"server-only";

import { profiles, users, userSchools, schools } from "@feelwell/database";
import { eq, and, ne } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";

export type PatientLocation = {
  id: string;
  name: string;
  organizationId: string | null;
  organizationName: string | null;
  assignedProviderId: string | null;
  assignedProviderName: string | null;
};

export type AvailableProvider = {
  id: string;
  name: string;
  email: string;
  locationId: string;
  locationName: string;
};

export type AvailableOrganization = {
  id: string;
  name: string;
  locations: { id: string; name: string }[];
};

export type PatientDetail = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  phone: string | null;
  accountStatus: string;
  createdAt: Date;
  updatedAt: Date;
  organizations: { id: string; name: string }[];
  locations: PatientLocation[];
  availableProviders: AvailableProvider[];
  availableOrganizations: AvailableOrganization[];
};

export async function fetchPatientDetail(
  patientId: string,
): Promise<PatientDetail | null> {
  const db = await serverDrizzle();

  const userRows = await db.admin
    .select({
      userId: users.id,
      email: users.email,
      rawUserMetaData: users.rawUserMetaData,
      accountStatus: profiles.accountStatus,
      createdAt: profiles.createdAt,
      updatedAt: profiles.updatedAt,
    })
    .from(users)
    .innerJoin(profiles, eq(users.id, profiles.id))
    .where(eq(users.id, patientId))
    .limit(1);

  const row = userRows[0];
  if (!row) return null;

  // Get locations/schools this patient is associated with, including organization info
  const schoolRows = await db.admin
    .select({
      schoolId: userSchools.schoolId,
      schoolName: schools.name,
      organizationId: schools.organizationId,
    })
    .from(userSchools)
    .innerJoin(schools, eq(userSchools.schoolId, schools.id))
    .where(eq(userSchools.userId, patientId));

  // Get all providers at the patient's locations for reassignment options
  const availableProviders: AvailableProvider[] = [];
  
  // For each location, get the providers (non-student users)
  for (const loc of schoolRows) {
    const providerRows = await db.admin
      .select({
        providerId: userSchools.userId,
        email: users.email,
        rawUserMetaData: users.rawUserMetaData,
      })
      .from(userSchools)
      .innerJoin(users, eq(userSchools.userId, users.id))
      .where(
        and(
          eq(userSchools.schoolId, loc.schoolId),
          ne(userSchools.role, "student")
        )
      );
    
    for (const p of providerRows) {
      // @ts-expect-error - User metadata is not typed
      const provFirstName = p.rawUserMetaData?.first_name ?? "";
      // @ts-expect-error - User metadata is not typed
      const provLastName = p.rawUserMetaData?.last_name ?? "";
      const provName = `${provFirstName} ${provLastName}`.trim() || p.email || "Unknown";
      availableProviders.push({
        id: p.providerId,
        name: provName,
        email: p.email ?? "",
        locationId: loc.schoolId,
        locationName: loc.schoolName,
      });
    }
  }
  
  // For now, assign the first provider at each location as the "assigned" provider
  // This is a placeholder until actual provider-patient assignment data is available
  const locationProviderMap: Record<string, { id: string; name: string }> = {};
  for (const provider of availableProviders) {
    if (!locationProviderMap[provider.locationId]) {
      locationProviderMap[provider.locationId] = { id: provider.id, name: provider.name };
    }
  }

  // @ts-expect-error - User metadata is not typed
  const firstName = row.rawUserMetaData?.first_name ?? "";
  // @ts-expect-error - User metadata is not typed
  const lastName = row.rawUserMetaData?.last_name ?? "";
  // @ts-expect-error - User metadata is not typed
  const phone = row.rawUserMetaData?.phone ?? null;

  // Build locations with provider assignments
  const locations: PatientLocation[] = schoolRows.map((s) => {
    const assignedProvider = locationProviderMap[s.schoolId] ?? null;
    return {
      id: s.schoolId,
      name: s.schoolName,
      organizationId: s.organizationId,
      organizationName: null, // Would need another query to get org name
      assignedProviderId: assignedProvider?.id ?? null,
      assignedProviderName: assignedProvider?.name ?? null,
    };
  });

  // Build unique organizations list from locations
  const organizations = locations
    .filter((l, i, arr) => l.organizationId && arr.findIndex((x) => x.organizationId === l.organizationId) === i)
    .map((l) => ({ id: l.organizationId!, name: l.name }));

  // Fetch all available organizations for reassignment
  const allOrgsRows = await db.admin
    .select({
      orgId: schools.id,
      orgName: schools.name,
      organizationId: schools.organizationId,
    })
    .from(schools);

  // Group locations by organization
  const orgMap: Record<string, AvailableOrganization> = {};
  for (const org of allOrgsRows) {
    // For now, treat each school/location as potentially being an organization
    // In a real setup, you'd filter by organizationId being null (top-level orgs)
    if (!orgMap[org.orgId]) {
      orgMap[org.orgId] = {
        id: org.orgId,
        name: org.orgName,
        locations: [],
      };
    }
  }
  const availableOrganizations = Object.values(orgMap);

  return {
    id: row.userId,
    email: row.email ?? "",
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim() || row.email || "Unknown",
    phone,
    accountStatus: row.accountStatus ?? "active",
    createdAt: row.createdAt ?? new Date(),
    updatedAt: row.updatedAt ?? new Date(),
    organizations,
    locations,
    availableProviders,
    availableOrganizations,
  };
}
