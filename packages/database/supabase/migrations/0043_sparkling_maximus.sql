CREATE TYPE "public"."shutdown_risk_type" AS ENUM('direct', 'indirect', 'ambiguous');--> statement-breakpoint
ALTER TABLE "chat_alerts" ADD COLUMN "is_shutdown" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_alerts" ADD COLUMN "shutdown_risk_type" "shutdown_risk_type";