import {
  emergencyContacts,
  locationBlackoutDays,
  locationContacts,
  locationEmergencyServices,
  locationGradeRestrictions,
  locationPlatformConfig,
  schoolAllowedEmails,
  schoolDomains,
  schoolEmailFilterSettings,
  schoolHours,
} from "@feelwell/database";
import type { LocationFormData } from "./types";

// biome-ignore lint/suspicious/noExplicitAny: Drizzle's admin db has dynamic insert signature
type AdminDb = { insert: (table: any) => any };

/** Convert "MM/DD/YYYY" to "YYYY-MM-DD", or return null if invalid/empty. */
function parseFormDate(value: string): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    return `${match[3]}-${match[1]}-${match[2]}`;
  }
  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return null;
}

const DAY_MAP: Record<string, number> = {
  Su: 0,
  M: 1,
  T: 2,
  W: 3,
  Th: 4,
  F: 5,
  Sa: 6,
};

export async function insertLocationContacts(
  db: AdminDb,
  schoolId: string,
  formData: LocationFormData,
) {
  const rows: (typeof locationContacts.$inferInsert)[] = [];

  const pc = formData.primaryContact;
  if (pc.name) {
    rows.push({
      schoolId,
      isPrimary: true,
      contactName: pc.name,
      jobTitle: pc.jobTitle || null,
      email: pc.email || null,
      phone: pc.phone || null,
      officePhone: pc.officePhone || null,
      mobilePhone: pc.mobilePhone || null,
      sortOrder: 0,
    });
  }

  formData.additionalContacts.forEach((c, i) => {
    if (c.name || c.email) {
      rows.push({
        schoolId,
        isPrimary: false,
        contactName: c.name || "Unnamed",
        jobTitle: c.title || null,
        email: c.email || null,
        phone: c.phone || null,
        officePhone: null,
        mobilePhone: null,
        sortOrder: i + 1,
      });
    }
  });

  if (rows.length > 0) {
    await db.insert(locationContacts).values(rows);
  }
}

export async function insertSchoolHours(
  db: AdminDb,
  schoolId: string,
  formData: LocationFormData,
) {
  const rows: (typeof schoolHours.$inferInsert)[] = [];

  for (const dayAbbr of formData.schoolDays) {
    const dayOfWeek = DAY_MAP[dayAbbr];
    if (dayOfWeek === undefined) continue;
    rows.push({
      schoolId,
      timezone: formData.timezone || "America/New_York",
      dayOfWeek,
      startTime: formData.schoolHoursStart || "08:00",
      endTime: formData.schoolHoursEnd || "15:30",
      isSchoolDay: true,
    });
  }

  if (rows.length > 0) {
    await db.insert(schoolHours).values(rows);
  }
}

export async function insertBlackoutDays(
  db: AdminDb,
  schoolId: string,
  formData: LocationFormData,
) {
  const rows: (typeof locationBlackoutDays.$inferInsert)[] = [];

  for (const b of formData.blackoutDays) {
    if (!b.startDate || !b.endDate || !b.name) continue;
    rows.push({
      schoolId,
      startDate: b.startDate,
      endDate: b.endDate,
      name: b.name,
    });
  }

  if (rows.length > 0) {
    await db.insert(locationBlackoutDays).values(rows);
  }
}

export async function insertEmergencyContacts(
  db: AdminDb,
  schoolId: string,
  formData: LocationFormData,
) {
  const rows: (typeof emergencyContacts.$inferInsert)[] = [];

  if (formData.primaryEmergencyContact?.name) {
    const c = formData.primaryEmergencyContact;
    rows.push({
      schoolId,
      contactType: "school",
      name: c.name,
      relation: c.relation || "School Contact",
      tag: "primary",
      primaryPhone: c.primaryPhone || null,
      secondaryPhone: c.secondaryPhone || null,
      primaryEmail: c.primaryEmail || null,
      secondaryEmail: c.secondaryEmail || null,
    });
  }

  const tags = ["backup_1", "backup_2"] as const;
  formData.backupContacts.forEach((c, i) => {
    if (!c.name) return;
    rows.push({
      schoolId,
      contactType: "school",
      name: c.name,
      relation: c.relation || "School Contact",
      tag: tags[i] ?? null,
      primaryPhone: c.primaryPhone || null,
      secondaryPhone: c.secondaryPhone || null,
      primaryEmail: c.primaryEmail || null,
      secondaryEmail: c.secondaryEmail || null,
    });
  });

  if (rows.length > 0) {
    await db.insert(emergencyContacts).values(rows);
  }
}

