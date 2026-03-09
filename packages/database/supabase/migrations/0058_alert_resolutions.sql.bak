-- Alert resolution enums
DO $$ BEGIN
  CREATE TYPE "public"."resolution_student_status" AS ENUM(
    'crisis_resolved',
    'ongoing_support',
    'transferred_external',
    'hospitalized',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."resolution_follow_up_plan" AS ENUM(
    'no_follow_up',
    'routine_check_ins',
    'scheduled_follow_up',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Alert resolutions table
CREATE TABLE IF NOT EXISTS "alert_resolutions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "alert_id" uuid NOT NULL REFERENCES "alerts"("id") ON DELETE CASCADE,
  "counselor_id" uuid NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "actions_taken" text[] NOT NULL,
  "resolution_summary" text NOT NULL,
  "student_status" "resolution_student_status" NOT NULL,
  "follow_up_plan" "resolution_follow_up_plan" NOT NULL,
  "verification_completed" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);

-- Unique constraint: one resolution per alert
ALTER TABLE "alert_resolutions"
  ADD CONSTRAINT "alert_resolutions_alert_id_unique" UNIQUE ("alert_id");

-- RLS policy
ALTER TABLE "alert_resolutions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin can manage all alert resolutions"
  ON "alert_resolutions" FOR ALL
  TO "supabase_auth_admin"
  USING (true);
