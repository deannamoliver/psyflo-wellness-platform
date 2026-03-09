-- =====================================================================
-- Create an additional wellness coach for Psyflo Academy
-- =====================================================================
-- Run in Supabase SQL Editor (Dashboard > SQL Editor)
--
-- Mirrors the wellness coach creation in npm run db:seed (createTestUsers
-- in packages/database/src/seed/helpers.ts): same school, role, profile
-- shape, and settings. This adds a second coach (wellness.coach2@psyflo.com);
-- the seed creates wellness.coach@psyflo.com (Coach Martinez).
--
-- Prerequisite: Seed must have been run at least once (schools + domain
-- exist). To match seed login behavior, set this user's password to
-- "password" in Supabase Dashboard (Authentication > Users) after running.
-- =====================================================================

DO $$
DECLARE
  psyflo_school_id uuid;
  coach_id uuid := gen_random_uuid();
  coach_email text := 'wellness.coach2@psyflo.com';
  coach_first_name text := 'Jordan';
  coach_last_name text := 'Lee';
BEGIN
  -- Get Psyflo Academy school (same as seed: seed.ts uses schools.find(s => s.name === "Psyflo Academy"))
  SELECT id INTO psyflo_school_id
  FROM schools
  WHERE name = 'Psyflo Academy'
  LIMIT 1;

  IF psyflo_school_id IS NULL THEN
    RAISE EXCEPTION 'Psyflo Academy not found. Run npm run db:seed first.';
  END IF;

  -- Create wellness coach for Psyflo Academy (same shape as seed createTestUsers wellness coach)
  -- Seed: supabaseAdminClient.auth.admin.createUser({ email, password: "password", email_confirm: true, user_metadata: { first_name, last_name } })
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    aud,
    role,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    coach_id,
    '00000000-0000-0000-0000-000000000000',
    coach_email,
    '',  -- set password in Dashboard to "password" to match seed test users
    NOW(),
    'authenticated',
    'authenticated',
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('first_name', coach_first_name, 'last_name', coach_last_name),
    '',
    '',
    '',
    ''
  );

  -- Seed uses createUser (which creates identity); we must insert identity explicitly
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    coach_id,
    coach_id,
    jsonb_build_object('sub', coach_id::text, 'email', coach_email),
    'email',
    NOW(),
    NOW(),
    NOW()
  );

  -- Seed: db.insert(schema.profiles).values({ id, dateOfBirth: null, grade: null, gender: null, pronouns: null, language: "english", ethnicity: null, onboardingCompletedAt: new Date() })
  INSERT INTO profiles (
    id,
    date_of_birth,
    grade,
    gender,
    pronouns,
    language,
    ethnicity,
    onboarding_completed_at,
    created_at,
    updated_at
  ) VALUES (
    coach_id,
    NULL,
    NULL,
    NULL,
    NULL,
    'english',
    NULL,
    NOW(),
    NOW(),
    NOW()
  );

  -- Seed: db.insert(schema.userSchools).values({ userId, schoolId, role: "wellness_coach" })
  INSERT INTO user_schools (id, user_id, school_id, role, created_at, updated_at)
  VALUES (gen_random_uuid(), coach_id, psyflo_school_id, 'wellness_coach', NOW(), NOW());

  -- Seed: db.insert(schema.userSettings).values({ id, timezone: "America/New_York" })
  INSERT INTO user_settings (id, timezone)
  VALUES (coach_id, 'America/New_York');

  RAISE NOTICE 'Created wellness coach: % (%) – %', coach_id, coach_first_name || ' ' || coach_last_name, coach_email;
  RAISE NOTICE 'Set password to "password" in Supabase Dashboard if you want same login as seed test users.';
END $$;
