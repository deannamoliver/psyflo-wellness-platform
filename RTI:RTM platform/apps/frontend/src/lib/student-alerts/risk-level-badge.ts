import type { SafetyRiskLevel } from "./safety-types";

export const RISK_BADGE_CONFIG: Record<
  SafetyRiskLevel,
  { label: string; bg: string; text: string }
> = {
  emergency: { label: "EMERGENCY", bg: "bg-red-500", text: "text-white" },
  high: { label: "HIGH", bg: "bg-orange-500", text: "text-white" },
  moderate: {
    label: "MODERATE",
    bg: "bg-yellow-400",
    text: "text-yellow-900",
  },
  low: { label: "LOW", bg: "bg-blue-500", text: "text-white" },
};
