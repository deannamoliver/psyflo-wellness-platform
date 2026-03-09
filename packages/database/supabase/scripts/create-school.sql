-- Create a school
-- Run in Supabase SQL Editor (Dashboard > SQL Editor)
--
-- Edit the variables below, then run the script.

DO $$
DECLARE
  school_name text := 'Default School';
  school_address text := null;
  school_email text := null;
  new_school_id uuid;
BEGIN
  new_school_id := gen_random_uuid();

  INSERT INTO public.schools (id, name, address, email, created_at, updated_at)
  VALUES (new_school_id, school_name, school_address, school_email, now(), now());

  RAISE NOTICE 'Created school: % (%)', school_name, new_school_id;
END $$;
