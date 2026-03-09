CREATE TYPE "public"."specific_emotion" AS ENUM('playful', 'joyful', 'curious', 'confident', 'valued', 'creative', 'peaceful', 'hopeful', 'lonely', 'left_out', 'guilty', 'embarrassed', 'empty', 'hurt', 'let_down', 'scared', 'nervous', 'worried', 'insecure', 'powerless', 'threatened', 'disrespected', 'holding_a_grudge', 'mad', 'jealous', 'aggressive', 'frustrated', 'annoyed', 'grossed_out', 'horrified', 'disapproving', 'disappointed', 'offended', 'excited', 'shocked', 'amazed', 'confused', 'startled', 'anxious', 'blah', 'tired', 'stressed', 'bored', 'overwhelmed', 'distracted', 'excluded');--> statement-breakpoint
CREATE TYPE "public"."universal_emotion" AS ENUM('happy', 'sad', 'afraid', 'angry', 'disgusted', 'surprised', 'bad');--> statement-breakpoint
CREATE TABLE "mood_check_ins" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"universal_emotion" "universal_emotion",
	"specific_emotion" "specific_emotion",
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "mood_check_ins" ADD CONSTRAINT "mood_check_ins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;