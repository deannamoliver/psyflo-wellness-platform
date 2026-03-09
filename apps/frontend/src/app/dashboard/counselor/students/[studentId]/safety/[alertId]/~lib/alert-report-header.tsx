import { format, isToday, isYesterday } from "date-fns";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Badge } from "@/lib/core-ui/badge";
import { RISK_BADGE_CONFIG } from "@/lib/student-alerts/risk-level-badge";
import type { SafetyRiskLevel } from "@/lib/student-alerts/safety-types";
import { cn } from "@/lib/tailwind-utils";

type AlertData = {
  id: string;
  type: string;
  source: string;
  status: string;
  createdAt: Date;
};

/** Matches StatusBadge in safety-table.tsx (alerts page) */
function statusPillConfig(status: string): {
  label: string;
  bg: string;
  text: string;
  dot: string;
} {
  const config: Record<
    string,
    { label: string; bg: string; text: string; dot: string }
  > = {
    new: {
      label: "NEW",
      bg: "bg-red-100",
      text: "text-red-700",
      dot: "bg-red-600",
    },
    in_progress: {
      label: "IN REVIEW",
      bg: "bg-amber-100",
      text: "text-amber-700",
      dot: "bg-amber-600",
    },
    resolved: {
      label: "RESOLVED",
      bg: "bg-green-100",
      text: "text-green-700",
      dot: "bg-green-600",
    },
  };
  return (
    config[status] ?? {
      label: status.toUpperCase().replace(/_/g, " "),
      bg: "bg-gray-100",
      text: "text-gray-700",
      dot: "bg-gray-500",
    }
  );
}

function alertTitle(source: string, type: string): string {
  if (source === "coach") return "Therapist Escalation Report";
  switch (type) {
    case "safety":
      return "PHQ-9 Question 9 Endorsed";
    case "depression":
      return "Depression Screener Alert";
    case "anxiety":
      return "Anxiety Screener Alert";
    default:
      return "Screener Alert";
  }
}

function formatRelativeTime(date: Date): string {
  if (isToday(date)) {
    return "Today";
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else {
    return format(date, "MMMM d, yyyy");
  }
}

export function AlertReportHeader({
  alert,
  riskLevel,
  expanded = true,
  onToggle,
  coachName,
}: {
  alert: AlertData;
  riskLevel: SafetyRiskLevel;
  expanded?: boolean;
  onToggle?: () => void;
  coachName?: string;
}) {
  const title = alertTitle(alert.source, alert.type);
  const statusPill = statusPillConfig(alert.status);
  const ChevronIcon = expanded ? ChevronUpIcon : ChevronDownIcon;

  const relativeTime = formatRelativeTime(alert.createdAt);
  const formattedTime = format(alert.createdAt, "h:mm a");

  return (
    <div className="px-6 py-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900 text-lg">{title}</h2>
            <Badge
              className={cn(
                "rounded-sm px-2.5 py-0.5 font-bold text-xs uppercase",
                RISK_BADGE_CONFIG[riskLevel].bg,
                RISK_BADGE_CONFIG[riskLevel].text,
              )}
            >
              {RISK_BADGE_CONFIG[riskLevel].label}
            </Badge>
          </div>
          <p className="mt-1 text-gray-500 text-sm">
            {relativeTime} • {formattedTime}
            {alert.source === "chat" &&
              coachName &&
              ` • Submitted by ${coachName}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold text-xs",
              statusPill.bg,
              statusPill.text,
            )}
          >
            <span
              className={cn("size-2 shrink-0 rounded-full", statusPill.dot)}
            />
            {statusPill.label}
          </span>
          {onToggle ? (
            <button
              type="button"
              onClick={onToggle}
              className="rounded p-0.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              <ChevronIcon className="h-5 w-5" />
            </button>
          ) : (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>
    </div>
  );
}
