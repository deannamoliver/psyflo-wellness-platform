-- Drop type column from wellness_coach_chat_entries
-- Handoff can be inferred programmatically (e.g. first coach message); all entries are regular messages

ALTER TABLE public.wellness_coach_chat_entries DROP COLUMN IF EXISTS type;

DROP TYPE IF EXISTS public.wellness_coach_chat_entry_type;
