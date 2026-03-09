"use client";

import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { cn } from "@/lib/tailwind-utils";
import {
  type AssignedExercise,
  type TherapyExercise,
  type TherapyModality,
  DIFFICULTY_COLORS,
  DOMAIN_COLORS,
  DOMAIN_LABELS,
  MODALITY_COLORS,
  THERAPY_EXERCISE_LIBRARY,
  getMockAssignedExercises,
} from "./therapy-exercises";

// ─── Exercise Detail Expand ─────────────────────────────────────────

function ExerciseInstructions({ exercise }: { exercise: TherapyExercise }) {
  return (
    <div className="mt-3 space-y-3 border-t pt-3">
      {/* DSM-5 Targets */}
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          DSM-5 Diagnostic Targets
        </p>
        <div className="flex flex-wrap gap-1.5">
          {exercise.dsm5Targets.map((target) => (
            <span
              key={target.code}
              className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700"
            >
              {target.code} — {target.name}
            </span>
          ))}
        </div>
      </div>

      {/* Clinical Indications */}
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Clinical Indications
        </p>
        <ul className="space-y-0.5 pl-3">
          {exercise.clinicalIndications.map((indication, i) => (
            <li key={i} className="list-disc text-xs text-gray-600">
              {indication}
            </li>
          ))}
        </ul>
      </div>

      {/* Instructions */}
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Instructions
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

      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {exercise.duration}
        </span>
        <span>Frequency: {exercise.frequency}</span>
      </div>

      {/* Contraindications */}
      {exercise.contraindications.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
            Contraindications
          </p>
          <ul className="mt-1 space-y-0.5 pl-3">
            {exercise.contraindications.map((ci, i) => (
              <li key={i} className="list-disc text-xs text-amber-700">
                {ci}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Evidence Base & Validation */}
      <div className="rounded-lg bg-gray-50 p-2.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
          Evidence Base
        </p>
        <p className="mt-0.5 text-xs text-gray-500">{exercise.evidenceBase}</p>
        <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">
          Validation
        </p>
        <p className="mt-0.5 text-xs text-gray-500">{exercise.validationSource}</p>
      </div>
    </div>
  );
}

// ─── Assigned Exercise Card ─────────────────────────────────────────

function AssignedExerciseCard({
  exercise,
  onUnassign,
}: {
  exercise: AssignedExercise;
  onUnassign: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const progress =
    exercise.targetCompletions > 0
      ? Math.min(
          (exercise.completionsThisPeriod / exercise.targetCompletions) * 100,
          100,
        )
      : 0;

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">
              {exercise.name}
            </p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                MODALITY_COLORS[exercise.modality],
              )}
            >
              {exercise.modality.toUpperCase()}
            </span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                DOMAIN_COLORS[exercise.domain] ?? "bg-gray-50 text-gray-600",
              )}
            >
              {exercise.domainLabel}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">{exercise.description}</p>

          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">
                {exercise.completionsThisPeriod}/{exercise.targetCompletions}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {exercise.frequency}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title={expanded ? "Collapse" : "View instructions"}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => onUnassign(exercise.id)}
            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
            title="Remove exercise"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && <ExerciseInstructions exercise={exercise} />}
    </div>
  );
}

// ─── Exercise Library Browser ───────────────────────────────────────

