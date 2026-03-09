"server-only";

import {
  alerts,
  emergencyContacts,
  locationBlackoutDays,
  locationContacts,
  locationEmergencyServices,
  locationGradeRestrictions,
  locationPlatformConfig,
  profiles,
  schoolDomains,
  schoolHours,
  schools,
  userSchools,
  users,
} from "@feelwell/database";
import { and, eq, isNull, like, ne, or } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullName } from "@/lib/user/utils";
import type {
  AssessmentConfig,
  LocationContact,
  LocationDetail,
  NonSchoolContact,
  StaffMember,
  StudentRecord,
} from "./location-detail-data";

const DAY_NAMES = ["Sun", "M", "T", "W", "Th", "F", "Sat"];
const TYPE_DISPLAY: Record<string, string> = {
  k12: "Public School",
  college: "College",
  clinic: "Clinic",
  cbo: "Community-Based Organization",
};

const ROLE_MAP: Record<string, string> = {
  counselor: "Provider",
  wellness_coach: "Therapist",
};

/** Use both platformRole + schoolRole to get the accurate display role */
function getDisplayRole(platformRole: string, schoolRole: string): string {
  if (platformRole === "admin") return "Super Admin";
  if (platformRole === "clinical_supervisor") return "Clinical Supervisor";
  return ROLE_MAP[schoolRole] ?? schoolRole;
}

