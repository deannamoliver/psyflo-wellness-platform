import { profiles, userSchools, users } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { supabaseAdmin } from "@/lib/database/supabase-admin";
import type { LocationFormData } from "./types";

// biome-ignore lint/suspicious/noExplicitAny: Drizzle admin db has dynamic signatures
type AdminDb = any;

const FORM_ROLE_TO_SCHOOL_ROLE: Record<string, "counselor" | "wellness_coach"> =
  {
    super_admin: "counselor",
    site_staff: "counselor",
    clinical_supervisor: "counselor",
    coach: "wellness_coach",
  };

const FORM_ROLE_TO_PLATFORM_ROLE: Record<
  string,
  "admin" | "clinical_supervisor" | "user"
> = {
  super_admin: "admin",
  clinical_supervisor: "clinical_supervisor",
  site_staff: "user",
  coach: "user",
};

export async function insertStaff(
  db: AdminDb,
  schoolId: string,
  formData: LocationFormData,
) {
  const staffMembers = formData.staff.filter((s) => s.email.trim());
  if (staffMembers.length === 0) return;

  const admin = supabaseAdmin();

  for (const member of staffMembers) {
    const email = member.email.trim().toLowerCase();
    const schoolRole = FORM_ROLE_TO_SCHOOL_ROLE[member.role] ?? "counselor";
    const platformRole = FORM_ROLE_TO_PLATFORM_ROLE[member.role] ?? "user";

    let userId: string | null = null;

    // Invite user by email so they can set their own password
    const { data: newUser, error } = await admin.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          first_name: member.firstName.trim(),
          last_name: member.lastName.trim(),
          role_title: member.roleTitle.trim(),
          phone: member.phone.trim(),
          internal_notes: member.notes.trim(),
        },
      },
    );

    if (error) {
      // User likely already exists — look them up via direct DB query
      const rows = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (rows[0]) {
        userId = rows[0].id;
      } else {
        console.error(`Failed to create/find user ${email}:`, error);
        continue;
      }
    } else if (newUser.user) {
      userId = newUser.user.id;
    }

    if (!userId) continue;

    // Upsert profile
    await db
      .insert(profiles)
      .values({
        id: userId,
        platformRole,
        accountStatus: "active",
        language: "english",
        onboardingCompletedAt: new Date(),
      })
      .onConflictDoNothing();

    // Link staff to this location
    await db
      .insert(userSchools)
      .values({
        userId,
        schoolId,
        role: schoolRole,
      })
      .onConflictDoNothing();
  }
}

export async function deleteStaffForLocation(db: AdminDb, schoolId: string) {
  await db.delete(userSchools).where(eq(userSchools.schoolId, schoolId));
}
