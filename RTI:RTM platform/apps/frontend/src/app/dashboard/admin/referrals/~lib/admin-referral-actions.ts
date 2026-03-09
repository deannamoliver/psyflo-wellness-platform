"use server";

import {
  profiles,
  schools,
  therapistReferrals,
  userSchools,
  users,
} from "@feelwell/database";
import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullName } from "@/lib/user/utils";

export type StudentSearchResult = {
  studentId: string;
  name: string;
  dob: string | null;
  age: number | null;
  grade: number | null;
  schoolName: string;
  schoolId: string;
  referralStatus: string | null;
};

export async function searchStudentsForReferral(
  query: string,
): Promise<StudentSearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const db = await serverDrizzle();
  const q = `%${query.trim().toLowerCase()}%`;

  const rows = await db.admin
    .select({
      userId: userSchools.userId,
      schoolId: userSchools.schoolId,
      schoolName: schools.name,
      profile: profiles,
      user: users,
      referralStatus: sql<string | null>`(
        SELECT status FROM therapist_referrals
        WHERE student_id = ${userSchools.userId}
        AND status NOT IN ('cancelled', 'completed')
        ORDER BY created_at DESC
        LIMIT 1
      )`,
    })
    .from(userSchools)
    .innerJoin(schools, eq(userSchools.schoolId, schools.id))
    .innerJoin(profiles, eq(userSchools.userId, profiles.id))
    .innerJoin(users, eq(userSchools.userId, users.id))
    .where(
      and(
        eq(userSchools.role, "student"),
        isNull(profiles.deletedAt),
        sql`(
          lower(${users.email}) like ${q}
          OR lower(concat(
            coalesce(${users.rawUserMetaData}->>'first_name', ''),
            ' ',
            coalesce(${users.rawUserMetaData}->>'last_name', '')
          )) like ${q}
        )`,
      ),
    )
    .limit(20);

  return rows.map((row) => {
    const name = getUserFullName(row.user);
    let age: number | null = null;
    if (row.profile.dateOfBirth) {
      const birth = new Date(row.profile.dateOfBirth);
      const now = new Date();
      age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    }
    return {
      studentId: row.userId,
      name,
      dob: row.profile.dateOfBirth,
      age,
      grade: row.profile.grade,
      schoolName: row.schoolName,
      schoolId: row.schoolId,
      referralStatus: row.referralStatus ?? null,
    };
  });
}

export type AdminReferralFormData = {
  studentId: string;
  schoolId: string;
  reason: string;
  serviceTypes: string[];
  additionalContext?: string;
  urgency: string;
  insuranceStatus?: string;
  parentNotificationConfirmed: boolean;
};

export async function submitAdminReferral(
  data: AdminReferralFormData,
): Promise<{ ok: boolean; error?: string }> {
  const db = await serverDrizzle();
  const adminId = db.userId();

  try {
    await db.admin.insert(therapistReferrals).values({
      studentId: data.studentId,
      counselorId: adminId,
      schoolId: data.schoolId,
      reason: data.reason as typeof therapistReferrals.$inferInsert.reason,
      serviceTypes: data.serviceTypes,
      additionalContext: data.additionalContext ?? null,
      urgency: data.urgency as typeof therapistReferrals.$inferInsert.urgency,
      insuranceStatus:
        (data.insuranceStatus as typeof therapistReferrals.$inferInsert.insuranceStatus) ??
        null,
      parentNotificationConfirmed: data.parentNotificationConfirmed,
    });
  } catch {
    return { ok: false, error: "Failed to save referral. Please try again." };
  }

  revalidatePath("/dashboard/admin/referrals");
  return { ok: true };
}
