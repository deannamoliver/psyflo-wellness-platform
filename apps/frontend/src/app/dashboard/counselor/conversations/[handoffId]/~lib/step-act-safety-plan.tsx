"use client";

import { Phone } from "lucide-react";
import { useState } from "react";
import { CrisisTextIcon } from "@/lib/emergency-resources/icons";
import type { SafetyPlanData } from "./safety-workflow-types";

type Props = {
  value: SafetyPlanData;
  onChange: (value: SafetyPlanData) => void;
};

/* ---------- Section configuration ---------- */

type SectionConfig = {
  key: keyof SafetyPlanData;
  number: number;
  title: string;
  /** Color classes for the number circle */
  numberColor: string;
  /** Short question below the title */
  question: string;
  /** Suggestions block — items shown as bullet points or two-column lists */
  suggestions?: {
    heading: string;
    items: string[];
    twoCol?: boolean;
  };
  /** Resource cards shown for professional resources */
  resourceCards?: {
    name: string;
    description: string;
    extra?: string;
    icon?: "phone" | "text";
    iconColor?: string;
  }[];
  /** Safety measures bullet items */
  safetyMeasures?: string[];
  /** "Your reasons might include" two-column items */
  reasonsItems?: { left: string[]; right: string[] };
  /** Placeholder for the textarea */
  placeholder: string;
  /** Example text shown in italics below the textarea */
  example: string;
};

const SECTIONS: SectionConfig[] = [
  {
    key: "warningSigns",
    number: 1,
    title: "Warning Signs",
    numberColor: "bg-red-600",
    question:
      "What are the signs that you might be starting to feel unsafe or having thoughts of self-harm?",
    suggestions: {
      heading: "Common warning signs include:",
      items: [
        "Feeling isolated or withdrawn from friends and family",
        "Overwhelming sadness or hopelessness",
        "Thinking about death or not wanting to be alive",
        "Increased anxiety or panic attacks",
        "Changes in sleep or eating patterns",
        "Loss of interest in activities you used to enjoy",
      ],
    },
    placeholder: "Describe your personal warning signs here...",
    example:
      "Example: When I start avoiding my friends, sleeping too much, and feeling like nothing matters anymore.",
  },
  {
    key: "copingStrategies",
    number: 2,
    title: "Coping Strategies",
    numberColor: "bg-green-600",
    question:
      "What are healthy ways you can cope when you notice warning signs?",
    suggestions: {
      heading: "Healthy coping strategies:",
      items: [
        "Deep breathing exercises",
        "Going for a walk or exercising",
        "Listening to calming music",
        "Journaling or drawing",
        "Taking a warm shower",
        "Talking to someone you trust",
        "Practicing mindfulness or meditation",
        "Spending time with pets",
        "Watching a favorite show or movie",
        "Doing a creative activity",
      ],
      twoCol: true,
    },
    placeholder: "List your personal coping strategies here...",
    example:
      "Example: When I feel overwhelmed, I put on my headphones and go for a walk. I also like to draw in my sketchbook or call my best friend.",
  },
  {
    key: "peopleTalkTo",
    number: 3,
    title: "People I Can Talk To",
    numberColor: "bg-blue-600",
    question:
      "Friends, family members, or trusted people you can reach out to when you need support.",
    placeholder:
      "List your trusted people and their contact information here...",
    example:
      "Example: When I feel overwhelmed, I put on my headphones and go for a walk. I also like to draw in my sketchbook or call my best friend.",
  },
  {
    key: "adultsHelp",
    number: 4,
    title: "Adults Who Can Help",
    numberColor: "bg-yellow-600",
    question:
      "Teachers, counselors, coaches, or other adults you trust and can turn to for help.",
    placeholder: "List your personal coping strategies here...",
    example:
      "Example: When I feel overwhelmed, I put on my headphones and go for a walk. I also like to draw in my sketchbook or call my best friend.",
  },
  {
    key: "professionalResources",
    number: 5,
    title: "Professional Resources",
    numberColor: "bg-gray-700",
    question:
      "Crisis hotlines and professional support services available 24/7.",
    resourceCards: [
      {
        name: "988 Suicide & Crisis Lifeline",
        description: "Free, confidential support 24/7 for people in distress.",
        extra: "Call or text 988 anytime",
        icon: "phone",
        iconColor: "text-red-500",
      },
      {
        name: "Crisis Text Line",
        description: "Text-based support 24/7 with trained counselors.",
        extra: "Text HOME to 741741",
        icon: "text",
        iconColor: "text-blue-600",
      },
    ],
    placeholder: "List any other resources here...",
    example: "",
  },
  {
    key: "environmentSafe",
    number: 6,
    title: "Making Environment Safe",
    numberColor: "bg-green-600",
    question:
      "Steps to reduce access to means of self-harm and create a safer environment.",
    safetyMeasures: [
      "Removing or securing sharp objects, medications, or other means",
      "Having someone check in regularly (daily or multiple times per day)",
      "Keeping a charged phone accessible at all times",
      "Creating a safe space in your home where you can go when upset",
      "Removing access to alcohol or substances",
    ],
    placeholder: "Describe specific steps to make your environment safer...",
    example:
      "Example: My mom will keep medications locked up. My sister will check in with me every evening. I'll stay in my favorite spot in the living room when feeling down.",
  },
  {
    key: "reasonsToLive",
    number: 7,
    title: "Reasons to Live",
    numberColor: "bg-purple-600",
    question:
      "What makes life worth living for you? What gives you hope for the future?",
    reasonsItems: {
      left: [
        "Family members who love you",
        "Future goals and dreams",
        "Pets who depend on you",
        "Friends who care about you",
      ],
      right: [
        "Activities and hobbies you enjoy",
        "Making a positive difference",
        "Places you want to visit",
        "Things you want to experience",
      ],
    },
    placeholder: "List your personal reasons for living...",
    example:
      "Example: My little brother looks up to me. I want to go to college and become a veterinarian. My dog Rex makes me happy. I want to visit my favorite beach someday.",
  },
];

