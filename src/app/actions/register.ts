"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fullRegistrationSchema } from "@/lib/validators/registration";
import { redirect } from "next/navigation";

export type RegisterState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  needsEmailConfirmation?: boolean;
};

export async function registerMember(input: unknown): Promise<RegisterState> {
  const parsed = fullRegistrationSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { error: "कृपया फॉर्म की जानकारी जांचें", fieldErrors };
  }

  const data = parsed.data;
  const supabase = await createClient();

  // 1. Create the auth user. If "Confirm email" is enabled in the Supabase
  //    project (the default for new projects), signUp() succeeds but does
  //    NOT return an active session — the user isn't "logged in" until they
  //    click the confirmation link. That's fine; we don't need a session to
  //    finish registration.
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { full_name: data.fullName, role: "member" },
    },
  });

  if (signUpError || !signUpData.user) {
    return { error: signUpError?.message || "खाता बनाने में त्रुटि हुई। कृपया दोबारा प्रयास करें।" };
  }

  const userId = signUpData.user.id;
  const hasSession = !!signUpData.session;

  // 2 & 3. Use the service-role (admin) client for the referral lookup and the
  //    membership insert. This is a deliberate, trusted server-side write —
  //    we set profile_id ourselves from the just-created auth user, the input
  //    was already Zod-validated above, and this is the ONE place a brand-new
  //    user (who may not have an active session yet, per the email-confirmation
  //    note above) needs to create their own membership row. Bypassing RLS
  //    here — rather than depending on an auth.uid() that may not exist yet —
  //    is what makes registration work in both configurations. Every other
  //    read/write in the app still goes through the normal RLS-protected
  //    client, so this doesn't weaken security elsewhere.
  const admin = createAdminClient();

  let referredByCode: string | null = null;
  if (data.referralCode && data.referralCode.trim()) {
    const { data: referrer } = await admin
      .from("memberships")
      .select("referral_code")
      .eq("referral_code", data.referralCode.trim().toUpperCase())
      .maybeSingle();
    referredByCode = referrer?.referral_code ?? null;
  }

  const { error: insertError } = await admin.from("memberships").insert({
    profile_id: userId,
    photo_base64: data.photoBase64,
    full_name: data.fullName,
    father_name: data.fatherName,
    dob: data.dob,
    gender: data.gender,
    phone: data.phone,
    email: data.email,
    address: data.address,
    pincode: data.pincode,
    district_id: data.districtId,
    assembly_id: data.assemblyId,
    mandal_id: data.mandalId,
    booth: data.booth,
    whatsapp: data.whatsapp,
    facebook: data.facebook || null,
    instagram: data.instagram || null,
    twitter: data.twitter || null,
    referred_by_code: referredByCode,
  });

  if (insertError) {
    // Roll back the orphaned auth user so the person can retry with the same
    // email/phone instead of getting stuck with an account that has no membership.
    await admin.auth.admin.deleteUser(userId).catch(() => {});
    if (insertError.message.includes("phone")) return { error: "यह मोबाइल नंबर पहले से पंजीकृत है" };
    if (insertError.message.includes("email")) return { error: "यह ईमेल पहले से पंजीकृत है" };
    return { error: insertError.message };
  }

  if (!hasSession) {
    // No session yet — email confirmation is required by the project's Auth
    // settings. Don't redirect to /dashboard (there's no logged-in user);
    // tell the person to confirm their email and then log in.
    return { needsEmailConfirmation: true };
  }

  redirect("/dashboard");
}
