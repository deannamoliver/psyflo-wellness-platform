"use client";

import { HelpCircle, Shield } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/lib/core-ui/checkbox";
import { cn } from "@/lib/tailwind-utils";
import { EMPTY_ABUSE_NEGLECT } from "./safety-workflow-types";

type AssessAbuseNeglectData = {
  abuseTypes: string[];
  involvedPersons: string[];
  perpetratorName: string;
  perpetratorRelationship: string;
  safeGoingHome: string | null;
};

type Props = {
  value: AssessAbuseNeglectData;
  onChange: (value: AssessAbuseNeglectData) => void;
};

type AbuseTypeOption = {
  id: string;
  label: string;
  description: string;
  tags: string[];
};

const ABUSE_TYPES: AbuseTypeOption[] = [
  {
    id: "physical_abuse",
    label: "PHYSICAL ABUSE",
    description:
      "Infliction of physical injury or causing a child to be at substantial risk of physical harm.",
    tags: ["Hitting, Punching, Kicking", "Bruises", "Injury", "Burning"],
  },
  {
    id: "emotional_abuse",
    label: "EMOTIONAL ABUSE",
    description:
      "Pattern of behavior that impairs a child's emotional development or sense of self-worth.",
    tags: ["Yelling", "Threats/Intimidation", "Isolation"],
  },
  {
    id: "sexual_abuse",
    label: "SEXUAL ABUSE",
    description:
      "Any sexual act with a child, including exploitation through prostitution or pornography.",
    tags: [
      "Inappropriate Touch",
      "Exploitation",
      "Sexual Assault",
      "Exposure to sexual content/activity",
    ],
  },
  {
    id: "physical_neglect",
    label: "PHYSICAL NEGLECT",
    description:
      "Failure to provide for a child's basic needs, such as food, shelter, medical care, or supervision.",
    tags: ["No Food", "Poor Hygiene", "Unsupervised"],
  },
  {
    id: "emotional_neglect",
    label: "EMOTIONAL NEGLECT",
    description:
      "Failure to provide for a child's basic needs, such as food, shelter, medical care, or supervision.",
    tags: ["No Food", "Poor Hygiene", "Unsupervised"],
  },
];

const INVOLVED_PERSONS = [
  "Parent / Step-parent",
  "Guardian/Caregiver",
  "Sibling",
  "Other relative",
  "Parent's partner",
  "Other adult in home",
  "Person outside home",
  "Unknown/student didn't say",
];

const SAFE_GOING_HOME_OPTIONS = [
  {
    value: "yes_not_in_home",
    label: "Yes - alleged perpetrator not in home",
  },
  { value: "yes_safe_adult", label: "Yes - other safe adult in home" },
  { value: "unsure", label: "Unsure" },
  {
    value: "no",
    label: "No - student is not safe going home",
  },
];

export function StepAssessAbuseNeglect({ value, onChange }: Props) {
  const [data, setData] = useState<AssessAbuseNeglectData>(() => ({
    ...EMPTY_ABUSE_NEGLECT,
    ...value,
  }));

  function update(partial: Partial<AssessAbuseNeglectData>) {
    const updated = { ...data, ...partial };
    setData(updated);
    onChange(updated);
  }

  function toggleAbuseType(id: string) {
    const abuseTypes = data.abuseTypes ?? [];
    const next = abuseTypes.includes(id)
      ? abuseTypes.filter((t) => t !== id)
      : [...abuseTypes, id];
    update({ abuseTypes: next });
  }

  function toggleInvolvedPerson(person: string) {
    const involvedPersons = data.involvedPersons ?? [];
    const next = involvedPersons.includes(person)
      ? involvedPersons.filter((p) => p !== person)
      : [...involvedPersons, person];
    update({ involvedPersons: next });
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex-1 space-y-4 p-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Risk Assessment</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 font-semibold text-blue-700 text-xs">
              <Shield className="size-3.5" />
              Abuse/Neglect
            </span>
            <span className="text-gray-400 text-xs">Selected concern type</span>
          </div>
        </div>

        {/* Section 1: Abuse type */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-xs">
              1
            </span>
            <h4 className="font-bold text-sm">
              What type of abuse or neglect is suspected?
            </h4>
          </div>
          <div className="space-y-2">
            {ABUSE_TYPES.map((type) => (
              <label
                key={type.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
              >
                <Checkbox
                  checked={(data.abuseTypes ?? []).includes(type.id)}
                  onCheckedChange={() => toggleAbuseType(type.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">{type.label}</span>
                  </div>
                  <p className="mt-0.5 text-gray-500 text-xs">
                    {type.description}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {type.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-blue-100 px-1.5 py-0.5 font-medium text-[10px] text-blue-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Section 2: Who is involved */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-xs">
              2
            </span>
            <h4 className="font-bold text-sm">Who is involved?</h4>
          </div>
          <div className="space-y-1">
            {INVOLVED_PERSONS.map((person) => (
              <label
                key={person}
                className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-gray-50"
              >
                <Checkbox
                  checked={(data.involvedPersons ?? []).includes(person)}
                  onCheckedChange={() => toggleInvolvedPerson(person)}
                />
                <span className="text-xs">{person}</span>
              </label>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            <div>
              <label className="font-medium text-gray-500 text-xs">
                Name (if disclosed)
              </label>
              <input
                type="text"
                placeholder="Name"
                value={data.perpetratorName}
                onChange={(e) => update({ perpetratorName: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="font-medium text-gray-500 text-xs">
                Relationship to student
              </label>
              <input
                type="text"
                placeholder="Relationship"
                value={data.perpetratorRelationship}
                onChange={(e) =>
                  update({ perpetratorRelationship: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Safe going home */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-xs">
              3
            </span>
            <h4 className="font-bold text-sm">
              Is the student safe going home today?
            </h4>
          </div>
          <div className="space-y-1">
            {SAFE_GOING_HOME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update({ safeGoingHome: opt.value })}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left text-xs transition-colors",
                  data.safeGoingHome === opt.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-100 hover:bg-gray-50",
                )}
              >
                <div
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full border-2",
                    data.safeGoingHome === opt.value
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300",
                  )}
                >
                  {data.safeGoingHome === opt.value && (
                    <div className="size-2 rounded-full bg-white" />
                  )}
                </div>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mandatory reporting notice */}
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <HelpCircle className="size-4 text-blue-600" />
            <span className="font-bold text-sm">
              MANDATORY REPORTING REQUIRED
            </span>
          </div>
          <p className="text-gray-600 text-xs">
            As a clinical staff member, you are required by law to report
            suspected child abuse or neglect. This report will be filed with
            Child Protective Services (CPS) as part of this process.
          </p>
          <p className="mt-2 text-gray-600 text-xs">
            You do NOT need to investigate or verify the abuse.
            <br />
            Your role is to report the disclosure.
          </p>
        </div>
      </div>
    </div>
  );
}