export async function insertEmergencyServices(
  db: AdminDb,
  schoolId: string,
  formData: LocationFormData,
) {
  await db.insert(locationEmergencyServices).values({
    schoolId,
    policePhone: formData.policePhone || null,
    policeAddress: formData.policeAddress || null,
    sroName: formData.sroName || null,
    sroPhone: formData.sroPhone || null,
    noSro: formData.noSro,
    crisisCenterName: formData.crisisCenterName || null,
    crisisHotline: formData.crisisHotline || null,
    crisisHours: formData.crisisHours || "24/7",
    mobileCrisisAvailable: formData.mobileCrisisAvailable,
    mobileCrisisNumber: formData.mobileCrisisNumber || null,
    nearestHospital: formData.nearestHospital || null,
    erAddress: formData.erAddress || null,
    erPhone: formData.erPhone || null,
    stateCpsHotline: formData.stateCpsHotline || null,
    localCpsOffice: formData.localCpsOffice || null,
    cpsReportUrl: formData.cpsReportUrl || null,
    notes: formData.emergencyNotes || null,
  });
}

export async function insertPlatformConfig(
  db: AdminDb,
  schoolId: string,
  formData: LocationFormData,
) {
  await db.insert(locationPlatformConfig).values({
    schoolId,
    chatbotEnabled: formData.chatbotEnabled,
    chatbotScheduleType: formData.chatbotScheduleType,
    chatbotClosuresDisabled: formData.chatbotClosuresDisabled,
    selScreenerEnabled: formData.selScreenerEnabled,
    selScreenerFrequency: formData.selScreenerFrequency.toLowerCase(),
    selScreenerFirstDate: parseFormDate(formData.selScreenerFirstDate),
    phq9Enabled: formData.phq9Enabled,
    phq9Frequency: formData.phq9Frequency.toLowerCase(),
    phq9FirstDate: parseFormDate(formData.phq9FirstDate),
    gad7Enabled: formData.gad7Enabled,
    gad7Frequency: formData.gad7Frequency.toLowerCase(),
    gad7FirstDate: parseFormDate(formData.gad7FirstDate),
  });
}

export async function insertStudentDomains(
  db: AdminDb,
  schoolId: string,
  formData: LocationFormData,
  opts?: { orgDomains?: string[] },
) {
  let domains = formData.studentDomains.filter((d) => d.trim());
  if (domains.length === 0) return;

  // When org domains are provided, only insert location-specific ones
  if (opts?.orgDomains?.length) {
    const orgSet = new Set(opts.orgDomains.map((d) => d.trim().toLowerCase()));
    domains = domains.filter((d) => !orgSet.has(d.trim().toLowerCase()));
    if (domains.length === 0) return;
  }

  await db
    .insert(schoolDomains)
    .values(domains.map((domain) => ({ schoolId, domain: domain.trim() })))
    .onConflictDoNothing();
}

export async function insertGradeRestrictions(
  db: AdminDb,
  schoolId: string,
  formData: LocationFormData,
) {
  const grades = formData.restrictedGrades.filter((g) => g.trim());
  if (grades.length === 0) return;

  await db
    .insert(locationGradeRestrictions)
    .values(grades.map((gradeLevel) => ({ schoolId, gradeLevel })));
}

export async function insertAllowedEmails(
  db: AdminDb,
  schoolId: string,
  formData: LocationFormData,
) {
  const emails = formData.manualStudentEmails.filter((e) => e.trim());

  if (emails.length > 0) {
    await db.insert(schoolAllowedEmails).values(
      emails.map((email) => ({
        schoolId,
        email: email.trim().toLowerCase(),
        role: "student" as const,
      })),
    );

    await db.insert(schoolEmailFilterSettings).values({
      schoolId,
      studentFilteringEnabled: true,
    });
  }
}
