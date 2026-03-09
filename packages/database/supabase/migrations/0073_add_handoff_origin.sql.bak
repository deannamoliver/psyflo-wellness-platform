-- Add origin column to wellness_coach_handoffs to distinguish
-- user-initiated handoffs from automatic risk-protocol handoffs.
CREATE TYPE "public"."wellness_coach_handoff_origin" AS ENUM('user', 'risk_protocol');

ALTER TABLE "wellness_coach_handoffs"
  ADD COLUMN "origin" "wellness_coach_handoff_origin" NOT NULL DEFAULT 'user';
