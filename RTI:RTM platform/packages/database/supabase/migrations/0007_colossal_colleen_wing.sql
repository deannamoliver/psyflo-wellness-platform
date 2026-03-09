CREATE TYPE "public"."score_category" AS ENUM('mental_health', 'sel');--> statement-breakpoint
CREATE TYPE "public"."score_type" AS ENUM('perceived_well_being', 'phq2', 'gad2', 'safety', 'cognitive', 'emotion', 'social', 'values', 'perspective', 'identity');--> statement-breakpoint
CREATE TABLE "screener_session_responses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"session_id" uuid NOT NULL,
	"question_code" varchar(50) NOT NULL,
	"answer_code" varchar(50),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "screener_sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"start_at" timestamp NOT NULL,
	"part" integer NOT NULL,
	"score_type" "score_type" NOT NULL,
	"score" real NOT NULL,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "screener_session_responses" ADD CONSTRAINT "screener_session_responses_session_id_screener_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."screener_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screener_sessions" ADD CONSTRAINT "screener_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;