"use server";

import { userSchools } from "@feelwell/database";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { serverDrizzle } from "@/lib/database/drizzle";

/**
 * Server actions for treatment plans, exercises, and diagnoses.
 *
 * These currently validate the counselor session and will persist to
 * Supabase once the tables from NEW_TABLES_SCHEMA.ts are created.
 * Until then, the frontend continues using localStorage via provider-store.ts.
 */

// ─── Authorization helper ───────────────────────────────────────────

async function verifyCounselorAccess(studentId: string) {
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

  if (!counselorSchool) return null;

  const studentSchool = await db.admin
    .select({ schoolId: userSchools.schoolId })
    .from(userSchools)
    .where(
      and(eq(userSchools.userId, studentId), eq(userSchools.role, "student")),
    )
    .limit(1)
    .then((res) => res[0]);

  if (studentSchool?.schoolId !== counselorSchool.schoolId) return null;

  return { counselorId, schoolId: counselorSchool.schoolId, db };
}

// ─── Treatment Plan Actions ─────────────────────────────────────────

export async function saveTreatmentPlan(
  studentId: string,
  plan: {
    id: string;
    title: string;
    goals: string[];
    startDate: string;
    reviewDate: string;
    notes: string;
  },
) {
  const access = await verifyCounselorAccess(studentId);
  if (!access) return { ok: false, error: "Unauthorized" };

  // ── Once treatment_plans table is created, uncomment: ──
  // import { treatmentPlans } from "@feelwell/database";
  // await access.db.admin
  //   .insert(treatmentPlans)
  //   .values({
  //     id: plan.id,
  //     studentId,
  //     counselorId: access.counselorId,
  //     title: plan.title,
  //     goals: plan.goals,
  //     notes: plan.notes,
  //     startDate: plan.startDate || null,
  //     reviewDate: plan.reviewDate || null,
  //   })
  //   .onConflictDoUpdate({
  //     target: treatmentPlans.id,
  //     set: {
  //       title: plan.title,
  //       goals: plan.goals,
  //       notes: plan.notes,
  //       reviewDate: plan.reviewDate || null,
  //     },
  //   });

  void plan; // used in commented code above

  revalidatePath(`/dashboard/counselor/students/${studentId}`);
  return { ok: true };
}

export async function deleteTreatmentPlan(
  studentId: string,
  planId: string,
) {
  const access = await verifyCounselorAccess(studentId);
  if (!access) return { ok: false, error: "Unauthorized" };

  // ── Once treatment_plans table is created, uncomment: ──
  // import { treatmentPlans } from "@feelwell/database";
  // await access.db.admin
  //   .delete(treatmentPlans)
  //   .where(eq(treatmentPlans.id, planId));

  void planId; // used in commented code above

  revalidatePath(`/dashboard/counselor/students/${studentId}`);
  return { ok: true };
}

// ─── Exercise Assignment Actions ────────────────────────────────────

export async function assignExercise(
  studentId: string,
  exercise: {
    id: string;
    planId: string;
    topicId: string;
    topicName: string;
    categoryName: string;
    frequency: string;
    deadline: string;
  },
) {
  const access = await verifyCounselorAccess(studentId);
  if (!access) return { ok: false, error: "Unauthorized" };

  // ── Once assigned_exercises table is created, uncomment: ──
  // import { assignedExercises } from "@feelwell/database";
  // await access.db.admin.insert(assignedExercises).values({
  //   id: exercise.id,
  //   planId: exercise.planId,
  //   studentId,
  //   topicId: exercise.topicId,
  //   topicName: exercise.topicName,
  //   categoryName: exercise.categoryName,
  //   frequency: exercise.frequency,
  //   assignedDate: new Date().toISOString().slice(0, 10),
  //   deadline: exercise.deadline || null,
  // });

  void exercise; // used in commented code above

  revalidatePath(`/dashboard/counselor/students/${studentId}`);
  return { ok: true };
}

export async function updateExerciseStatus(
  studentId: string,
  exerciseId: string,
  status: "active" | "completed" | "deactivated",
) {
  const access = await verifyCounselorAccess(studentId);
  if (!access) return { ok: false, error: "Unauthorized" };

  // ── Once assigned_exercises table is created, uncomment: ──
  // import { assignedExercises } from "@feelwell/database";
  // await access.db.admin
  //   .update(assignedExercises)
  //   .set({
  //     status,
  //     completedDate: status === "completed" ? new Date().toISOString().slice(0, 10) : null,
  //   })
  //   .where(eq(assignedExercises.id, exerciseId));

  void exerciseId; // used in commented code above
  void status; // used in commented code above

  revalidatePath(`/dashboard/counselor/students/${studentId}`);
  return { ok: true };
}

// ─── Diagnosis Actions ──────────────────────────────────────────────

export async function saveDiagnosis(
  studentId: string,
  diagnosis: { code: string; description: string },
) {
  const access = await verifyCounselorAccess(studentId);
  if (!access) return { ok: false, error: "Unauthorized" };

  // ── Once patient_diagnoses table is created, uncomment: ──
  // import { patientDiagnoses } from "@feelwell/database";
  // await access.db.admin.insert(patientDiagnoses).values({
  //   studentId,
  //   counselorId: access.counselorId,
  //   code: diagnosis.code,
  //   description: diagnosis.description,
  // });

  void diagnosis; // used in commented code above

  revalidatePath(`/dashboard/counselor/students/${studentId}`);
  return { ok: true };
}

export async function removeDiagnosis(
  studentId: string,
  diagnosisCode: string,
) {
  const access = await verifyCounselorAccess(studentId);
  if (!access) return { ok: false, error: "Unauthorized" };

  // ── Once patient_diagnoses table is created, uncomment: ──
  // import { patientDiagnoses } from "@feelwell/database";
  // await access.db.admin
  //   .delete(patientDiagnoses)
  //   .where(
  //     and(
  //       eq(patientDiagnoses.studentId, studentId),
  //       eq(patientDiagnoses.code, diagnosisCode),
  //     ),
  //   );

  void diagnosisCode; // used in commented code above

  revalidatePath(`/dashboard/counselor/students/${studentId}`);
  return { ok: true };
}
