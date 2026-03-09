ALTER TABLE "screener_sessions" ALTER COLUMN "score" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "screener_sessions" ALTER COLUMN "max_score" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "screeners" ADD COLUMN "score" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "screeners" ADD COLUMN "max_score" real DEFAULT 0 NOT NULL;