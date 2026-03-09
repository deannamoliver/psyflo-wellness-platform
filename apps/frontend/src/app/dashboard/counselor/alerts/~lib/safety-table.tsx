"use client";

import { format, formatDistanceToNow } from "date-fns";
import { UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/lib/core-ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/core-ui/table";
import { Muted } from "@/lib/core-ui/typography";
import { RISK_BADGE_CONFIG } from "@/lib/student-alerts/risk-level-badge";
import {
  ACTION_DISPLAY_LABELS,
  getAlertTypeLabel,
  type SafetyRiskLevel,
  type SafetyStudentRow,
} from "@/lib/student-alerts/safety-types";
import { cn } from "@/lib/tailwind-utils";

const TABLE_HEADERS = [
  "Patient",
  "Risk Level",
  "Alerts",
  "Most Recent",
  "Actions Taken",
  "Status",
  "Actions",
];

const SKELETON_ROW_COUNT = 1;

export function SafetyTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white font-dm shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 border-b bg-gray-50/50">
            {TABLE_HEADERS.map((h) => (
              <TableHead
                key={h}
                className="px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
            <TableRow key={i} className="border-gray-100 border-b">
              <TableCell className="px-4">
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-28 bg-gray-200" />
                  <Skeleton className="h-3 w-20 bg-gray-200" />
                </div>
              </TableCell>
              <TableCell className="px-4">
                <Skeleton className="h-6 w-20 rounded-full bg-gray-200" />
              </TableCell>
              <TableCell className="px-4">
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-24 bg-gray-200" />
                  <Skeleton className="h-3 w-16 bg-gray-200" />
                </div>
              </TableCell>
              <TableCell className="px-4">
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-32 bg-gray-200" />
                  <Skeleton className="h-3 w-28 bg-gray-200" />
                </div>
              </TableCell>
              <TableCell className="px-4">
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-36 bg-gray-200" />
                  <Skeleton className="h-3 w-24 bg-gray-200" />
                </div>
              </TableCell>
              <TableCell className="px-4">
                <Skeleton className="h-4 w-20 bg-gray-200" />
              </TableCell>
              <TableCell className="px-4">
                <Skeleton className="h-4 w-16 bg-gray-200" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function RiskBadge({ level }: { level: SafetyRiskLevel }) {
  const c = RISK_BADGE_CONFIG[level];
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

function StatusBadge({ status }: { status: string }) {
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
  const c = config[status] ?? {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-700",
    dot: "bg-gray-500",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold text-xs",
        c.bg,
        c.text,
      )}
    >
      <span className={cn("size-2 shrink-0 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}

function AlertsCell({ row }: { row: SafetyStudentRow }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5 font-medium text-sm">
        <Image
          src="/emergency-icon.svg"
          alt=""
          width={16}
          height={16}
          className="size-4 shrink-0 object-contain"
        />
        <span>
          {row.alertCount} {row.alertCount === 1 ? "Alert" : "Alerts"}
        </span>
      </div>
      {row.alerts.map((alert) => (
        <span key={alert.alertId} className="text-gray-500 text-xs">
          {getAlertTypeLabel(alert.type)}
        </span>
      ))}
    </div>
  );
}

function MostRecentCell({ date }: { date: Date }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-gray-900 text-sm">
        {formatDistanceToNow(date, { addSuffix: true })}
      </span>
      <span className="text-gray-500 text-xs">
        {format(date, "MMM d, h:mm a")}
      </span>
    </div>
  );
}

const ACTION_ICON_SRC: Record<string, string> = {
  notified_staff: "/action-notified_staff.png",
  cps_notified: "/action-cps_notified.png",
  assessment_performed: "/action-assessment_performed.png",
  contacted_parents: "/action-contacted_parents.png",
  emergency_services_contacted: "/action-emergency_services_contacted.png",
};

const ACTION_DOT_COLOR: Record<string, string> = {
  contacted_988: "bg-red-500",
  triggered_gad7: "bg-blue-500",
  triggered_phq9: "bg-amber-500",
};

function ActionItem({ action }: { action: string }) {
  const label =
    ACTION_DISPLAY_LABELS[action as keyof typeof ACTION_DISPLAY_LABELS] ??
    action;
  const iconSrc = ACTION_ICON_SRC[action];
  const dotColor = ACTION_DOT_COLOR[action];

  return (
    <span className="mb-1 flex items-center gap-1.5 text-gray-600 text-xs last:mb-0">
      {iconSrc ? (
        <Image
          src={iconSrc}
          alt=""
          width={14}
          height={14}
          className="size-3.5 shrink-0 object-contain"
        />
      ) : (
        <span
          className={cn(
            "size-2 shrink-0 rounded-full",
            dotColor ?? "bg-gray-400",
          )}
        />
      )}
      {label}
    </span>
  );
}

function ActionsTakenCell({ actions }: { actions: string[] }) {
  if (actions.length === 0) {
    return <span className="text-gray-400 text-xs">None</span>;
  }
  return (
    <div className="flex flex-col gap-0.5">
      {actions.map((action) => (
        <ActionItem key={action} action={action} />
      ))}
    </div>
  );
}

export function SafetyTable({ rows }: { rows: SafetyStudentRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white font-dm shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 border-b bg-gray-50/50">
              {TABLE_HEADERS.map((h) => (
                <TableHead
                  key={h}
                  className="px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="h-32">
                <div className="flex items-center justify-center">
                  <Muted>No alerts.</Muted>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white font-dm shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 border-b bg-gray-50/50">
            {TABLE_HEADERS.map((h) => (
              <TableHead
                key={h}
                className="px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.studentId}
              className="border-gray-100 border-b transition-colors hover:bg-gray-50"
            >
              <TableCell className="px-4">
                <div className="flex flex-col">
                  <span className="font-dm font-medium text-gray-900 text-sm">
                    {row.studentName}
                  </span>
                  {row.studentCode && (
                    <span className="text-gray-500 text-xs">
                      ID: {row.studentCode}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="px-4">
                <RiskBadge level={row.highestRiskLevel} />
              </TableCell>
              <TableCell className="px-4">
                <AlertsCell row={row} />
              </TableCell>
              <TableCell className="px-4">
                <MostRecentCell date={row.latestAlertAt} />
              </TableCell>
              <TableCell className="px-4">
                <ActionsTakenCell actions={row.actionsTaken} />
              </TableCell>
              <TableCell className="px-4">
                <StatusBadge status={row.status} />
              </TableCell>
              <TableCell className="px-4">
                <Link
                  href={`/dashboard/counselor/alerts/student/${row.studentId}`}
                  className="inline-flex items-center gap-1.5 font-medium text-blue-600 text-sm hover:text-blue-800"
                >
                  View
                  <UserIcon className="size-4" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
