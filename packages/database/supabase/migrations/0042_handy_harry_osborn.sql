CREATE TYPE "public"."alert_resolved_by" AS ENUM('educator', 'chatbot');--> statement-breakpoint
ALTER TABLE "alerts" ADD COLUMN "resolved_by" "alert_resolved_by";