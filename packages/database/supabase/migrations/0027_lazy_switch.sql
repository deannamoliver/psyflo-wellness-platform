ALTER TABLE "alerts" DROP CONSTRAINT "alerts_assigned_to_users_id_fk";
--> statement-breakpoint
ALTER TABLE "alert_timeline_entries" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."timeline_entry_type";--> statement-breakpoint
CREATE TYPE "public"."timeline_entry_type" AS ENUM('alert_generated', 'emergency_action', 'note_added', 'status_changed');--> statement-breakpoint
ALTER TABLE "alert_timeline_entries" ALTER COLUMN "type" SET DATA TYPE timeline_entry_type USING "type"::timeline_entry_type;--> statement-breakpoint
ALTER TABLE "alerts" DROP COLUMN "assigned_to";