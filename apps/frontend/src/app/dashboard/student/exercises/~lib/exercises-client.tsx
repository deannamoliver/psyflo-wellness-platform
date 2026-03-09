"use client";

import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/tailwind-utils";
import {
  completeAssessmentServer,
  completeExerciseServer,
} from "@/app/dashboard/~lib/provider-data-actions";
import {
  getPatientAssessments,
  getPatientPlans,
  type StoredAssessment,
  type StoredExercise,
  type StoredTreatmentPlan,
} from "@/app/dashboard/~lib/provider-store";

// ─── Provider-Assigned Exercise Card ────────────────────────────────

function ProviderExerciseCard({ exercise, onComplete }: { exercise: StoredExercise; onComplete?: (id: string) => void }) {
  const isDone = exercise.status === "completed";
  const [isPending, startTransition] = useTransition();

  function handleComplete() {
    startTransition(async () => {
      await completeExerciseServer(exercise.id);
      onComplete?.(exercise.id);
    });
  }

  return (
    <div className={cn(
      "group flex items-center gap-3 rounded-xl border p-3.5 transition-all",
      isDone
        ? "border-gray-50 bg-gray-50/50"
        : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm",
    )}>
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
        isDone ? "bg-emerald-50" : "bg-blue-50",
      )}>
        {isDone ? <Check className="h-5 w-5 text-emerald-600" /> : <BookOpen className="h-5 w-5 text-blue-600" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn("truncate font-semibold text-sm", isDone ? "text-gray-400 line-through" : "text-gray-900")}>{exercise.topicName}</p>
          <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold uppercase text-blue-700">
            {exercise.categoryName}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-400">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{exercise.frequency}</span>
          <span className={cn(
            "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
            isDone ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-600",
          )}>
            {isDone ? "Done" : "To Do"}
          </span>
        </div>
      </div>
      {!isDone && (
        <button
          type="button"
          disabled={isPending}
          onClick={handleComplete}
          className="rounded-lg bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Mark Done"}
        </button>
      )}
    </div>
  );
}

// ─── Provider-Assigned Treatment Plan Card ──────────────────────────

function ProviderPlanCard({
  plan,
  exercises,
  onExerciseComplete,
}: {
  plan: StoredTreatmentPlan;
  exercises: StoredExercise[];
  onExerciseComplete?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const activeCount = exercises.filter((e) => e.status === "active").length;
  const completedCount = exercises.filter((e) => e.status === "completed").length;

  return (
    <div className="rounded-2xl border border-blue-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors bg-blue-50"
      >
        <Target className="h-6 w-6 text-blue-600 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-blue-700">{plan.title}</h3>
            <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600">
              {exercises.length} exercise{exercises.length !== 1 ? "s" : ""}
            </span>
          </div>
          {plan.goals.length > 0 && (
            <p className="mt-0.5 text-[11px] text-gray-500 line-clamp-1">
              Goals: {plan.goals[0]}
            </p>
          )}
          <div className="mt-1.5 flex items-center gap-3 text-[10px] text-gray-400">
            <span>{activeCount} active</span>
            <span>{completedCount} completed</span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Review: {plan.reviewDate}</span>
          </div>
        </div>
        <div className="shrink-0 text-gray-400">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="bg-white p-3 space-y-2">
          {exercises.length > 0 ? (
            exercises.map((ex) => <ProviderExerciseCard key={ex.id} exercise={ex} onComplete={onExerciseComplete} />)
          ) : (
            <p className="py-4 text-center text-xs text-gray-400">No exercises assigned to this plan yet</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Provider-Assigned Assessment Card ──────────────────────────────

function ProviderAssessmentCard({ assessment, onComplete }: { assessment: StoredAssessment; onComplete?: (id: string) => void }) {
  const isDone = assessment.status === "completed";
  const [isPending, startTransition] = useTransition();

  function handleComplete() {
    startTransition(async () => {
      await completeAssessmentServer(assessment.id);
      onComplete?.(assessment.id);
    });
  }

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-xl border p-3.5 transition-all",
      isDone
        ? "border-gray-50 bg-gray-50/50"
        : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm",
    )}>
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
        isDone ? "bg-emerald-50" : "bg-violet-50",
      )}>
        {isDone ? <Check className="h-5 w-5 text-emerald-600" /> : <ClipboardList className="h-5 w-5 text-violet-600" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn("truncate font-semibold text-sm", isDone ? "text-gray-400 line-through" : "text-gray-900")}>{assessment.title}</p>
          <span className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold",
            isDone ? "bg-emerald-50 text-emerald-700" : "bg-violet-50 text-violet-700",
          )}>
            {isDone ? "Done" : "To Do"}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-400">
          <span>{assessment.frequency}</span>
          {isDone
            ? <span>Completed</span>
            : <span>Due: {assessment.nextDue}</span>
          }
        </div>
      </div>
      {!isDone && (
        <button
          type="button"
          disabled={isPending}
          onClick={handleComplete}
          className="rounded-lg bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Mark Done"}
        </button>
      )}
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────────────────

