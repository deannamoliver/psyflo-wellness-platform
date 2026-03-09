"use client";

import type { alertStatusEnum } from "@feelwell/database";
import { format, isToday, isYesterday } from "date-fns";
import {
  AlertTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
} from "lucide-react";
import { useState } from "react";
import { AlertReportActions } from "@/app/dashboard/counselor/students/[studentId]/safety/[alertId]/~lib/alert-report-actions";
import type { ResolveAlertStudentInfo } from "@/lib/alerts/resolve-alert-modal";
import { Badge } from "@/lib/core-ui/badge";
import { RISK_BADGE_CONFIG } from "@/lib/student-alerts/risk-level-badge";
import type { SafetyRiskLevel } from "@/lib/student-alerts/safety-types";
import { cn } from "@/lib/tailwind-utils";

export type AlertTimelineItemData = {
  id: string;
  type: string;
  source: string;
  status: (typeof alertStatusEnum.enumValues)[number];
  createdAt: Date;
  coachName?: string;
  riskLevel: SafetyRiskLevel;
};

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

function statusPillConfig(status: string) {
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
      label: status.toUpperCase(),
      bg: "bg-gray-100",
      text: "text-gray-700",
      dot: "bg-gray-500",
    }
  );
}

function formatRelativeTime(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

function AlertIcon({ source }: { source: string }) {
  if (source === "coach") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
        <UserIcon className="h-5 w-5 text-red-600" />
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
      <AlertTriangleIcon className="h-5 w-5 text-orange-600" />
    </div>
  );
}

export function AlertTimelineItem({
  alert,
  children,
  student,
  defaultExpanded = false,
}: {
  alert: AlertTimelineItemData;
  children: React.ReactNode;
  student: ResolveAlertStudentInfo;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const title = alertTitle(alert.source, alert.type);
  const statusPill = statusPillConfig(alert.status);
  const relativeTime = formatRelativeTime(alert.createdAt);
  const formattedTime = format(alert.createdAt, "h:mm a");
  const ChevronIcon = expanded ? ChevronUpIcon : ChevronDownIcon;

  return (
    <div className="flex gap-4">
      <AlertIcon source={alert.source} />
      <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* Header */}
        <div className="px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-gray-900">{title}</h3>
                <Badge
                  className={cn(
                    "rounded-sm px-2 py-0.5 font-bold text-xs uppercase",
                    RISK_BADGE_CONFIG[alert.riskLevel].bg,
                    RISK_BADGE_CONFIG[alert.riskLevel].text,
                  )}
                >
                  {RISK_BADGE_CONFIG[alert.riskLevel].label}
                </Badge>
              </div>
              <p className="mt-1 text-gray-500 text-sm">
                {relativeTime} • {formattedTime}
                {alert.coachName && ` • Submitted by ${alert.coachName}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold text-xs",
                  statusPill.bg,
                  statusPill.text,
                )}
              >
                <span
                  className={cn("size-2 shrink-0 rounded-full", statusPill.dot)}
                />
                {statusPill.label}
              </span>
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="rounded p-0.5 text-gray-500 hover:bg-gray-100"
              >
                <ChevronIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable content */}
        {expanded && (
          <>
            {children}
            <AlertReportActions
              alertId={alert.id}
              status={alert.status}
              student={student}
            />
          </>
        )}
      </div>
    </div>
  );
}
