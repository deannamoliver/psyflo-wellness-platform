-- Add 'takeover' to the conversation_event_type enum
ALTER TYPE conversation_event_type ADD VALUE IF NOT EXISTS 'takeover';
