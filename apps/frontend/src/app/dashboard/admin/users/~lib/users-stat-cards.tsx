"use client";

import { Building2, Crown, Stethoscope, Users } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";
import type { UserStats } from "./users-data";

type StatCardDef = {
  label: string;
  key: keyof UserStats;
  sublabel: string;
  sublabelColor: string;
  icon: React.ReactNode;
  iconBg: string;
};

const STAT_CARD_DEFS: StatCardDef[] = [
  {
    label: "Total Users",
    key: "total",
    sublabel: "All roles combined",
    sublabelColor: "text-gray-500",
    icon: <Users className="size-6 text-blue-600" />,
    iconBg: "bg-blue-50",
  },
  {
    label: "Admin (Psyflo)",
    key: "superAdmins",
    sublabel: "Platform Admin",
    sublabelColor: "text-purple-600",
    icon: <Crown className="size-6 text-purple-600" />,
    iconBg: "bg-purple-50",
  },
  {
    label: "Providers",
    key: "providers",
    sublabel: "Patient Care",
    sublabelColor: "text-blue-600",
    icon: <Stethoscope className="size-6 text-blue-600" />,
    iconBg: "bg-blue-50",
  },
  {
    label: "Practice Management",
    key: "practiceManagement",
    sublabel: "Practice Admin",
    sublabelColor: "text-teal-600",
    icon: <Building2 className="size-6 text-teal-600" />,
    iconBg: "bg-teal-50",
  },
];

export function UsersStatCards({ stats }: { stats: UserStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STAT_CARD_DEFS.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className={cn("mb-3 inline-flex rounded-lg p-2.5", card.iconBg)}>
            {card.icon}
          </div>
          <p className="font-bold text-3xl text-gray-900">
            {stats[card.key].toLocaleString()}
          </p>
          <p className="mt-1 font-medium text-gray-500 text-sm">{card.label}</p>
          <span
            className={cn(
              "mt-1 inline-block rounded-full bg-gray-50 px-2.5 py-0.5 font-medium text-xs",
              card.sublabelColor,
            )}
          >
            {card.sublabel}
          </span>
        </div>
      ))}
    </div>
  );
}
