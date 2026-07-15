export type District = { id: string; name_en: string; name_hi: string };
export type Assembly = { id: string; district_id: string; name_en: string; name_hi: string };
export type Mandal = { id: string; assembly_id: string; name_en: string; name_hi: string };

export type MembershipStatus = "Active" | "Suspended" | "Deleted";
export type Gender = "Male" | "Female" | "Other";

export type Membership = {
  id: string;
  profile_id: string;
  membership_id: string;
  photo_base64: string | null;
  full_name: string;
  father_name: string;
  dob: string;
  gender: Gender;
  phone: string;
  email: string;
  address: string;
  pincode: string;
  district_id: string | null;
  assembly_id: string | null;
  mandal_id: string | null;
  booth: string;
  whatsapp: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  referral_code: string;
  referred_by_code: string | null;
  status: MembershipStatus;
  joined_at: string;
  districts?: { name_en: string; name_hi: string } | null;
  assemblies?: { name_en: string; name_hi: string } | null;
  mandals?: { name_en: string; name_hi: string } | null;
};

export type Profile = {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  role: "member" | "admin";
  created_at: string;
};

export type VerifyResult = {
  membership_id: string;
  full_name: string;
  photo_base64: string | null;
  district_name_hi: string | null;
  assembly_name_hi: string | null;
  mandal_name_hi: string | null;
  status: MembershipStatus;
  joined_at: string;
};
