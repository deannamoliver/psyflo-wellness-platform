"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/tailwind-utils";
import { Button } from "@/lib/core-ui/button";
import { LikertScale } from "../shared/LikertScale";
import { TrendChart } from "../shared/TrendChart";
import { ClinicalAlert } from "../shared/ClinicalAlert";
import type { TrackerConfig, TrackerField, ExerciseResponse, ScoringResult } from "@/lib/exercises/types";
import { scorePHQ9, PHQ9_THRESHOLDS } from "@/lib/exercises/scoring/phq9";
import { scoreGAD7, GAD7_THRESHOLDS } from "@/lib/exercises/scoring/gad7";

// ─── Types ───────────────────────────────────────────────────────────

export interface TrackerRendererProps {
  config: TrackerConfig;
  previousResponses?: ExerciseResponse[];
  onChange?: (values: Record<string, unknown>) => void;
  onScoreCalculated?: (score: ScoringResult) => void;
  readOnly?: boolean;
}

interface AlertState {
  severity: "warning" | "critical";
  message: string;
}

// ─── Field Renderer ──────────────────────────────────────────────────

function FieldInput({
  field,
  value,
  onChange,
  disabled,
}: {
  field: TrackerField;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  disabled?: boolean;
}) {
  switch (field.type) {
    case "likert":
      return (
        <LikertScale
          min={field.min ?? 0}
          max={field.max ?? 10}
          value={typeof value === "number" ? value : undefined}
          onChange={onChange}
          minLabel={field.minLabel}
          maxLabel={field.maxLabel}
          disabled={disabled}
        />
      );

    case "number":
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
            disabled={disabled}
            step={field.step ?? 1}
            min={field.validation?.min}
            max={field.validation?.max}
            className={cn(
              "w-32 rounded-lg border px-3 py-2 text-sm",
              "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
              disabled && "bg-gray-100 cursor-not-allowed"
            )}
          />
          {field.unit && <span className="text-sm text-gray-500">{field.unit}</span>}
        </div>
      );

    case "text":
      return (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={field.helpText}
          className={cn(
            "w-full rounded-lg border px-3 py-2 text-sm",
            "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
            disabled && "bg-gray-100 cursor-not-allowed"
          )}
        />
      );

    case "select":
      return (
        <div className="flex flex-wrap gap-2">
          {field.options?.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => !disabled && onChange(option.value)}
              disabled={disabled}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                value === option.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      );

    case "multiselect":
      const selectedValues: string[] = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="flex flex-wrap gap-2">
          {field.options?.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (disabled) return;
                  const newValues = isSelected
                    ? selectedValues.filter((v) => v !== option.value)
                    : [...selectedValues, option.value];
                  onChange(newValues as unknown as string | number);
                }}
                disabled={disabled}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                  disabled && "cursor-not-allowed opacity-50"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      );

    case "time":
      return (
        <input
          type="time"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            "rounded-lg border px-3 py-2 text-sm",
            "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
            disabled && "bg-gray-100 cursor-not-allowed"
          )}
        />
      );

    case "duration":
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
            disabled={disabled}
            min={0}
            className={cn(
              "w-20 rounded-lg border px-3 py-2 text-sm",
              "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
              disabled && "bg-gray-100 cursor-not-allowed"
            )}
          />
          <span className="text-sm text-gray-500">minutes</span>
        </div>
      );

    default:
      return (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            "w-full rounded-lg border px-3 py-2 text-sm",
            "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
            disabled && "bg-gray-100 cursor-not-allowed"
          )}
        />
      );
  }
}

// ─── Score Display ───────────────────────────────────────────────────

