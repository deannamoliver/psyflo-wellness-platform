CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"quote" text NOT NULL,
	"author" text NOT NULL,
	"year" integer NOT NULL,
	"source" text NOT NULL,
	"themes" text[] DEFAULT '{}' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "quotes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "authenticated can view quotes" ON "quotes" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all quotes" ON "quotes" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);