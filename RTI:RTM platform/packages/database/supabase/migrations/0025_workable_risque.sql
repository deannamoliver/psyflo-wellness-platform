ALTER TABLE "profiles" ALTER COLUMN "gender" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."gender";--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'non_binary', 'prefer_not_to_answer');--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "gender" SET DATA TYPE "public"."gender" USING "gender"::"public"."gender";--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "pronouns" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."pronoun";--> statement-breakpoint
CREATE TYPE "public"."pronoun" AS ENUM('he/him', 'she/her', 'they/them', 'prefer_not_to_answer');--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "pronouns" SET DATA TYPE "public"."pronoun" USING "pronouns"::"public"."pronoun";