function ScoreDisplay({ score, scoringFunction }: { score: ScoringResult; scoringFunction?: string }) {
  const _thresholds = scoringFunction === "phq9" ? PHQ9_THRESHOLDS : 
                     scoringFunction === "gad7" ? GAD7_THRESHOLDS : [];
  
  const maxScore = scoringFunction === "phq9" ? 27 : scoringFunction === "gad7" ? 21 : 100;
  const percent = Math.min(100, (score.total / maxScore) * 100);

  const severityColors: Record<string, string> = {
    minimal: "bg-emerald-500",
    mild: "bg-yellow-500",
    moderate: "bg-orange-500",
    "moderately-severe": "bg-red-500",
    severe: "bg-red-700",
  };

  const barColor = score.severity ? severityColors[score.severity] ?? "bg-blue-500" : "bg-blue-500";

  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Score</span>
        <span className="text-2xl font-bold text-gray-900">{score.total}</span>
      </div>
      <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className={cn(
        "text-sm font-medium",
        score.severity === "severe" || score.severity === "moderately-severe" ? "text-red-700" :
        score.severity === "moderate" ? "text-orange-700" :
        score.severity === "mild" ? "text-yellow-700" : "text-emerald-700"
      )}>
        {score.interpretation}
      </p>
      {score.recommendations && score.recommendations.length > 0 && (
        <ul className="mt-2 space-y-1">
          {score.recommendations.map((rec, i) => (
            <li key={i} className="text-xs text-gray-600">• {rec}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────

export function TrackerRenderer({
  config,
  previousResponses = [],
  onChange,
  onScoreCalculated,
  readOnly = false,
}: TrackerRendererProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<ScoringResult | null>(null);
  const [alerts, setAlerts] = useState<AlertState[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(new Set());

  // Calculate historical trend data
  const trendData = useMemo(() => {
    if (!config.showTrend || !previousResponses.length) return [];
    return previousResponses
      .filter((r) => r.score?.total !== undefined)
      .map((r) => ({
        date: new Date(r.completedAt ?? r.savedAt ?? r.startedAt).toLocaleDateString(),
        value: r.score!.total,
      }))
      .reverse();
  }, [previousResponses, config.showTrend]);

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange(values);
    }
  }, [values, onChange]);

  const handleFieldChange = (fieldId: string, value: string | number) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = () => {
    if (readOnly) return;

    // Apply scoring if configured
    if (config.scoringFunction) {
      let result: ScoringResult | null = null;
      if (config.scoringFunction === "phq9") {
        result = scorePHQ9(values as Record<string, string | number>);
      } else if (config.scoringFunction === "gad7") {
        result = scoreGAD7(values as Record<string, string | number>);
      }
      if (result) {
        setScore(result);
        onScoreCalculated?.(result);

        // Check for critical flags
        if (result.flags?.includes("suicidal_ideation")) {
          setAlerts((prev) => [
            ...prev,
            {
              severity: "critical",
              message: "Patient indicated thoughts of self-harm. Please assess immediately.",
            },
          ]);
        }
      }
    }

    // Check alert thresholds
    if (config.alertRules) {
      const newAlerts: AlertState[] = [];
      for (const rule of config.alertRules) {
        const fieldValue = values[rule.fieldId];
        let triggered = false;

        if (typeof fieldValue === "number" && typeof rule.value === "number") {
          switch (rule.condition) {
            case "gte": triggered = fieldValue >= rule.value; break;
            case "lte": triggered = fieldValue <= rule.value; break;
            case "eq": triggered = fieldValue === rule.value; break;
          }
        } else if (typeof fieldValue === "string" && rule.condition === "contains") {
          triggered = fieldValue.toLowerCase().includes(String(rule.value).toLowerCase());
        }

        if (triggered) {
          newAlerts.push({ severity: rule.severity, message: rule.message });
        }
      }
      setAlerts((prev) => [...prev, ...newAlerts]);
    }

    setSubmitted(true);
  };

  const dismissAlert = (index: number) => {
    setDismissedAlerts((prev) => new Set([...prev, index]));
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {alerts.map((alert, index) =>
        !dismissedAlerts.has(index) ? (
          <ClinicalAlert
            key={index}
            level={alert.severity}
            message={alert.message}
            onDismiss={() => dismissAlert(index)}
          />
        ) : null
      )}

      {/* Trend Chart */}
      {config.showTrend && trendData.length > 0 && (
        <div className="rounded-lg border bg-white p-4">
          <TrendChart
            data={trendData}
            label="Score History"
            color="#3b82f6"
            thresholdLines={
              config.scoringFunction === "phq9" ? PHQ9_THRESHOLDS :
              config.scoringFunction === "gad7" ? GAD7_THRESHOLDS : []
            }
          />
        </div>
      )}

      {/* Entry Form */}
      {!submitted ? (
        <div className="space-y-6">
          {config.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.helpText && field.type !== "text" && (
                <p className="text-xs text-gray-500">{field.helpText}</p>
              )}
              <FieldInput
                field={field}
                value={values[field.id] as string | number | undefined}
                onChange={(v) => handleFieldChange(field.id, v)}
                disabled={readOnly}
              />
            </div>
          ))}

          {!readOnly && (
            <Button
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Submit Entry
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Score Display */}
          {score && (
            <ScoreDisplay score={score} scoringFunction={config.scoringFunction} />
          )}

          {/* Summary of entered values */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Entry Summary</h4>
            <div className="space-y-2">
              {config.fields.map((field) => (
                <div key={field.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{field.label}</span>
                  <span className="font-medium text-gray-900">
                    {String(values[field.id] ?? "—")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {!readOnly && (
            <Button
              variant="outline"
              onClick={() => setSubmitted(false)}
              className="w-full"
            >
              Edit Entry
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
