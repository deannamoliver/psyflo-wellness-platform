"use server";

import { therapistReferrals, userSchools } from "@feelwell/database";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { unauthorized } from "next/navigation";
import { serverDrizzle } from "@/lib/database/drizzle";

export type ReferralFormData = {
  studentId: string;
  schoolId: string;
  reason: string;
  serviceTypes: string[];
  additionalContext?: string;
  urgency: string;
  insuranceStatus?: string;
  parentNotificationConfirmed: boolean;
};

export async function submitTherapistReferral(
  data: ReferralFormData,
): Promise<{ ok: boolean; error?: string }> {
  const db = await serverDrizzle();
  const counselorId = db.userId();

  const counselorSchool = await db.admin
    .select({ schoolId: userSchools.schoolId })
    .from(userSchools)
    .where(
      and(
        eq(userSchools.userId, counselorId),
        inArray(userSchools.role, ["counselor", "wellness_coach"]),
      ),
    )
    .limit(1)
    .then((res) => res[0]);

  if (!counselorSchool) unauthorized();

  const studentSchool = await db.admin
    .select({ schoolId: userSchools.schoolId })
    .from(userSchools)
    .where(
      and(
        eq(userSchools.userId, data.studentId),
        eq(userSchools.role, "student"),
      ),
    )
    .limit(1)
    .then((res) => res[0]);

  if (studentSchool?.schoolId !== counselorSchool.schoolId) unauthorized();

  try {
    await db.admin.insert(therapistReferrals).values({
      studentId: data.studentId,
      counselorId,
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

  revalidatePath(`/dashboard/counselor/students/${data.studentId}`);
  return { ok: true };
}
