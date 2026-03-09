"use server";

import { profiles, schools, userSchools } from "@feelwell/database";
import { eq, inArray } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";

export async function cascadeOrgStatus(orgId: string) {
  const db = await serverDrizzle();

  const locationStatus = "archived";
  const accountStatus = "archived";

  // Update child locations
  await db.admin
    .update(schools)
    .set({ status: locationStatus })
    .where(eq(schools.organizationId, orgId));

  // Get child location IDs
  const childLocations = await db.admin
    .select({ id: schools.id })
    .from(schools)
    .where(eq(schools.organizationId, orgId));

  const allSchoolIds = [orgId, ...childLocations.map((l) => l.id)];

  // Find all user IDs associated with the org and its locations
  const userRows = await db.admin
    .select({ userId: userSchools.userId })
    .from(userSchools)
    .where(inArray(userSchools.schoolId, allSchoolIds));

  const userIds = [...new Set(userRows.map((r) => r.userId))];

  if (userIds.length > 0) {
    await db.admin
      .update(profiles)
      .set({ accountStatus })
      .where(inArray(profiles.id, userIds));
  }
}
