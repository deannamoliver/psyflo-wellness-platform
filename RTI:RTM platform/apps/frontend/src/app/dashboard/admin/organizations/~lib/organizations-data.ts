import { schools, userSchools } from "@feelwell/database";
import { and, count, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import type { Organization, OrgStatus, OrgType } from "./organizations-types";

const TYPE_DISPLAY: Record<string, OrgType> = {
  k12: "Private Practice",
  college: "Group Practice",
  clinic: "Clinic",
  cbo: "CBO",
};

const STATUS_DISPLAY: Record<string, OrgStatus> = {
  active: "Active",
  suspended: "Suspended",
  onboarding: "Onboarding",
  archived: "Archived",
};

export async function getOrganizations(): Promise<Organization[]> {
  const db = await serverDrizzle();

  const childLocations = db.admin
    .select({
      parentId: schools.organizationId,
      cnt: count().as("cnt"),
    })
    .from(schools)
    .where(and(isNull(schools.deletedAt), isNotNull(schools.organizationId)))
    .groupBy(schools.organizationId)
    .as("child_locations");

  const rows = await db.admin
    .select({
      id: schools.id,
      name: schools.name,
      type: schools.type,
      city: schools.city,
      state: schools.state,
      status: schools.status,
      studentCount: count(userSchools.id),
      locationCount: sql<number>`coalesce(${childLocations.cnt}, 0)`,
    })
    .from(schools)
    .leftJoin(userSchools, eq(schools.id, userSchools.schoolId))
    .leftJoin(childLocations, eq(schools.id, childLocations.parentId))
    .where(and(isNull(schools.deletedAt), isNull(schools.organizationId)))
    .groupBy(schools.id, childLocations.cnt)
    .orderBy(schools.name);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: TYPE_DISPLAY[row.type ?? ""] ?? "Private Practice",
    location: [row.city, row.state].filter(Boolean).join(", ") || "--",
    locationCount: Number(row.locationCount),
    students: row.studentCount,
    status: STATUS_DISPLAY[row.status ?? "active"] ?? "Active",
  }));
}
