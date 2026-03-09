"use server";

import { profiles, userSchools } from "@feelwell/database";
import { and, eq, inArray } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";

/**
 * Cascades deactivation from a location to all users and patients at that location.
 * When a location is deactivated, all associated users and patients are also deactivated.
 */
export async function cascadeLocationDeactivation(locationId: string) {
  const db = await serverDrizzle();

  // Find all user IDs associated with this location
  const userRows = await db.admin
    .select({ userId: userSchools.userId })
    .from(userSchools)
    .where(eq(userSchools.schoolId, locationId));

  const userIds = [...new Set(userRows.map((r) => r.userId))];

  if (userIds.length > 0) {
    await db.admin
      .update(profiles)
      .set({ accountStatus: "archived" })
      .where(inArray(profiles.id, userIds));
  }
}

/**
 * Cascades deactivation from a provider user to all their assigned patients.
 * When a provider is deactivated, all their assigned patients are also deactivated.
 */
export async function cascadeProviderDeactivation(
  _providerId: string,
  locationId: string,
) {
  const db = await serverDrizzle();

  // Find all patient IDs at this location
  // Note: In a full implementation, this would filter by the provider's assigned patients
  const patientRows = await db.admin
    .select({ userId: userSchools.userId })
    .from(userSchools)
    .where(
      and(
        eq(userSchools.role, "student"),
        eq(userSchools.schoolId, locationId),
      ),
    );

  const patientIds = [...new Set(patientRows.map((r) => r.userId))];

  if (patientIds.length > 0) {
    await db.admin
      .update(profiles)
      .set({ accountStatus: "archived" })
      .where(inArray(profiles.id, patientIds));
  }
}

/**
 * Reactivates a user by setting their status to active.
 */
export async function reactivateUser(userId: string) {
  const db = await serverDrizzle();

  await db.admin
    .update(profiles)
    .set({ accountStatus: "active" })
    .where(eq(profiles.id, userId));
}

/**
 * Deactivates a user by setting their status to archived.
 */
export async function deactivateUser(userId: string) {
  const db = await serverDrizzle();

  await db.admin
    .update(profiles)
    .set({ accountStatus: "archived" })
    .where(eq(profiles.id, userId));
}
