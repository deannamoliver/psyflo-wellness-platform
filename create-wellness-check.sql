-- Create a wellness check (PHQ-A screener) for user 43d54fdf-3dd3-4f98-a21a-ec14f5bb4d86
-- This will make a wellness check appear on the student dashboard
--
-- PHQ-A is a 9-question depression screener for ages 11-17
-- Max score = 9 questions * 3 (max score per question) = 27

WITH screener_insert AS (
  -- Step 1: Create the screener record
  INSERT INTO screeners (
    id,
    user_id,
    age,
    type,
    completed_at,
    score,
    max_score,
    domain_scores,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    '43d54fdf-3dd3-4f98-a21a-ec14f5bb4d86',
    15, -- Age 15 (within PHQ-A range of 11-17)
    'phq_a',
    NULL, -- Not completed yet
    0,
    27, -- Max score: 9 questions * 3 points each
    '{}',
    NOW(),
    NOW()
  )
  RETURNING id AS screener_id
),
session_insert AS (
  -- Step 2: Create the screener session
  -- PHQ-A is a single-part screener (part 1)
  INSERT INTO screener_sessions (
    id,
    screener_id,
    start_at,
    part,
    subtype,
    completed_at,
    score,
    max_score,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    screener_id,
    NOW() - INTERVAL '1 hour', -- Started 1 hour ago (ensures it's available)
    1, -- Part 1 for PHQ-A
    'phq_a',
    NULL, -- Not completed yet
    0,
    27, -- Max score: 9 questions * 3 points each
    NOW(),
    NOW()
  FROM screener_insert
  RETURNING id AS session_id
)
-- Step 3: Create response records for all 9 PHQ-A questions
-- All questions start with answer_code = NULL (unanswered)
INSERT INTO screener_session_responses (
  id,
  session_id,
  ordinal,
  question_code,
  answer_code,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  session_id,
  ordinal,
  question_code,
  NULL, -- Unanswered
  NOW(),
  NOW()
FROM session_insert
CROSS JOIN (
  VALUES
    (1, 'PHQA_1'),
    (2, 'PHQA_2'),
    (3, 'PHQA_3'),
    (4, 'PHQA_4'),
    (5, 'PHQA_5'),
    (6, 'PHQA_6'),
    (7, 'PHQA_7'),
    (8, 'PHQA_8'),
    (9, 'PHQA_9')
) AS questions(ordinal, question_code);