function ExerciseLibraryBrowser({
  onAssign,
  assignedIds,
  onClose,
}: {
  onAssign: (exercise: TherapyExercise) => void;
  assignedIds: Set<string>;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [modalityFilter, setModalityFilter] = useState<
    TherapyModality | "all"
  >("all");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = THERAPY_EXERCISE_LIBRARY.filter((ex) => {
    if (assignedIds.has(ex.id)) return false;
    if (modalityFilter !== "all" && ex.modality !== modalityFilter) return false;
    if (domainFilter !== "all" && ex.domain !== domainFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        ex.name.toLowerCase().includes(q) ||
        ex.description.toLowerCase().includes(q) ||
        ex.domainLabel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const domains =
    modalityFilter === "all"
      ? Object.entries(DOMAIN_LABELS)
      : Object.entries(DOMAIN_LABELS).filter(([key]) => {
          return THERAPY_EXERCISE_LIBRARY.some(
            (ex) => ex.modality === modalityFilter && ex.domain === key,
          );
        });

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h4 className="text-sm font-semibold text-gray-900">
            CBT & DBT Exercise Library
          </h4>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">Modality:</span>
          </div>
          {(["all", "cbt", "dbt"] as const).map((mod) => (
            <button
              key={mod}
              onClick={() => {
                setModalityFilter(mod);
                setDomainFilter("all");
              }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                modalityFilter === mod
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100",
              )}
            >
              {mod === "all"
                ? "All"
                : mod === "cbt"
                  ? "CBT"
                  : "DBT"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setDomainFilter("all")}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors",
              domainFilter === "all"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-500 hover:bg-gray-100",
            )}
          >
            All Domains
          </button>
          {domains.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setDomainFilter(key)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-colors",
                domainFilter === key
                  ? DOMAIN_COLORS[key]
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise List */}
      <div className="max-h-[400px] space-y-2 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-400">
            No matching exercises found.
          </p>
        ) : (
          filtered.map((exercise) => (
            <div
              key={exercise.id}
              className="rounded-lg border bg-white p-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-medium text-gray-900">
                      {exercise.name}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                        MODALITY_COLORS[exercise.modality],
                      )}
                    >
                      {exercise.modality.toUpperCase()}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                        DIFFICULTY_COLORS[exercise.difficulty],
                      )}
                    >
                      {exercise.difficulty}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    {exercise.description}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-400">
                    <span>{exercise.domainLabel}</span>
                    <span>·</span>
                    <span>{exercise.duration}</span>
                    <span>·</span>
                    <span>{exercise.frequency}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Button
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={() => onAssign(exercise)}
                  >
                    <Plus className="h-3 w-3" />
                    Assign
                  </Button>
                  <button
                    onClick={() =>
                      setExpandedId(
                        expandedId === exercise.id ? null : exercise.id,
                      )
                    }
                    className="text-[10px] text-blue-600 hover:text-blue-700"
                  >
                    {expandedId === exercise.id
                      ? "Hide details"
                      : "View details"}
                  </button>
                </div>
              </div>
              {expandedId === exercise.id && (
                <ExerciseInstructions exercise={exercise} />
              )}
            </div>
          ))
        )}
      </div>

      <p className="mt-3 text-center text-[10px] text-gray-400">
        {filtered.length} exercise{filtered.length !== 1 ? "s" : ""} available
        · {THERAPY_EXERCISE_LIBRARY.length} total in library
      </p>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export function TherapyExerciseAssignment({
  patientName,
}: {
  patientName: string;
}) {
  const [assigned, setAssigned] = useState<AssignedExercise[]>(() =>
    getMockAssignedExercises(patientName),
  );
  const [showLibrary, setShowLibrary] = useState(false);

  const assignedIds = new Set(assigned.map((a) => a.id));

  const cbtCount = assigned.filter((a) => a.modality === "cbt").length;
  const dbtCount = assigned.filter((a) => a.modality === "dbt").length;

  function handleAssign(exercise: TherapyExercise) {
    const newAssigned: AssignedExercise = {
      ...exercise,
      assignedAt: new Date().toISOString(),
      assignedBy: "Dr. Provider",
      completionsThisPeriod: 0,
      lastCompletedAt: null,
      patientNotes: null,
      status: "active",
    };
    setAssigned((prev) => [...prev, newAssigned]);
  }

  function handleUnassign(id: string) {
    setAssigned((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Therapy Exercises (CBT/DBT)
          </h3>
          <p className="mt-1 text-xs text-gray-400">
            {cbtCount} CBT · {dbtCount} DBT exercises assigned
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => setShowLibrary(!showLibrary)}
        >
          {showLibrary ? (
            <>
              <X className="h-3.5 w-3.5" />
              Close Library
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              Assign Exercise
            </>
          )}
        </Button>
      </div>

      {/* Assigned Exercises */}
      {assigned.length === 0 ? (
        <div className="rounded-lg border border-dashed py-8 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">
            No therapy exercises assigned yet
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Assign CBT or DBT exercises from the evidence-based library
          </p>
          <Button
            size="sm"
            className="mt-3 gap-1.5"
            onClick={() => setShowLibrary(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Browse Exercise Library
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {assigned.map((exercise) => (
            <AssignedExerciseCard
              key={exercise.id}
              exercise={exercise}
              onUnassign={handleUnassign}
            />
          ))}
        </div>
      )}

      {/* Exercise Library Browser */}
      {showLibrary && (
        <div className="mt-4">
          <ExerciseLibraryBrowser
            onAssign={handleAssign}
            assignedIds={assignedIds}
            onClose={() => setShowLibrary(false)}
          />
        </div>
      )}
    </div>
  );
}
