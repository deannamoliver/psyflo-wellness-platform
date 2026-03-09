"server-only";

import { profiles, schools, userSchools, users } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";

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
  if (status === "blocked" || status === "archived") return "Inactive";
  return "Active";
}

export async function fetchUserDetail(
  userId: string,
): Promise<UserDetail | null> {
  const db = await serverDrizzle();

  const [profileRow] = await db.admin
    .select({
      profileId: profiles.id,
      platformRole: profiles.platformRole,
      accountStatus: profiles.accountStatus,
      phone: profiles.phone,
      internalNotes: profiles.internalNotes,
      canManageUsers: profiles.canManageUsers,
      receivesAlertNotifications: profiles.receivesAlertNotifications,
      addedBy: profiles.addedBy,
      createdAt: profiles.createdAt,
      updatedAt: profiles.updatedAt,
      userId: users.id,
      email: users.email,
      rawUserMetaData: users.rawUserMetaData,
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
  if (profileRow.addedBy) {
    const [addedByUser] = await db.admin
      .select({ 
        email: users.email,
        rawUserMetaData: users.rawUserMetaData,
      })
      .from(users)
      .where(eq(users.id, profileRow.addedBy))
      .limit(1);
    if (addedByUser) {
      // @ts-expect-error - User metadata is not typed
      const addedByFirstName = addedByUser.rawUserMetaData?.first_name ?? "";
      // @ts-expect-error - User metadata is not typed
      const addedByLastName = addedByUser.rawUserMetaData?.last_name ?? "";
      addedByName = `${addedByFirstName} ${addedByLastName}`.trim() || addedByUser.email || "Unknown";
    }
  }

  const schoolRole = schoolRows.find((r) => r.role === "counselor")
    ? "counselor"
    : schoolRows.length > 0
      ? (schoolRows[0]?.role ?? null)
      : null;

  // @ts-expect-error - User metadata is not typed
  const firstName = profileRow.rawUserMetaData?.first_name ?? "";
  // @ts-expect-error - User metadata is not typed
  const lastName = profileRow.rawUserMetaData?.last_name ?? "";
  const name = `${firstName} ${lastName}`.trim() || profileRow.email || "Unknown";

  return {
    id: userId,
    firstName,
    lastName,
    name,
    email: profileRow.email ?? "",
    phone: profileRow.phone,
    platformRole: profileRow.platformRole,
    displayRole: displayRole(profileRow.platformRole, schoolRole),
    accountStatus: profileRow.accountStatus,
    displayStatus: displayStatus(profileRow.accountStatus),
    createdAt: profileRow.createdAt,
    updatedAt: profileRow.updatedAt,
    addedByName,
    internalNotes: profileRow.internalNotes,
    canManageUsers: profileRow.canManageUsers,
    receivesAlertNotifications: profileRow.receivesAlertNotifications,
    organizations: schoolRows
      .filter((r) => !r.orgId)
      .map((r) => ({ id: r.schoolId, name: r.schoolName })),
    locations: schoolRows.map((r) => ({
      id: r.schoolId,
      name: r.schoolName,
    })),
  };
}
