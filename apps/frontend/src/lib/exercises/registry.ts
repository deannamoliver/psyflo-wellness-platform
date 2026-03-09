/**
 * Exercise Registry
 * 
 * Lazy-loads exercise configurations by ID.
 * This allows for code-splitting and only loading configs when needed.
 */

import type { AnyExerciseConfig } from "./types";

// ─── Registry Map ────────────────────────────────────────────────────

type ConfigLoader = () => Promise<AnyExerciseConfig>;

const registry = new Map<string, ConfigLoader>([
  // ═══════════════════════════════════════════════════════════════════
  // F32 - Major Depressive Disorder
  // ═══════════════════════════════════════════════════════════════════
  ["f32-1-01", () => import("@/data/exercises/f32/phq9-self-check").then((m) => m.default)],
  ["f32-1-02", () => import("@/data/exercises/f32/thought-record").then((m) => m.default)],
  ["f32-1-03", () => import("@/data/exercises/f32/understanding-depression").then((m) => m.default)],
  ["f32-2-01", () => import("@/data/exercises/f32/daily-activity-log").then((m) => m.default)],
  ["f32-2-02", () => import("@/data/exercises/f32/activity-scheduling-planner").then((m) => m.default)],
  ["f32-2-03", () => import("@/data/exercises/f32/values-based-activity-brainstorm").then((m) => m.default)],
  ["f32-3-01", () => import("@/data/exercises/f32/sleep-hygiene-checklist").then((m) => m.default)],
  ["f32-3-02", () => import("@/data/exercises/f32/sleep-diary").then((m) => m.default)],
  ["f32-3-03", () => import("@/data/exercises/f32/wind-down-routine-builder").then((m) => m.default)],
  ["f32-4-01", () => import("@/data/exercises/f32/pleasant-events-tracker").then((m) => m.default)],
  ["f32-4-02", () => import("@/data/exercises/f32/pleasant-activities-inventory").then((m) => m.default)],

  // ═══════════════════════════════════════════════════════════════════
  // F33 - Recurrent Depressive Disorder
  // ═══════════════════════════════════════════════════════════════════
  ["f33-1-01", () => import("@/data/exercises/f33/rumination-interruption-practice").then((m) => m.default)],
  ["f33-1-02", () => import("@/data/exercises/f33/three-minute-breathing-space").then((m) => m.default)],
  ["f33-2-01", () => import("@/data/exercises/f33/early-warning-signs-map").then((m) => m.default)],
  ["f33-2-02", () => import("@/data/exercises/f33/personal-relapse-prevention-plan").then((m) => m.default)],
  ["f33-2-03", () => import("@/data/exercises/f33/weekly-wellness-checkin").then((m) => m.default)],
  ["f33-3-01", () => import("@/data/exercises/f33/coping-skills-library").then((m) => m.default)],
  ["f33-3-02", () => import("@/data/exercises/f33/coping-skills-practice-log").then((m) => m.default)],
  ["f33-4-01", () => import("@/data/exercises/f33/protective-factors-habit-tracker").then((m) => m.default)],
  ["f33-4-02", () => import("@/data/exercises/f33/maintenance-blueprint").then((m) => m.default)],

  // ═══════════════════════════════════════════════════════════════════
  // F41 - Anxiety Disorders
  // ═══════════════════════════════════════════════════════════════════
  ["f41-1-01", () => import("@/data/exercises/f41/gad7-self-check").then((m) => m.default)],
  ["f41-1-02", () => import("@/data/exercises/f41/anxious-thought-challenge").then((m) => m.default)],
  ["f41-1-03", () => import("@/data/exercises/f41/understanding-your-anxiety").then((m) => m.default)],
  ["f41-2-01", () => import("@/data/exercises/f41/exposure-hierarchy-builder").then((m) => m.default)],
  ["f41-2-02", () => import("@/data/exercises/f41/exposure-practice-log").then((m) => m.default)],
  ["f41-2-03", () => import("@/data/exercises/f41/approach-vs-avoidance").then((m) => m.default)],
  ["f41-3-01", () => import("@/data/exercises/f41/diaphragmatic-breathing").then((m) => m.default)],
  ["f41-3-02", () => import("@/data/exercises/f41/progressive-muscle-relaxation").then((m) => m.default)],
  ["f41-3-03", () => import("@/data/exercises/f41/five-four-three-two-one-grounding").then((m) => m.default)],
  ["f41-4-01", () => import("@/data/exercises/f41/worry-time-scheduler").then((m) => m.default)],
  ["f41-4-02", () => import("@/data/exercises/f41/worry-decision-tree").then((m) => m.default)],
  ["f41-4-03", () => import("@/data/exercises/f41/daily-worry-log").then((m) => m.default)],

  // ═══════════════════════════════════════════════════════════════════
  // F43 - Stress Reactions & Adjustment Disorders
  // ═══════════════════════════════════════════════════════════════════
  ["f43-1-01", () => import("@/data/exercises/f43/weekly-distress-thermometer").then((m) => m.default)],
  ["f43-1-02", () => import("@/data/exercises/f43/impact-statement").then((m) => m.default)],
  ["f43-1-03", () => import("@/data/exercises/f43/understanding-stress-trauma").then((m) => m.default)],
  ["f43-2-01", () => import("@/data/exercises/f43/grounding-toolkit").then((m) => m.default)],
  ["f43-2-02", () => import("@/data/exercises/f43/intrusion-log").then((m) => m.default)],
  ["f43-2-03", () => import("@/data/exercises/f43/containment-visualization").then((m) => m.default)],
  ["f43-3-01", () => import("@/data/exercises/f43/functioning-self-assessment").then((m) => m.default)],
  ["f43-3-02", () => import("@/data/exercises/f43/gradual-reengagement-planner").then((m) => m.default)],
  ["f43-4-01", () => import("@/data/exercises/f43/safety-coping-plan").then((m) => m.default)],
  ["f43-4-02", () => import("@/data/exercises/f43/stress-inoculation-rehearsal").then((m) => m.default)],

  // ═══════════════════════════════════════════════════════════════════
  // F90 - ADHD
  // ═══════════════════════════════════════════════════════════════════
  ["f90-1-01", () => import("@/data/exercises/f90/focus-session-timer").then((m) => m.default)],
  ["f90-1-02", () => import("@/data/exercises/f90/focus-environment-audit").then((m) => m.default)],
  ["f90-1-03", () => import("@/data/exercises/f90/understanding-adhd").then((m) => m.default)],
  ["f90-2-01", () => import("@/data/exercises/f90/pause-plan-proceed").then((m) => m.default)],
  ["f90-2-02", () => import("@/data/exercises/f90/impulse-incident-log").then((m) => m.default)],
  ["f90-3-01", () => import("@/data/exercises/f90/brain-dump-action-plan").then((m) => m.default)],
  ["f90-3-02", () => import("@/data/exercises/f90/routine-consistency-tracker").then((m) => m.default)],
  ["f90-3-03", () => import("@/data/exercises/f90/organizational-system-setup").then((m) => m.default)],
  ["f90-4-01", () => import("@/data/exercises/f90/task-breakdown-tool").then((m) => m.default)],
  ["f90-4-02", () => import("@/data/exercises/f90/deadline-completion-log").then((m) => m.default)],
  ["f90-4-03", () => import("@/data/exercises/f90/accommodations-assessment").then((m) => m.default)],

  // ═══════════════════════════════════════════════════════════════════
  // R45 - Symptoms Involving Emotional State
  // ═══════════════════════════════════════════════════════════════════
  ["r45-1-01", () => import("@/data/exercises/r45/personal-history-timeline").then((m) => m.default)],
  ["r45-1-02", () => import("@/data/exercises/r45/daily-mood-symptom-snapshot").then((m) => m.default)],
  ["r45-2-01", () => import("@/data/exercises/r45/distress-tolerance-toolkit").then((m) => m.default)],
  ["r45-2-02", () => import("@/data/exercises/r45/self-compassion-break").then((m) => m.default)],
  ["r45-3-01", () => import("@/data/exercises/r45/emotions-101").then((m) => m.default)],
  ["r45-3-02", () => import("@/data/exercises/r45/name-it-to-tame-it").then((m) => m.default)],
  ["r45-3-03", () => import("@/data/exercises/r45/emotion-action-urge-surfing").then((m) => m.default)],
  ["r45-4-01", () => import("@/data/exercises/r45/mood-behavior-diary").then((m) => m.default)],
  ["r45-4-02", () => import("@/data/exercises/r45/trigger-map").then((m) => m.default)],

  // ═══════════════════════════════════════════════════════════════════
  // Cross-Diagnostic
  // ═══════════════════════════════════════════════════════════════════
  ["cross-01", () => import("@/data/exercises/cross/medication-adherence-tracker").then((m) => m.default)],
  ["cross-02", () => import("@/data/exercises/cross/session-prep-sheet").then((m) => m.default)],
  ["cross-03", () => import("@/data/exercises/cross/between-session-checkin").then((m) => m.default)],
]);

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Get an exercise configuration by ID.
 * Returns null if the exercise is not found in the registry.
 */
export async function getExerciseConfig(id: string): Promise<AnyExerciseConfig | null> {
  const loader = registry.get(id);
  if (!loader) {
    return null;
  }
  try {
    return await loader();
  } catch (error) {
    console.error(`Failed to load exercise config: ${id}`, error);
    return null;
  }
}

/**
 * Check if an exercise exists in the registry.
 */
export function hasExercise(id: string): boolean {
  return registry.has(id);
}

/**
 * Get all registered exercise IDs.
 */
export function getRegisteredExerciseIds(): string[] {
  return Array.from(registry.keys());
}

/**
 * Register a new exercise configuration.
 * Useful for dynamic registration or testing.
 */
export function registerExercise(id: string, loader: ConfigLoader): void {
  registry.set(id, loader);
}

/**
 * Preload an exercise configuration (useful for warming cache).
 */
export async function preloadExercise(id: string): Promise<void> {
  await getExerciseConfig(id);
}

/**
 * Preload multiple exercise configurations.
 */
export async function preloadExercises(ids: string[]): Promise<void> {
  await Promise.all(ids.map(preloadExercise));
}
