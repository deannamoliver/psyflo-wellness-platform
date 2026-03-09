CREATE TYPE "public"."prompt_type" AS ENUM('system', 'user_guidance', 'safety_response');--> statement-breakpoint
CREATE TABLE "admin_prompts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "prompt_type" DEFAULT 'system' NOT NULL,
	"content" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "admin_prompts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "admin_prompts" ADD CONSTRAINT "admin_prompts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "admin can manage all prompts" ON "admin_prompts" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);