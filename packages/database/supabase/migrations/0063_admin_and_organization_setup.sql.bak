-- Combined migration: Admin roles, user management, organization management,
-- referrals, student codes, and account status.
--
-- Combines: 0063_admin_platform_role, 0064_admin_users_management,
-- 0064_location_management, 0064_organization_management,
-- 0065_admin_referrals, 0065_admin_safety_monitor_student_code,
-- 0066_student_account_status

-- =============================================================================
-- 1. Platform role enum + profiles column (from 0063)
-- =============================================================================

CREATE TYPE "public"."platform_role" AS ENUM('user', 'admin');

ALTER TABLE "profiles" ADD COLUMN "platform_role" "platform_role" DEFAULT 'user' NOT NULL;

-- =============================================================================
-- 2. Admin user management (from 0064_admin_users_management)
-- =============================================================================

ALTER TYPE "public"."platform_role" ADD VALUE IF NOT EXISTS 'clinical_supervisor';

ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "last_active_at" timestamptz;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "account_status" text DEFAULT 'active' NOT NULL;

-- =============================================================================
-- 3. Organization enums (from 0064_organization_management)
-- =============================================================================

CREATE TYPE "public"."organization_type" AS ENUM('k12', 'college', 'clinic', 'cbo');
CREATE TYPE "public"."organization_status" AS ENUM('active', 'suspended', 'onboarding');
CREATE TYPE "public"."organization_contact_role" AS ENUM('admin', 'billing', 'technical', 'additional');

-- =============================================================================
-- 4. Organizations table (from 0064_location_management)
-- =============================================================================

CREATE TABLE IF NOT EXISTS "public"."organizations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "code" text,
  "status" text NOT NULL DEFAULT 'active',
  "type" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);

ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin can manage all organizations"
ON "public"."organizations"
AS PERMISSIVE
FOR ALL
TO "supabase_auth_admin"
USING (true);

-- =============================================================================
-- 5. Schools table - all new columns (merged from both 0064 scripts)
-- =============================================================================

-- From organization_management
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "type" "organization_type";
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "district_code" text;
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "status" "organization_status" DEFAULT 'active';
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "website" text;
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "email_domain" text;
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "street_address_2" text;
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "internal_notes" text;

-- Shared columns (exist in both scripts)
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "timezone" text;
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "phone" text;
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "street_address" text;
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "city" text;
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "state" text;
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "country" text;
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "zip_code" text;

-- From location_management only
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "organization_id" uuid REFERENCES "public"."organizations"("id") ON DELETE SET NULL;
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "school_code" text;
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "address_line_2" text;
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "grade_levels" text[] DEFAULT '{}';
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "school_type" text;
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "estimated_student_count" integer DEFAULT 0;
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "invite_link_active" boolean DEFAULT false;
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "invite_link_code" text;
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "academic_year_start" date;
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "academic_year_end" date;

CREATE UNIQUE INDEX IF NOT EXISTS "schools_invite_link_code_unique"
  ON "public"."schools" ("invite_link_code") WHERE "invite_link_code" IS NOT NULL;

-- =============================================================================
-- 6. Organization contacts table (from 0064_organization_management)
-- =============================================================================

CREATE TABLE IF NOT EXISTS "organization_contacts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "school_id" uuid NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
  "contact_role" "organization_contact_role" NOT NULL,
  "name" text,
  "title" text,
  "email" text,
  "phone" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);

ALTER TABLE "organization_contacts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin can manage all organization contacts"
  ON "organization_contacts"
  FOR ALL
  TO supabase_auth_admin
  USING (true);

-- =============================================================================
-- 7. Location tables (from 0064_location_management)
-- =============================================================================

CREATE TABLE IF NOT EXISTS "public"."location_contacts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "school_id" uuid NOT NULL REFERENCES "public"."schools"("id") ON DELETE CASCADE,
  "is_primary" boolean NOT NULL DEFAULT false,
  "contact_name" text NOT NULL,
  "job_title" text,
  "email" text,
  "phone" text,
  "office_phone" text,
  "mobile_phone" text,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);

ALTER TABLE "public"."location_contacts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin can manage all location contacts"
ON "public"."location_contacts"
AS PERMISSIVE
FOR ALL
TO "supabase_auth_admin"
USING (true);

CREATE TABLE IF NOT EXISTS "public"."location_blackout_days" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "school_id" uuid NOT NULL REFERENCES "public"."schools"("id") ON DELETE CASCADE,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);

