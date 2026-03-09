ALTER TABLE "alerts" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."alert_type";--> statement-breakpoint
CREATE TYPE "public"."alert_type" AS ENUM('safety', 'depression', 'anxiety');--> statement-breakpoint
ALTER TABLE "alerts" ALTER COLUMN "type" SET DATA TYPE "public"."alert_type" USING "type"::"public"."alert_type";