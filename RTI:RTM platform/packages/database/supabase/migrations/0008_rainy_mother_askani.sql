CREATE TYPE "public"."action_type" AS ENUM('contacted_988', 'notified_staff', 'contacted_parents', 'triggered_gad7', 'triggered_phq9');--> statement-breakpoint
CREATE TYPE "public"."alert_source" AS ENUM('chat', 'screener');--> statement-breakpoint
CREATE TYPE "public"."alert_status" AS ENUM('new', 'in_progress', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."alert_type" AS ENUM('safety', 'depression', 'anxiety');--> statement-breakpoint
CREATE TYPE "public"."timeline_entry_type" AS ENUM('alert_generated', 'alert_assigned', 'emergency_action', 'note_added', 'status_changed');--> statement-breakpoint
CREATE TABLE "alert_actions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"alert_id" uuid NOT NULL,
	"type" "action_type" NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "alert_notes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"alert_id" uuid NOT NULL,
	"content" text NOT NULL,
	"educator_id" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "alert_status_changes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"alert_id" uuid NOT NULL,
	"from_status" "alert_status" NOT NULL,
	"to_status" "alert_status" NOT NULL,
	"educator_id" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "alert_timeline_entries" (
	"id" uuid PRIMARY KEY NOT NULL,
	"alert_id" uuid NOT NULL,
	"type" timeline_entry_type NOT NULL,
	"description" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"student_id" uuid NOT NULL,
	"type" "alert_type" NOT NULL,
	"source" "alert_source" NOT NULL,
	"status" "alert_status" NOT NULL,
	"assigned_to" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "alert_actions" ADD CONSTRAINT "alert_actions_alert_id_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."alerts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_notes" ADD CONSTRAINT "alert_notes_alert_id_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."alerts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_notes" ADD CONSTRAINT "alert_notes_educator_id_users_id_fk" FOREIGN KEY ("educator_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_status_changes" ADD CONSTRAINT "alert_status_changes_alert_id_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."alerts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_status_changes" ADD CONSTRAINT "alert_status_changes_educator_id_users_id_fk" FOREIGN KEY ("educator_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_timeline_entries" ADD CONSTRAINT "alert_timeline_entries_alert_id_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."alerts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;