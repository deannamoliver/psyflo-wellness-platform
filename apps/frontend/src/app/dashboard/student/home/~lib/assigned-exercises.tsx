"use client";

import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import {
  findProviderDataForUser,
  type StoredAssessment,
  type StoredExercise,
} from "@/app/dashboard/~lib/provider-store";

// ─── Types (mirrored from therapist side, patient sees read-only) ───

type TherapyModality = "cbt" | "dbt";

type AssignedExercise = {
  id: string;
  name: string;
  modality: TherapyModality;
  domainLabel: string;
  description: string;
  instructions: string[];
  duration: string;
  frequency: string;
  completionsThisPeriod: number;
  targetCompletions: number;
  status: "active" | "paused" | "completed";
};

// ─── Mock data (simulates what the patient would see) ───────────────

const MOCK_PATIENT_EXERCISES: AssignedExercise[] = [
  {
    id: "cbt-01",
    name: "Thought Record",
    modality: "cbt",
    domainLabel: "Cognitive Restructuring",
    description:
      "Identify and challenge automatic negative thoughts using a structured thought record.",
    instructions: [
      "Describe the situation that triggered the negative emotion",
      "Identify the automatic thought(s) that came to mind",
      "Rate the intensity of each emotion (0-100%)",
      "List the cognitive distortions present",
      "Write a balanced, rational alternative thought",
      "Re-rate the intensity of each emotion after reframing",
      "Note what action you will take based on the balanced thought",
    ],
    duration: "15-20 min",
    frequency: "Daily or when distressed",
    completionsThisPeriod: 8,
    targetCompletions: 20,
    status: "active",
  },
  {
    id: "cbt-04",
    name: "Cognitive Distortion Identification",
    modality: "cbt",
    domainLabel: "Cognitive Restructuring",
    description:
      "Learn to recognize common cognitive distortions in your daily thinking patterns.",
    instructions: [
      "Review the list of 10 cognitive distortions",
      "Throughout the day, notice when a negative thought arises",
      "Write down the thought and identify which distortion(s) apply",
      "Practice labeling the distortion without judging yourself",
      "Over time, notice which distortions are most common for you",
    ],
    duration: "5-10 min",
    frequency: "Daily",
    completionsThisPeriod: 14,
    targetCompletions: 30,
    status: "active",
  },
  {
    id: "dbt-01",
    name: "Wise Mind Meditation",
    modality: "dbt",
    domainLabel: "Mindfulness",
    description:
      "Access your Wise Mind — the integration of Emotion Mind and Reasonable Mind.",
    instructions: [
      "Sit comfortably and close your eyes",
      "Take 3 deep breaths, exhaling slowly",
      "Imagine walking down a spiral staircase, going deeper with each step",
      "At the bottom, you find a calm, clear pool — this is your Wise Mind",
      "Ask yourself: 'What does my Wise Mind know about this situation?'",
      "Sit with whatever answer arises without judging it",
      "When ready, slowly walk back up the staircase and open your eyes",
      "Journal what your Wise Mind communicated",
    ],
    duration: "10-15 min",
    frequency: "Daily",
    completionsThisPeriod: 10,
    targetCompletions: 30,
    status: "active",
  },
  {
    id: "dbt-06",
    name: "Emotion Surfing",
    modality: "dbt",
    domainLabel: "Mindfulness",
    description:
      "Observe emotions as waves that rise, peak, and fall — without acting on them.",
    instructions: [
      "When you notice a strong emotion, pause",
      "Name the emotion: 'I notice I am feeling ___'",
      "Observe where you feel it in your body",
      "Rate its intensity (0-10)",
      "Imagine the emotion as a wave — watch it rise",
      "Breathe steadily and let the wave peak without reacting",
      "Notice as the intensity naturally decreases",
      "Re-rate the intensity and note how long the wave lasted",
    ],
    duration: "5-10 min",
    frequency: "As needed, practice daily",
    completionsThisPeriod: 6,
    targetCompletions: 30,
    status: "active",
  },
];

// ─── Modality colors ────────────────────────────────────────────────

const MODALITY_STYLES: Record<TherapyModality, { bg: string; text: string; accent: string }> = {
  cbt: { bg: "bg-blue-50", text: "text-blue-700", accent: "bg-blue-500" },
  dbt: { bg: "bg-violet-50", text: "text-violet-700", accent: "bg-violet-500" },
};

// ─── Single Exercise Card ───────────────────────────────────────────

