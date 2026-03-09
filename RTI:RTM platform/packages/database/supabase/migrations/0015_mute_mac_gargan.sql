CREATE TYPE "public"."screener_type" AS ENUM('perceived_well_being', 'phq2', 'gad2', 'safety', 'sel');--> statement-breakpoint
ALTER TYPE "public"."score_type" RENAME TO "screener_subtype";--> statement-breakpoint
CREATE TABLE "screeners" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"grade" integer NOT NULL,
	"type" "screener_type" NOT NULL,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "screener_sessions" RENAME COLUMN "score_type" TO "subtype";--> statement-breakpoint
ALTER TABLE "screener_sessions" DROP CONSTRAINT "screener_sessions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "screener_sessions" ADD COLUMN "screener_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "screener_sessions" ADD COLUMN "max_score" real NOT NULL;--> statement-breakpoint
ALTER TABLE "screeners" ADD CONSTRAINT "screeners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screener_sessions" ADD CONSTRAINT "screener_sessions_screener_id_screeners_id_fk" FOREIGN KEY ("screener_id") REFERENCES "public"."screeners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screener_sessions" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "screener_sessions" DROP COLUMN "grade";--> statement-breakpoint
DROP TYPE "public"."score_category";