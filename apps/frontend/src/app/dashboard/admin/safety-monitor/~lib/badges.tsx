import { cn } from "@/lib/tailwind-utils";
import {
  type AdminAlertType,
  type AdminRiskLevel,
  ALERT_TYPE_LABELS,
} from "./types";

const ALERT_TYPE_COLORS: Record<AdminAlertType, { bg: string; text: string }> =
  {
    self_harm: { bg: "bg-red-500", text: "text-white" },
    harm_to_others: { bg: "bg-orange-500", text: "text-white" },
    abuse_neglect: { bg: "bg-amber-500", text: "text-white" },
    phq9_q9_endorsed: { bg: "bg-rose-500", text: "text-white" },
    other: { bg: "bg-green-500", text: "text-white" },
  };

export function AlertTypeBadge({
  type,
  riskLevel,
}: {
  type: AdminAlertType;
  riskLevel?: AdminRiskLevel;
}) {
  const colors = riskLevel
    ? RISK_TAG_CONFIG[riskLevel]
    : ALERT_TYPE_COLORS[type];
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-3 py-1 font-semibold text-xs",
        colors.bg,
        colors.text,
      )}
    >
      {ALERT_TYPE_LABELS[type]}
    </span>
  );
}

const RISK_LEVEL_CONFIG: Record<
  AdminRiskLevel,
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

export function RiskLevelBadge({ level }: { level: AdminRiskLevel }) {
  const c = RISK_LEVEL_CONFIG[level];
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 font-[700] text-xs",
        c.bg,
        c.text,
      )}
    >
      {c.label}
    </span>
  );
}

const RISK_TAG_CONFIG: Record<
  AdminRiskLevel,
  { label: string; bg: string; text: string }
> = {
  emergency: { label: "Urgent", bg: "bg-red-100", text: "text-red-700" },
  high: { label: "Active", bg: "bg-orange-100", text: "text-orange-700" },
  moderate: { label: "Monitor", bg: "bg-yellow-100", text: "text-yellow-700" },
  low: { label: "Low Priority", bg: "bg-green-100", text: "text-green-700" },
};

export function RiskTagBadge({ level }: { level: AdminRiskLevel }) {
  const c = RISK_TAG_CONFIG[level];
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-2.5 py-1 font-semibold text-xs",
        c.bg,
        c.text,
      )}
    >
      {c.label}
    </span>
  );
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  new: {
    label: "New",
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-600",
  },
  in_progress: {
    label: "In Review",
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-600",
  },
  resolved: {
    label: "Resolved",
    bg: "bg-green-100",
    text: "text-green-700",
    dot: "bg-green-600",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-700",
    dot: "bg-gray-500",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 font-semibold text-xs",
        config.bg,
        config.text,
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
