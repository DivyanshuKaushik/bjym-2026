/**
 * Hand-authored types matching supabase/migrations/*.sql.
 *
 * This file is checked in so the project type-checks without a live
 * Supabase project linked. Once you've run `supabase link` against your
 * real project, running:
 *
 *     npm run db:generate-types
 *
 * will OVERWRITE this file with the authoritative, auto-generated version
 * from your actual database. Keep the two in sync until then.
 */

export type MemberStatus = "Active" | "Suspended" | "Deleted";
export type VerificationStatus = "Pending" | "Verified" | "Rejected";
export type Gender = "Male" | "Female" | "Other";
export type RoleName = "MASTER_ADMIN" | "TEAM_MEMBER";

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: { id: string; name: RoleName; description: string | null; created_at: string };
        Insert: { id?: string; name: RoleName; description?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["roles"]["Insert"]>;
      };
      permissions: {
        Row: { id: string; key: string; description: string | null; created_at: string };
        Insert: { id?: string; key: string; description?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["permissions"]["Insert"]>;
      };
      role_permissions: {
        Row: { role_id: string; permission_id: string };
        Insert: { role_id: string; permission_id: string };
        Update: Partial<Database["public"]["Tables"]["role_permissions"]["Insert"]>;
      };
      admin_users: {
        Row: {
          id: string;
          username: string;
          password_hash: string;
          full_name: string;
          role_id: string;
          token_version: number;
          is_active: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["admin_users"]["Row"]> & {
          username: string;
          password_hash: string;
          full_name: string;
          role_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Row"]>;
      };
      members: {
        Row: {
          id: string;
          membership_id: string;
          status: MemberStatus;
          verification_status: VerificationStatus;
          photo_base64: string | null;
          full_name: string;
          father_name: string;
          dob: string;
          gender: Gender;
          category: string;
          jaati: string;
          mobile: string;
          whatsapp: string;
          email: string;
          loksabha_id: string | null;
          loksabha_name_en: string | null;
          loksabha_name_hi: string | null;
          district_id: string;
          district_name_en: string;
          district_name_hi: string;
          assembly_id: string;
          assembly_name_en: string;
          assembly_name_hi: string;
          mandal_id: string;
          mandal_name_en: string;
          mandal_name_hi: string;
          booth: string | null;
          address: string;
          pincode: string;
          mpin_hash: string;
          referral_code: string;
          referred_by_code: string | null;
          referral_count: number;
          qr_generated: boolean;
          id_card_generated: boolean;
          last_login: string | null;
          registration_source: string;
          language_preference: string;
          token_version: number;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          verified_by: string | null;
          verified_at: string | null;
          suspended_by: string | null;
          suspended_at: string | null;
          rejected_by: string | null;
          rejected_at: string | null;
          deleted_by: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["members"]["Row"]> & {
          full_name: string;
          father_name: string;
          dob: string;
          gender: Gender;
          category: string;
          jaati: string;
          mobile: string;
          whatsapp: string;
          email: string;
          loksabha_id: string | null;
          loksabha_name_en: string | null;
          loksabha_name_hi: string | null;
          district_id: string;
          district_name_en: string;
          district_name_hi: string;
          assembly_id: string;
          assembly_name_en: string;
          assembly_name_hi: string;
          mandal_id: string;
          mandal_name_en: string;
          mandal_name_hi: string;
          address: string;
          pincode: string;
          mpin_hash: string;
        };
        Update: Partial<Database["public"]["Tables"]["members"]["Row"]>;
      };
      membership_sequences: {
        Row: { year: number; last_serial: number };
        Insert: { year: number; last_serial?: number };
        Update: Partial<Database["public"]["Tables"]["membership_sequences"]["Insert"]>;
      };
      member_referrals: {
        Row: { id: string; referrer_membership_id: string; referred_membership_id: string; created_at: string };
        Insert: { id?: string; referrer_membership_id: string; referred_membership_id: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["member_referrals"]["Insert"]>;
      };
      member_status_history: {
        Row: {
          id: string;
          member_id: string;
          from_status: string | null;
          to_status: string;
          reason: string | null;
          changed_by: string | null;
          changed_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["member_status_history"]["Row"]> & { member_id: string; to_status: string };
        Update: Partial<Database["public"]["Tables"]["member_status_history"]["Row"]>;
      };
      activity_logs: {
        Row: {
          id: string;
          actor_type: "admin" | "member" | "system";
          actor_id: string | null;
          actor_label: string | null;
          action: string;
          target_table: string | null;
          target_id: string | null;
          meta: Record<string, unknown> | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["activity_logs"]["Row"]> & { actor_type: "admin" | "member" | "system"; action: string };
        Update: Partial<Database["public"]["Tables"]["activity_logs"]["Row"]>;
      };
      export_history: {
        Row: {
          id: string;
          admin_id: string;
          format: "csv" | "xlsx" | "pdf";
          filters: Record<string, unknown> | null;
          columns: string[] | null;
          record_count: number;
          status: "completed" | "failed";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["export_history"]["Row"]> & { admin_id: string; format: "csv" | "xlsx" | "pdf"; record_count: number };
        Update: Partial<Database["public"]["Tables"]["export_history"]["Row"]>;
      };
      settings: {
        Row: { key: string; value: unknown; updated_by: string | null; updated_at: string };
        Insert: { key: string; value: unknown; updated_by?: string | null; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
      };
    };
  };
}
