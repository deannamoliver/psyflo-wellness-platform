"use client";

import { ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/lib/core-ui/checkbox";
import { EMPTY_OTHER_SAFETY } from "./safety-workflow-types";

type AssessOtherSafetyData = {
  concerns: string[];
  situationDescription: string;
};

type Props = {
  value: AssessOtherSafetyData;
  onChange: (value: AssessOtherSafetyData) => void;
};

const CONCERN_OPTIONS = [
  "Substance use / overdose",
  "Running away",
  "Human trafficking",
  "Gang involvement",
  "Dangerous Relationship",
  "Other",
];

export function StepAssessOtherSafety({ value, onChange }: Props) {
  const [data, setData] = useState<AssessOtherSafetyData>(() => ({
    ...EMPTY_OTHER_SAFETY,
    ...value,
  }));

  function toggleConcern(item: string) {
    const concerns = data.concerns ?? [];
    const next = concerns.includes(item)
      ? concerns.filter((c) => c !== item)
      : [...concerns, item];
    const updated = { ...data, concerns: next };
    setData(updated);
    onChange(updated);
  }

  function setDescription(situationDescription: string) {
    const updated = { ...data, situationDescription };
    setData(updated);
    onChange(updated);
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex-1 space-y-4 p-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Risk Assessment</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 font-semibold text-blue-700 text-xs">
              <ShieldAlert className="size-3.5" />
              Other Safety Concern
            </span>
            <span className="text-gray-400 text-xs">Selected concern type</span>
          </div>
        </div>

        {/* Section 1: What is the concern */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-xs">
              1
            </span>
            <h4 className="font-bold text-sm">What is the concern?</h4>
          </div>
          <div className="space-y-1">
            {CONCERN_OPTIONS.map((item) => (
              <label
                key={item}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-100 px-3 py-3 hover:bg-gray-50"
              >
                <Checkbox
                  checked={(data.concerns ?? []).includes(item)}
                  onCheckedChange={() => toggleConcern(item)}
                />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Section 2: Describe the situation */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-xs">
              2
            </span>
            <h4 className="font-bold text-sm">Describe the situation</h4>
          </div>
          <textarea
            placeholder="Provide a brief summary of the situation for the administrator..."
            value={data.situationDescription ?? ""}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:border-blue-400"
          />
        </div>
      </div>
    </div>
  );
}
