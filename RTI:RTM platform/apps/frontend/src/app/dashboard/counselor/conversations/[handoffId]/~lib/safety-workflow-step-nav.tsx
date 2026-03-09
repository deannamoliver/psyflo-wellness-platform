"use client";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileText,
  HelpCircle,
  Send,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/tailwind-utils";
import type { SafetyWorkflowStep } from "./safety-workflow-types";
import { ORDERED_STEPS, STEP_LABELS } from "./safety-workflow-types";

const STEP_ICONS: Record<SafetyWorkflowStep, React.ReactNode> = {
  danger: <AlertTriangle className="size-4" />,
  type: <ClipboardList className="size-4" />,
  assess: <FileText className="size-4" />,
  level: <HelpCircle className="size-4" />,
  act: <Zap className="size-4" />,
  document: <FileText className="size-4" />,
  send: <Send className="size-4" />,
  return: <ArrowLeft className="size-4" />,
};

type StepNavProps = {
  currentStep: SafetyWorkflowStep;
  completedSteps: SafetyWorkflowStep[];
};

export function SafetyWorkflowStepNav({
  currentStep,
  completedSteps,
}: StepNavProps) {
  const currentIndex = ORDERED_STEPS.indexOf(currentStep);
  return (
    <div className="flex items-center justify-between border-gray-200 border-b px-2 py-3">
      {ORDERED_STEPS.map((step) => {
        const isCurrent = step === currentStep;
        const isCompleted = completedSteps.includes(step);
        const stepIndex = ORDERED_STEPS.indexOf(step);
        const isSkipped = stepIndex < currentIndex && !isCompleted;
        return (
          <div key={step} className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full font-medium text-sm",
                isCurrent && "bg-blue-600 text-white",
                isCompleted && !isCurrent && "bg-green-500 text-white",
                !isCurrent && !isCompleted && "bg-gray-100 text-gray-500",
              )}
            >
              {isCompleted && !isCurrent ? (
                <CheckCircle2 className="size-4" />
              ) : isSkipped ? (
                <span>-</span>
              ) : (
                STEP_ICONS[step]
              )}
            </div>
            <span
              className={cn(
                "text-[10px]",
                isCurrent ? "font-semibold text-gray-900" : "text-gray-400",
              )}
            >
              {STEP_LABELS[step]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
