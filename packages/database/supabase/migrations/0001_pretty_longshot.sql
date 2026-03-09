CREATE TYPE "public"."ethnicity" AS ENUM('american_indian_or_alaska_native', 'asian', 'black_or_african_american', 'hispanic_or_latino', 'middle_eastern_or_north_african', 'native_hawaiian_or_pacific_islander', 'white', 'prefer_not_to_answer');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('english', 'spanish', 'french', 'chinese_simplified', 'arabic', 'haitian_creole', 'bengali', 'russian', 'urdu', 'vietnamese', 'portuguese');--> statement-breakpoint
ALTER TABLE "profiles" RENAME COLUMN "race" TO "ethnicity";--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "language" "language";--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "onboarding_completed_at" timestamp;