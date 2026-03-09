-- Therapist referrals table
-- Tracks referral requests submitted by counselors for students

-- Enums
CREATE TYPE referral_reason AS ENUM (
  'anxiety',
  'depression',
  'trauma',
  'behavioral',
  'family_issues',
  'grief_loss',
  'self_harm',
  'substance_use',
  'other'
);

CREATE TYPE referral_urgency AS ENUM (
  'routine',
  'urgent'
);

CREATE TYPE referral_insurance_status AS ENUM (
  'has_insurance',
  'uninsured',
  'unknown'
);

CREATE TYPE referral_status AS ENUM (
  'submitted',
  'in_progress',
  'matched',
  'completed',
  'cancelled'
);

-- Table
CREATE TABLE therapist_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who is being referred and by whom
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  counselor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,

  -- Referral details
  reason referral_reason NOT NULL,
  service_types TEXT[] NOT NULL,
  additional_context TEXT,
  urgency referral_urgency NOT NULL,

  -- Insurance
  insurance_status referral_insurance_status,

  -- Confirmation
  parent_notification_confirmed BOOLEAN NOT NULL,

  -- Status tracking
  status referral_status NOT NULL DEFAULT 'submitted',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_therapist_referrals_student_id ON therapist_referrals(student_id);
CREATE INDEX idx_therapist_referrals_counselor_id ON therapist_referrals(counselor_id);
CREATE INDEX idx_therapist_referrals_school_id ON therapist_referrals(school_id);
CREATE INDEX idx_therapist_referrals_status ON therapist_referrals(status);

-- Enable RLS
ALTER TABLE therapist_referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "admin can manage all therapist referrals"
  ON therapist_referrals
  FOR ALL
  TO supabase_auth_admin
  USING (true);
