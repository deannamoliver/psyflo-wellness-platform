"server-only";

import { profiles, schools, userSchools, users } from "@feelwell/database";
import { and, eq, isNull, ne, or, sql } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullName } from "@/lib/user/utils";
import type {
  AdminUser,
  UserRole,
  UserStatus,
  UsersPageData,
} from "./users-data";

function mapRole(platformRole: string, schoolRole: string | null): UserRole {
  if (platformRole === "admin") return "Admin (Psyflo)";
  if (schoolRole === "counselor") return "Provider";
  return "Practice Management";
}

function mapStatus(accountStatus: string, isActivated: boolean): UserStatus {
  if (!isActivated) return "Invite Sent";
  if (accountStatus === "blocked" || accountStatus === "archived") return "Inactive";
  return "Active";
}

export async function fetchAdminUsers(): Promise<UsersPageData> {
  const db = await serverDrizzle();

  const rows = await db.admin
    .select({
      userId: profiles.id,
      platformRole: profiles.platformRole,
      accountStatus: profiles.accountStatus,
      createdAt: profiles.createdAt,
      user: users,
      schoolRole: userSchools.role,
      schoolName: schools.name,
      // Check if user has confirmed their email (activated their account)
      emailConfirmedAt: sql<Date | null>`auth.users.email_confirmed_at`,
    })
    .from(profiles)
    .innerJoin(users, eq(profiles.id, users.id))
    .leftJoin(userSchools, eq(profiles.id, userSchools.userId))
    .leftJoin(schools, eq(userSchools.schoolId, schools.id))
    .where(
      and(
        isNull(profiles.deletedAt),
        or(
          ne(profiles.platformRole, "user"),
          eq(userSchools.role, "counselor"),
          eq(userSchools.role, "wellness_coach"),
        ),
      ),
    );

  const userMap = new Map<
    string,
    {
      user: typeof users.$inferSelect;
      platformRole: string;
      accountStatus: string;
      createdAt: Date;
      schoolRole: string | null;
      schoolNames: Set<string>;
      isActivated: boolean;
    }
  >();

  for (const row of rows) {
    const existing = userMap.get(row.userId);
    if (existing) {
      if (row.schoolName) existing.schoolNames.add(row.schoolName);
      if (row.schoolRole === "counselor") existing.schoolRole = "counselor";
    } else {
      const schoolNames = new Set<string>();
      if (row.schoolName) schoolNames.add(row.schoolName);
      userMap.set(row.userId, {
        user: row.user,
        platformRole: row.platformRole,
        accountStatus: row.accountStatus,
        createdAt: row.createdAt,
        schoolRole: row.schoolRole,
        schoolNames,
        isActivated: row.emailConfirmedAt !== null,
      });
    }
  }

  let superAdmins = 0;
  let providers = 0;
  let practiceManagement = 0;
  const orgSet = new Set<string>();

  const adminUsers: AdminUser[] = [];

  for (const [id, entry] of userMap) {
    const role = mapRole(entry.platformRole, entry.schoolRole);
    if (role === "Admin (Psyflo)") superAdmins++;
    else if (role === "Provider") providers++;
    else practiceManagement++;

    const schoolArr = [...entry.schoolNames];
    for (const s of schoolArr) orgSet.add(s);
    const org =
      schoolArr.length === 0
        ? null
        : schoolArr.length === 1
          ? (schoolArr[0] ?? null)
          : "Multiple Organizations";

    adminUsers.push({
      id,
      name: getUserFullName(entry.user),
      email: entry.user.email ?? "",
      role,
      organization: org,
      locations: schoolArr,
      status: mapStatus(entry.accountStatus, entry.isActivated),
      createdAt: entry.createdAt,
    });
  }

  return {
    users: adminUsers,
    orgs: [...orgSet].sort(),
    stats: {
      total: adminUsers.length,
      superAdmins,
      providers,
      practiceManagement,
    },
  };
}
