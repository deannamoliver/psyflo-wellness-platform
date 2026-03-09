"use client";

import { cn } from "@/lib/tailwind-utils";

export type TakeoverReason = {
  id: string;
  label: string;
  description: string;
};

export const TAKEOVER_REASONS: TakeoverReason[] = [
  {
    id: "safety_concern",
    label: "Safety Concern \u2013 Immediate Clinical Intervention Needed",
    description:
      "Patient is at immediate risk and requires direct clinical assessment and intervention",
  },
  {
    id: "clinical_escalation",
    label: "Clinical Escalation \u2013 Beyond Therapist Scope",
    description:
      "Situation has escalated beyond the therapist\u2019s clinical scope and requires supervisor expertise",
  },
  {
    id: "coach_request",
    label: "Therapist Request \u2013 Therapist Asked for Support",
    description:
      "Therapist has requested supervisor assistance with this conversation",
  },
  {
    id: "training",
    label: "Training/Modeling \u2013 Demonstrating Technique",
    description:
      "Taking over to model clinical approach or demonstrate proper intervention technique",
  },
  {
    id: "other",
    label: "Other Reason",
    description: "Specify another reason for supervisor intervention",
  },
];

type Props = {
  selectedId: string;
  onSelect: (id: string) => void;
};

export function TakeoverReasonSelector({ selectedId, onSelect }: Props) {
  return (
    <div className="space-y-3">
      {TAKEOVER_REASONS.map((reason) => {
        const selected = selectedId === reason.id;
        return (
          <button
            key={reason.id}
            type="button"
            onClick={() => onSelect(reason.id)}
            className={cn(
              "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors",
              selected
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
            )}
          >
            <div
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                selected ? "border-blue-600" : "border-gray-300",
              )}
            >
              {selected && (
                <div className="size-2.5 rounded-full bg-blue-600" />
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {reason.label}
              </p>
              <p className="mt-0.5 text-gray-500 text-sm">
                {reason.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
