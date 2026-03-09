"server-only";

import {
  profiles,
  schools,
  therapistReferrals,
  users,
} from "@feelwell/database";
import { eq, isNull } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullName } from "@/lib/user/utils";
import type {
  AdminReferral,
  ReferralStatus,
  ReferralsPageData,
  ReferralUrgency,
} from "./referrals-data";

const STATUS_MAP: Record<string, ReferralStatus> = {
  submitted: "Submitted",
  in_progress: "In Progress",
  matched: "Connected",
  completed: "Closed",
  cancelled: "Closed",
};

const URGENCY_MAP: Record<string, ReferralUrgency> = {
  routine: "Routine",
  urgent: "Urgent",
};

function computeAge(dob: string | null): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export async function fetchActiveReferralCount(): Promise<number> {
  const db = await serverDrizzle();

  const rows = await db.admin
    .select({ status: therapistReferrals.status })
    .from(therapistReferrals)
    .where(isNull(therapistReferrals.deletedAt));

  return rows.filter(
    (r) => r.status === "submitted" || r.status === "in_progress",
  ).length;
}

export async function fetchAdminReferrals(): Promise<ReferralsPageData> {
  const db = await serverDrizzle();

  const rows = await db.admin
    .select({
      referral: therapistReferrals,
      studentUser: users,
      profile: profiles,
      schoolName: schools.name,
    })
    .from(therapistReferrals)
    .innerJoin(users, eq(therapistReferrals.studentId, users.id))
    .innerJoin(profiles, eq(therapistReferrals.studentId, profiles.id))
    .innerJoin(schools, eq(therapistReferrals.schoolId, schools.id))
    .where(isNull(therapistReferrals.deletedAt));

  let submitted = 0;
  let inProgress = 0;
  let connected = 0;
  let closed = 0;
  const orgSet = new Set<string>();

  const referrals: AdminReferral[] = rows.map((row) => {
    const status = STATUS_MAP[row.referral.status] ?? "Submitted";
    if (status === "Submitted") submitted++;
    else if (status === "In Progress") inProgress++;
    else if (status === "Connected") connected++;
    else closed++;

    orgSet.add(row.schoolName);

    return {
      id: row.referral.id,
      studentName: getUserFullName(row.studentUser),
      studentAge: computeAge(row.profile.dateOfBirth),
      studentGrade: row.profile.grade ?? 0,
      organization: row.schoolName,
      urgency: URGENCY_MAP[row.referral.urgency] ?? "Routine",
      status,
      submittedAt: row.referral.createdAt,
    };
  });

  return {
    referrals,
    orgs: [...orgSet].sort(),
    stats: { submitted, inProgress, connected, closed },
  };
}
