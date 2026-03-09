CREATE TABLE "admin_evals" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "admin_evals" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "admin_evals" ADD CONSTRAINT "admin_evals_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "admin can manage all evals" ON "admin_evals" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);