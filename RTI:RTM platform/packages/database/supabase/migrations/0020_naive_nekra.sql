CREATE TABLE "screener_alerts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"screener_id" uuid NOT NULL,
	"alert_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "screener_alerts" ADD CONSTRAINT "screener_alerts_screener_id_screeners_id_fk" FOREIGN KEY ("screener_id") REFERENCES "public"."screeners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screener_alerts" ADD CONSTRAINT "screener_alerts_alert_id_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."alerts"("id") ON DELETE cascade ON UPDATE no action;