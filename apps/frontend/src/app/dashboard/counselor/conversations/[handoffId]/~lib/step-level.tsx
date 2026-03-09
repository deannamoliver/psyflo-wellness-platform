"use client";

import { AlertTriangle, HelpCircle, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import type {
  AssessHarmSelfData,
  ConcernType,
  RiskLevel,
} from "./safety-workflow-types";

type Props = {
  concernType: ConcernType;
  assessmentData: Record<string, unknown> | null;
  value: RiskLevel | null;
  onChange: (level: RiskLevel) => void;
};

const RISK_LEVELS: {
  level: RiskLevel;
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
  description: string;
}[] = [
  {
    level: "emergency",
    label: "Emergency",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-500",
    dot: "bg-red-500",
    description:
      "Immediate danger to life; requires emergency intervention now",
  },
  {
    level: "high",
    label: "High",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-500",
    dot: "bg-orange-500",
    description: "Serious risk requiring urgent intervention within hours",
  },
  {
    level: "moderate",
    label: "Moderate",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-500",
    dot: "bg-yellow-500",
    description: "Elevated concern requiring intervention within 24-48 hours",
  },
  {
    level: "low",
    label: "Low",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-500",
    dot: "bg-blue-500",
    description: "Concern noted; follow-up needed but no immediate risk",
  },
];

function calculateSelfHarmRisk(data: AssessHarmSelfData): RiskLevel {
  const cssrAnswers = data?.cssrAnswers ?? {};
  if (cssrAnswers["planning"] === true || cssrAnswers["preparation"] === true)
    return "emergency";
  if (cssrAnswers["method"] === true || cssrAnswers["intent"] === true)
    return "high";
  if (cssrAnswers["thoughts"] === true) return "moderate";
  return "low";
}

const RISK_LEVEL_GUIDELINES: {
  level: RiskLevel;
  label: string;
  dot: string;
  description: string;
}[] = [
  {
    level: "emergency",
    label: "Emergency",
    dot: "bg-red-500",
    description:
      "Immediate danger to self or others. Active threat, weapon present, suicide attempt in progress, severe medical emergency.",
  },
  {
    level: "high",
    label: "High",
    dot: "bg-orange-500",
    description:
      "Serious safety concern requiring immediate action. Suicidal ideation with plan, intent to harm others, severe abuse disclosure, acute crisis.",
  },
  {
    level: "moderate",
    label: "Moderate",
    dot: "bg-yellow-500",
    description:
      "Concerning situation requiring follow-up within 24-48 hours. Passive suicidal ideation, concerning behavior patterns, ongoing stressors.",
  },
  {
    level: "low",
    label: "Low",
    dot: "bg-blue-500",
    description:
      "Situation requires monitoring and support. Student expressing stress or worry but no immediate safety concerns. Preventive intervention appropriate.",
  },
];

const PROFESSIONAL_JUDGMENT_FACTORS = [
  "Your direct observation of the patient's demeanor and emotional state",
  "Historical context and previous interactions with this patient",
  "Known family or environmental stressors",
  "Patient's access to support systems and resources",
  "Cultural and individual factors that may affect risk presentation",
  "Patient's willingness to engage in safety planning",
  "Timing and context of the disclosure",
];

export function StepLevel({
  concernType,
  assessmentData,
  value,
  onChange,
}: Props) {
  const isAutoCalculated = concernType === "harm_to_self";
  const suggestedLevel =
    isAutoCalculated && assessmentData
      ? calculateSelfHarmRisk(assessmentData as unknown as AssessHarmSelfData)
      : null;

  const [selected, setSelected] = useState<RiskLevel | null>(
    value ?? suggestedLevel,
  );
  const [judgment, setJudgment] = useState("");

  // If auto-calculated and no previous selection, propagate suggested level to parent
  useEffect(() => {
    if (suggestedLevel && !value) {
      onChange(suggestedLevel);
    }
  }, [suggestedLevel, value, onChange]);

  function handleSelect(level: RiskLevel) {
    setSelected(level);
    onChange(level);
  }

  function handleAcceptSuggested() {
    if (suggestedLevel) {
      setSelected(suggestedLevel);
      onChange(suggestedLevel);
    }
  }

  const isAdjusted =
    isAutoCalculated && selected !== null && selected !== suggestedLevel;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex-1 space-y-4 p-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">
            Determine Risk Level
          </h3>
          <p className="mt-1 text-gray-500 text-sm">
            {isAutoCalculated
              ? "Based on the CSSR screening, a risk level has been suggested. You may accept or adjust it."
              : "Select the risk level that best matches your assessment of this situation."}
          </p>
        </div>

        {/* Suggested level banner for auto-calculated */}
        {isAutoCalculated && suggestedLevel && (
          <div
            className={cn(
              "rounded-lg border-2 p-4",
              RISK_LEVELS.find((r) => r.level === suggestedLevel)?.border,
              RISK_LEVELS.find((r) => r.level === suggestedLevel)?.bg,
            )}
          >
            <div className="mb-2 flex items-center gap-2">
              <Shield className="size-4 text-blue-600" />
              <span className="font-bold text-sm">Suggested Risk Level</span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "rounded-full px-3 py-1 font-bold text-sm",
                  RISK_LEVELS.find((r) => r.level === suggestedLevel)?.bg,
                  RISK_LEVELS.find((r) => r.level === suggestedLevel)?.color,
                )}
              >
                {suggestedLevel.toUpperCase()}
              </span>
              <span className="text-gray-600 text-xs">
                {
                  RISK_LEVELS.find((r) => r.level === suggestedLevel)
                    ?.description
                }
              </span>
            </div>
            {selected !== suggestedLevel && (
              <button
                type="button"
                onClick={handleAcceptSuggested}
                className="mt-3 rounded-md bg-blue-600 px-4 py-2 font-medium text-sm text-white hover:bg-blue-700"
              >
                Accept Suggested Level
              </button>
            )}
          </div>
        )}

        {/* Risk level selection */}
        <div className="space-y-2">
          {isAutoCalculated && (
            <p className="font-semibold text-gray-500 text-xs uppercase tracking-wide">
              {selected === suggestedLevel
                ? "Suggested level accepted — or select to adjust"
                : "Adjusted from suggested level"}
            </p>
          )}
          {RISK_LEVELS.map((r) => (
            <button
              key={r.level}
              type="button"
              onClick={() => handleSelect(r.level)}
              className={cn(
                "w-full rounded-lg border-2 p-3 text-left transition-colors",
                selected === r.level
                  ? `${r.border} ${r.bg}`
                  : "border-gray-200 hover:border-gray-300",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full border-2",
                    selected === r.level ? r.border : "border-gray-300",
                  )}
                >
                  {selected === r.level && (
                    <div className={cn("size-2 rounded-full", r.dot)} />
                  )}
                </div>
                <div>
                  <span
                    className={cn(
                      "font-bold text-sm",
                      selected === r.level ? r.color : "text-gray-900",
                    )}
                  >
                    {r.label}
                  </span>
                  <p className="text-gray-500 text-xs">{r.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Professional judgment note when adjusting */}
        {isAdjusted && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600" />
              <span className="font-bold text-sm">
                Professional Judgment Override
              </span>
            </div>
            <p className="mb-2 text-gray-600 text-xs">
              You&apos;re adjusting from the suggested level. Please note your
              clinical reasoning:
            </p>
            <textarea
              value={judgment}
              onChange={(e) => setJudgment(e.target.value)}
              placeholder="Explain your clinical reasoning for adjusting the risk level..."
              className="w-full rounded-md border border-gray-300 p-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={3}
            />
          </div>
        )}

        {/* Risk Level Guidelines */}
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <HelpCircle className="size-4 text-blue-600" />
            <span className="font-bold text-sm">Risk Level Guidelines</span>
          </div>
          <div className="space-y-2.5">
            {RISK_LEVEL_GUIDELINES.map((r) => (
              <div key={r.level}>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-xs">
                    {r.label}:
                  </span>
                  <span
                    className={cn("size-2 shrink-0 rounded-full", r.dot)}
                    aria-hidden
                  />
                </div>
                <p className="mt-0.5 ml-4 text-gray-700 text-xs">
                  {r.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Professional Judgment Factors */}
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <HelpCircle className="size-4 text-blue-600" />
            <span className="font-bold text-sm">
              Professional Judgment Factors
            </span>
          </div>
          <p className="mb-2 text-gray-700 text-xs">
            Consider these additional factors when determining risk level:
          </p>
          <ul className="ml-4 space-y-1.5">
            {PROFESSIONAL_JUDGMENT_FACTORS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs">
                <span className="shrink-0 text-gray-500">-</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
