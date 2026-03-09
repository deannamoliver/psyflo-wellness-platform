CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'non-binary', 'prefer not to say', 'other');--> statement-breakpoint
CREATE TYPE "public"."pronoun" AS ENUM('he/him', 'she/her', 'they/them', 'other');--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"date_of_birth" date,
	"grade" integer,
	"gender" "gender",
	"pronouns" "pronoun",
	"race" text
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "authenticated can manage own profile" ON "profiles" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = id);--> statement-breakpoint
CREATE POLICY "admin can manage all profiles" ON "profiles" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);