"use server";

import { fullRegistrationSchema } from "@/lib/validators/registration";
import { memberRepository } from "@/lib/repositories/member.repository";
import { findHierarchyLabels } from "@/data/hierarchy";
import { findLokSabhaLabel } from "@/data/loksabha";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export type RegisterState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function registerMember(input: unknown): Promise<RegisterState> {
  const parsed = fullRegistrationSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] = issue.message;
    return { error: "कृपया फॉर्म की जानकारी जांचें", fieldErrors };
  }
  const data = parsed.data;

  const { mobileTaken, emailTaken } = await memberRepository.mobileOrEmailExists(data.mobile, data.email);
  if (mobileTaken) return { error: "यह मोबाइल नंबर पहले से पंजीकृत है", fieldErrors: { mobile: "पहले से पंजीकृत है" } };
  if (emailTaken) return { error: "यह ईमेल पहले से पंजीकृत है", fieldErrors: { email: "पहले से पंजीकृत है" } };

  const labels = findHierarchyLabels(data.districtId, data.assemblyId, data.mandalId);
  if (!labels.district || !labels.assembly || !labels.mandal) {
    return { error: "चयनित क्षेत्र मान्य नहीं है, कृपया दोबारा चुनें" };
  }

  const loksabhaLabel = findLokSabhaLabel(data.loksabhaId);
  if (!loksabhaLabel) {
    return { error: "चयनित लोकसभा क्षेत्र मान्य नहीं है, कृपया दोबारा चुनें" };
  }

  // Referral code (optional): validate it belongs to a real, active member
  // before crediting it — an invalid/mistyped code is silently dropped
  // rather than blocking registration, since it's not a required field.
  let referredByCode: string | null = null;
  if (data.referredByCode && data.referredByCode.trim()) {
    const referrer = await memberRepository.referralCodeExists(data.referredByCode.trim().toUpperCase());
    if (referrer) referredByCode = referrer.referral_code;
  }

  const dob = `${data.dobYear}-${data.dobMonth}-${data.dobDay}`;
  const mpinHash = await memberRepository.hashMpin(data.mpin);

  const { member, error } = await memberRepository.create({
    photo_base64: data.photoBase64,
    full_name: data.fullName,
    father_name: data.fatherName,
    dob,
    gender: data.gender,
    category: data.category,
    jaati: data.jaati,
    mobile: data.mobile,
    whatsapp: data.whatsappSameAsMobile ? data.mobile : data.whatsapp,
    email: data.email,
    loksabha_id: data.loksabhaId,
    loksabha_name_en: loksabhaLabel.en,
    loksabha_name_hi: loksabhaLabel.hi,
    district_id: data.districtId,
    district_name_en: labels.district.en,
    district_name_hi: labels.district.hi,
    assembly_id: data.assemblyId,
    assembly_name_en: labels.assembly.en,
    assembly_name_hi: labels.assembly.hi,
    mandal_id: data.mandalId,
    mandal_name_en: labels.mandal.en,
    mandal_name_hi: labels.mandal.hi,
    booth: data.booth || null,
    address: data.address,
    pincode: data.pincode,
    mpin_hash: mpinHash,
    referred_by_code: referredByCode,
    registration_source: "web",
  });

  if (error || !member) {
    if (error?.includes("mobile")) return { error: "यह मोबाइल नंबर पहले से पंजीकृत है" };
    if (error?.includes("email")) return { error: "यह ईमेल पहले से पंजीकृत है" };
    return { error: error || "पंजीकरण में त्रुटि हुई। कृपया दोबारा प्रयास करें।" };
  }

  try {
    await signIn("member", {
      identifier: data.mobile,
      mpin: data.mpin,
      remember: "true",
      redirectTo: "/dashboard",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      // Registration succeeded but auto-login failed for some reason —
      // send them to /login instead of leaving them stuck.
      return { error: "पंजीकरण सफल रहा। कृपया /login पर जाकर लॉगिन करें।" };
    }
    throw err; // NEXT_REDIRECT — let it propagate
  }

  return {};
}
