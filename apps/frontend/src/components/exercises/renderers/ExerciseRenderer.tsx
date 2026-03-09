"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";
import { Button } from "@/lib/core-ui/button";
import { LikertScale } from "../shared/LikertScale";
import { VisualPacer } from "../widgets/VisualPacer";
import { TimerWidget } from "../widgets/TimerWidget";
import { EmotionPicker, type EmotionSelection } from "../widgets/EmotionPicker";
import { SUDSSlider } from "../widgets/SUDSSlider";
import type { ExerciseConfig, ExerciseStep } from "@/lib/exercises/types";

// ─── Types ───────────────────────────────────────────────────────────

export interface ExerciseRendererProps {
  config: ExerciseConfig;
  initialValues?: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
  readOnly?: boolean;
}

// ─── Step Renderer ───────────────────────────────────────────────────

function StepContent({
  step,
  value,
  onChange,
  disabled,
}: {
  step: ExerciseStep;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
}) {
  switch (step.type) {
    case "instruction":
      return (
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{step.content}</p>
        </div>
      );

    case "text-input":
      return step.multiline ? (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={step.placeholder}
          maxLength={step.maxLength}
          rows={5}
          className={cn(
            "w-full rounded-lg border px-4 py-3 text-sm resize-none",
            "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
            disabled && "bg-gray-100 cursor-not-allowed"
          )}
        />
      ) : (
        <input
          type="text"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={step.placeholder}
          maxLength={step.maxLength}
          className={cn(
            "w-full rounded-lg border px-4 py-3 text-sm",
            "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
            disabled && "bg-gray-100 cursor-not-allowed"
          )}
        />
      );

    case "likert":
      return (
        <LikertScale
          min={step.min}
          max={step.max}
          value={typeof value === "number" ? value : undefined}
          onChange={onChange}
          minLabel={step.minLabel}
          maxLabel={step.maxLabel}
          disabled={disabled}
          size="lg"
        />
      );

    case "select":
      return (
        <div className="flex flex-wrap gap-2">
          {step.options?.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => !disabled && onChange(step.allowMultiple 
                ? toggleArrayValue(value as string[] | undefined, option.value)
                : option.value
              )}
              disabled={disabled}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                (step.allowMultiple 
                  ? (value as string[] | undefined)?.includes(option.value)
                  : value === option.value)
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

    case "reflection":
      return (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 italic">{step.prompt}</p>
          <textarea
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            rows={4}
            className={cn(
              "w-full rounded-lg border px-4 py-3 text-sm resize-none",
              "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
              disabled && "bg-gray-100 cursor-not-allowed"
            )}
            placeholder="Write your reflection here..."
          />
        </div>
      );

    case "summary":
      return (
        <div className="rounded-lg border bg-gray-50 p-4">
          <p className="text-sm text-gray-700">{step.template}</p>
        </div>
      );

    case "breathing-pacer":
      return (
        <VisualPacer
          inhaleSeconds={step.inhaleSeconds}
          holdSeconds={step.holdSeconds}
          exhaleSeconds={step.exhaleSeconds}
          cycles={step.cycles}
          onComplete={() => onChange(true)}
        />
      );

    case "timer":
      return (
        <TimerWidget
          durationSeconds={step.durationSeconds}
          label={step.timerLabel}
          onComplete={() => onChange(true)}
        />
      );

    case "emotion-picker":
      return (
        <EmotionPicker
          value={value as EmotionSelection | undefined}
          onChange={(v) => onChange(v)}
        />
      );

    case "suds":
      return (
        <SUDSSlider
          value={typeof value === "number" ? value : 50}
          onChange={(v) => onChange(v)}
          label={step.sudsLabel}
        />
      );

    default:
      return <p className="text-sm text-gray-500">Unknown step type</p>;
  }
}

function toggleArrayValue(arr: string[] | undefined, value: string): string[] {
  const current = arr ?? [];
  return current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
}

// ─── Component ───────────────────────────────────────────────────────

export function ExerciseRenderer({
  config,
  initialValues,
  onChange,
  readOnly = false,
}: ExerciseRendererProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [values, setValues] = useState<Record<string, unknown>>(initialValues ?? {});
  const [preRating, setPreRating] = useState<number | undefined>();
  const [postRating, setPostRating] = useState<number | undefined>();
  const [showPreRating, setShowPreRating] = useState(false);
  const [showPostRating, setShowPostRating] = useState(false);

  const totalSteps = config.steps.length;
  const currentStep = config.steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const progressPercent = totalSteps > 0 ? Math.round(((currentStepIndex + 1) / totalSteps) * 100) : 0;

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange({
        ...values,
        ...(preRating !== undefined && { _preRating: preRating }),
        ...(postRating !== undefined && { _postRating: postRating }),
      });
    }
  }, [values, preRating, postRating, onChange]);

  const handleValueChange = (stepId: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [stepId]: value }));
  };

  const handleNext = () => {
    if (isLastStep) {
      setShowPostRating(true);
    } else {
      setCurrentStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handleBack = () => {
    if (config.allowBackNavigation !== false) {
      setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  // Show pre-rating on first render if configured
  useEffect(() => {
    if (isFirstStep && preRating === undefined) {
      setShowPreRating(true);
    }
  }, [isFirstStep, preRating]);

  if (!currentStep) {
    return <p className="text-sm text-gray-500">No steps configured</p>;
  }

  // Pre-rating screen
  if (showPreRating) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Before We Begin</h3>
          <p className="mt-2 text-sm text-gray-600">
            How are you feeling right now? Rate your current state.
          </p>
        </div>
        <LikertScale
          min={0}
          max={10}
          value={preRating}
          onChange={setPreRating}
          minLabel="Very Low"
          maxLabel="Very High"
          size="lg"
        />
        <Button
          onClick={() => setShowPreRating(false)}
          disabled={preRating === undefined}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Continue
        </Button>
      </div>
    );
  }

  // Post-rating screen
  if (showPostRating) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Exercise Complete!</h3>
          <p className="mt-2 text-sm text-gray-600">
            How are you feeling now? Rate your current state.
          </p>
        </div>
        <LikertScale
          min={0}
          max={10}
          value={postRating}
          onChange={setPostRating}
          minLabel="Very Low"
          maxLabel="Very High"
          size="lg"
        />
        {preRating !== undefined && postRating !== undefined && (
          <div className="rounded-lg border bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-600">
              Change: <span className={cn(
                "font-semibold",
                postRating > preRating ? "text-emerald-600" :
                postRating < preRating ? "text-red-600" : "text-gray-600"
              )}>
                {postRating > preRating ? "+" : ""}{postRating - preRating}
              </span>
            </p>
          </div>
        )}
        <Button
          onClick={() => setShowPostRating(false)}
          disabled={postRating === undefined}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          Finish Exercise
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      {config.showProgressBar !== false && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <span className="text-gray-500">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="space-y-4">
        {currentStep.label && (
          <h3 className="text-lg font-semibold text-gray-900">{currentStep.label}</h3>
        )}

        {currentStep.helpText && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex gap-3">
            <Lightbulb className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">{currentStep.helpText}</p>
          </div>
        )}

        <StepContent
          step={currentStep}
          value={values[currentStep.id]}
          onChange={(v) => handleValueChange(currentStep.id, v)}
          disabled={readOnly}
        />
      </div>

      {/* Navigation */}
      {!readOnly && (
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isFirstStep || config.allowBackNavigation === false}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            className={cn(
              "gap-1",
              isLastStep ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {isLastStep ? "Complete" : "Next"}
            {!isLastStep && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}
