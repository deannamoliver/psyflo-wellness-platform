CREATE TYPE "public"."soli_color" AS ENUM('blue', 'teal', 'purple', 'pink', 'orange', 'green', 'yellow', 'royal');--> statement-breakpoint
CREATE TYPE "public"."soli_shape" AS ENUM('round', 'tall', 'wide', 'chunky');--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "soli_color" "soli_color" DEFAULT 'blue';--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "soli_shape" "soli_shape" DEFAULT 'round';--> statement-breakpoint
CREATE POLICY "authenticated can manage own settings" ON "user_settings" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = id);