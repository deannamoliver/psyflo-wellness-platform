"use client";

import { CheckCircle2, Heart, HelpCircle } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/lib/core-ui/checkbox";
import { cn } from "@/lib/tailwind-utils";

type AssessHarmSelfData = {
  disclosures: string[];
  cssrAnswers: Record<string, boolean | null>;
};

type Props = {
  value: AssessHarmSelfData;
  onChange: (value: AssessHarmSelfData) => void;
};

const DISCLOSURE_OPTIONS = [
  "Thoughts of suicide",
  "Self-harm behaviors (cutting, burning, etc.)",
  "Wishing they were dead",
  "Feeling like a burden to others",
  "Feeling hopeless or trapped",
  "Previous suicide attempts",
];

const CSSR_QUESTIONS = [
  {
    id: "wishes",
    number: 1,
    label: "Wishes",
    question:
      '"Have you wished you were dead or wished you could go to sleep and not wake up?"',
  },
  {
    id: "thoughts",
    number: 2,
    label: "Thoughts",
    question: '"Have you actually had any thoughts of killing yourself?"',
    note: "IF YES, ask questions 3-6. If NO, go directly to question 6.",
  },
  {
    id: "method",
    number: 3,
    label: "Method",
    question: '"Have you been thinking about how you might do this?"',
  },
  {
    id: "intent",
    number: 4,
    label: "Intent",
    question:
      '"Have you had these thoughts and had some intention of acting on them?"',
  },
  {
    id: "planning",
    number: 5,
    label: "Planning",
    question:
      '"Have you started to work out or worked out the details of how to kill yourself? Do you intend to carry out this plan?"',
  },
  {
    id: "preparation",
    number: 6,
    label: "Preparation",
    question:
      '"Have you ever done anything, started to do anything, or prepared to do anything to end your life?"',
  },
];

const GUIDANCE_ITEMS = [
  "Be thorough but sensitive - this is difficult for the student",
  "Ask questions calmly and without judgment",
  "It's okay to ask directly about suicide - it doesn't increase risk",
  "Document exactly what the student says in their own words",
  "Higher risk = specific plan + access to means + intent + low protective factors",
];

export function StepAssessHarmSelf({ value, onChange }: Props) {
  const [data, setData] = useState<AssessHarmSelfData>(value);

  function toggleDisclosure(item: string) {
    const next = data.disclosures.includes(item)
      ? data.disclosures.filter((d) => d !== item)
      : [...data.disclosures, item];
    const updated = { ...data, disclosures: next };
    setData(updated);
    onChange(updated);
  }

  function setCssrAnswer(id: string, answer: boolean) {
    const current = data.cssrAnswers[id];
    const next = current === answer ? null : answer;
    const updated = {
      ...data,
      cssrAnswers: { ...data.cssrAnswers, [id]: next },
    };
    setData(updated);
    onChange(updated);
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex-1 space-y-4 p-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Risk Assessment</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 font-semibold text-red-700 text-xs">
              <Heart className="size-3.5" />
              Harm to Self
            </span>
            <span className="text-gray-400 text-xs">Selected concern type</span>
          </div>
        </div>

        {/* Section 1: Disclosures */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-xs">
              1
            </span>
            <h4 className="font-bold text-sm">
              What did the student disclose?
            </h4>
          </div>
          <div className="space-y-1">
            {DISCLOSURE_OPTIONS.map((item) => (
              <label
                key={item}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-100 px-3 py-2.5 hover:bg-gray-50"
              >
                <Checkbox
                  checked={data.disclosures.includes(item)}
                  onCheckedChange={() => toggleDisclosure(item)}
                />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Section 2: CSSR Questions */}
        <div className="rounded-lg border border-red-200 bg-red-50/30 p-4">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-red-600 font-bold text-white text-xs">
              2
            </span>
            <h4 className="font-bold text-sm">
              Ask the student these questions:
            </h4>
          </div>
          <div className="space-y-4">
            {CSSR_QUESTIONS.map((q) => (
              <div key={q.id} className="space-y-2">
                <p className="font-bold text-sm">
                  {q.number}. {q.label}
                </p>
                <p className="text-gray-600 text-xs italic">{q.question}</p>
                {q.note && (
                  <p className="font-semibold text-red-600 text-xs">{q.note}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCssrAnswer(q.id, true)}
                    className={cn(
                      "flex-1 rounded-md border py-2 text-center font-medium text-sm transition-colors",
                      data.cssrAnswers[q.id] === true
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-200 bg-white hover:bg-gray-50",
                    )}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setCssrAnswer(q.id, false)}
                    className={cn(
                      "flex-1 rounded-md border py-2 text-center font-medium text-sm transition-colors",
                      data.cssrAnswers[q.id] === false
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-200 bg-white hover:bg-gray-50",
                    )}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment Guidance */}
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <HelpCircle className="size-4 text-blue-600" />
            <span className="font-bold text-sm">Assessment Guidance</span>
          </div>
          <ul className="ml-4 space-y-1.5">
            {GUIDANCE_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-blue-600" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
