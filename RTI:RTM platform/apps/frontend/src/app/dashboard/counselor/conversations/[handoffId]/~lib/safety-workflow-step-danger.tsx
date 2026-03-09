"use client";

import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";

type StepDangerProps = {
  value: boolean | null;
  onChange: (value: boolean) => void;
};

const IMMEDIATE_YES_BULLETS = [
  "Patient is actively harming themselves or about to",
  <>
    Patient has a specific suicide plan <strong>and</strong> intends to act on
    it soon
  </>,
  "Patient is being harmed by someone right now",
  "Patient plans to harm someone else imminently",
  <>
    Patient has access to lethal means (weapon, pills, etc.){" "}
    <strong>and</strong> is at immediate risk
  </>,
  "Patient needs immediate medical attention",
];

const IMMEDIATE_NO_BULLETS = [
  "Patient shared thoughts of suicide but no immediate plan",
  "Patient disclosed past self-harm or abuse",
  "Patient mentioned concerns about violence but no specific imminent threat",
  "Patient shared warning signs that need follow-up",
];

const DECIDING_QUESTIONS = [
  "Is the patient actively planning to harm themselves or others right now?",
  "Do they have immediate access to means of harm?",
  "Are they in a crisis state requiring immediate intervention?",
  "Would waiting to assess further put anyone at risk?",
];

export function StepDanger({ value, onChange }: StepDangerProps) {
  const [selected, setSelected] = useState<boolean | null>(value);

  function handleSelect(val: boolean) {
    setSelected(val);
    onChange(val);
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex-1 space-y-4 p-4">
        <div>
          <h3 className="font-bold text-lg text-red-600">
            Is there immediate danger or an emergency right now?
          </h3>
          <p className="mt-1 text-gray-500 text-sm">
            Select the option that best matches the student&apos;s situation.
          </p>
        </div>

        {/* Option: Yes */}
        <button
          type="button"
          onClick={() => handleSelect(true)}
          className={cn(
            "w-full rounded-lg border-2 p-4 text-left transition-colors",
            selected === true
              ? "border-red-500 bg-red-50"
              : "border-gray-200 hover:border-gray-300",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                selected === true
                  ? "border-red-500 bg-red-500"
                  : "border-gray-300",
              )}
            >
              {selected === true && (
                <div className="size-2 rounded-full bg-white" />
              )}
            </div>
            <span className="font-bold text-sm">
              Yes, student needs help RIGHT NOW
            </span>
          </div>
          <ul className="mt-3 space-y-1.5 pl-8">
            {IMMEDIATE_YES_BULLETS.map((item, i) => (
              <li key={i} className="text-gray-600 text-xs">
                &bull; {item}
              </li>
            ))}
          </ul>
        </button>

        {/* Option: No */}
        <button
          type="button"
          onClick={() => handleSelect(false)}
          className={cn(
            "w-full rounded-lg border-2 p-4 text-left transition-colors",
            selected === false
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                selected === false
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-300",
              )}
            >
              {selected === false && (
                <div className="size-2 rounded-full bg-white" />
              )}
            </div>
            <span className="font-bold text-sm">
              No, student has disclosed something serious but is currently safe
            </span>
          </div>
          <ul className="mt-3 space-y-1.5 pl-8">
            {IMMEDIATE_NO_BULLETS.map((item, i) => (
              <li key={i} className="text-gray-600 text-xs">
                &bull; {item}
              </li>
            ))}
          </ul>
        </button>

        {/* Help deciding — same styling as Selection tip (no outline, body text not blue) */}
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="mb-1 flex items-center gap-2">
            <HelpCircle className="size-4 text-blue-600" />
            <span className="font-bold text-sm">Need help deciding?</span>
          </div>
          <p className="text-gray-600 text-xs">
            If you&apos;re unsure, consider these questions:
          </p>
          <ul className="mt-1.5 space-y-1.5 text-gray-600 text-xs">
            {DECIDING_QUESTIONS.map((q) => (
              <li key={q} className="flex items-start gap-2">
                <span className="shrink-0">-</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 font-semibold text-[12px] text-red-600">
            If you answered YES to any of these, select &quot;YES -
            EMERGENCY&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
