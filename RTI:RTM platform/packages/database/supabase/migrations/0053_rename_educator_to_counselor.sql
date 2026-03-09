-- Migration: Rename 'educator' to 'counselor' throughout the schema
-- This migration:
-- 1. Renames enum value 'educator' to 'counselor' in user_school_role
-- 2. Renames enum value 'educator' to 'counselor' in alert_resolved_by
-- 3. Renames column educator_id to counselor_id in alert_notes
-- 4. Renames column educator_id to counselor_id in alert_status_changes

-- Step 1: Rename enum value in user_school_role
ALTER TYPE public.user_school_role RENAME VALUE 'educator' TO 'counselor';

-- Step 2: Rename enum value in alert_resolved_by
ALTER TYPE public.alert_resolved_by RENAME VALUE 'educator' TO 'counselor';

-- Step 3: Rename column in alert_notes
ALTER TABLE public.alert_notes RENAME COLUMN educator_id TO counselor_id;

-- Step 4: Rename column in alert_status_changes
ALTER TABLE public.alert_status_changes RENAME COLUMN educator_id TO counselor_id;
