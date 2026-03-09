"server-only";

import { profiles, schools, userSchools, users } from "@feelwell/database";
import { and, eq, isNull, sql } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import type {
  BlockedStudent,
  Student,
  StudentStatus,
  StudentsPageData,
} from "./students-data";

function formatGrade(grade: number | null): string {
  if (grade === null) return "-";
  if (grade === 0) return "K";
  if (grade === 1) return "1st";
  if (grade === 2) return "2nd";
  if (grade === 3) return "3rd";
  return `${grade}th`;
}

function formatRelativeTime(date: Date | null): string {
  if (!date) return "--";
  const now = Date.now();
  const diffMs = now - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

const REASON_LABELS: Record<string, string> = {
  policy_violation: "Policy Violation/Misuses",
  inappropriate_language: "Inappropriate Language",
  harassment: "Harassment or Bullying",
  school_parent_request: "Clinic/Parent Request",
  under_investigation: "Under Investigation",
  admin_bulk_action: "Admin Bulk Action",
  other: "Other",
};

function formatBlockedReason(reason: string | null): string {
  if (!reason) return "Policy Violation/Misuses";
  return REASON_LABELS[reason] ?? reason;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function fetchAdminStudents(): Promise<StudentsPageData> {
  const db = await serverDrizzle();

  const rows = await db.admin
    .select({
      userId: userSchools.userId,
      schoolName: schools.name,
      districtCode: schools.districtCode,
      accountStatus: profiles.accountStatus,
      studentCode: profiles.studentCode,
      grade: profiles.grade,
      createdAt: profiles.createdAt,
      blockedAt: profiles.blockedAt,
      blockedUntil: profiles.blockedUntil,
      blockedReason: profiles.blockedReason,
      email: users.email,
      rawUserMetaData: users.rawUserMetaData,
      // Check if user has confirmed their email (activated their account)
      emailConfirmedAt: sql<Date | null>`auth.users.email_confirmed_at`,
    })
    .from(userSchools)
    .innerJoin(schools, eq(userSchools.schoolId, schools.id))
    .innerJoin(profiles, eq(userSchools.userId, profiles.id))
    .innerJoin(users, eq(userSchools.userId, users.id))
    .where(and(eq(userSchools.role, "student"), isNull(profiles.deletedAt)));

  let activeCount = 0;
  let inactiveCount = 0;
  let inviteSentCount = 0;
  const blockedStudents: BlockedStudent[] = [];

  const now = new Date();

  const studentList: Student[] = rows.map((row) => {
    const status = row.accountStatus;
    const isActivated = row.emailConfirmedAt !== null;
    const blockExpired =
      status === "blocked" &&
      row.blockedUntil !== null &&
      row.blockedUntil < now;

    // Count based on activation status
    if (!isActivated) {
      inviteSentCount++;
    } else if (blockExpired || status === "active") {
      activeCount++;
    } else {
      // blocked or archived -> Inactive
      inactiveCount++;
    }

    // Determine display status - prioritize "Invite Sent" for unactivated accounts
    let displayStatus: StudentStatus;
    if (!isActivated) {
      displayStatus = "Invite Sent";
    } else if (blockExpired || status === "active") {
      displayStatus = "Active";
    } else {
      // blocked or archived -> Inactive
      displayStatus = "Inactive";
    }
    // @ts-expect-error - User metadata is not typed
    const firstName = row.rawUserMetaData?.first_name ?? "";
    // @ts-expect-error - User metadata is not typed
    const lastName = row.rawUserMetaData?.last_name ?? "";
    const name = `${firstName} ${lastName}`.trim() || row.email || "Unknown";

    if (status === "blocked" && !blockExpired) {
      blockedStudents.push({
        id: row.userId,
        name,
        school: row.schoolName,
        grade: `${formatGrade(row.grade)} Grade`,
        blockedAgo: row.blockedAt
          ? `Blocked ${formatRelativeTime(row.blockedAt)}`
          : "Blocked",
        reason: formatBlockedReason(row.blockedReason),
      });
    }

    return {
      id: row.userId,
      studentId: row.studentCode
        ? `#${row.studentCode}`
        : `#${row.userId.slice(0, 6).toUpperCase()}`,
      name,
      school: row.schoolName,
      district: row.districtCode ?? "--",
      grade: formatGrade(row.grade),
      status: displayStatus,
      createdDate: formatDate(row.createdAt),
    };
  });

  const schoolNames = [...new Set(rows.map((r) => r.schoolName))].sort();
  const districts = [
    ...new Set(rows.map((r) => r.districtCode).filter(Boolean)),
  ].sort() as string[];

  return {
    students: studentList,
    blockedStudents,
    stats: {
      total: rows.length,
      active: activeCount,
      inactive: inactiveCount,
      inviteSent: inviteSentCount,
    },
    schools: schoolNames,
    districts,
  };
}
