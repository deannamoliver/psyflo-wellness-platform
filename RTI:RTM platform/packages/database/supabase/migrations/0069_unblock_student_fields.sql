-- Add columns to profiles table for unblock student functionality
ALTER TABLE "public"."profiles"
  ADD COLUMN IF NOT EXISTS "unblocked_reason" text,
  ADD COLUMN IF NOT EXISTS "unblocked_notes" text,
  ADD COLUMN IF NOT EXISTS "unblocked_at" timestamptz;
