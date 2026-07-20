import type { MemberRow } from "@/lib/repositories/member.repository";
import { calculateAgeFromDob } from "@/lib/utils";

export type ExportColumn = { key: string; label: string; get: (m: MemberRow) => string | number | boolean };

export const EXPORT_COLUMNS: ExportColumn[] = [
  { key: "membership_id", label: "Membership ID", get: (m) => m.membership_id },
  { key: "created_at", label: "Registration Date", get: (m) => m.created_at },
  { key: "status", label: "Status", get: (m) => m.status },
  { key: "verification_status", label: "Verification Status", get: (m) => m.verification_status },
  { key: "full_name", label: "Full Name", get: (m) => m.full_name },
  { key: "father_name", label: "Father/Husband Name", get: (m) => m.father_name },
  { key: "dob", label: "Date of Birth", get: (m) => m.dob },
  { key: "age", label: "Age", get: (m) => calculateAgeFromDob(m.dob) },
  { key: "gender", label: "Gender", get: (m) => m.gender },
  { key: "category", label: "Category (Varg)", get: (m) => m.category },
  { key: "jaati", label: "Jaati", get: (m) => m.jaati },
  { key: "mobile", label: "Mobile Number", get: (m) => m.mobile },
  { key: "whatsapp", label: "WhatsApp Number", get: (m) => m.whatsapp },
  { key: "email", label: "Email Address", get: (m) => m.email },
  { key: "loksabha_name_en", label: "Lok Sabha", get: (m) => m.loksabha_name_en ?? "" },
  { key: "district_name_en", label: "District", get: (m) => m.district_name_en },
  { key: "assembly_name_en", label: "Assembly", get: (m) => m.assembly_name_en },
  { key: "mandal_name_en", label: "Mandal", get: (m) => m.mandal_name_en },
  { key: "booth", label: "Booth Number", get: (m) => m.booth ?? "" },
  { key: "address", label: "Full Address", get: (m) => m.address },
  { key: "pincode", label: "Pincode", get: (m) => m.pincode },
  { key: "referral_code", label: "Referral Code", get: (m) => m.referral_code },
  { key: "referred_by_code", label: "Referred By", get: (m) => m.referred_by_code ?? "" },
  { key: "referral_count", label: "Total Referrals", get: (m) => m.referral_count },
  { key: "qr_generated", label: "QR Generated", get: (m) => (m.qr_generated ? "Yes" : "No") },
  { key: "id_card_generated", label: "ID Card Generated", get: (m) => (m.id_card_generated ? "Yes" : "No") },
  { key: "last_login", label: "Last Login", get: (m) => m.last_login ?? "" },
  { key: "registration_source", label: "Registration Source", get: (m) => m.registration_source },
  { key: "language_preference", label: "Language Preference", get: (m) => m.language_preference },
  { key: "updated_at", label: "Updated At", get: (m) => m.updated_at },
  { key: "created_by", label: "Created By", get: (m) => m.created_by ?? "" },
  { key: "updated_by", label: "Updated By", get: (m) => m.updated_by ?? "" },
  { key: "verified_by", label: "Verified By", get: (m) => m.verified_by ?? "" },
  { key: "verified_at", label: "Verified At", get: (m) => m.verified_at ?? "" },
  { key: "suspended_by", label: "Suspended By", get: (m) => m.suspended_by ?? "" },
  { key: "suspended_at", label: "Suspended At", get: (m) => m.suspended_at ?? "" },
  { key: "deleted_by", label: "Deleted By", get: (m) => m.deleted_by ?? "" },
  { key: "deleted_at", label: "Deleted At", get: (m) => m.deleted_at ?? "" },
];

export const DEFAULT_EXPORT_COLUMNS = ["membership_id", "full_name", "mobile", "email", "district_name_en", "category", "gender", "status", "verification_status", "created_at"];
