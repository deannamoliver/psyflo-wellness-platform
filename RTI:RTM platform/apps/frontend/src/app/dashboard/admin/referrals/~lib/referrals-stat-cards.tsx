"use client";

import { CheckCircle2, Clock, Phone, XCircle } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";
import type { ReferralStats, ReferralStatus } from "./referrals-data";
import { STATUS_DOT_CONFIG } from "./referrals-data";

type StatCardDef = {
  label: string;
  key: keyof ReferralStats;
  statusKey: ReferralStatus;
  icon: React.ReactNode;
  iconBg: string;
};

const STAT_CARD_DEFS: StatCardDef[] = [
  {
    label: "Awaiting Contact",
    key: "submitted",
    statusKey: "Submitted",
    icon: <Clock className="size-5 text-orange-500" />,
    iconBg: "bg-orange-50",
  },
  {
    label: "Coordinating Care",
    key: "inProgress",
    statusKey: "In Progress",
    icon: <Phone className="size-5 text-blue-500" />,
    iconBg: "bg-blue-50",
  },
  {
    label: "Matched with Provider",
    key: "connected",
    statusKey: "Connected",
    icon: <CheckCircle2 className="size-5 text-green-500" />,
    iconBg: "bg-green-50",
  },
  {
    label: "Completed/Cancelled",
    key: "closed",
    statusKey: "Closed",
    icon: <XCircle className="size-5 text-gray-500" />,
    iconBg: "bg-gray-100",
  },
];

export function ReferralsStatCards({ stats }: { stats: ReferralStats }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {STAT_CARD_DEFS.map((card) => {
        const statusConfig = STATUS_DOT_CONFIG[card.statusKey];
        return (
          <div
            key={card.statusKey}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className={cn("inline-flex rounded-lg p-2", card.iconBg)}>
                {card.icon}
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium text-xs",
                  statusConfig.bg,
                  statusConfig.text,
                )}
              >
                <span className={cn("size-2 rounded-full", statusConfig.dot)} />
                {card.statusKey}
              </span>
            </div>
            <p className="mt-2 font-bold text-2xl text-gray-900">
              {stats[card.key]}
            </p>
            <p className="mt-0.5 text-gray-500 text-sm">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}
