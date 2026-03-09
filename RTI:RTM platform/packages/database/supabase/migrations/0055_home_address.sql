-- Add home_address column to profiles table
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "home_address" text;
