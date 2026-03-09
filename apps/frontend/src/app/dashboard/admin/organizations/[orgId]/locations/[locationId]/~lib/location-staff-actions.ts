"use server";

import { profiles, userSchools } from "@feelwell/database";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { serverDrizzle } from "@/lib/database/drizzle";
import { supabaseAdmin } from "@/lib/database/supabase-admin";

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

export async function updateStaffMember(
  userId: string,
  schoolId: string,
  orgId: string,
  data: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    roleTitle: string;
    phone: string;
    notes: string;
  },
) {
  const db = await serverDrizzle();
  const admin = supabaseAdmin();

  const schoolRole = FORM_ROLE_TO_SCHOOL_ROLE[data.role] ?? "counselor";
  const platformRole = FORM_ROLE_TO_PLATFORM_ROLE[data.role] ?? "user";

  // Update auth user metadata (first_name, last_name)
  await admin.auth.admin.updateUserById(userId, {
    email: data.email,
    user_metadata: {
      first_name: data.firstName,
      last_name: data.lastName,
      role_title: data.roleTitle,
      phone: data.phone,
      internal_notes: data.notes,
    },
  });

  // Update profile platform role
  await db.admin
    .update(profiles)
    .set({ platformRole })
    .where(eq(profiles.id, userId));

  // Update school role
  await db.admin
    .update(userSchools)
    .set({ role: schoolRole })
    .where(
      and(eq(userSchools.userId, userId), eq(userSchools.schoolId, schoolId)),
    );

  revalidatePath(
    `/dashboard/admin/organizations/${orgId}/locations/${schoolId}`,
  );
}
