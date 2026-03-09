-- =====================================================================
-- Create Active Wellness Coach Conversations
-- =====================================================================
-- Run in Supabase SQL Editor (Dashboard > SQL Editor)
--
-- This script creates test students with active wellness coach conversations.
-- The conversations will appear in the counselor dashboard under "Active Conversations".
-- =====================================================================

-- =====================================================================
-- CONFIGURATION - Edit these values as needed
-- =====================================================================
DO $$
DECLARE
  -- School ID - Change this to target a different school
  target_school_id uuid := '019c29b3-96b6-7178-8b9f-9f7c904eb8d7';

  -- Number of active conversations to create
  num_conversations int := 3;

  -- Variables used in script
  coach_id uuid;
  student_id uuid;
  chat_session_id uuid;
  handoff_id uuid;
  i int;
  student_first_names text[] := ARRAY['Emma', 'Liam', 'Sophia', 'Noah', 'Olivia'];
  student_last_names text[] := ARRAY['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
  topics text[] := ARRAY['Stress & Anxiety', 'Academic Pressure', 'Social Relationships', 'Family Issues', 'Self-Esteem'];
  reasons text[] := ARRAY[
    'Student expressed feeling overwhelmed and requested to speak with a wellness coach',
    'Student mentioned persistent anxiety symptoms and wanted support',
    'Student asked for help with stress management techniques'
  ];

BEGIN
  -- =====================================================================
  -- Step 1: Find or create a wellness coach for the school
  -- =====================================================================
  SELECT us.user_id INTO coach_id
  FROM user_schools us
  WHERE us.school_id = target_school_id
    AND us.role = 'wellness_coach'
    AND us.deleted_at IS NULL
  LIMIT 1;

  IF coach_id IS NULL THEN
    -- Create a new wellness coach user
    coach_id := gen_random_uuid();

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
      'wellness.coach.' || substring(target_school_id::text, 1, 8) || '@psyflo.com',
      '',
      NOW(),
      'authenticated',
      'authenticated',
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"Sarah","last_name":"Thompson"}',
      '',
      '',
      '',
      ''
    );

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
      jsonb_build_object('sub', coach_id::text, 'email', 'wellness.coach.' || substring(target_school_id::text, 1, 8) || '@psyflo.com'),
      'email',
      NOW(),
      NOW(),
      NOW()
    );

    INSERT INTO user_schools (id, user_id, school_id, role, created_at, updated_at)
    VALUES (gen_random_uuid(), coach_id, target_school_id, 'wellness_coach', NOW(), NOW());

    RAISE NOTICE 'Created wellness coach: % (Sarah Thompson)', coach_id;
  ELSE
    RAISE NOTICE 'Using existing wellness coach: %', coach_id;
  END IF;

  -- =====================================================================
  -- Step 2: Create students with active conversations
  -- =====================================================================
  FOR i IN 1..num_conversations LOOP
    -- Create a new student user
    student_id := gen_random_uuid();
    chat_session_id := gen_random_uuid();
    handoff_id := gen_random_uuid();

    -- Create student auth user
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
      student_id,
      '00000000-0000-0000-0000-000000000000',
      lower(student_first_names[i]) || '.' || lower(student_last_names[i]) || '.' || substring(gen_random_uuid()::text, 1, 4) || '@student.example.com',
      '',
      NOW(),
      'authenticated',
      'authenticated',
      NOW() - (random() * interval '30 days'),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('first_name', student_first_names[i], 'last_name', student_last_names[i]),
      '',
      '',
      '',
      ''
    );

    -- Create student identity
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
      student_id,
      student_id,
      jsonb_build_object('sub', student_id::text),
      'email',
      NOW(),
      NOW(),
      NOW()
    );

    -- Create student profile
    INSERT INTO profiles (id, date_of_birth, grade, created_at, updated_at)
    VALUES (
      student_id,
      (CURRENT_DATE - (interval '1 year' * (14 + floor(random() * 4)::int)))::date,
      9 + floor(random() * 4)::int,
      NOW(),
      NOW()
    );

    -- Link student to school
    INSERT INTO user_schools (id, user_id, school_id, role, created_at, updated_at)
    VALUES (gen_random_uuid(), student_id, target_school_id, 'student', NOW(), NOW());

    -- Create chat session for the student
    INSERT INTO chat_sessions (id, user_id, title, assigned_coach_id, created_at, updated_at)
    VALUES (
      chat_session_id,
      student_id,
      'Wellness Check-in',
      coach_id,
      NOW() - (random() * interval '7 days'),
      NOW()
    );

    -- Create wellness coach handoff (accepted status = active conversation)
    INSERT INTO wellness_coach_handoffs (
      id,
      chat_session_id,
      student_id,
      school_id,
      reason,
      topic,
      status,
      requested_at,
      accepted_by_coach_id,
      accepted_at,
      created_at,
      updated_at
    ) VALUES (
      handoff_id,
      chat_session_id,
      student_id,
      target_school_id,
      reasons[1 + (i - 1) % array_length(reasons, 1)],
      topics[i],
      (CASE WHEN i = 1 THEN 'in_progress' ELSE 'accepted' END)::wellness_coach_escalation_status,
      NOW() - (random() * interval '3 days'),
      coach_id,
      NOW() - (random() * interval '2 days'),
      NOW() - (random() * interval '3 days'),
      NOW()
    );

    -- Create chat entries to simulate a conversation
    -- Entry 1: Handoff message from coach
    INSERT INTO wellness_coach_chat_entries (id, escalation_id, content, author, sender_user_id, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      handoff_id,
      'Hi ' || student_first_names[i] || '! I''m your wellness coach. I''m here to listen and help. What''s on your mind today?',
      'coach',
      coach_id,
      NOW() - interval '2 days' + (i * interval '1 hour'),
      NOW()
    );

    -- Entry 2: Student response
    INSERT INTO wellness_coach_chat_entries (id, escalation_id, content, author, sender_user_id, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      handoff_id,
      CASE i
        WHEN 1 THEN 'I''ve been feeling really stressed lately with all my schoolwork piling up. I don''t know how to manage everything.'
        WHEN 2 THEN 'Thanks for reaching out. I''ve been having trouble sleeping because I keep worrying about upcoming tests.'
        ELSE 'I''ve been feeling a bit down lately. Some things happened with my friends and I''m not sure how to handle it.'
      END,
      'student',
      student_id,
      NOW() - interval '1 day' + (i * interval '2 hours'),
      NOW()
    );

    -- Entry 3: For first conversation only, add another coach reply so it shows "Waiting on Student"
    IF i = 1 THEN
      INSERT INTO wellness_coach_chat_entries (id, escalation_id, content, author, sender_user_id, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        handoff_id,
        'I understand how overwhelming that can feel. Let''s work through this together. Can you tell me more about what specific subjects or assignments are causing the most stress?',
        'coach',
        coach_id,
        NOW() - interval '12 hours',
        NOW()
      );
    END IF;

    RAISE NOTICE 'Created conversation % for student % % (status: %)',
      i,
      student_first_names[i],
      student_last_names[i],
      CASE WHEN i = 1 THEN 'in_progress' ELSE 'accepted' END;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '=====================================================================';
  RAISE NOTICE 'SUCCESS: Created % active conversations for school %', num_conversations, target_school_id;
  RAISE NOTICE '=====================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Summary:';
  RAISE NOTICE '  - Wellness Coach ID: %', coach_id;
  RAISE NOTICE '  - Created % students with handoffs', num_conversations;
  RAISE NOTICE '  - Conversation 1 shows "Waiting on Student" (last message from coach)';
  RAISE NOTICE '  - Conversations 2-3 show "Needs Coach Reply" (last message from student)';

END $$;
