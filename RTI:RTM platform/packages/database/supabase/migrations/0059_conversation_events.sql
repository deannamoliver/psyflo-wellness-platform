-- Migration: Add conversation_events table for close/transfer/reopen tracking
-- Run with: psql $DATABASE_URL -f packages/database/migrations/conversation-events.sql

-- Create enum for event types
CREATE TYPE conversation_event_type AS ENUM ('closed', 'transferred', 'reopened');

-- Create conversation_events table
CREATE TABLE conversation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handoff_id UUID NOT NULL REFERENCES wellness_coach_handoffs(id) ON DELETE CASCADE,
  event_type conversation_event_type NOT NULL,
  performed_by_coach_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Close-specific fields
  closure_reason TEXT,
  closing_summary TEXT,
  student_notified BOOLEAN DEFAULT false,

  -- Transfer-specific fields
  transfer_to_coach_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  transfer_reason TEXT,
  transfer_notes TEXT,

  -- Reopen-specific fields
  reopen_reason TEXT,
  reopen_context TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE conversation_events ENABLE ROW LEVEL SECURITY;

-- Admin policy (matches existing pattern)
CREATE POLICY "admin can manage all conversation events"
  ON conversation_events
  FOR ALL
  TO supabase_auth_admin
  USING (true);

-- Index for fast lookups by handoff
CREATE INDEX idx_conversation_events_handoff_id ON conversation_events(handoff_id);
CREATE INDEX idx_conversation_events_event_type ON conversation_events(event_type);
