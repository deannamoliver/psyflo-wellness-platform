"server-only";

import { profiles, schools, userSchools, users } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullName } from "@/lib/user/utils";

export type UserDetail = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string | null;
  platformRole: string;
  displayRole: string;
  accountStatus: string;
  displayStatus: string;
  createdAt: Date;
  updatedAt: Date;
  addedByName: string | null;
  internalNotes: string | null;
  canManageUsers: boolean;
  receivesAlertNotifications: boolean;
  organizations: { id: string; name: string }[];
  locations: { id: string; name: string }[];
};

function displayRole(platform: string, school: string | null): string {
  if (platform === "admin") return "Super Admin";
  if (platform === "clinical_supervisor") return "Clinical Supervisor";
  if (school === "counselor") return "Provider";
  return "Therapist";
}

function displayStatus(status: string): string {
  if (status === "blocked") return "Suspended";
  if (status === "archived") return "Inactive";
  return "Active";
}

export async function fetchUserDetail(
  userId: string,
): Promise<UserDetail | null> {
  const db = await serverDrizzle();

  const [profileRow] = await db.admin
    .select({
      profile: profiles,
      user: users,
    })
    .from(profiles)
    .innerJoin(users, eq(profiles.id, users.id))
    .where(eq(profiles.id, userId))
    .limit(1);

  if (!profileRow) return null;

  const schoolRows = await db.admin
    .select({
      schoolId: schools.id,
      schoolName: schools.name,
      role: userSchools.role,
      orgId: schools.organizationId,
    })
    .from(userSchools)
    .innerJoin(schools, eq(userSchools.schoolId, schools.id))
    .where(eq(userSchools.userId, userId));

  let addedByName: string | null = null;
  if (profileRow.profile.addedBy) {
    const [addedByUser] = await db.admin
      .select({ user: users })
      .from(users)
      .where(eq(users.id, profileRow.profile.addedBy))
      .limit(1);
    if (addedByUser) addedByName = getUserFullName(addedByUser.user);
  }

  const schoolRole = schoolRows.find((r) => r.role === "counselor")
    ? "counselor"
    : schoolRows.length > 0
      ? (schoolRows[0]?.role ?? null)
      : null;

  // @ts-expect-error - User metadata is not typed
  const firstName = profileRow.user.rawUserMetaData?.first_name ?? "";
  // @ts-expect-error - User metadata is not typed
  const lastName = profileRow.user.rawUserMetaData?.last_name ?? "";

  return {
    id: userId,
    firstName,
    lastName,
    name: getUserFullName(profileRow.user),
    email: profileRow.user.email ?? "",
    phone: profileRow.profile.phone,
    platformRole: profileRow.profile.platformRole,
    displayRole: displayRole(profileRow.profile.platformRole, schoolRole),
    accountStatus: profileRow.profile.accountStatus,
    displayStatus: displayStatus(profileRow.profile.accountStatus),
    createdAt: profileRow.profile.createdAt,
    updatedAt: profileRow.profile.updatedAt,
    addedByName,
    internalNotes: profileRow.profile.internalNotes,
    canManageUsers: profileRow.profile.canManageUsers,
    receivesAlertNotifications: profileRow.profile.receivesAlertNotifications,
    organizations: schoolRows
      .filter((r) => !r.orgId)
      .map((r) => ({ id: r.schoolId, name: r.schoolName })),
    locations: schoolRows.map((r) => ({
      id: r.schoolId,
      name: r.schoolName,
    })),
  };
}
