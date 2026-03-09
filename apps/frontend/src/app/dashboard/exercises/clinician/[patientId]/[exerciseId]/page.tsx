"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Loader2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/tailwind-utils";
import { getExerciseConfig } from "@/lib/exercises/registry";
import { ExerciseRouter } from "@/components/exercises/ExerciseRouter";
import type { AnyExerciseConfig, ExerciseResponse } from "@/lib/exercises/types";

// Mock responses for demonstration - in production, fetch from API
function getMockResponses(exerciseId: string, patientId: string): ExerciseResponse[] {
  // Generate mock responses based on exercise type
  const now = new Date();
  const responses: ExerciseResponse[] = [];

  // Generate 3-5 mock responses
  const count = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    responses.push({
      id: `resp-${exerciseId}-${i}`,
      exerciseId,
      assignmentId: `assign-${exerciseId}`,
      patientId,
      clinicianId: "clinician-1",
      status: "completed",
      responses: {
        // Mock response data
        score: 10 + Math.floor(Math.random() * 15),
        notes: `Response from ${date.toLocaleDateString()}`,
      },
      startedAt: date.toISOString(),
      completedAt: date.toISOString(),
      score: exerciseId.includes("phq") || exerciseId.includes("gad")
        ? { total: 10 + Math.floor(Math.random() * 15), interpretation: "Moderate" }
        : undefined,
    });
  }

  return responses;
}

// ─── Response Entry Card ─────────────────────────────────────────────

function ResponseEntryCard({
  response,
  config,
  isExpanded,
  onToggle,
}: {
  response: ExerciseResponse;
  config: AnyExerciseConfig;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const completedDate = response.completedAt
    ? new Date(response.completedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "In Progress";

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{completedDate}</p>
            <p className="text-xs text-gray-500">
              {response.status === "completed" ? "Completed" : "Draft"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {response.score && (
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
              Score: {response.score.total}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t px-4 py-4">
          <ExerciseRouter
            exerciseId={config.id}
            assignmentId={response.assignmentId}
            patientId={response.patientId}
            clinicianId={response.clinicianId}
            previousResponses={[response]}
            readOnly={true}
          />
        </div>
      )}
    </div>
  );
}

// ─── Trend Chart (simplified) ────────────────────────────────────────

function TrendChart({ responses }: { responses: ExerciseResponse[] }) {
  const scores = responses
    .filter((r) => r.score?.total !== undefined)
    .map((r) => ({
      date: new Date(r.completedAt ?? r.startedAt),
      score: r.score!.total,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (scores.length < 2) {
    return (
      <div className="rounded-lg border bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-500">
          Not enough data for trend analysis. Complete at least 2 entries.
        </p>
      </div>
    );
  }

  const maxScore = Math.max(...scores.map((s) => s.score));
  const minScore = Math.min(...scores.map((s) => s.score));
  const range = maxScore - minScore || 1;
  const latestScore = scores[scores.length - 1]?.score ?? 0;
  const previousScore = scores[scores.length - 2]?.score ?? 0;
  const trend = latestScore < previousScore ? "improving" : latestScore > previousScore ? "worsening" : "stable";

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Score Trend</h3>
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium",
          trend === "improving" ? "text-emerald-600" :
          trend === "worsening" ? "text-red-600" : "text-gray-500"
        )}>
          {trend === "improving" && <TrendingDown className="h-3.5 w-3.5" />}
          {trend === "worsening" && <TrendingUp className="h-3.5 w-3.5" />}
          <span className="capitalize">{trend}</span>
        </div>
      </div>

      {/* Simple bar chart */}
      <div className="flex items-end gap-2 h-24">
        {scores.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={cn(
                "w-full rounded-t transition-all",
                i === scores.length - 1 ? "bg-blue-500" : "bg-blue-200"
              )}
              style={{
                height: `${((s.score - minScore + 1) / (range + 1)) * 100}%`,
                minHeight: "8px",
              }}
            />
            <span className="text-[10px] text-gray-500">
              {s.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>Latest: {latestScore}</span>
        <span>Previous: {previousScore}</span>
        <span>Change: {latestScore - previousScore > 0 ? "+" : ""}{latestScore - previousScore}</span>
      </div>
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────

export default function ClinicianReviewPage() {
  const params = useParams();
  const patientId = params["patientId"] as string;
  const exerciseId = params["exerciseId"] as string;

  const [config, setConfig] = useState<AnyExerciseConfig | null>(null);
  const [responses, setResponses] = useState<ExerciseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // Load exercise config
        const loadedConfig = await getExerciseConfig(exerciseId);
        if (cancelled) return;

        if (!loadedConfig) {
          setError(`Exercise "${exerciseId}" not found.`);
          setLoading(false);
          return;
        }

        setConfig(loadedConfig);

        // Load responses - in production, fetch from API
        // For now, use mock data
        const mockResponses = getMockResponses(exerciseId, patientId);
        setResponses(mockResponses);

        // Expand the most recent response by default
        if (mockResponses.length > 0) {
          setExpandedId(mockResponses[0]?.id ?? null);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [exerciseId, patientId]);

  const backHref = `/dashboard/counselor/rtm/${patientId}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading responses...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white px-6 py-4">
          <div className="mx-auto max-w-4xl">
            <Link
              href={backHref}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Patient
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-4xl p-6">
          <div className="rounded-lg border bg-white p-12 text-center">
            <p className="text-gray-500">{error ?? "Exercise not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  const isTracker = config.type === "tracker";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <Link
            href={backHref}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patient
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{config.title}</h1>
              <p className="mt-1 text-sm text-gray-500">{config.description}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                {responses.length} response{responses.length !== 1 ? "s" : ""}
              </span>
              {config.estimatedMinutes && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  ~{config.estimatedMinutes} min
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl p-6 space-y-6">
        {/* Trend chart for trackers */}
        {isTracker && responses.length > 0 && (
          <TrendChart responses={responses} />
        )}

        {/* Response entries */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Response History
          </h2>

          {responses.length === 0 ? (
            <div className="rounded-lg border bg-white p-8 text-center">
              <Calendar className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">No responses yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Responses will appear here once the patient completes the exercise.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {responses.map((response) => (
                <ResponseEntryCard
                  key={response.id}
                  response={response}
                  config={config}
                  isExpanded={expandedId === response.id}
                  onToggle={() =>
                    setExpandedId(expandedId === response.id ? null : response.id)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
