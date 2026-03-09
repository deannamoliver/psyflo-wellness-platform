-- =============================================================================
-- Seed Therapist Referrals
-- =============================================================================
-- This script inserts therapist referral rows identical to what the
-- "Refer to Therapist" modal writes via submitTherapistReferral().
--
-- Prerequisites:
--   - The database has been seeded (bun run db:seed) so that auth.users,
--     profiles, user_schools, and schools rows exist.
--   - Run against the local Supabase Postgres instance:
--       psql "$SUPABASE_PG_URL" -f scripts/seed-referrals.sql
-- =============================================================================

-- Grab IDs from the seeded data
-- counselor  = counselor@psyflo.com
-- school     = Psyflo Academy
-- students   = scenario students already created by the seed

DO $$
DECLARE
  v_counselor_id uuid;
  v_school_id    uuid;
  v_student_ids  uuid[];
  v_student_id   uuid;
BEGIN
  -- Resolve counselor
  SELECT id INTO v_counselor_id
    FROM auth.users
   WHERE email = 'counselor@psyflo.com';

  IF v_counselor_id IS NULL THEN
    RAISE EXCEPTION 'counselor@psyflo.com not found. Run bun run db:seed first.';
  END IF;

  -- Resolve school
  SELECT s.id INTO v_school_id
    FROM schools s
   WHERE s.name = 'Psyflo Academy';

  IF v_school_id IS NULL THEN
    RAISE EXCEPTION 'Psyflo Academy school not found. Run bun run db:seed first.';
  END IF;

  -- Collect the first 8 students at Psyflo Academy
  SELECT array_agg(us.user_id)
    INTO v_student_ids
    FROM (
      SELECT us2.user_id
        FROM user_schools us2
       WHERE us2.school_id = v_school_id
         AND us2.role = 'student'
       LIMIT 8
    ) us;

  IF v_student_ids IS NULL OR array_length(v_student_ids, 1) < 1 THEN
    RAISE EXCEPTION 'No students found at Psyflo Academy. Run bun run db:seed first.';
  END IF;

  -- Referral 1 - Submitted / Routine / Anxiety
  v_student_id := v_student_ids[1];
  INSERT INTO therapist_referrals (
    id, student_id, counselor_id, school_id,
    reason, service_types, additional_context,
    urgency, insurance_status, parent_notification_confirmed,
    status, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_student_id, v_counselor_id, v_school_id,
    'anxiety', ARRAY['individual_therapy'], 'Student has been showing signs of social anxiety in class.',
    'routine', 'has_insurance', true,
    'submitted', NOW() - interval '3 days', NOW() - interval '3 days'
  );

  -- Referral 2 - In Progress / Urgent / Depression
  v_student_id := v_student_ids[2];
  INSERT INTO therapist_referrals (
    id, student_id, counselor_id, school_id,
    reason, service_types, additional_context,
    urgency, insurance_status, parent_notification_confirmed,
    status, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_student_id, v_counselor_id, v_school_id,
    'depression', ARRAY['individual_therapy'], 'Persistent low mood and withdrawal from peers over the past month.',
    'urgent', 'has_insurance', true,
    'in_progress', NOW() - interval '5 days', NOW() - interval '2 days'
  );

  -- Referral 3 - Connected / Routine / Family Issues
  v_student_id := v_student_ids[3];
  INSERT INTO therapist_referrals (
    id, student_id, counselor_id, school_id,
    reason, service_types, additional_context,
    urgency, insurance_status, parent_notification_confirmed,
    status, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_student_id, v_counselor_id, v_school_id,
    'family_issues', ARRAY['family_therapy'], 'Parents going through divorce; student is struggling to cope.',
    'routine', 'unknown', true,
    'matched', NOW() - interval '10 days', NOW() - interval '1 day'
  );

  -- Referral 4 - Completed (Closed) / Urgent / Trauma
  v_student_id := v_student_ids[4];
  INSERT INTO therapist_referrals (
    id, student_id, counselor_id, school_id,
    reason, service_types, additional_context,
    urgency, insurance_status, parent_notification_confirmed,
    status, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_student_id, v_counselor_id, v_school_id,
    'trauma', ARRAY['individual_therapy'], 'Experienced a traumatic event outside of school. Family has been notified.',
    'urgent', 'has_insurance', true,
    'completed', NOW() - interval '20 days', NOW() - interval '3 days'
  );

  -- Referral 5 - Submitted / Routine / Behavioral
  v_student_id := v_student_ids[5];
  INSERT INTO therapist_referrals (
    id, student_id, counselor_id, school_id,
    reason, service_types, additional_context,
    urgency, insurance_status, parent_notification_confirmed,
    status, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_student_id, v_counselor_id, v_school_id,
    'behavioral', ARRAY['individual_therapy'], 'Frequent outbursts in class and difficulty managing anger.',
    'routine', 'uninsured', true,
    'submitted', NOW() - interval '1 day', NOW() - interval '1 day'
  );

  -- Referral 6 - In Progress / Routine / Grief/Loss
  IF array_length(v_student_ids, 1) >= 6 THEN
    v_student_id := v_student_ids[6];
    INSERT INTO therapist_referrals (
      id, student_id, counselor_id, school_id,
      reason, service_types, additional_context,
      urgency, insurance_status, parent_notification_confirmed,
      status, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_student_id, v_counselor_id, v_school_id,
      'grief_loss', ARRAY['individual_therapy'], 'Recently lost a grandparent; showing signs of prolonged grief.',
      'routine', 'has_insurance', true,
      'in_progress', NOW() - interval '7 days', NOW() - interval '2 days'
    );
  END IF;

  -- Referral 7 - Connected / Urgent / Substance Use
  IF array_length(v_student_ids, 1) >= 7 THEN
    v_student_id := v_student_ids[7];
    INSERT INTO therapist_referrals (
      id, student_id, counselor_id, school_id,
      reason, service_types, additional_context,
      urgency, insurance_status, parent_notification_confirmed,
      status, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_student_id, v_counselor_id, v_school_id,
      'substance_use', ARRAY['individual_therapy', 'psychiatric_services'], 'Reports of vaping and possible substance experimentation.',
      'urgent', 'unknown', true,
      'matched', NOW() - interval '14 days', NOW() - interval '4 days'
    );
  END IF;

  -- Referral 8 - Cancelled (Closed) / Routine / Other
  IF array_length(v_student_ids, 1) >= 8 THEN
    v_student_id := v_student_ids[8];
    INSERT INTO therapist_referrals (
      id, student_id, counselor_id, school_id,
      reason, service_types, additional_context,
      urgency, insurance_status, parent_notification_confirmed,
      status, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_student_id, v_counselor_id, v_school_id,
      'other', ARRAY['psychiatric_services'], 'Family requested cancellation; pursuing private care.',
      'routine', 'has_insurance', true,
      'cancelled', NOW() - interval '15 days', NOW() - interval '5 days'
    );
  END IF;

  RAISE NOTICE 'Therapist referrals seeded successfully.';
END $$;
