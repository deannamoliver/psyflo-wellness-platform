-- Add columns to profiles table for enhanced block student functionality
ALTER TABLE "public"."profiles"
  ADD COLUMN IF NOT EXISTS "blocked_explanation" text,
  ADD COLUMN IF NOT EXISTS "blocked_duration" text,
  ADD COLUMN IF NOT EXISTS "blocked_notes" text,
  ADD COLUMN IF NOT EXISTS "blocked_until" timestamptz;
