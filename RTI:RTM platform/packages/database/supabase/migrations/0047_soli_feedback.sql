CREATE TABLE IF NOT EXISTS "public"."feedback" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "is_helpful" boolean NOT NULL,
  "comment" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);--> statement-breakpoint

CREATE POLICY "authenticated can insert own feedback"
ON "public"."feedback"
AS PERMISSIVE
FOR INSERT
TO "authenticated"
WITH CHECK ((select auth.uid()) = user_id);--> statement-breakpoint

CREATE POLICY "authenticated can view own feedback"
ON "public"."feedback"
AS PERMISSIVE
FOR SELECT
TO "authenticated"
USING ((select auth.uid()) = user_id);--> statement-breakpoint

CREATE POLICY "admin can manage all feedback"
ON "public"."feedback"
AS PERMISSIVE
FOR ALL
TO "service_role"
USING (true);--> statement-breakpoint

