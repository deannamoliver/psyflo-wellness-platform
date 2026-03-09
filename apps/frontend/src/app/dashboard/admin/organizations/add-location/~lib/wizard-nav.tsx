"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";

const STEPS = [
  { num: 1, label: "Location Profile" },
  { num: 2, label: "Users & Permissions" },
];

export function WizardNav({
  currentStep,
  onStepClick,
}: {
  currentStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, i) => (
        <div key={step.num} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onStepClick(step.num)}
            className="flex items-center gap-2"
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full font-semibold text-sm",
                currentStep === step.num
                  ? "bg-blue-600 text-white"
                  : currentStep > step.num
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-400",
              )}
            >
              {step.num}
            </span>
            <span
              className={cn(
                "font-medium text-sm",
                currentStep === step.num
                  ? "text-blue-600"
                  : currentStep > step.num
                    ? "text-gray-700"
                    : "text-gray-400",
              )}
            >
              {step.label}
            </span>
          </button>
          {i < STEPS.length - 1 && (
            <ChevronRight className="h-4 w-4 text-gray-300" />
          )}
        </div>
      ))}
    </div>
  );
}
