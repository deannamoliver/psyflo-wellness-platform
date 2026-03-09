CREATE TYPE "public"."user_school_role" AS ENUM('student', 'educator');--> statement-breakpoint
CREATE TABLE "schools" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"email" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_schools" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"school_id" uuid NOT NULL,
	"role" "user_school_role" DEFAULT 'student' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "user_schools" ADD CONSTRAINT "user_schools_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_schools" ADD CONSTRAINT "user_schools_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;