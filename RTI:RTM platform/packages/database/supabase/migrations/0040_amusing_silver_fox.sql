CREATE TABLE "chat_alerts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"alert_id" uuid NOT NULL,
	"chat_session_id" uuid NOT NULL,
	"triggering_statement" text NOT NULL,
	"conversation_context" text NOT NULL,
	"questionnaire_state" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "chat_alerts_alertId_unique" UNIQUE("alert_id")
);
--> statement-breakpoint
ALTER TABLE "chat_alerts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "chat_alerts" ADD CONSTRAINT "chat_alerts_alert_id_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."alerts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "admin can manage all chat alerts" ON "chat_alerts" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);