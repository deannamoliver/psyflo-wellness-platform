-- Fixed migration that handles existing data
-- This replaces the problematic 0031_marvelous_blur.sql

-- Step 1: Convert columns to text to allow data transformation
ALTER TABLE "screener_sessions" ALTER COLUMN "subtype" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "screeners" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint

-- Step 2: Update existing data to use new enum values
UPDATE "screener_sessions" 
SET "subtype" = CASE 
  -- Mental health subtypes
  WHEN "subtype" = 'perceived_well_being' THEN 'sel_self_awareness_self_concept'
  WHEN "subtype" = 'phq2' THEN 'phq_a'
  WHEN "subtype" = 'phq9' THEN 'phq_9'
  WHEN "subtype" = 'gad2' THEN 'gad_child'
  WHEN "subtype" = 'gad7' THEN 'gad_7'
  WHEN "subtype" = 'safety' THEN 'sel_self_awareness_self_concept'
  -- SEL subtypes (map original SEL categories to new ones)
  WHEN "subtype" = 'cognitive' THEN 'sel_self_awareness_self_concept'
  WHEN "subtype" = 'emotion' THEN 'sel_self_awareness_emotion_knowledge'
  WHEN "subtype" = 'social' THEN 'sel_social_awareness'
  WHEN "subtype" = 'values' THEN 'sel_responsible_decision_making'
  WHEN "subtype" = 'perspective' THEN 'sel_self_management_emotion_regulation'
  WHEN "subtype" = 'identity' THEN 'sel_self_awareness_self_concept'
  WHEN "subtype" = 'sel' THEN 'sel_self_awareness_self_concept'
  ELSE "subtype" -- Keep any values that already match new enum
END;--> statement-breakpoint

UPDATE "screeners"
SET "type" = CASE
  WHEN "type" = 'perceived_well_being' THEN 'sel'
  WHEN "type" = 'phq2' THEN 'phq_a'
  WHEN "type" = 'phq9' THEN 'phq_9'
  WHEN "type" = 'gad2' THEN 'gad_child'
  WHEN "type" = 'gad7' THEN 'gad_7'
  WHEN "type" = 'safety' THEN 'sel'
  WHEN "type" = 'social' THEN 'sel'
  WHEN "type" = 'emotional' THEN 'sel'
  WHEN "type" = 'self_management' THEN 'sel'
  WHEN "type" = 'relationship' THEN 'sel'
  WHEN "type" = 'decision_making' THEN 'sel'
  ELSE "type" -- Keep any values that already match new enum
END;--> statement-breakpoint

-- Step 3: Drop old enum types
DROP TYPE IF EXISTS "public"."screener_subtype";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."screener_type";--> statement-breakpoint

-- Step 4: Create new enum types
CREATE TYPE "public"."screener_subtype" AS ENUM('sel_self_awareness_self_concept', 'sel_self_awareness_emotion_knowledge', 'sel_social_awareness', 'sel_self_management_emotion_regulation', 'sel_self_management_goal_management', 'sel_self_management_school_work', 'sel_relationship_skills', 'sel_responsible_decision_making', 'phq_a', 'phq_9', 'gad_child', 'gad_7');--> statement-breakpoint
CREATE TYPE "public"."screener_type" AS ENUM('sel', 'phq_a', 'phq_9', 'gad_child', 'gad_7');--> statement-breakpoint

-- Step 5: Convert columns back to enum types
ALTER TABLE "screener_sessions" ALTER COLUMN "subtype" SET DATA TYPE "public"."screener_subtype" USING "subtype"::"public"."screener_subtype";--> statement-breakpoint
ALTER TABLE "screeners" ALTER COLUMN "type" SET DATA TYPE "public"."screener_type" USING "type"::"public"."screener_type";--> statement-breakpoint

-- Step 6: Handle the grade -> age migration
-- Add age column with default value first
ALTER TABLE "screeners" ADD COLUMN "age" integer;--> statement-breakpoint

-- Convert grade to age (adjust this mapping based on your business logic)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name='screeners' AND column_name='grade'
  ) THEN
    UPDATE "screeners"
    SET "age" = CASE
      WHEN "grade" IS NULL THEN 18 -- Default for NULL grade
      WHEN "grade" <= 5 THEN 10  -- Elementary: assume age 10
      WHEN "grade" <= 8 THEN 13  -- Middle school: assume age 13  
      WHEN "grade" <= 12 THEN 16 -- High school: assume age 16
      ELSE 18 -- College or beyond: assume age 18
    END;
  ELSE
    -- If grade column does not exist, set age to default
    UPDATE "screeners" SET "age" = 18;
  END IF;
END
$$;--> statement-breakpoint

-- Now make age NOT NULL
ALTER TABLE "screeners" ALTER COLUMN "age" SET NOT NULL;--> statement-breakpoint

-- Step 7: Add other new columns
ALTER TABLE "screeners" ADD COLUMN "domain_scores" jsonb DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "screeners" ADD COLUMN "last_score" real;--> statement-breakpoint

-- Step 8: Drop the old grade column
ALTER TABLE "screeners" DROP COLUMN "grade";--> statement-breakpoint