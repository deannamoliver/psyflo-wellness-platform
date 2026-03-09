-- Phase 2: Wellness coach handoff and chat tables
-- Add wellness_coach to user_school_role enum
ALTER TYPE "public"."user_school_role" ADD VALUE IF NOT EXISTS 'wellness_coach';--> statement-breakpoint

-- Create handoff status enum
CREATE TYPE "public"."wellness_coach_escalation_status" AS ENUM(
  'pending',
  'accepted',
  'in_progress',
  'completed',
  'cancelled'
);--> statement-breakpoint

-- Create chat entry type enum
CREATE TYPE "public"."wellness_coach_chat_entry_type" AS ENUM('handoff', 'message');--> statement-breakpoint

-- Create chat entry author enum
CREATE TYPE "public"."wellness_coach_chat_entry_author" AS ENUM('student', 'coach');--> statement-breakpoint

-- Create wellness_coach_handoffs table
CREATE TABLE "public"."wellness_coach_handoffs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "chat_session_id" uuid NOT NULL REFERENCES "public"."chat_sessions"("id") ON DELETE CASCADE,
  "student_id" uuid NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "school_id" uuid REFERENCES "public"."schools"("id") ON DELETE SET NULL,
  "reason" text NOT NULL,
  "topic" text NOT NULL,
  "other_detail" text,
  "status" "public"."wellness_coach_escalation_status" NOT NULL DEFAULT 'pending',
  "requested_at" timestamptz NOT NULL DEFAULT now(),
  "accepted_by_coach_id" uuid REFERENCES "auth"."users"("id") ON DELETE SET NULL,
  "accepted_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);--> statement-breakpoint

ALTER TABLE "public"."wellness_coach_handoffs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "admin can manage all wellness coach handoffs"
ON "public"."wellness_coach_handoffs"
AS PERMISSIVE
FOR ALL
TO "service_role"
USING (true);--> statement-breakpoint

-- Create wellness_coach_chat_entries table
CREATE TABLE "public"."wellness_coach_chat_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "escalation_id" uuid NOT NULL REFERENCES "public"."wellness_coach_handoffs"("id") ON DELETE CASCADE,
  "type" "public"."wellness_coach_chat_entry_type" NOT NULL,
  "content" text NOT NULL,
  "author" "public"."wellness_coach_chat_entry_author",
  "sender_user_id" uuid REFERENCES "auth"."users"("id") ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);--> statement-breakpoint

ALTER TABLE "public"."wellness_coach_chat_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "admin can manage all wellness coach chat entries"
ON "public"."wellness_coach_chat_entries"
AS PERMISSIVE
FOR ALL
TO "service_role"
USING (true);--> statement-breakpoint

-- Add assigned_coach_id to chat_sessions
ALTER TABLE "public"."chat_sessions" ADD COLUMN "assigned_coach_id" uuid REFERENCES "auth"."users"("id") ON DELETE SET NULL;
