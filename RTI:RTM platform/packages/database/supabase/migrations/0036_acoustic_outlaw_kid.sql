ALTER TABLE "school_email_filter_settings" RENAME COLUMN "enabled" TO "student_filtering_enabled";--> statement-breakpoint
DROP INDEX "school_email_unique";--> statement-breakpoint
ALTER TABLE "school_allowed_emails" ADD COLUMN "role" "user_school_role" NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "school_email_role_unique" ON "school_allowed_emails" USING btree ("school_id","email","role");