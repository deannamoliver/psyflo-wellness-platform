"use client";

import { Archive, Ban, CheckCircle, Users } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";
import type { StudentStats } from "../../students/~lib/students-data";

type StatCardProps = {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
};

function StatCard({ icon, iconBg, label, value }: StatCardProps) {
  return (
    <div className="flex flex-1 flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          iconBg,
        )}
      >
        {icon}
      </div>
      <span className="font-medium text-gray-500 text-sm">{label}</span>
      <span className="font-bold text-2xl text-gray-900">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

export function PatientsStats({ stats }: { stats: StudentStats }) {
  return (
    <div className="grid grid-cols-2 gap-4 font-dm lg:grid-cols-4">
      <StatCard
        icon={<Users className="size-5 text-blue-600" />}
        iconBg="bg-blue-100"
        label="Total Patients"
        value={stats.total}
      />
      <StatCard
        icon={<CheckCircle className="size-5 text-green-600" />}
        iconBg="bg-green-100"
        label="Active Patients"
        value={stats.active}
      />
      <StatCard
        icon={<Ban className="size-5 text-red-600" />}
        iconBg="bg-red-100"
        label="Blocked"
        value={stats.blocked}
      />
      <StatCard
        icon={<Archive className="size-5 text-gray-600" />}
        iconBg="bg-gray-100"
        label="Archived"
        value={stats.archived}
      />
    </div>
  );
}
