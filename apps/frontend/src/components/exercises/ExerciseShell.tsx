"use client";

import { useState, useCallback } from "react";
import { Clock, CheckCircle2, Save, X } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";
import { Button } from "@/lib/core-ui/button";
import type { AnyExerciseConfig, ExerciseResponse, ResponseStatus } from "@/lib/exercises/types";

// ─── Intervention Type Labels (matches patient-detail.tsx) ───────────

const INTERVENTION_TYPE_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  checklist: { label: "Checklist", bg: "bg-emerald-50", color: "text-emerald-700" },
  tracker: { label: "Tracker", bg: "bg-blue-50", color: "text-blue-700" },
  exercise: { label: "Exercise", bg: "bg-purple-50", color: "text-purple-700" },
  worksheet: { label: "Worksheet", bg: "bg-amber-50", color: "text-amber-700" },
  psychoed: { label: "Psychoed", bg: "bg-rose-50", color: "text-rose-700" },
};

// ─── Props ───────────────────────────────────────────────────────────

export interface ExerciseShellProps {
  config: AnyExerciseConfig;
  assignmentId: string;
  patientId: string;
  clinicianId: string;
  previousResponses?: ExerciseResponse[];
  onComplete?: (response: ExerciseResponse) => void;
  readOnly?: boolean;
  children?: React.ReactNode;
  responses?: Record<string, unknown>;
  onResponseChange?: (responses: Record<string, unknown>) => void;
}

// ─── Component ───────────────────────────────────────────────────────

export function ExerciseShell({
  config,
  assignmentId,
  patientId,
  clinicianId,
  previousResponses,
  onComplete,
  readOnly = false,
  children,
  responses = {},
  onResponseChange: _onResponseChange,
}: ExerciseShellProps) {
  const [status, setStatus] = useState<ResponseStatus>("draft");
  const [isSaving, setIsSaving] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typeLabel = INTERVENTION_TYPE_LABELS[config.type] ?? {
    label: config.type,
    bg: "bg-gray-50",
    color: "text-gray-700",
  };

  const handleSaveDraft = useCallback(async () => {
    if (readOnly) return;
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/exercises/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: config.id,
          assignmentId,
          patientId,
          clinicianId,
          status: "saved",
          responses,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save draft");
      }

      setStatus("saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  }, [config.id, assignmentId, patientId, clinicianId, responses, readOnly]);

  const handleMarkComplete = useCallback(async () => {
    if (readOnly) return;
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/exercises/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: config.id,
          assignmentId,
          patientId,
          clinicianId,
          status: "completed",
          responses,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to complete exercise");
      }

      const data = await res.json();
      setStatus("completed");
      setShowCompletion(true);

      if (onComplete) {
        onComplete(data.response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete exercise");
    } finally {
      setIsSaving(false);
    }
  }, [config.id, assignmentId, patientId, clinicianId, responses, readOnly, onComplete]);

  const handleCloseCompletion = () => {
    setShowCompletion(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-semibold text-gray-900 truncate">{config.title}</h1>
              <span className={cn("rounded px-2 py-0.5 text-xs font-medium shrink-0", typeLabel.bg, typeLabel.color)}>
                {typeLabel.label}
              </span>
              {readOnly && (
                <span className="rounded px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 shrink-0">
                  Read Only
                </span>
              )}
            </div>
            {config.subtitle && (
              <p className="text-sm text-gray-600">{config.subtitle}</p>
            )}
            {config.description && (
              <p className="mt-1 text-sm text-gray-500">{config.description}</p>
            )}
          </div>
          {config.estimatedMinutes && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 shrink-0">
              <Clock className="h-4 w-4" />
              <span>~{config.estimatedMinutes} min</span>
            </div>
          )}
        </div>

        {/* Status indicator */}
        {!readOnly && (
          <div className="mt-3 flex items-center gap-2">
            <div className={cn(
              "h-2 w-2 rounded-full",
              status === "completed" ? "bg-emerald-500" :
              status === "saved" ? "bg-blue-500" : "bg-gray-300"
            )} />
            <span className="text-xs text-gray-500 capitalize">{status}</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>

      {/* Footer with Actions */}
      {!readOnly && (
        <div className="border-t px-6 py-4 bg-gray-50">
          {error && (
            <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {previousResponses && previousResponses.length > 0 && (
                <span>Previous entries: {previousResponses.length}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSaving || status === "completed"}
                className="gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                Save Draft
              </Button>
              <Button
                size="sm"
                onClick={handleMarkComplete}
                disabled={isSaving || status === "completed"}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark Complete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Dialog */}
      {showCompletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button
              type="button"
              onClick={handleCloseCompletion}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Exercise Complete!</h2>
              <p className="mt-2 text-sm text-gray-600">
                {config.completionMessage ?? "Great work! Your response has been saved."}
              </p>
              <Button
                onClick={handleCloseCompletion}
                className="mt-6 bg-emerald-600 hover:bg-emerald-700"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
