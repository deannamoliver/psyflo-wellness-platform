-- Assign wellness coaches to pending handoffs (as if each coach accepted themselves)
--
-- 1. Find wellness coaches: user_schools where role='wellness_coach' (userId = auth.users.id)
-- 2. For each pending handoff, pick a coach (prefer same school)
-- 3. Update wellness_coach_handoffs: accepted_by_coach_id, accepted_at, status
-- 4. Update chat_sessions: assigned_coach_id
-- 5. Insert wellness_coach_chat_entries: handoff entry per handoff
--
-- Coach selection: Prefer coach from handoff's school; else any wellness coach.

CREATE TEMP TABLE _coach_assignments AS
SELECT
  e.id AS handoff_id,
  e.chat_session_id,
  (
    SELECT us.user_id
    FROM public.user_schools us
    WHERE us.role = 'wellness_coach'
      AND (e.school_id IS NULL OR us.school_id = e.school_id)
    ORDER BY
      CASE WHEN e.school_id IS NOT NULL AND us.school_id = e.school_id THEN 0 ELSE 1 END,
      us.user_id
    LIMIT 1
  ) AS coach_id
FROM public.wellness_coach_handoffs e
WHERE e.status = 'pending'
  AND e.accepted_by_coach_id IS NULL;

-- Update handoffs: coach accepted
UPDATE public.wellness_coach_handoffs e
SET
  accepted_by_coach_id = a.coach_id,
  accepted_at = now(),
  status = 'accepted',
  updated_at = now()
FROM _coach_assignments a
WHERE e.id = a.handoff_id
  AND a.coach_id IS NOT NULL;

-- Update chat_sessions: assign coach to chat
UPDATE public.chat_sessions cs
SET assigned_coach_id = a.coach_id,
    updated_at = now()
FROM _coach_assignments a
WHERE cs.id = a.chat_session_id
  AND a.coach_id IS NOT NULL;

-- Insert handoff entries (as if coach joined the conversation)
INSERT INTO public.wellness_coach_chat_entries (escalation_id, type, content, author, sender_user_id)
SELECT
  a.handoff_id,
  'handoff'::public.wellness_coach_chat_entry_type,
  'Hi! What''s up, I''m your wellness coach.',
  'coach'::public.wellness_coach_chat_entry_author,
  a.coach_id
FROM _coach_assignments a
WHERE a.coach_id IS NOT NULL;
