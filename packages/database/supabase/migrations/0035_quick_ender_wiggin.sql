CREATE TABLE IF NOT EXISTS "school_allowed_emails" (
	"id" uuid PRIMARY KEY NOT NULL,
	"school_id" uuid NOT NULL,
	"email" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "school_allowed_emails" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "school_email_filter_settings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"school_id" uuid NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "school_email_filter_settings_school_id_unique" UNIQUE("school_id")
);
--> statement-breakpoint
ALTER TABLE "school_email_filter_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "school_allowed_emails" ADD CONSTRAINT "school_allowed_emails_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "school_email_filter_settings" ADD CONSTRAINT "school_email_filter_settings_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "school_email_unique" ON "school_allowed_emails" USING btree ("school_id","email");--> statement-breakpoint
DO $$ BEGIN
 CREATE POLICY "admin can manage all school allowed emails" ON "school_allowed_emails" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE POLICY "admin can manage all school email filter settings" ON "school_email_filter_settings" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;