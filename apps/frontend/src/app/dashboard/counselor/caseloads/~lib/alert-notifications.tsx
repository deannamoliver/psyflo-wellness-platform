"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/lib/core-ui/card";
import { cn } from "@/lib/tailwind-utils";

type AlertStatus = "new" | "in_progress" | "resolved";

export type AlertNotification = {
  id: string;
  studentId: string;
  title: string;
  studentName: string;
  riskLevel: string | null;
  status: AlertStatus;
  updatedAt: string;
};

const TABS = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "In Review", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

function StatusIcon({ status }: { status: AlertStatus }) {
  if (status === "resolved") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
        <Image src="/resolved.png" alt="Resolved" width={16} height={16} />
      </div>
    );
  }
  if (status === "new") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
        <Image src="/alert-icon.svg" alt="New alert" width={14} height={16} />
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100">
      <Image src="/alert-icon.svg" alt="Alert" width={14} height={16} />
    </div>
  );
}

function getRiskLevelPill(riskLevel: string | null): {
  label: string;
  className: string;
} | null {
  switch (riskLevel) {
    case "emergency":
      return { label: "Emergency", className: "bg-red-100 text-red-700" };
    case "high":
      return { label: "High", className: "bg-orange-100 text-orange-700" };
    case "moderate":
      return {
        label: "Moderate",
        className: "bg-yellow-100 text-yellow-700",
      };
    case "low":
      return { label: "Low", className: "bg-blue-100 text-blue-700" };
    default:
      return null;
  }
}

function AlertItem({ notification }: { notification: AlertNotification }) {
  const router = useRouter();
  const riskPill = getRiskLevelPill(notification.riskLevel);

  let bgColor = "bg-yellow-50";
  let hoverBgColor = "hover:bg-yellow-100";
  let borderColor = "border-l-yellow-400";

  if (notification.status === "resolved") {
    bgColor = "bg-green-50";
    hoverBgColor = "hover:bg-green-100";
    borderColor = "border-l-green-500";
  } else if (notification.status === "new") {
    bgColor = "bg-red-50";
    hoverBgColor = "hover:bg-red-100";
    borderColor = "border-l-red-500";
  }

  const handleClick = () => {
    router.push(
      `/dashboard/counselor/students/${notification.studentId}/safety/${notification.id}`,
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "mx-4 my-2 flex items-start gap-3 rounded-lg border-l-4 px-4 py-3 text-left transition-colors",
        bgColor,
        hoverBgColor,
        borderColor,
        "cursor-pointer",
      )}
    >
      <StatusIcon status={notification.status} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-dm font-medium text-gray-900 text-sm">
          {notification.title}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-dm text-gray-700 text-xs">
            {notification.studentName}
          </span>
          {riskPill && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 font-dm font-medium text-[11px]",
                riskPill.className,
              )}
            >
              {riskPill.label}
            </span>
          )}
        </div>
      </div>
      <span className="shrink-0 font-dm text-gray-400 text-xs">
        {formatRelativeTime(notification.updatedAt)}
      </span>
    </button>
  );
}

export function AlertNotifications({
  notifications,
}: {
  notifications: AlertNotification[];
}) {
  const [activeTab, setActiveTab] = useState<TabValue>("all");

  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.status === activeTab);

  return (
    <Card className="flex flex-col gap-0 overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <h3 className="font-dm font-semibold text-base text-gray-900">
          Alert Notifications
        </h3>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "rounded-md px-3 py-1 font-dm font-medium text-xs transition-colors",
                activeTab === tab.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col py-2">
        {filtered.length === 0 ? (
          <div className="px-5 py-8 text-center font-dm text-gray-400 text-sm">
            No alerts to display
          </div>
        ) : (
          filtered.map((n) => <AlertItem key={n.id} notification={n} />)
        )}
      </div>
    </Card>
  );
}
