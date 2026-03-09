"server-only";

import {
  locationContacts,
  profiles,
  schoolContacts,
  schools,
  userSchools,
} from "@feelwell/database";
import { and, count, eq, isNull, sql } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import type { OrgDetail } from "./org-detail-data";

const STATUS_DISPLAY: Record<string, OrgDetail["status"]> = {
  active: "Active",
  suspended: "Suspended",
  onboarding: "Onboarding",
  archived: "Archived",
};

const TYPE_DISPLAY: Record<string, string> = {
  k12: "K-12 School",
  college: "College",
  clinic: "Clinic",
  cbo: "CBO",
};

const ROLE_DISPLAY: Record<string, string> = {
  admin: "Primary Contact",
  billing: "Billing Contact",
  technical: "Technical Contact",
  additional: "Additional Contact",
};

export async function getOrgDetail(orgId: string): Promise<OrgDetail | null> {
  const db = await serverDrizzle();

  const orgRows = await db.admin
    .select()
    .from(schools)
    .where(and(eq(schools.id, orgId), isNull(schools.deletedAt)))
    .limit(1);

  const org = orgRows[0];
  if (!org) return null;

  const contactRows = await db.admin
    .select()
    .from(schoolContacts)
    .where(eq(schoolContacts.schoolId, orgId));

  const contacts = contactRows.map((c) => ({
    role: ROLE_DISPLAY[c.contactRole] ?? c.contactRole,
    name: c.name ?? "--",
    title: c.title ?? "--",
    email: c.email ?? "--",
    phone: c.phone ?? "--",
  }));

  const address: string[] = [];
  if (org.streetAddress) {
    let line = org.streetAddress;
    if (org.streetAddress2) line += `, ${org.streetAddress2}`;
    address.push(line);
  }
  const cityState = [org.city, org.state, org.zipCode]
    .filter(Boolean)
    .join(", ");
  if (cityState) address.push(cityState);
  if (org.country) address.push(org.country);

  const locations = await getChildLocations(db.admin, orgId);

  return {
    id: org.id,
    name: org.name,
    code: `ORG-${org.id.slice(0, 3).toUpperCase()}`,
    createdAt: org.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: STATUS_DISPLAY[org.status ?? "active"] ?? "Active",
    type: TYPE_DISPLAY[org.type ?? ""] ?? org.type ?? "--",
    districtCode: org.districtCode ?? "--",
    timeZone: org.timezone ?? "--",
    phone: org.phone ?? "--",
    website: org.website ?? "--",
    domain: org.emailDomain ?? "--",
    address: address.length > 0 ? address : ["--"],
    contacts,
    locations,
  };
}

// biome-ignore lint/suspicious/noExplicitAny: drizzle admin client type
async function getChildLocations(admin: any, orgId: string) {
  const childSchool = schools;
  const rows = await admin
    .select({
      id: childSchool.id,
      name: childSchool.name,
      gradeLevels: childSchool.gradeLevels,
      status: childSchool.status,
      contactName: sql<string>`coalesce(${locationContacts.contactName}, '--')`,
      contactEmail: sql<string>`coalesce(${locationContacts.email}, '--')`,
      studentCount: count(profiles.id),
    })
    .from(childSchool)
    .leftJoin(
      locationContacts,
      and(
        eq(locationContacts.schoolId, childSchool.id),
        eq(locationContacts.isPrimary, true),
      ),
    )
    .leftJoin(
      userSchools,
      and(
        eq(userSchools.schoolId, childSchool.id),
        eq(userSchools.role, "student"),
        isNull(userSchools.deletedAt),
      ),
    )
    .leftJoin(
      profiles,
      and(
        eq(profiles.id, userSchools.userId),
        eq(profiles.accountStatus, "active"),
      ),
    )
    .where(
      and(eq(childSchool.organizationId, orgId), isNull(childSchool.deletedAt)),
    )
    .groupBy(
      childSchool.id,
      childSchool.name,
      childSchool.gradeLevels,
      childSchool.status,
      locationContacts.contactName,
      locationContacts.email,
    )
    .orderBy(childSchool.name);

  return rows.map((r: (typeof rows)[number]) => ({
    id: r.id,
    code: r.id.slice(0, 8).toUpperCase(),
    name: r.name,
    gradeLevels: (r.gradeLevels ?? []).join(", ") || "--",
    students: r.studentCount,
    status: r.status === "active" ? ("Active" as const) : ("Inactive" as const),
    contactName: r.contactName,
    contactEmail: r.contactEmail,
  }));
}
