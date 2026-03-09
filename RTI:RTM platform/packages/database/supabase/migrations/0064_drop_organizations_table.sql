-- Change FK from organizations table to self-reference schools
ALTER TABLE "schools" DROP CONSTRAINT IF EXISTS "schools_organization_id_fkey";
ALTER TABLE "schools" ADD CONSTRAINT "schools_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "schools"("id") ON DELETE SET NULL;

-- Drop the unused organizations table (empty, no code reads/writes it)
DROP POLICY IF EXISTS "admin can manage all organizations" ON "public"."organizations";
DROP TABLE IF EXISTS "public"."organizations";

-- Rename organization_contacts → school_contacts
DROP POLICY IF EXISTS "admin can manage all organization contacts" ON "public"."organization_contacts";
ALTER TABLE "public"."organization_contacts" RENAME TO "school_contacts";
CREATE POLICY "admin can manage all school contacts"
ON "public"."school_contacts"
AS PERMISSIVE
FOR ALL
TO "supabase_auth_admin"
USING (true);
