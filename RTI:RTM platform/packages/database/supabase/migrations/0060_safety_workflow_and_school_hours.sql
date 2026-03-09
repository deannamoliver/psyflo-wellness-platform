-- Safety Workflow and School Hours
--
-- Changes:
-- 1. Create school_hours table for per-school daily schedules with timezone
-- 2. Create safety_workflow_status enum
-- 3. Create safety_workflows table for tracking safety workflow instances

-- =============================================================================
-- 1. Create school_hours table
-- =============================================================================

CREATE TABLE IF NOT EXISTS "public"."school_hours" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "school_id" uuid NOT NULL REFERENCES "public"."schools"("id") ON DELETE CASCADE,
  "timezone" text NOT NULL DEFAULT 'America/New_York',
  "day_of_week" integer NOT NULL, -- 0=Sunday, 6=Saturday
  "start_time" text NOT NULL, -- "08:00" HH:mm format
  "end_time" text NOT NULL, -- "15:00" HH:mm format
  "is_school_day" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);--> statement-breakpoint

CREATE UNIQUE INDEX "school_hours_school_day_unique"
  ON "public"."school_hours" ("school_id", "day_of_week");--> statement-breakpoint

ALTER TABLE "public"."school_hours" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE POLICY "admin can manage all school hours"
ON "public"."school_hours"
AS PERMISSIVE
FOR ALL
TO "supabase_auth_admin"
USING (true);--> statement-breakpoint

-- =============================================================================
-- 2. Create safety_workflow_status enum
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE "public"."safety_workflow_status" AS ENUM(
    'active',
    'completed',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

-- =============================================================================
-- 3. Create safety_workflows table
-- =============================================================================

CREATE TABLE IF NOT EXISTS "public"."safety_workflows" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "handoff_id" uuid NOT NULL REFERENCES "public"."wellness_coach_handoffs"("id") ON DELETE CASCADE,
  "student_id" uuid NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "initiated_by_coach_id" uuid REFERENCES "auth"."users"("id") ON DELETE SET NULL,
  "school_id" uuid REFERENCES "public"."schools"("id") ON DELETE SET NULL,
  "status" "public"."safety_workflow_status" NOT NULL DEFAULT 'active',
  "is_during_school_hours" boolean NOT NULL DEFAULT false,
  "activated_at" timestamptz NOT NULL DEFAULT now(),
  "completed_at" timestamptz,
  "immediate_danger" boolean,
  "concern_type" "public"."safety_concern_category",
  "assessment_data" jsonb,
  "alert_id" uuid REFERENCES "public"."alerts"("id") ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);--> statement-breakpoint

ALTER TABLE "public"."safety_workflows" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE POLICY "admin can manage all safety workflows"
ON "public"."safety_workflows"
AS PERMISSIVE
FOR ALL
TO "supabase_auth_admin"
USING (true);--> statement-breakpoint

-- =============================================================================
-- 4. Seed default school hours for existing schools
-- =============================================================================

-- Insert default Mon-Fri 8:00-15:00 schedule for all existing schools
INSERT INTO "public"."school_hours" ("id", "school_id", "timezone", "day_of_week", "start_time", "end_time", "is_school_day")
SELECT
  gen_random_uuid(),
  s.id,
  'America/New_York',
  d.day,
  CASE WHEN d.day IN (0, 6) THEN '00:00' ELSE '08:00' END,
  CASE WHEN d.day IN (0, 6) THEN '00:00' ELSE '15:00' END,
  d.day NOT IN (0, 6)
FROM "public"."schools" s
CROSS JOIN (SELECT unnest(ARRAY[0,1,2,3,4,5,6]) AS day) d
ON CONFLICT DO NOTHING;
