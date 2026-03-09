-- Coach Safety Reports: schema changes for coach-submitted escalation reports
--
-- Changes:
-- 1. Extend alert_type enum with 'harm_to_self' and 'other'
-- 2. Extend alert_source enum with 'coach'
-- 3. Extend action_type enum with 'emergency_services_contacted', 'cps_notified', 'assessment_performed'
-- 4. Create new enums: safety_concern_category, risk_level, coach_safety_report_status
-- 5. Create coach_safety_reports table
-- 6. Add alert_id to wellness_coach_handoffs

-- =============================================================================
-- 1. Extend alert_type enum
-- =============================================================================

ALTER TYPE "public"."alert_type" ADD VALUE IF NOT EXISTS 'harm_to_self';--> statement-breakpoint
ALTER TYPE "public"."alert_type" ADD VALUE IF NOT EXISTS 'other';--> statement-breakpoint

-- =============================================================================
-- 2. Extend alert_source enum
-- =============================================================================

ALTER TYPE "public"."alert_source" ADD VALUE IF NOT EXISTS 'coach';--> statement-breakpoint

-- =============================================================================
-- 3. Extend action_type enum
-- =============================================================================

ALTER TYPE "public"."action_type" ADD VALUE IF NOT EXISTS 'emergency_services_contacted';--> statement-breakpoint
ALTER TYPE "public"."action_type" ADD VALUE IF NOT EXISTS 'cps_notified';--> statement-breakpoint
ALTER TYPE "public"."action_type" ADD VALUE IF NOT EXISTS 'assessment_performed';--> statement-breakpoint

-- =============================================================================
-- 4. Create new enums
-- =============================================================================

CREATE TYPE "public"."safety_concern_category" AS ENUM(
  'harm_to_self',
  'harm_to_others',
  'abuse_neglect',
  'other_safety'
);--> statement-breakpoint

CREATE TYPE "public"."risk_level" AS ENUM(
  'emergency',
  'high',
  'moderate',
  'low'
);--> statement-breakpoint

CREATE TYPE "public"."coach_safety_report_status" AS ENUM(
  'draft',
  'submitted'
);--> statement-breakpoint

-- =============================================================================
-- 5. Create coach_safety_reports table
-- =============================================================================

CREATE TABLE "public"."coach_safety_reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "alert_id" uuid NOT NULL REFERENCES "public"."alerts"("id") ON DELETE CASCADE,
  "handoff_id" uuid REFERENCES "public"."wellness_coach_handoffs"("id") ON DELETE SET NULL,
  "category" "public"."safety_concern_category" NOT NULL,
  "risk_level" "public"."risk_level" NOT NULL DEFAULT 'moderate',
  "student_disclosure" text,
  "situation_summary" text,
  "screening_responses" jsonb,
  "submitted_by_coach_id" uuid REFERENCES "auth"."users"("id") ON DELETE SET NULL,
  "report_status" "public"."coach_safety_report_status" NOT NULL DEFAULT 'draft',
  "submitted_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz,
  CONSTRAINT "coach_safety_reports_alert_id_unique" UNIQUE("alert_id")
);--> statement-breakpoint

ALTER TABLE "public"."coach_safety_reports" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE POLICY "admin can manage all coach safety reports"
ON "public"."coach_safety_reports"
AS PERMISSIVE
FOR ALL
TO "supabase_auth_admin"
USING (true);--> statement-breakpoint

-- =============================================================================
-- 6. Add alert_id to wellness_coach_handoffs
-- =============================================================================

ALTER TABLE "public"."wellness_coach_handoffs"
  ADD COLUMN "alert_id" uuid REFERENCES "public"."alerts"("id") ON DELETE SET NULL;--> statement-breakpoint