/* ---------- Component ---------- */

export function StepActSafetyPlan({ value, onChange }: Props) {
  const [data, setData] = useState<SafetyPlanData>(value);

  function handleChange(key: keyof SafetyPlanData, val: string) {
    const updated = { ...data, [key]: val };
    setData(updated);
    onChange(updated);
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex-1 space-y-4 p-4">
        {/* Header */}
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Actions</h3>
          <h4 className="mt-2 font-bold text-base text-gray-900">
            Create a Safety Plan with Student
          </h4>
          <p className="mt-0.5 text-gray-500 text-xs">
            Contact RIF if immediate medical attention required
          </p>
        </div>

        {/* Sections */}
        {SECTIONS.map((s) => (
          <div key={s.key} className="rounded-lg border border-gray-200 p-4">
            {/* Section header */}
            <div className="mb-1 flex items-center gap-2">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full font-bold text-white text-xs ${s.numberColor}`}
              >
                {s.number}
              </span>
              <h4 className="font-bold text-gray-900 text-sm">{s.title}</h4>
            </div>
            <p className="mb-3 text-gray-500 text-xs">{s.question}</p>

            {/* Suggestions (bullet list or two-column) */}
            {s.suggestions && (
              <div className="mb-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="mb-1.5 font-semibold text-gray-700 text-xs">
                  {s.suggestions.heading}
                </p>
                {s.suggestions.twoCol ? (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    {s.suggestions.items.map((item) => (
                      <p key={item} className="text-[11px] text-gray-600">
                        • {item}
                      </p>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-0.5">
                    {s.suggestions.items.map((item) => (
                      <li key={item} className="text-[11px] text-gray-600">
                        • {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Resource cards (professional resources) */}
            {s.resourceCards && (
              <div className="mb-3 space-y-2">
                {s.resourceCards.map((r) => {
                  const is988 = r.name === "988 Suicide & Crisis Lifeline";
                  const isCrisisText = r.name === "Crisis Text Line";
                  const cardClass = is988
                    ? "rounded-lg border border-red-200 bg-red-50 p-3"
                    : isCrisisText
                      ? "rounded-lg border border-blue-200 bg-blue-50 p-3"
                      : "rounded-lg border border-gray-200 bg-white p-3";
                  const ctaClass = is988
                    ? "text-[11px] font-semibold text-red-600"
                    : isCrisisText
                      ? "text-[11px] font-semibold text-blue-600"
                      : "text-[11px] font-semibold text-gray-700";
                  return (
                    <div
                      key={r.name}
                      className={`flex items-start gap-3 ${cardClass}`}
                    >
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-xs">
                          {r.name}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {r.description}
                        </p>
                        {r.extra && (
                          <p className={`mt-0.5 ${ctaClass}`}>{r.extra}</p>
                        )}
                      </div>
                      {r.icon === "phone" && (
                        <Phone className={`size-5 shrink-0 ${r.iconColor}`} />
                      )}
                      {r.icon === "text" && (
                        <span
                          className={`inline-flex shrink-0 [&_svg_g_path]:fill-current ${r.iconColor}`}
                        >
                          <CrisisTextIcon className="size-5" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Safety measures (environment safe) */}
            {s.safetyMeasures && (
              <div className="mb-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="mb-1.5 font-semibold text-gray-700 text-xs">
                  Safety measures might include:
                </p>
                <ul className="space-y-0.5">
                  {s.safetyMeasures.map((item) => (
                    <li key={item} className="text-[11px] text-gray-600">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reasons to live (two-column) */}
            {s.reasonsItems && (
              <div className="mb-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="mb-1.5 font-semibold text-gray-700 text-xs">
                  Your reasons might include:
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  {s.reasonsItems.left.map((item, i) => (
                    <>
                      <p
                        key={`l-${item}`}
                        className="text-[11px] text-gray-600"
                      >
                        • {item}
                      </p>
                      {s.reasonsItems!.right[i] && (
                        <p
                          key={`r-${s.reasonsItems!.right[i]}`}
                          className="text-[11px] text-gray-600"
                        >
                          • {s.reasonsItems!.right[i]}
                        </p>
                      )}
                    </>
                  ))}
                </div>
              </div>
            )}

            {/* Textarea */}
            <div>
              <textarea
                value={data[s.key] ?? ""}
                onChange={(e) => handleChange(s.key, e.target.value)}
                placeholder={s.placeholder}
                className="w-full rounded-md border border-gray-300 p-2.5 text-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={2}
              />
              {s.example && (
                <p className="mt-1.5 text-[11px] text-gray-400 italic">
                  {s.example}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
