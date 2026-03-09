"server-only";

import {
  emergencyContacts,
  locationBlackoutDays,
  locationContacts,
  locationEmergencyServices,
  locationGradeRestrictions,
  locationPlatformConfig,
  profiles,
  schoolAllowedEmails,
  schoolDomains,
  schoolHours,
  schools,
  userSchools,
  users,
} from "@feelwell/database";
import { and, eq, isNull, ne } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import type { LocationFormData, StaffMember } from "./types";
import { INITIAL_FORM_DATA } from "./types";

const DAY_NAMES: Record<number, string> = {
  0: "Su",
  1: "M",
  2: "T",
  3: "W",
  4: "Th",
  5: "F",
  6: "Sa",
};

export async function getOrgDomains(orgId: string): Promise<string[]> {
  const db = await serverDrizzle();
  const rows = await db.admin
    .select({ domain: schoolDomains.domain })
    .from(schoolDomains)
    .where(
      and(eq(schoolDomains.schoolId, orgId), isNull(schoolDomains.deletedAt)),
    );
  return rows.map((r) => r.domain);
}

export async function loadLocationFormData(
  locationId: string,
): Promise<LocationFormData | null> {
  const db = await serverDrizzle();

  // Load school / location row
  const schoolRows = await db.admin
    .select()
    .from(schools)
    .where(and(eq(schools.id, locationId), isNull(schools.deletedAt)))
    .limit(1);
  const school = schoolRows[0];
  if (!school) return null;

  // Parent org type = school type (location inherits from organization)
  let orgType = "";
  if (school.organizationId) {
    const orgRows = await db.admin
      .select({ type: schools.type })
      .from(schools)
      .where(
        and(eq(schools.id, school.organizationId), isNull(schools.deletedAt)),
      )
      .limit(1);
    orgType = orgRows[0]?.type ?? "";
  }

  // Load location contacts (general contacts)
  const contactRows = await db.admin
    .select()
    .from(locationContacts)
    .where(eq(locationContacts.schoolId, locationId))
    .orderBy(locationContacts.sortOrder);

  const primaryRow = contactRows.find((c) => c.isPrimary);
  const additionalRows = contactRows.filter((c) => !c.isPrimary);

  // Load school hours
  const hoursRows = await db.admin
    .select()
    .from(schoolHours)
    .where(eq(schoolHours.schoolId, locationId));

  const schoolDays: string[] = [];
  let schoolHoursStart = INITIAL_FORM_DATA.schoolHoursStart;
  let schoolHoursEnd = INITIAL_FORM_DATA.schoolHoursEnd;
  let timezone = school.timezone ?? INITIAL_FORM_DATA.timezone;

  for (const h of hoursRows) {
    if (h.isSchoolDay) {
      const dayName = DAY_NAMES[h.dayOfWeek];
      if (dayName) schoolDays.push(dayName);
      if (h.startTime) schoolHoursStart = h.startTime;
      if (h.endTime) schoolHoursEnd = h.endTime;
    }
    if (h.timezone) timezone = h.timezone;
  }

  // Load blackout days
  const blackoutRows = await db.admin
    .select()
    .from(locationBlackoutDays)
    .where(eq(locationBlackoutDays.schoolId, locationId))
    .orderBy(locationBlackoutDays.startDate);

  // Load emergency contacts (school emergency contacts)
  const emergencyRows = await db.admin
    .select()
    .from(emergencyContacts)
    .where(
      and(
        eq(emergencyContacts.schoolId, locationId),
        eq(emergencyContacts.contactType, "school"),
      ),
    );

  const primaryEmergencyRow = emergencyRows.find((c) => c.tag === "primary");
  const backupRows = emergencyRows.filter((c) => c.tag !== "primary");

  // Load emergency services
  const esRows = await db.admin
    .select()
    .from(locationEmergencyServices)
    .where(eq(locationEmergencyServices.schoolId, locationId))
    .limit(1);
  const es = esRows[0];

  // Load platform config
  const configRows = await db.admin
    .select()
    .from(locationPlatformConfig)
    .where(eq(locationPlatformConfig.schoolId, locationId))
    .limit(1);
  const config = configRows[0];

  // Load student domains (location-specific first, fall back to org's)
  let domainRows = await db.admin
    .select()
    .from(schoolDomains)
    .where(
      and(
        eq(schoolDomains.schoolId, locationId),
        isNull(schoolDomains.deletedAt),
      ),
    );

  if (domainRows.length === 0 && school.organizationId) {
    domainRows = await db.admin
      .select()
      .from(schoolDomains)
      .where(
        and(
          eq(schoolDomains.schoolId, school.organizationId),
          isNull(schoolDomains.deletedAt),
        ),
      );
  }

  // Load grade restrictions
  const gradeRestrictionRows = await db.admin
    .select()
    .from(locationGradeRestrictions)
    .where(eq(locationGradeRestrictions.schoolId, locationId));

  // Load allowed emails
  const allowedEmailRows = await db.admin
    .select()
    .from(schoolAllowedEmails)
    .where(eq(schoolAllowedEmails.schoolId, locationId));

  // Load staff (non-student user_schools entries)
  const staffRows = await db.admin
    .select({
      userId: userSchools.userId,
      role: userSchools.role,
      user: users,
      profile: profiles,
    })
    .from(userSchools)
    .innerJoin(users, eq(userSchools.userId, users.id))
    .innerJoin(profiles, eq(userSchools.userId, profiles.id))
    .where(
      and(
        eq(userSchools.schoolId, locationId),
        ne(userSchools.role, "student"),
        isNull(userSchools.deletedAt),
      ),
    );

  const DB_ROLE_TO_FORM_ROLE: Record<string, StaffMember["role"]> = {
    counselor: "site_staff",
    wellness_coach: "coach",
  };

  const staffList: StaffMember[] = staffRows.map((r) => {
    const meta = r.user.rawUserMetaData as Record<string, unknown> | null;
    return {
      id: r.userId,
      firstName: String(meta?.["first_name"] ?? ""),
      lastName: String(meta?.["last_name"] ?? ""),
      email: r.user.email ?? "",
      phone: "",
      roleTitle: "",
      role: DB_ROLE_TO_FORM_ROLE[r.role] ?? "site_staff",
      notes: "",
    };
  });

  const capitalize = (s: string) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  const formData: LocationFormData = {
    parentOrganizationId: school.organizationId ?? "",
    legalName: school.name,
    dba: "",
    schoolCode: school.schoolCode ?? "",
    phone: school.phone ?? "",
    streetAddress: school.streetAddress ?? "",
    addressLine2: school.streetAddress2 ?? "",
    city: school.city ?? "",
    state: school.state ?? "",
    zipCode: school.zipCode ?? "",
    country: school.country ?? INITIAL_FORM_DATA.country,
    gradeLevels: school.gradeLevels ?? [],
    schoolType: orgType,
    estimatedStudentCount: String(school.estimatedStudentCount ?? 0),
    timezone,
    primaryContact: primaryRow
      ? {
          name: primaryRow.contactName ?? "",
          jobTitle: primaryRow.jobTitle ?? "",
          email: primaryRow.email ?? "",
          phone: primaryRow.phone ?? "",
          officePhone: primaryRow.officePhone ?? "",
          mobilePhone: primaryRow.mobilePhone ?? "",
        }
      : { ...INITIAL_FORM_DATA.primaryContact },
    additionalContacts:
      additionalRows.length > 0
        ? additionalRows.map((c) => ({
            name: c.contactName ?? "",
            title: c.jobTitle ?? "",
            email: c.email ?? "",
            phone: c.phone ?? "",
          }))
        : [{ name: "", title: "", email: "", phone: "" }],
    schoolHoursStart,
    schoolHoursEnd,
    schoolDays:
      schoolDays.length > 0 ? schoolDays : INITIAL_FORM_DATA.schoolDays,
    academicYearStart:
      school.academicYearStart ?? INITIAL_FORM_DATA.academicYearStart,
    academicYearEnd:
      school.academicYearEnd ?? INITIAL_FORM_DATA.academicYearEnd,
    blackoutDays:
      blackoutRows.length > 0
        ? blackoutRows.map((b) => ({
            startDate: b.startDate,
            endDate: b.endDate,
            name: b.name,
          }))
        : [],
    staff: staffList,
    studentDomains: domainRows.map((d) => d.domain),
    inviteLinkActive: school.inviteLinkActive ?? false,
    inviteLink: school.inviteLinkCode ?? "",
    manualStudentEmails: allowedEmailRows.map((e) => e.email),
    restrictedGrades: gradeRestrictionRows.map((g) => g.gradeLevel),
    primaryEmergencyContact: primaryEmergencyRow
      ? {
          id: primaryEmergencyRow.id,
          name: primaryEmergencyRow.name,
          relation: primaryEmergencyRow.relation,
          primaryPhone: primaryEmergencyRow.primaryPhone ?? "",
          secondaryPhone: primaryEmergencyRow.secondaryPhone ?? "",
          primaryEmail: primaryEmergencyRow.primaryEmail ?? "",
          secondaryEmail: primaryEmergencyRow.secondaryEmail ?? "",
        }
      : null,
    backupContacts: backupRows.map((c) => ({
      id: c.id,
      name: c.name,
      relation: c.relation,
      primaryPhone: c.primaryPhone ?? "",
      secondaryPhone: c.secondaryPhone ?? "",
      primaryEmail: c.primaryEmail ?? "",
      secondaryEmail: c.secondaryEmail ?? "",
    })),
    policePhone: es?.policePhone ?? "",
    policeAddress: es?.policeAddress ?? "",
    sroName: es?.sroName ?? "",
    sroPhone: es?.sroPhone ?? "",
    noSro: es?.noSro ?? false,
    crisisCenterName: es?.crisisCenterName ?? "",
    crisisHotline: es?.crisisHotline ?? "",
    crisisHours: es?.crisisHours ?? "",
    mobileCrisisAvailable: es?.mobileCrisisAvailable ?? false,
    mobileCrisisNumber: es?.mobileCrisisNumber ?? "",
    nearestHospital: es?.nearestHospital ?? "",
    erAddress: es?.erAddress ?? "",
    erPhone: es?.erPhone ?? "",
    stateCpsHotline: es?.stateCpsHotline ?? "",
    localCpsOffice: es?.localCpsOffice ?? "",
    cpsReportUrl: es?.cpsReportUrl ?? "",
    emergencyNotes: es?.notes ?? "",
    chatbotEnabled: config?.chatbotEnabled ?? true,
    chatbotScheduleType:
      (config?.chatbotScheduleType as "24_7" | "school_hours_only") ?? "24_7",
    chatbotClosuresDisabled: config?.chatbotClosuresDisabled ?? true,
    selScreenerEnabled: config?.selScreenerEnabled ?? true,
    selScreenerFrequency: capitalize(config?.selScreenerFrequency ?? "monthly"),
    selScreenerFirstDate: config?.selScreenerFirstDate ?? "",
    phq9Enabled: config?.phq9Enabled ?? true,
    phq9Frequency: capitalize(config?.phq9Frequency ?? "quarterly"),
    phq9FirstDate: config?.phq9FirstDate ?? "",
    gad7Enabled: config?.gad7Enabled ?? true,
    gad7Frequency: capitalize(config?.gad7Frequency ?? "quarterly"),
    gad7FirstDate: config?.gad7FirstDate ?? "",
  };

  return formData;
}
