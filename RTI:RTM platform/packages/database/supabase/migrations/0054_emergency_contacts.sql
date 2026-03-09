-- Emergency contacts table for students
-- Supports two types of contacts:
-- 1. Home contacts: linked to a specific student (student_id)
-- 2. School contacts: linked to a school (school_id) and appear for ALL students at that school

-- Contact type enum
CREATE TYPE emergency_contact_type AS ENUM ('home', 'school');

-- Contact tag enum (priority level)
CREATE TYPE emergency_contact_tag AS ENUM ('primary', 'backup_1', 'backup_2');

CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Either student_id OR school_id must be set, but not both
  -- student_id is for home contacts (specific to one student)
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- school_id is for school contacts (applies to all students at that school)
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  
  -- Contact type (home or school)
  contact_type emergency_contact_type NOT NULL,
  
  -- Contact information
  name TEXT NOT NULL,
  relation TEXT NOT NULL, -- e.g., 'mother', 'father', 'sibling', 'counselor', etc.
  tag emergency_contact_tag, -- e.g., 'primary', 'backup_1', 'backup_2'
  
  -- Phone numbers
  primary_phone TEXT,
  secondary_phone TEXT,
  
  -- Email addresses
  primary_email TEXT,
  secondary_email TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  -- Ensure exactly one of student_id or school_id is set
  CONSTRAINT contact_reference_check CHECK (
    (student_id IS NOT NULL AND school_id IS NULL AND contact_type = 'home') OR
    (student_id IS NULL AND school_id IS NOT NULL AND contact_type = 'school')
  )
);

-- Indexes for efficient querying
CREATE INDEX idx_emergency_contacts_student_id ON emergency_contacts(student_id) WHERE student_id IS NOT NULL;
CREATE INDEX idx_emergency_contacts_school_id ON emergency_contacts(school_id) WHERE school_id IS NOT NULL;
CREATE INDEX idx_emergency_contacts_contact_type ON emergency_contacts(contact_type);

-- Enable RLS
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- Admin can manage all emergency contacts
CREATE POLICY "admin can manage all emergency contacts"
  ON emergency_contacts
  FOR ALL
  TO supabase_auth_admin
  USING (true);

-- Students can view their own home contacts
CREATE POLICY "students can view their own home contacts"
  ON emergency_contacts
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
  );

-- Students can view school contacts for their school
CREATE POLICY "students can view their school contacts"
  ON emergency_contacts
  FOR SELECT
  TO authenticated
  USING (
    contact_type = 'school' AND
    school_id IN (
      SELECT us.school_id 
      FROM user_schools us 
      WHERE us.user_id = auth.uid()
    )
  );

-- Counselors can view all emergency contacts for students in their school
CREATE POLICY "counselors can view emergency contacts for their school"
  ON emergency_contacts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_schools us
      WHERE us.user_id = auth.uid()
      AND us.role = 'counselor'
      AND (
        -- School contacts for counselor's school
        (emergency_contacts.contact_type = 'school' AND emergency_contacts.school_id = us.school_id)
        OR
        -- Home contacts for students in counselor's school
        (emergency_contacts.contact_type = 'home' AND emergency_contacts.student_id IN (
          SELECT us2.user_id FROM user_schools us2 WHERE us2.school_id = us.school_id
        ))
      )
    )
  );

-- Note: updated_at is handled at the application layer by Drizzle ORM
