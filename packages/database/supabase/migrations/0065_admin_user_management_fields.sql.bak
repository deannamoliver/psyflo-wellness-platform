-- Add admin user management fields to profiles table
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "phone" text;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "internal_notes" text;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "added_by" uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "can_manage_users" boolean NOT NULL DEFAULT false;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "receives_alert_notifications" boolean NOT NULL DEFAULT true;
