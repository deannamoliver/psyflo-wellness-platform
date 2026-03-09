ALTER TABLE "profiles" ADD COLUMN "interests" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "learning_styles" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "goals" text[] DEFAULT '{}' NOT NULL;