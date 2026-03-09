/**
 * Shared localStorage-based store for provider-assigned data.
 * Both the provider (counselor) and patient (student) dashboards read/write here.
 * Keys are scoped by patient/student ID so multiple patients can be managed.
 *
 * This is a temporary persistence layer for demo/iteration purposes.
 * In production, this should be replaced with Supabase tables + server actions.
 */

// ─── Types ──────────────────────────────────────────────────────────

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

// ─── Keys ───────────────────────────────────────────────────────────

function storageKey(patientId: string): string {
  return `rtm-provider-data-${patientId}`;
}

// ─── Read / Write ───────────────────────────────────────────────────

export function loadProviderData(patientId: string): ProviderData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(patientId));
    if (!raw) return null;
    return JSON.parse(raw) as ProviderData;
  } catch {
    return null;
  }
}

export function saveProviderData(patientId: string, data: ProviderData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(patientId), JSON.stringify(data));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

// ─── Convenience: read individual sections ──────────────────────────

export function getPatientPlans(patientId: string): StoredTreatmentPlan[] {
  return loadProviderData(patientId)?.plans ?? [];
}

export function getPatientExercises(patientId: string): Record<string, StoredExercise[]> {
  return loadProviderData(patientId)?.planExercises ?? {};
}

export function getPatientDiagnoses(patientId: string): StoredDiagnosis[] {
  return loadProviderData(patientId)?.diagnoses ?? [];
}

export function getPatientAssessments(patientId: string): StoredAssessment[] {
  return loadProviderData(patientId)?.assessments ?? [];
}

// ─── Convenience: get all exercises flat (for patient dashboard) ────

export function getAllExercisesFlat(patientId: string): StoredExercise[] {
  const byPlan = getPatientExercises(patientId);
  return Object.values(byPlan).flat();
}

// ─── Discovery: find provider data for the current user ─────────────
// Scans all localStorage keys to find provider data that matches
// This is used by the patient side which may not know its own ID upfront.

export function findProviderDataForUser(userId: string): ProviderData | null {
  // First try direct match
  const direct = loadProviderData(userId);
  if (direct) return direct;

  // Scan all keys for any provider data (fallback for demo)
  if (typeof window === "undefined") return null;
  const prefix = "rtm-provider-data-";
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      try {
        const data = JSON.parse(localStorage.getItem(key)!) as ProviderData;
        if (data && (data.plans?.length > 0 || data.assessments?.length > 0)) {
          return data;
        }
      } catch { /* ignore */ }
    }
  }
  return null;
}
