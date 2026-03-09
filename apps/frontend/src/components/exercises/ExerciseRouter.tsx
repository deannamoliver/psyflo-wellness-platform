"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ExerciseShell } from "./ExerciseShell";
import { ChecklistRenderer } from "./renderers/ChecklistRenderer";
import { TrackerRenderer } from "./renderers/TrackerRenderer";
import { ExerciseRenderer } from "./renderers/ExerciseRenderer";
import { WorksheetRenderer } from "./renderers/WorksheetRenderer";
import { PsychoedRenderer } from "./renderers/PsychoedRenderer";
import { getExerciseConfig } from "@/lib/exercises/registry";
import type {
  AnyExerciseConfig,
  ExerciseResponse,
  ChecklistConfig,
  TrackerConfig,
  ExerciseConfig,
  WorksheetConfig,
  PsychoedConfig,
} from "@/lib/exercises/types";

// ─── Props ───────────────────────────────────────────────────────────

export interface ExerciseRouterProps {
  exerciseId: string;
  assignmentId: string;
  patientId: string;
  clinicianId: string;
  previousResponses?: ExerciseResponse[];
  onComplete?: (response: ExerciseResponse) => void;
  readOnly?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────

export function ExerciseRouter({
  exerciseId,
  assignmentId,
  patientId,
  clinicianId,
  previousResponses,
  onComplete,
  readOnly = false,
}: ExerciseRouterProps) {
  const [config, setConfig] = useState<AnyExerciseConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, unknown>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      setLoading(true);
      setError(null);
      try {
        const loadedConfig = await getExerciseConfig(exerciseId);
        if (cancelled) return;
        if (loadedConfig) {
          setConfig(loadedConfig);
        } else {
          setError(`Exercise "${exerciseId}" not found in registry.`);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load exercise");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadConfig();

    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  const handleResponseChange = (newResponses: Record<string, unknown>) => {
    setResponses(newResponses);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-sm text-gray-500">Loading exercise...</p>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <span className="text-2xl">❓</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Exercise Not Found</h2>
        <p className="mt-2 text-sm text-gray-500">
          {error ?? `The exercise with ID "${exerciseId}" could not be found.`}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          This exercise may not have been registered yet.
        </p>
      </div>
    );
  }

  const renderContent = () => {
    switch (config.type) {
      case "checklist":
        return (
          <ChecklistRenderer
            config={config as ChecklistConfig}
            onChange={(values) => handleResponseChange(values)}
            readOnly={readOnly}
          />
        );
      case "tracker":
        return (
          <TrackerRenderer
            config={config as TrackerConfig}
            previousResponses={previousResponses}
            onChange={handleResponseChange}
            readOnly={readOnly}
          />
        );
      case "exercise":
        return (
          <ExerciseRenderer
            config={config as ExerciseConfig}
            onChange={handleResponseChange}
            readOnly={readOnly}
          />
        );
      case "worksheet":
        return (
          <WorksheetRenderer
            config={config as WorksheetConfig}
            onChange={handleResponseChange}
            readOnly={readOnly}
          />
        );
      case "psychoed":
        return (
          <PsychoedRenderer
            config={config as PsychoedConfig}
            onChange={handleResponseChange}
            readOnly={readOnly}
          />
        );
      default:
        return (
          <div className="text-sm text-gray-500">
            Unknown exercise type: {(config as AnyExerciseConfig).type}
          </div>
        );
    }
  };

  return (
    <ExerciseShell
      config={config}
      assignmentId={assignmentId}
      patientId={patientId}
      clinicianId={clinicianId}
      previousResponses={previousResponses}
      onComplete={onComplete}
      readOnly={readOnly}
      responses={responses}
      onResponseChange={handleResponseChange}
    >
      {renderContent()}
    </ExerciseShell>
  );
}
