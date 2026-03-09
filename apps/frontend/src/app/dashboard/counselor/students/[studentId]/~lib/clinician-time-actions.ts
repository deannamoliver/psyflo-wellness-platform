"use server";

import { profiles, userSchools } from "@feelwell/database";
import { and, eq, inArray } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";

/**
 * Record that the counselor viewed a patient's chart.
 * Updates the patient's profile.lastActiveAt as a side-effect.
 *
 * Once the `clinician_time_logs` table exists (see NEW_TABLES_SCHEMA.ts),
 * uncomment the insert below to persist time-tracking rows.
 */
export async function recordChartView(
  studentId: string,
  _pageViewed: string,
) {
  const db = await serverDrizzle();
  const counselorId = db.userId();

  // Verify counselor has access to this student
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

  if (!counselorSchool) return { ok: false, error: "Unauthorized" };

  const studentSchool = await db.admin
    .select({ schoolId: userSchools.schoolId })
    .from(userSchools)
    .where(
      and(eq(userSchools.userId, studentId), eq(userSchools.role, "student")),
    )
    .limit(1)
    .then((res) => res[0]);

  if (studentSchool?.schoolId !== counselorSchool.schoolId) {
    return { ok: false, error: "Unauthorized" };
  }

  // Update the student's lastActiveAt to mark this as a chart-view event
  // This also serves as a proxy for clinician engagement until the
  // clinician_time_logs table is created.
  await db.admin
    .update(profiles)
    .set({ lastActiveAt: new Date() })
    .where(eq(profiles.id, studentId));

  // ── Once clinician_time_logs table is created, uncomment: ──
  // import { clinicianTimeLogs } from "@feelwell/database";
  // await db.admin.insert(clinicianTimeLogs).values({
  //   counselorId,
  //   studentId,
  //   startedAt: new Date(),
  //   pageViewed,
  // });

  return { ok: true };
}

/**
 * End a clinician time session (call when leaving patient chart).
 * Placeholder — requires clinician_time_logs table.
 */
export async function endChartView(
  _studentId: string,
  _startedAt: string,
) {
  // Once clinician_time_logs table exists:
  // const db = await serverDrizzle();
  // const counselorId = db.userId();
  // const start = new Date(_startedAt);
  // const end = new Date();
  // const durationSeconds = Math.round((end.getTime() - start.getTime()) / 1000);
  // await db.admin.update(clinicianTimeLogs).set({ endedAt: end, durationSeconds }).where(...);
  return { ok: true };
}
