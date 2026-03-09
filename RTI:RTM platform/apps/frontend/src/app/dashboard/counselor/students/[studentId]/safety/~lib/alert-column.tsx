"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Badge } from "@/lib/core-ui/badge";
import { Button } from "@/lib/core-ui/button";
import { cn } from "@/lib/tailwind-utils";

type AlertItem = {
  id: string;
  title: string;
  severity: string;
  severityColor: string;
  status: string;
  createdAt: Date;
  assigneeName: string | null;
};

type AlertColumnProps = {
  title: string;
  count: number;
  alerts: AlertItem[];
  studentId: string;
  emptyMessage: string;
  buttonLabel: string;
  showViewAll?: boolean;
  badgeColor: "red" | "yellow" | "green";
};

function AlertCard({
  alert,
  studentId,
  buttonLabel,
  columnBorderColor,
}: {
  alert: AlertItem;
  studentId: string;
  buttonLabel: string;
  columnBorderColor: "red" | "yellow" | "green";
}) {
  const borderColor =
    columnBorderColor === "red"
      ? "border-l-red-500"
      : columnBorderColor === "yellow"
        ? "border-l-yellow-500"
        : "border-l-green-500";

  const isViewDetails = buttonLabel === "View Details";

  return (
    <div
      className={cn(
        "rounded-xl border border-l-4 bg-white p-4 transition-shadow hover:shadow-md",
        borderColor,
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <Badge
          className={cn("rounded-full text-xs font-semibold", alert.severityColor)}
        >
          {alert.severity}
        </Badge>
        <span className="text-xs text-gray-400">
          {formatDistanceToNow(alert.createdAt)} ago
        </span>
      </div>
      <p className="mb-3 text-sm font-semibold text-gray-900">{alert.title}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
            {alert.assigneeName ? alert.assigneeName.charAt(0) : "?"}
          </div>
          <span className="text-xs text-gray-500">
            {alert.assigneeName ?? "Unassigned"}
          </span>
        </div>
        <Link
          href={`/dashboard/counselor/students/${studentId}/safety/${alert.id}`}
        >
          <Button
            variant={isViewDetails ? "outline" : "default"}
            size="sm"
            className={cn(
              "text-xs font-medium",
              isViewDetails
                ? "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                : "bg-gray-900 text-white hover:bg-gray-800",
            )}
          >
            {buttonLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function AlertColumn({
  title,
  count,
  alerts,
  studentId,
  emptyMessage,
  buttonLabel,
  showViewAll,
  badgeColor,
}: AlertColumnProps) {
  const badgeColorClass =
    badgeColor === "red"
      ? "bg-red-500"
      : badgeColor === "yellow"
        ? "bg-yellow-500"
        : "bg-green-500";

  return (
    <div className="font-dm">
      <div className="mb-4 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <span
          className={cn(
            "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white",
            badgeColorClass,
          )}
        >
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            studentId={studentId}
            buttonLabel={buttonLabel}
            columnBorderColor={badgeColor}
          />
        ))}
        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-white py-10 text-center">
            <p className="text-xs text-gray-400">{emptyMessage}</p>
          </div>
        )}
      </div>
      {showViewAll && (
        <div className="mt-3 text-center">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
            View All
          </button>
        </div>
      )}
    </div>
  );
}