const GRADE_TEXT_TO_NUM: Record<string, number> = {
  K: 0,
  Kindergarten: 0,
  kindergarten: 0,
  k: 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  "11": 11,
  "12": 12,
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Format "YYYY-MM-DD" → "M/D/YYYY" */
function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

/** Format "YYYY-MM-DD" → "M/D/YY" for compact display */
function formatShortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}`;
}

export async function getLocationDetail(
  orgId: string,
  locationId: string,
): Promise<LocationDetail | null> {
  const db = await serverDrizzle();

  const schoolRows = await db.admin
    .select()
    .from(schools)
    .where(and(eq(schools.id, locationId), isNull(schools.deletedAt)))
    .limit(1);

  const school = schoolRows[0];
  if (!school) return null;

  const orgRows = await db.admin
    .select({ name: schools.name, type: schools.type })
    .from(schools)
    .where(and(eq(schools.id, orgId), isNull(schools.deletedAt)))
    .limit(1);
  const org = orgRows[0];
  const orgName = org?.name ?? school.name;
  const orgTypeDisplay =
    org?.type != null ? (TYPE_DISPLAY[org.type] ?? org.type) : "--";

  const contactRows = await db.admin
    .select()
    .from(emergencyContacts)
    .where(
      and(
        eq(emergencyContacts.schoolId, locationId),
        eq(emergencyContacts.contactType, "school"),
      ),
    );

  const emergencyContactList: LocationContact[] = contactRows.map((c, i) => ({
    role: c.tag === "primary" ? "Primary Contact" : `Backup Contact #${i}`,
    name: c.name,
    title: c.relation,
    email: c.primaryEmail ?? "--",
    phones: [c.primaryPhone, c.secondaryPhone].filter(Boolean) as string[],
  }));

  // General / location contacts (primary + additional)
  const generalContactRows = await db.admin
    .select()
    .from(locationContacts)
    .where(eq(locationContacts.schoolId, locationId))
    .orderBy(locationContacts.sortOrder);

  const generalContactList: LocationContact[] = generalContactRows.map((c) => ({
    role: c.isPrimary ? "Primary Contact" : "Additional Contact",
    name: c.contactName,
    title: c.jobTitle ?? "--",
    email: c.email ?? "--",
    phones: [
      c.phone ? `${c.phone}` : null,
      c.officePhone ? `${c.officePhone} (office)` : null,
      c.mobilePhone ? `${c.mobilePhone} (mobile)` : null,
    ].filter(Boolean) as string[],
  }));

  // Blackout days
  const blackoutRows = await db.admin
    .select()
    .from(locationBlackoutDays)
    .where(eq(locationBlackoutDays.schoolId, locationId))
    .orderBy(locationBlackoutDays.startDate);

  const blackoutDaysList = blackoutRows.map((b) => ({
    date:
      formatDate(b.startDate) +
      (b.endDate !== b.startDate ? `–${formatDate(b.endDate)}` : ""),
    label: b.name,
  }));

  // Non-school emergency services
  const emergencyServiceRows = await db.admin
    .select()
    .from(locationEmergencyServices)
    .where(eq(locationEmergencyServices.schoolId, locationId))
    .limit(1);

  const es = emergencyServiceRows[0];
  const nonSchoolContacts: NonSchoolContact[] = [];
  if (es) {
    const policeAddr: string[] = [];
    if (es.policeAddress) policeAddr.push(es.policeAddress);
    nonSchoolContacts.push({
      label: "Local Emergency Services",
      name: "Police (Non-emergency)",
      phone: es.policePhone ?? "--",
      address: policeAddr,
    });

    nonSchoolContacts.push({
      label: "School Resource Officer",
      name: es.sroName || (es.noSro ? "No SRO" : "Police (Non-emergency)"),
      phone: es.sroPhone ?? "--",
      address: es.policeAddress ? [es.policeAddress] : [],
    });

    nonSchoolContacts.push({
      label: "Crisis Services",
      name: es.crisisCenterName || "Crisis Center",
      phone: es.crisisHotline ?? "--",
      address: es.crisisHours ? [`Hours: ${es.crisisHours}`] : [],
    });

    const erAddr: string[] = [];
    if (es.erAddress) erAddr.push(es.erAddress);
    nonSchoolContacts.push({
      label: "Medical",
      name: es.nearestHospital || "Nearest Hospital",
      phone: es.erPhone ?? "--",
      address: erAddr,
    });

    nonSchoolContacts.push({
      label: "CPS",
      name: es.localCpsOffice || "Child Protective Services",
      phone: es.stateCpsHotline ?? "--",
      address: es.cpsReportUrl ? [`Report: ${es.cpsReportUrl}`] : [],
    });
  }

  // Platform configuration
  const platformConfigRows = await db.admin
    .select()
    .from(locationPlatformConfig)
    .where(eq(locationPlatformConfig.schoolId, locationId))
    .limit(1);
  const platformConfig = platformConfigRows[0];

  // Grade restrictions
  const gradeRestrictionRows = await db.admin
    .select({ gradeLevel: locationGradeRestrictions.gradeLevel })
    .from(locationGradeRestrictions)
    .where(eq(locationGradeRestrictions.schoolId, locationId));

  const restrictedGradeNums = gradeRestrictionRows
    .map((r) => GRADE_TEXT_TO_NUM[r.gradeLevel] ?? -1)
    .filter((n) => n >= 0);

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
      ),
    );

  const staff: StaffMember[] = staffRows.map((r) => {
    // @ts-expect-error - User metadata is not typed
    const firstName = r.user.rawUserMetaData?.first_name ?? "";
    // @ts-expect-error - User metadata is not typed
    const lastName = r.user.rawUserMetaData?.last_name ?? "";
    // @ts-expect-error - User metadata is not typed
    const roleTitle = r.user.rawUserMetaData?.role_title ?? "";
    // @ts-expect-error - User metadata is not typed
    const phone = r.user.rawUserMetaData?.phone ?? "";
    // @ts-expect-error - User metadata is not typed
    const notes = r.user.rawUserMetaData?.internal_notes ?? "";
    const pRole = r.profile.platformRole ?? "user";
    return {
      id: r.userId,
      name: getUserFullName(r.user),
      role: getDisplayRole(pRole, r.role),
      locations: [school.name],
      email: r.user.email ?? "--",
      status: r.profile.accountStatus === "active" ? "Active" : "Inactive",
      firstName,
      lastName,
      roleTitle,
      phone,
      notes,
      platformRole: pRole,
      schoolRole: r.role,
    };
  });

  const studentRows = await db.admin
    .select({
      userId: userSchools.userId,
      user: users,
      profile: profiles,
    })
    .from(userSchools)
    .innerJoin(users, eq(userSchools.userId, users.id))
    .innerJoin(profiles, eq(userSchools.userId, profiles.id))
    .where(
      and(
        eq(userSchools.schoolId, locationId),
        eq(userSchools.role, "student"),
        isNull(profiles.deletedAt),
      ),
    );

  const alertStudentIds = new Set<string>();
  const alertRows = await db.admin
    .select({ studentId: alerts.studentId })
    .from(alerts)
    .where(eq(alerts.status, "new"));
  for (const a of alertRows) alertStudentIds.add(a.studentId);

  const studentList: StudentRecord[] = studentRows.map((r) => ({
    id: r.userId,
    name: getUserFullName(r.user),
    email: r.user.email ?? "--",
    studentId:
      r.profile.studentCode ?? `STU-${r.userId.slice(0, 4).toUpperCase()}`,
    grade: r.profile.grade ?? 0,
    alertStatus: alertStudentIds.has(r.userId) ? "Safety Alert" : null,
  }));

  // Also find students by email domain matching
  const domainRows = await db.admin
    .select({ domain: schoolDomains.domain })
    .from(schoolDomains)
    .where(eq(schoolDomains.schoolId, locationId));

  const domains = domainRows.map((d) => d.domain);

  if (domains.length > 0) {
    const existingStudentIds = new Set(studentRows.map((r) => r.userId));
    const domainConditions = domains.map((d) => like(users.email, `%@${d}`));

    const domainStudentRows = await db.admin
      .select({
        userId: users.id,
        user: users,
        profile: profiles,
      })
      .from(users)
      .innerJoin(profiles, eq(users.id, profiles.id))
      .where(and(or(...domainConditions), isNull(profiles.deletedAt)));

    for (const r of domainStudentRows) {
      if (!existingStudentIds.has(r.userId)) {
        studentList.push({
          id: r.userId,
          name: getUserFullName(r.user),
          email: r.user.email ?? "--",
          studentId:
            r.profile.studentCode ??
            `STU-${r.userId.slice(0, 4).toUpperCase()}`,
          grade: r.profile.grade ?? 0,
          alertStatus: alertStudentIds.has(r.userId) ? "Safety Alert" : null,
        });
      }
    }
  }

  const hoursRows = await db.admin
    .select()
    .from(schoolHours)
    .where(eq(schoolHours.schoolId, locationId));

  const schoolDaysList: string[] = [];
  let startTimeStr = "--";
  let endTimeStr = "--";
  let tz = school.timezone ?? "America/New_York";

  for (const h of hoursRows) {
    const dayName = DAY_NAMES[h.dayOfWeek];
    if (h.isSchoolDay && dayName) {
      schoolDaysList.push(dayName);
    }
    if (h.isSchoolDay && h.startTime) startTimeStr = h.startTime;
    if (h.isSchoolDay && h.endTime) endTimeStr = h.endTime;
    if (h.timezone) tz = h.timezone;
  }

  const assessments: AssessmentConfig[] = [];
  if (platformConfig) {
    assessments.push({
      name: "SEL Screener",
      description: "Social-Emotional Learning assessment",
      icon: "sel",
      frequency: capitalize(platformConfig.selScreenerFrequency ?? "monthly"),
      nextScheduledDate: platformConfig.selScreenerFirstDate
        ? formatDate(platformConfig.selScreenerFirstDate)
        : "--",
      active: platformConfig.selScreenerEnabled ?? true,
    });
    assessments.push({
      name: "PHQ-9 (Depression Screening)",
      description: "Patient Health Questionnaire - 9 Items",
      icon: "phq9",
      frequency: capitalize(platformConfig.phq9Frequency ?? "quarterly"),
      nextScheduledDate: platformConfig.phq9FirstDate
        ? formatDate(platformConfig.phq9FirstDate)
        : "--",
      active: platformConfig.phq9Enabled ?? true,
    });
    assessments.push({
      name: "GAD-7 (Anxiety Screening)",
      description: "Generalized Anxiety Disorder - 7 Items",
      icon: "gad7",
      frequency: capitalize(platformConfig.gad7Frequency ?? "quarterly"),
      nextScheduledDate: platformConfig.gad7FirstDate
        ? formatDate(platformConfig.gad7FirstDate)
        : "--",
      active: platformConfig.gad7Enabled ?? true,
    });
  }

  const address: string[] = [];
  if (school.streetAddress) address.push(school.streetAddress);
  const cityLine = [school.city, school.state, school.zipCode]
    .filter(Boolean)
    .join(", ");
  if (cityLine) address.push(cityLine);
  if (school.country) address.push(school.country);

  return {
    id: locationId,
    name: school.name,
    code: `LOC-${locationId.slice(0, 3).toUpperCase()}`,
    orgId,
    orgName,
    createdAt: school.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    locationName: school.name,
    locationNpi: "",
    locationCode: school.schoolCode ?? school.districtCode ?? "--",
    timeZone: tz,
    locationType: orgTypeDisplay,
    address: address.length > 0 ? address : ["--"],
    phone: school.phone ?? "--",
    // Patient population characteristics
    agesServed: (school.gradeLevels ?? []).length > 0
      ? (school.gradeLevels ?? []).join(", ")
      : "All ages",
    mentalHealthNeeds: ["Anxiety", "Depression", "PTSD", "ADHD"],
    languagesSpoken: ["English", "Spanish"],
    modalities: ["Individual", "Group", "Family"],
    approaches: ["CBT", "DBT", "Mindfulness"],
    estPatientCount: school.estimatedStudentCount ?? studentList.length,
    // Location hours
    operatingDays: schoolDaysList.length > 0 ? schoolDaysList.join(", ") : "--",
    startTime: startTimeStr,
    endTime: endTimeStr,
    generalContacts: generalContactList,
    emergencyContacts: emergencyContactList,
    externalContacts: nonSchoolContacts,
    staff,
    patients: studentList,
    chatbotEnabled: platformConfig?.chatbotEnabled ?? true,
    is24HourAccess: (platformConfig?.chatbotScheduleType ?? "24_7") === "24_7",
    closuresEnabled: !(platformConfig?.chatbotClosuresDisabled ?? true),
    assessments,
  };
}