ALTER TABLE "public"."location_blackout_days" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin can manage all location blackout days"
ON "public"."location_blackout_days"
AS PERMISSIVE
FOR ALL
TO "supabase_auth_admin"
USING (true);

CREATE TABLE IF NOT EXISTS "public"."location_emergency_services" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "school_id" uuid NOT NULL REFERENCES "public"."schools"("id") ON DELETE CASCADE UNIQUE,
  "police_phone" text,
  "police_address" text,
  "sro_name" text,
  "sro_phone" text,
  "no_sro" boolean DEFAULT false,
  "crisis_center_name" text,
  "crisis_hotline" text,
  "crisis_hours" text DEFAULT '24/7',
  "mobile_crisis_available" boolean DEFAULT false,
  "mobile_crisis_number" text,
  "nearest_hospital" text,
  "er_address" text,
  "er_phone" text,
  "state_cps_hotline" text,
  "local_cps_office" text,
  "cps_report_url" text,
  "notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);

ALTER TABLE "public"."location_emergency_services" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin can manage all location emergency services"
ON "public"."location_emergency_services"
AS PERMISSIVE
FOR ALL
TO "supabase_auth_admin"
USING (true);

CREATE TABLE IF NOT EXISTS "public"."location_platform_config" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "school_id" uuid NOT NULL REFERENCES "public"."schools"("id") ON DELETE CASCADE UNIQUE,
  "chatbot_enabled" boolean DEFAULT true,
  "chatbot_schedule_type" text DEFAULT '24_7',
  "chatbot_closures_disabled" boolean DEFAULT true,
  "sel_screener_enabled" boolean DEFAULT true,
  "sel_screener_frequency" text DEFAULT 'monthly',
  "sel_screener_first_date" date,
  "phq9_enabled" boolean DEFAULT true,
  "phq9_frequency" text DEFAULT 'quarterly',
  "phq9_first_date" date,
  "gad7_enabled" boolean DEFAULT true,
  "gad7_frequency" text DEFAULT 'quarterly',
  "gad7_first_date" date,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);

ALTER TABLE "public"."location_platform_config" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin can manage all location platform config"
ON "public"."location_platform_config"
AS PERMISSIVE
FOR ALL
TO "supabase_auth_admin"
USING (true);

CREATE TABLE IF NOT EXISTS "public"."location_grade_restrictions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "school_id" uuid NOT NULL REFERENCES "public"."schools"("id") ON DELETE CASCADE,
  "grade_level" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS "location_grade_restrictions_unique"
  ON "public"."location_grade_restrictions" ("school_id", "grade_level");

ALTER TABLE "public"."location_grade_restrictions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin can manage all location grade restrictions"
ON "public"."location_grade_restrictions"
AS PERMISSIVE
FOR ALL
TO "supabase_auth_admin"
USING (true);

-- =============================================================================
-- 8. Admin referrals (from 0065_admin_referrals)
-- =============================================================================

ALTER TYPE referral_urgency ADD VALUE IF NOT EXISTS 'crisis';

ALTER TABLE therapist_referrals
  ADD COLUMN IF NOT EXISTS insurance_provider TEXT,
  ADD COLUMN IF NOT EXISTS insurance_member_id TEXT;

CREATE TABLE IF NOT EXISTS referral_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES therapist_referrals(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referral_notes_referral_id ON referral_notes(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_notes_author_id ON referral_notes(author_id);

ALTER TABLE referral_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin can manage all referral notes"
  ON referral_notes
  FOR ALL
  TO supabase_auth_admin
  USING (true);

-- =============================================================================
-- 9. Student code (from 0065_admin_safety_monitor_student_code)
-- =============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS student_code text;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_student_code_unique
  ON profiles (student_code)
  WHERE student_code IS NOT NULL;

-- =============================================================================
-- 10. Account status enum conversion (from 0066_student_account_status)
-- =============================================================================

CREATE TYPE account_status AS ENUM ('active', 'blocked', 'archived');

ALTER TABLE profiles
  ALTER COLUMN account_status DROP DEFAULT;

ALTER TABLE profiles
  ALTER COLUMN account_status TYPE account_status
  USING account_status::account_status;

ALTER TABLE profiles
  ALTER COLUMN account_status SET DEFAULT 'active';

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS blocked_reason text,
  ADD COLUMN IF NOT EXISTS blocked_at timestamptz;
