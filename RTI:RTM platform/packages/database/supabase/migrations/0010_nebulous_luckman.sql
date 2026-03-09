ALTER TABLE "alert_actions" DROP CONSTRAINT "alert_actions_alert_id_alerts_id_fk";
--> statement-breakpoint
ALTER TABLE "alert_notes" DROP CONSTRAINT "alert_notes_alert_id_alerts_id_fk";
--> statement-breakpoint
ALTER TABLE "alert_status_changes" DROP CONSTRAINT "alert_status_changes_alert_id_alerts_id_fk";
--> statement-breakpoint
ALTER TABLE "alert_actions" ADD COLUMN "timeline_entry_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_notes" ADD COLUMN "timeline_entry_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_status_changes" ADD COLUMN "timeline_entry_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_actions" ADD CONSTRAINT "alert_actions_timeline_entry_id_alert_timeline_entries_id_fk" FOREIGN KEY ("timeline_entry_id") REFERENCES "public"."alert_timeline_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_notes" ADD CONSTRAINT "alert_notes_timeline_entry_id_alert_timeline_entries_id_fk" FOREIGN KEY ("timeline_entry_id") REFERENCES "public"."alert_timeline_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_status_changes" ADD CONSTRAINT "alert_status_changes_timeline_entry_id_alert_timeline_entries_id_fk" FOREIGN KEY ("timeline_entry_id") REFERENCES "public"."alert_timeline_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_actions" DROP COLUMN "alert_id";--> statement-breakpoint
ALTER TABLE "alert_notes" DROP COLUMN "alert_id";--> statement-breakpoint
ALTER TABLE "alert_status_changes" DROP COLUMN "alert_id";