export function ExercisesClient({
  userId,
  serverPlans,
  serverPlanExercises,
  serverAssessments,
}: {
  userId: string;
  serverPlans?: StoredTreatmentPlan[];
  serverPlanExercises?: Record<string, StoredExercise[]>;
  serverAssessments?: StoredAssessment[];
}) {
  const router = useRouter();
  const [plans, setPlans] = useState<StoredTreatmentPlan[]>(serverPlans ?? []);
  const [allExercises, setAllExercises] = useState<Record<string, StoredExercise[]>>(serverPlanExercises ?? {});
  const [assessments, setAssessments] = useState<StoredAssessment[]>(serverAssessments ?? []);
  const [loaded, setLoaded] = useState(
    // If server data was provided, we're already loaded
    (serverPlans && serverPlans.length > 0) || (serverAssessments && serverAssessments.length > 0),
  );

  useEffect(() => {
    // If server already provided data, skip localStorage
    if (loaded) return;

    // Fallback: read provider-assigned data from localStorage
    const storedPlans = getPatientPlans(userId);
    const storedExercises: Record<string, StoredExercise[]> = {};

    // Group exercises by plan ID
    for (const plan of storedPlans) {
      storedExercises[plan.id] = [];
    }
    // Also get from the full planExercises store
    try {
      const raw = localStorage.getItem(`rtm-provider-data-${userId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.planExercises) {
          for (const [planId, exs] of Object.entries(parsed.planExercises)) {
            storedExercises[planId] = exs as StoredExercise[];
          }
        }
      }
    } catch { /* ignore */ }

    if (storedPlans.length > 0 || getPatientAssessments(userId).length > 0) {
      setPlans(storedPlans);
      setAllExercises(storedExercises);
      setAssessments(getPatientAssessments(userId));
    }
    setLoaded(true);
  }, [userId, loaded]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-lg px-4 py-6">
          <div className="h-8 w-32 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    );
  }

  const hasProviderData = plans.length > 0 || assessments.length > 0;
  const activeExercises = Object.values(allExercises).flat().filter((e) => e.status === "active").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-lg px-4 py-6 space-y-5">
        {/* Header */}
        <div>
          <Link href="/dashboard/student/home" className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <h1 className="font-bold text-xl text-gray-900">My Treatment Plans</h1>
          <p className="mt-1 text-sm text-gray-500">
            {hasProviderData
              ? `${plans.length} plan${plans.length !== 1 ? "s" : ""} · ${activeExercises} active exercise${activeExercises !== 1 ? "s" : ""} · ${assessments.length} assessment${assessments.length !== 1 ? "s" : ""}`
              : "Exercises and assessments assigned by your provider"}
          </p>
        </div>

        {/* Treatment Plans with Exercises */}
        {plans.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-bold text-sm text-gray-700 uppercase tracking-wider">Treatment Plans</h2>
            {plans.map((plan) => (
              <ProviderPlanCard
                key={plan.id}
                plan={plan}
                exercises={allExercises[plan.id] ?? []}
                onExerciseComplete={(exId) => {
                  setAllExercises((prev) => {
                    const updated = { ...prev };
                    for (const pId of Object.keys(updated)) {
                      updated[pId] = updated[pId]!.map((e) =>
                        e.id === exId ? { ...e, status: "completed" as const, completedDate: new Date().toISOString().split("T")[0]! } : e,
                      );
                    }
                    return updated;
                  });
                  router.refresh();
                }}
              />
            ))}
          </div>
        )}

        {/* Assessments */}
        {assessments.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-sm text-gray-700 uppercase tracking-wider">Assigned Assessments</h2>
            <p className="text-xs text-gray-400">Complete these assessments as scheduled by your provider</p>
            {assessments.map((a) => (
              <ProviderAssessmentCard
                key={a.id}
                assessment={a}
                onComplete={() => {
                  setAssessments((prev) => prev.map((x) => x.id === a.id ? { ...x, status: "completed" } : x));
                  router.refresh();
                }}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!hasProviderData && (
          <div className="rounded-2xl border border-dashed bg-white p-8 text-center">
            <Target className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-500">No treatment plans assigned yet</p>
            <p className="mt-1 text-xs text-gray-400">Your provider will assign treatment plans, exercises, and assessments here</p>
          </div>
        )}

        <p className="text-center text-[11px] text-gray-400 pb-4">
          Assigned by your provider · Tap exercises to start
        </p>
      </div>
    </div>
  );
}
