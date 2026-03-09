CREATE TYPE "public"."message_role" AS ENUM('user', 'assistant');--> statement-breakpoint
CREATE TABLE "admin_test_cases" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "admin_test_cases" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "admin_test_messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"test_case_id" uuid NOT NULL,
	"role" "message_role" NOT NULL,
	"content" text NOT NULL,
	"sequence_order" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "admin_test_messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "admin_test_cases" ADD CONSTRAINT "admin_test_cases_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_test_messages" ADD CONSTRAINT "admin_test_messages_test_case_id_admin_test_cases_id_fk" FOREIGN KEY ("test_case_id") REFERENCES "public"."admin_test_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "admin can manage all test cases" ON "admin_test_cases" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all test messages" ON "admin_test_messages" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);