import { format, formatDistanceToNow } from "date-fns";
import { AlertTriangle, Flame, Info } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/core-ui/table";
import { Muted } from "@/lib/core-ui/typography";
import { AlertTypeBadge, StatusBadge } from "./badges";
import type { AdminRiskLevel, AdminSafetyAlert } from "./types";
import { ViewConversationButton } from "./view-conversation-button";

const RISK_ORDER: AdminRiskLevel[] = ["emergency", "high", "moderate", "low"];

const SECTION_CONFIG: Record<
  AdminRiskLevel,
  {
    title: string;
    icon: typeof Flame;
    iconColor: string;
    headerBg: string;
    headerBorder: string;
    badgeBg: string;
  }
> = {
  emergency: {
    title: "Emergency Risk Alerts",
    icon: Flame,
    iconColor: "text-red-600",
    headerBg: "bg-red-50",
    headerBorder: "border-red-200",
    badgeBg: "bg-red-500 text-white",
  },
  high: {
    title: "High Risk Alerts",
    icon: AlertTriangle,
    iconColor: "text-orange-500",
    headerBg: "bg-orange-50",
    headerBorder: "border-orange-200",
    badgeBg: "bg-orange-500 text-white",
  },
  moderate: {
    title: "Moderate Risk Alerts",
    icon: AlertTriangle,
    iconColor: "text-yellow-600",
    headerBg: "bg-yellow-50",
    headerBorder: "border-yellow-200",
    badgeBg: "bg-yellow-500 text-white",
  },
  low: {
    title: "Low Risk Alerts",
    icon: Info,
    iconColor: "text-blue-500",
    headerBg: "bg-blue-50",
    headerBorder: "border-blue-200",
    badgeBg: "bg-blue-500 text-white",
  },
};

const TABLE_HEADERS = [
  "Patient",
  "Location",
  "Alert Type",
  "Submitted By",
  "Time",
  "Status",
  "Action",
];

export function AlertsTable({ alerts }: { alerts: AdminSafetyAlert[] }) {
  const grouped = RISK_ORDER.reduce(
    (acc, level) => {
      acc[level] = alerts.filter((a) => a.riskLevel === level);
      return acc;
    },
    {} as Record<AdminRiskLevel, AdminSafetyAlert[]>,
  );

  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center font-dm shadow-sm">
        <Muted>No alerts match the current filters.</Muted>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {RISK_ORDER.map((level) => {
        if (grouped[level].length === 0) return null;
        return (
          <RiskSection key={level} level={level} alerts={grouped[level]} />
        );
      })}
    </div>
  );
}

function RiskSection({
  level,
  alerts,
}: {
  level: AdminRiskLevel;
  alerts: AdminSafetyAlert[];
}) {
  const config = SECTION_CONFIG[level];
  const Icon = config.icon;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white font-dm shadow-sm">
      <div
        className={`flex items-center justify-between border-b px-6 pt-5 pb-3 ${config.headerBg} ${config.headerBorder}`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`size-5 ${config.iconColor}`} />
          <h3 className="font-semibold text-gray-900 text-lg">
            {config.title}
          </h3>
          <span
            className={`rounded-full px-3 py-0.5 font-semibold text-xs ${config.badgeBg}`}
          >
            {alerts.length} {alerts.length === 1 ? "Patient" : "Patients"}
          </span>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 border-b bg-gray-50/50">
            {TABLE_HEADERS.map((h) => (
              <TableHead
                key={h}
                className={`px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider ${h === "Action" ? "text-center" : ""}`}
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {alerts.map((alert) => (
            <AlertRow key={alert.alertId} alert={alert} riskLevel={level} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function AlertRow({
  alert,
  riskLevel,
}: {
  alert: AdminSafetyAlert;
  riskLevel: AdminRiskLevel;
}) {
  return (
    <TableRow className="border-gray-100 border-b transition-colors hover:bg-gray-50">
      <TableCell className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 text-sm">
            {alert.studentName}
          </span>
          <span className="text-gray-500 text-xs">
            Grade {alert.grade ?? "\u2014"}
            {alert.studentCode ? ` \u2022 ID: ${alert.studentCode}` : ""}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-gray-900 text-sm">{alert.schoolName}</span>
          {alert.districtCode && (
            <span className="text-gray-500 text-xs">{alert.districtCode}</span>
          )}
        </div>
      </TableCell>
      <TableCell className="px-6 py-4">
        <AlertTypeBadge type={alert.alertType} riskLevel={riskLevel} />
      </TableCell>
      <TableCell className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-gray-900 text-sm">{alert.submittedByName}</span>
          <span className="text-gray-500 text-xs">{alert.submittedByRole}</span>
        </div>
      </TableCell>
      <TableCell className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 text-sm">
            {formatDistanceToNow(alert.createdAt, { addSuffix: true })}
          </span>
          <span className="text-gray-500 text-xs">
            {format(alert.createdAt, "h:mm a")}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-6 py-4">
        <StatusBadge status={alert.status} />
      </TableCell>
      <TableCell className="px-6 py-4 text-center">
        <div className="flex flex-col items-center gap-1">
          <Link
            href={`/dashboard/admin/safety-monitor/${alert.alertId}`}
            className="font-medium text-blue-600 text-sm hover:text-blue-800"
          >
            View
          </Link>
          {alert.handoffId && (
            <ViewConversationButton handoffId={alert.handoffId} />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
