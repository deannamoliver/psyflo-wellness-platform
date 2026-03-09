ALTER TABLE "chat_messages" ALTER COLUMN "author" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."chat_author";--> statement-breakpoint
CREATE TYPE "public"."chat_author" AS ENUM('user', 'assistant');--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "author" SET DATA TYPE "public"."chat_author" USING "author"::"public"."chat_author";