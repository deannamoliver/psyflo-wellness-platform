"use client";

import {
  AlertTriangle,
  Heart,
  HelpCircle,
  Shield,
  ShieldAlert,
  Swords,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import type { ConcernType } from "./safety-workflow-types";

type StepTypeProps = {
  value: ConcernType | null;
  onChange: (value: ConcernType) => void;
};

type ConcernOption = {
  type: ConcernType;
  label: string;
  description: string;
  quotes: string[];
  iconBg: string;
  icon: React.ReactNode;
  hasMandatoryWarning?: boolean;
};

const CONCERN_OPTIONS: ConcernOption[] = [
  {
    type: "harm_to_self",
    label: "HARM TO SELF",
    description: "Thoughts of suicide, self-harm, not wanting to be alive",
    iconBg: "bg-red-100",
    icon: <Heart className="size-5 text-red-600" />,
    quotes: [
      '"I don\'t want to be here anymore"',
      '"Everyone would be better off without me"',
      '"I\'ve been cutting myself"',
      '"I have a plan to end my life"',
    ],
  },
  {
    type: "harm_to_others",
    label: "HARM TO OTHERS",
    description:
      "Intent or plan to hurt someone else, threats, weapons, violent intentions",
    iconBg: "bg-orange-100",
    icon: <Swords className="size-5 text-orange-600" />,
    quotes: [
      '"I\'m going to hurt them"',
      '"I brought something to school"',
      '"They deserve what\'s coming"',
      '"I have a list of people"',
    ],
  },
  {
    type: "abuse_neglect",
    label: "ABUSE / NEGLECT",
    description:
      "Being hurt, neglected, or not cared for by an adult; experiencing abuse at home or somewhere else",
    iconBg: "bg-blue-100",
    icon: <Shield className="size-5 text-blue-600" />,
    quotes: [
      '"My parent hits me"',
      '"Someone touched me inappropriately"',
      '"There\'s no food at home"',
      '"I\'m afraid to go home"',
    ],
    hasMandatoryWarning: true,
  },
  {
    type: "other_safety",
    label: "OTHER SAFETY CONCERN",
    description: "Substance use, running away, trafficking, other danger",
    iconBg: "bg-blue-100",
    icon: <ShieldAlert className="size-5 text-blue-600" />,
    quotes: [
      '"I\'ve been using drugs"',
      '"I\'m planning to run away"',
      '"Someone is making me do things"',
      '"I\'m in an unsafe relationship"',
    ],
  },
];

export function StepType({ value, onChange }: StepTypeProps) {
  const [selected, setSelected] = useState<ConcernType | null>(value);

  function handleSelect(type: ConcernType) {
    setSelected(type);
    onChange(type);
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex-1 space-y-3 p-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">
            What type of safety concern is this?
          </h3>
          <p className="mt-1 text-gray-500 text-sm">
            Select the category that best matches the situation. This will
            determine the assessment questions.
          </p>
        </div>

        {CONCERN_OPTIONS.map((opt) => (
          <button
            key={opt.type}
            type="button"
            onClick={() => handleSelect(opt.type)}
            className={cn(
              "w-full rounded-lg border-2 p-4 text-left transition-colors",
              selected === opt.type
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300",
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-10 min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg",
                  opt.iconBg,
                )}
              >
                {opt.icon}
              </div>
              <div>
                <p className="font-bold text-sm">{opt.label}</p>
                <p className="text-gray-500 text-xs">{opt.description}</p>
              </div>
            </div>
            <div className="mt-3 space-y-1 pl-[52px]">
              {opt.quotes.map((q) => (
                <p key={q} className="text-gray-500 text-xs italic">
                  {q}
                </p>
              ))}
            </div>
            {opt.hasMandatoryWarning && (
              <div className="mt-3 ml-[52px] flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                <p className="text-xs">
                  <strong>Mandatory Reporting:</strong> You are legally required
                  to report suspected abuse or neglect to appropriate
                  authorities
                </p>
              </div>
            )}
          </button>
        ))}

        {/* Selection tip */}
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="mb-1 flex items-center gap-2">
            <HelpCircle className="size-4 text-blue-600" />
            <span className="font-bold text-sm">Selection Tip</span>
          </div>
          <p className="text-gray-600 text-xs">
            Choose the category that best matches the primary concern. You can
            provide additional context in the assessment phase. If multiple
            concerns exist, select the most urgent or immediate safety issue.
          </p>
        </div>
      </div>
    </div>
  );
}
