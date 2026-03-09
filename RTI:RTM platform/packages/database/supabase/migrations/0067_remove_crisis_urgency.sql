-- Migration: Remove 'crisis' from referral_urgency enum
-- First update any existing rows that have 'crisis' to 'urgent' as a safe fallback
UPDATE therapist_referrals
SET urgency = 'urgent', updated_at = now()
WHERE urgency = 'crisis';

-- Rename the old enum
ALTER TYPE referral_urgency RENAME TO referral_urgency_old;

-- Create the new enum without 'crisis'
CREATE TYPE referral_urgency AS ENUM ('routine', 'urgent');

-- Swap the column to use the new enum
ALTER TABLE therapist_referrals
  ALTER COLUMN urgency TYPE referral_urgency
  USING urgency::text::referral_urgency;

-- Drop the old enum
DROP TYPE referral_urgency_old;
