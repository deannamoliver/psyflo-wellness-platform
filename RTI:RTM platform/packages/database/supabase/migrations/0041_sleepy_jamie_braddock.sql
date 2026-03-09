ALTER TABLE "chat_alerts" ADD COLUMN "clarification_responses" jsonb;--> statement-breakpoint
ALTER TABLE "chat_alerts" ADD COLUMN "cssr_state" jsonb;--> statement-breakpoint
ALTER TABLE "chat_alerts" DROP COLUMN "questionnaire_state";