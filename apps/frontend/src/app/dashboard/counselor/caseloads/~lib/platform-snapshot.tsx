"use client";

import {
  Brain,
  DollarSign,
  Users,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/tailwind-utils";

function SnapshotCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  href,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="rounded-xl border bg-white p-4 transition-shadow hover:shadow-md cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", iconBg)}>
            <Icon className={cn("h-4.5 w-4.5", iconColor)} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function PlatformSnapshot({
  totalPatients,
}: {
  totalPatients: number;
  sessionCount: number;
  alertCount: number;
  supportHours: number;
}) {
  const activeRTMCaseload = Math.max(Math.round(totalPatients * 0.65), totalPatients > 3 ? 1 : 0);
  const activePlans = Math.round(totalPatients * 0.7);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <SnapshotCard
        label="Total Patients"
        value={totalPatients}
        icon={Users}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        href="/dashboard/counselor/caseloads"
      />
      <SnapshotCard
        label="Active RTM Case Load"
        value={activeRTMCaseload}
        icon={DollarSign}
        iconBg="bg-violet-50"
        iconColor="text-violet-600"
        href="/dashboard/counselor/rtm"
      />
      <SnapshotCard
        label="Active Plans"
        value={activePlans}
        icon={Brain}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
        href="/dashboard/counselor/caseloads"
      />
    </div>
  );
}
