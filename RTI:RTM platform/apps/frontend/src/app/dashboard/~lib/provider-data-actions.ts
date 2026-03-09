"use server";

import { userSchools } from "@feelwell/database";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { serverDrizzle } from "@/lib/database/drizzle";

/**
 * Server-side shared store for provider-assigned data (treatment plans,
 * exercises, assessments, diagnoses).
 *
 * Uses a file-based JSON store so data is accessible across both the
 * provider's and student's sessions. This replaces the localStorage-based
 * provider-store.ts which was per-browser and never crossed over.
 *
 * When the DB tables from NEW_TABLES_SCHEMA.ts are created, replace the
 * file reads/writes with Drizzle queries.
 */

// ─── Types (same as provider-store.ts) ──────────────────────────────

export type StoredDiagnosis = { code: string; description: string };

export type StoredTreatmentPlan = {
  id: string;
  title: string;
  goals: string[];
  startDate: string;
  reviewDate: string;
  notes: string;
};

export type StoredExercise = {
  id: string;
  topicId: string;
  topicName: string;
  categoryName: string;
  frequency: string;
  assignedDate: string;
  deadline: string;
  status: "active" | "completed" | "deactivated";
  completedDate: string | null;
  lastActivity: string | null;
};

export type StoredAssessment = {
  id: string;
  definitionId: string;
  title: string;
  shortTitle: string;
  frequency: string;
  assignedDate: string;
  nextDue: string;
  status: "active" | "paused" | "completed";
};

export type ProviderData = {
  diagnoses: StoredDiagnosis[];
  plans: StoredTreatmentPlan[];
  planExercises: Record<string, StoredExercise[]>;
  assessments: StoredAssessment[];
};

// ─── File-based storage (replaces localStorage) ─────────────────────

const STORE_DIR = path.join(process.cwd(), ".provider-data");

async function ensureDir() {
  try {
    await fs.mkdir(STORE_DIR, { recursive: true });
  } catch { /* already exists */ }
}

function filePath(patientId: string): string {
  // Sanitize ID to prevent path traversal
  const safe = patientId.replace(/[^a-zA-Z0-9-_]/g, "");
  return path.join(STORE_DIR, `${safe}.json`);
}

async function readStore(patientId: string): Promise<ProviderData | null> {
  try {
    const data = await fs.readFile(filePath(patientId), "utf-8");
    return JSON.parse(data) as ProviderData;
  } catch {
    return null;
  }
}

async function writeStore(patientId: string, data: ProviderData): Promise<void> {
  await ensureDir();
  await fs.writeFile(filePath(patientId), JSON.stringify(data, null, 2), "utf-8");
}

// ─── Authorization ──────────────────────────────────────────────────

async function verifyCounselorForStudent(studentId: string) {
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

  return { counselorId, db };
}

// ─── Server Actions: Provider side (write) ──────────────────────────

export async function saveProviderDataServer(
  studentId: string,
  data: ProviderData,
): Promise<{ ok: boolean; error?: string }> {
  const access = await verifyCounselorForStudent(studentId);
  if (!access) return { ok: false, error: "Unauthorized" };

  await writeStore(studentId, data);

  revalidatePath(`/dashboard/counselor/students/${studentId}`);
  revalidatePath("/dashboard/student/exercises");
  return { ok: true };
}

// ─── Server Actions: Student/Provider side (read) ───────────────────

export async function loadProviderDataServer(
  studentId: string,
): Promise<ProviderData | null> {
  const db = await serverDrizzle();
  db.userId(); // verify authenticated
  return readStore(studentId);
}

export async function getStudentPlansServer(
  studentId: string,
): Promise<StoredTreatmentPlan[]> {
  const data = await readStore(studentId);
  return data?.plans ?? [];
}

export async function getStudentExercisesServer(
  studentId: string,
): Promise<Record<string, StoredExercise[]>> {
  const data = await readStore(studentId);
  return data?.planExercises ?? {};
}

export async function getStudentAssessmentsServer(
  studentId: string,
): Promise<StoredAssessment[]> {
  const data = await readStore(studentId);
  return data?.assessments ?? [];
}

export async function getStudentDiagnosesServer(
  studentId: string,
): Promise<StoredDiagnosis[]> {
  const data = await readStore(studentId);
  return data?.diagnoses ?? [];
}

// ─── Server Actions: Student side (write-back) ──────────────────────

export async function completeAssessmentServer(
  assessmentId: string,
): Promise<{ ok: boolean; error?: string }> {
  const db = await serverDrizzle();
  const studentId = db.userId();

  const data = await readStore(studentId);
  if (!data) return { ok: false, error: "No data found" };

  const idx = data.assessments.findIndex((a) => a.id === assessmentId);
  if (idx === -1) return { ok: false, error: "Assessment not found" };

  data.assessments[idx]!.status = "completed";
  await writeStore(studentId, data);

  revalidatePath("/dashboard/student/home");
  revalidatePath("/dashboard/student/exercises");
  revalidatePath(`/dashboard/counselor/students/${studentId}`);
  return { ok: true };
}

export async function completeExerciseServer(
  exerciseId: string,
): Promise<{ ok: boolean; error?: string }> {
  const db = await serverDrizzle();
  const studentId = db.userId();

  const data = await readStore(studentId);
  if (!data) return { ok: false, error: "No data found" };

  let found = false;
  for (const planId of Object.keys(data.planExercises)) {
    const exercises = data.planExercises[planId]!;
    const idx = exercises.findIndex((e) => e.id === exerciseId);
    if (idx !== -1) {
      exercises[idx]!.status = "completed";
      exercises[idx]!.completedDate = new Date().toISOString().split("T")[0]!;
      found = true;
      break;
    }
  }

  if (!found) return { ok: false, error: "Exercise not found" };

  await writeStore(studentId, data);

  revalidatePath("/dashboard/student/home");
  revalidatePath("/dashboard/student/exercises");
  revalidatePath(`/dashboard/counselor/students/${studentId}`);
  return { ok: true };
}