function ExerciseCard({
  exercise,
  onComplete,
}: {
  exercise: AssignedExercise;
  onComplete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [completing, setCompleting] = useState(false);
  const style = MODALITY_STYLES[exercise.modality];
  const progress =
    exercise.targetCompletions > 0
      ? Math.min(
          (exercise.completionsThisPeriod / exercise.targetCompletions) * 100,
          100,
        )
      : 0;

  function handleComplete() {
    setCompleting(true);
    setTimeout(() => {
      onComplete(exercise.id);
      setCompleting(false);
    }, 600);
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
      >
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
            style.bg,
          )}
        >
          <BookOpen className={cn("h-4 w-4", style.text)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-gray-900">
              {exercise.name}
            </p>
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase",
                style.bg,
                style.text,
              )}
            >
              {exercise.modality}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">{exercise.domainLabel}</p>
          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div
                className={cn("h-full rounded-full transition-all", style.accent)}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="shrink-0 text-[10px] text-gray-400">
              {exercise.completionsThisPeriod}/{exercise.targetCompletions}
            </span>
          </div>
        </div>
        <div className="mt-1 shrink-0 text-gray-300">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          <p className="mb-3 text-xs leading-relaxed text-gray-600">
            {exercise.description}
          </p>

          <div className="mb-3 flex items-center gap-3 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {exercise.duration}
            </span>
            <span>{exercise.frequency}</span>
          </div>

          <div className="mb-4">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Steps
            </p>
            <ol className="space-y-1.5 pl-4">
              {exercise.instructions.map((step, i) => (
                <li
                  key={i}
                  className="list-decimal text-xs leading-relaxed text-gray-600"
                >
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <button
            type="button"
            onClick={handleComplete}
            disabled={completing}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all",
              completing
                ? "bg-emerald-500 text-white"
                : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600",
            )}
          >
            {completing ? (
              <>
                <Check className="h-4 w-4" />
                Completed!
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Mark as Complete
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Provider-Assigned Items (from localStorage) ───────────────────

function ProviderExerciseRow({ exercise }: { exercise: StoredExercise }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50">
        <BookOpen className="h-4 w-4 text-blue-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{exercise.topicName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-gray-400">{exercise.frequency}</span>
          <span className={cn(
            "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
            exercise.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700",
          )}>
            {exercise.status}
          </span>
        </div>
      </div>
    </div>
  );
}

function ProviderAssessmentRow({ assessment }: { assessment: StoredAssessment }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-50">
        <Sparkles className="h-4 w-4 text-violet-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{assessment.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-gray-400">{assessment.frequency}</span>
          <span className="text-[10px] text-gray-400">Due: {assessment.nextDue}</span>
        </div>
      </div>
      <div className="rounded-lg bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">
        Take
      </div>
    </div>
  );
}

// ─── Main Section ───────────────────────────────────────────────────

export function AssignedExercisesSection({
  userId,
  serverExercises,
  serverAssessments,
}: {
  userId?: string;
  serverExercises?: StoredExercise[];
  serverAssessments?: StoredAssessment[];
}) {
  const [exercises, setExercises] = useState(MOCK_PATIENT_EXERCISES);
  const [providerExercises, setProviderExercises] = useState<StoredExercise[]>(serverExercises ?? []);
  const [providerAssessments, setProviderAssessments] = useState<StoredAssessment[]>(serverAssessments ?? []);

  useEffect(() => {
    // If server already provided data, skip localStorage
    if ((serverExercises && serverExercises.length > 0) || (serverAssessments && serverAssessments.length > 0)) return;

    // Fallback: read from localStorage
    const data = findProviderDataForUser(userId ?? "");
    if (data) {
      const allExs = Object.values(data.planExercises ?? {}).flat();
      setProviderExercises(allExs);
      setProviderAssessments(data.assessments ?? []);
    }
  }, [userId, serverExercises, serverAssessments]);

  const totalCompleted = exercises.reduce(
    (sum, e) => sum + e.completionsThisPeriod,
    0,
  );
  const totalTarget = exercises.reduce(
    (sum, e) => sum + e.targetCompletions,
    0,
  );

  function handleComplete(id: string) {
    setExercises((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, completionsThisPeriod: e.completionsThisPeriod + 1 }
          : e,
      ),
    );
  }

  const hasAnything = exercises.length > 0 || providerExercises.length > 0 || providerAssessments.length > 0;
  if (!hasAnything) return null;

  return (
    <>
      {/* Provider-assigned exercises */}
      {providerExercises.length > 0 && (
        <>
          <div className="mt-6 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-lg">My Treatment Exercises</h2>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">
              {providerExercises.filter((e) => e.status === "active").length} active
            </span>
          </div>
          <div className="space-y-2">
            {providerExercises.map((ex) => (
              <ProviderExerciseRow key={ex.id} exercise={ex} />
            ))}
          </div>
        </>
      )}

      {/* Provider-assigned assessments */}
      {providerAssessments.length > 0 && (
        <>
          <div className="mt-6 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-lg">My Assessments</h2>
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-semibold text-violet-700">
              {providerAssessments.length} assigned
            </span>
          </div>
          <div className="space-y-2">
            {providerAssessments.map((a) => (
              <ProviderAssessmentRow key={a.id} assessment={a} />
            ))}
          </div>
        </>
      )}

      {/* Original mock exercises */}
      {exercises.length > 0 && (
        <>
          <div className="mt-6 mb-3 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-lg">My Exercises</h2>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">
              {totalCompleted}/{totalTarget} done
            </span>
          </div>

          <div className="space-y-2.5">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onComplete={handleComplete}
              />
            ))}
          </div>
        </>
      )}

      <p className="mt-2 text-center text-[10px] text-gray-400">
        Exercises assigned by your therapist
      </p>
    </>
  );
}
