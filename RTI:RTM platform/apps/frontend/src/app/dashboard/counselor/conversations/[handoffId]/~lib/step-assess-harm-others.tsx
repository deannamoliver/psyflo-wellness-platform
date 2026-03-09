"use client";

import { CheckCircle2, HelpCircle, Swords } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/lib/core-ui/checkbox";
import { cn } from "@/lib/tailwind-utils";

type AssessHarmOthersData = {
  whatHappened: string[];
  coOccurrence: string[];
  questions: Record<string, boolean | null>;
};

type Props = {
  value: AssessHarmOthersData;
  onChange: (value: AssessHarmOthersData) => void;
};

const WHAT_HAPPENED_OPTIONS = [
  "Verbal threat",
  "Written threat (note, text, social media)",
  "Threat through artwork or creative work",
  "Physical aggression",
  "Talked about wanting to hurt someone",
  "Talked about weapons",
  "Made a hit list or similar",
  "Other",
];

const CO_OCCURRENCE_OPTIONS = [
  "Generalized anger or aggression",
  "Hostile fantasies or violent imagery",
  "Revenge-oriented language",
  "Dehumanization or moral disengagement",
  "Power, control or dominance fantasies",
  "Identification with violent characters or events",
  "Statements minimizing harm or consequences",
  "Indirect reference to harm without intent",
];

const ASSESSMENT_QUESTIONS: {
  id: string;
  number: number;
  label: string;
  description: string;
  yesLabel?: string;
}[] = [
  {
    id: "moderate_risk",
    number: 2,
    label: "Is at least one moderate risk factor present?",
    description: "",
  },
  {
    id: "escalation_specificity",
    number: 3,
    label: "Escalation in specificity",
    description:
      "The user gets more and more specific regarding their concerning thoughts as the conversation progresses.",
  },
  {
    id: "escalation_intensity",
    number: 4,
    label: "Escalation in intensity",
    description:
      "The user gets more and more intense regarding their thoughts as the conversation progresses.",
  },
  {
    id: "fixation",
    number: 5,
    label: "Fixation",
    description:
      "The user repeatedly focuses (or re-focuses) the conversation on a specific person or group.",
  },
  {
    id: "specific_means",
    number: 6,
    label: "Specific means, method or timeline",
    description: '"Have you done anything to prepare?"',
  },
  {
    id: "access_weapons",
    number: 7,
    label: "Access to weapons",
    description: "The user mentions access to weapons.",
  },
  {
    id: "boundary_testing",
    number: 8,
    label: "Boundary testing",
    description:
      "The user is testing boundaries to see what they can get away with. This may include asking for permission to engage in violent behavior.",
  },
  {
    id: "leakage",
    number: 9,
    label: "Leakage",
    description:
      "The user intentionally or unintentionally reveals clues to feelings, thoughts, fantasies, attitudes, or intentions that may signal an impending violent act.",
    yesLabel: "Yes or maybe",
  },
];

const MODERATE_RISK_BULLETS = [
  "Expressions of loss of control",
  "Conditional or hypothetical violence",
  "Grievance or fixation patterns",
  "Statements about being dangerous or scary",
  "Statements of hopelessness about the resolution of the situation",
];

const GUIDANCE_ITEMS = [
  "Be thorough but sensitive - this is difficult for the student",
  "Ask questions calmly and without judgment",
  "It's okay to ask directly about suicide - it doesn't increase risk",
  "Document exactly what the student says in their own words",
  "Higher risk = specific plan + access to means + intent + low protective factors",
];

export function StepAssessHarmOthers({ value, onChange }: Props) {
  const [data, setData] = useState<AssessHarmOthersData>(value);

  function toggleWhatHappened(item: string) {
    const next = data.whatHappened.includes(item)
      ? data.whatHappened.filter((d) => d !== item)
      : [...data.whatHappened, item];
    const updated = { ...data, whatHappened: next };
    setData(updated);
    onChange(updated);
  }

  function toggleCoOccurrence(item: string) {
    const next = data.coOccurrence.includes(item)
      ? data.coOccurrence.filter((d) => d !== item)
      : [...data.coOccurrence, item];
    const updated = { ...data, coOccurrence: next };
    setData(updated);
    onChange(updated);
  }

  function setAnswer(id: string, answer: boolean) {
    const updated = {
      ...data,
      questions: { ...data.questions, [id]: answer },
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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-0.5 font-semibold text-orange-700 text-xs">
              <Swords className="size-3.5" />
              Harm to Others
            </span>
            <span className="text-gray-400 text-xs">Selected concern type</span>
          </div>
        </div>

        {/* Section 1: What happened */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-xs">
              1
            </span>
            <h4 className="font-bold text-sm">What happened?</h4>
          </div>
          <div className="space-y-1">
            {WHAT_HAPPENED_OPTIONS.map((item) => (
              <label
                key={item}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-100 px-3 py-2.5 hover:bg-gray-50"
              >
                <Checkbox
                  checked={data.whatHappened.includes(item)}
                  onCheckedChange={() => toggleWhatHappened(item)}
                />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Section 2: Assessment questions */}
        <div className="rounded-lg border border-red-200 bg-red-50/30 p-4">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-red-600 font-bold text-white text-xs">
              2
            </span>
            <h4 className="font-bold text-sm">
              Complete the following assessment (do NOT ask the student these
              questions):
            </h4>
          </div>

          <div className="space-y-4">
            {/* Q1: Co-occurrence */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="font-bold text-sm">
                1. Co-occurrence of more than one of the following (select all
                that apply):
              </p>
              <div className="mt-2 space-y-1 pl-2">
                {CO_OCCURRENCE_OPTIONS.map((item) => (
                  <label
                    key={item}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={data.coOccurrence.includes(item)}
                      onCheckedChange={() => toggleCoOccurrence(item)}
                    />
                    <span className="text-gray-700 text-xs">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Q2: Moderate risk */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="font-bold text-sm">
                2. Is at least one moderate risk factor present?
              </p>
              <ul className="mt-2 space-y-0.5 pl-4 text-gray-600 text-sm">
                {MODERATE_RISK_BULLETS.map((b) => (
                  <li key={b}>&bull; {b}</li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAnswer("moderate_risk", true)}
                  className={cn(
                    "flex-1 rounded-md border py-2 text-center font-medium text-sm transition-colors",
                    data.questions["moderate_risk"] === true
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-200 bg-white hover:bg-gray-50",
                  )}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setAnswer("moderate_risk", false)}
                  className={cn(
                    "flex-1 rounded-md border py-2 text-center font-medium text-sm transition-colors",
                    data.questions["moderate_risk"] === false
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-200 bg-white hover:bg-gray-50",
                  )}
                >
                  No
                </button>
              </div>
            </div>

            {/* Q3-Q9 */}
            {ASSESSMENT_QUESTIONS.filter((q) => q.number >= 3).map((q) => (
              <div
                key={q.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <p className="font-bold text-sm">
                  {q.number}. {q.label}
                </p>
                {q.description && (
                  <p className="mt-1 text-gray-600 text-xs">{q.description}</p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAnswer(q.id, true)}
                    className={cn(
                      "flex-1 rounded-md border py-2 text-center font-medium text-sm transition-colors",
                      data.questions[q.id] === true
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-200 bg-white hover:bg-gray-50",
                    )}
                  >
                    {q.yesLabel ?? "Yes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnswer(q.id, false)}
                    className={cn(
                      "flex-1 rounded-md border py-2 text-center font-medium text-sm transition-colors",
                      data.questions[q.id] === false
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
