import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { Card } from "@/lib/core-ui/card";
import { cn } from "@/lib/tailwind-utils";
import type { AdminSafetySummary } from "./types";

type CardConfig = {
  label: string;
  summaryKey: keyof AdminSafetySummary;
  icon: React.ReactNode;
  iconBg: string;
  tag: string;
  tagBg: string;
  tagText: string;
  dotColor: string;
};

const CARDS: CardConfig[] = [
  {
    label: "Emergency Alerts",
    summaryKey: "emergency",
    icon: <Shield className="size-5 text-red-600" />,
    iconBg: "bg-red-50",
    tag: "Urgent",
    tagBg: "bg-red-100",
    tagText: "text-red-700",
    dotColor: "bg-red-600",
  },
  {
    label: "High Risk",
    summaryKey: "high",
    icon: <ShieldAlert className="size-5 text-orange-500" />,
    iconBg: "bg-orange-50",
    tag: "Active",
    tagBg: "bg-orange-100",
    tagText: "text-orange-700",
    dotColor: "bg-orange-500",
  },
  {
    label: "Moderate Risk",
    summaryKey: "moderate",
    icon: <AlertTriangle className="size-5 text-yellow-600" />,
    iconBg: "bg-yellow-50",
    tag: "Monitor",
    tagBg: "bg-yellow-100",
    tagText: "text-yellow-700",
    dotColor: "bg-yellow-600",
  },
  {
    label: "Low Risk",
    summaryKey: "low",
    icon: <CheckCircle2 className="size-5 text-green-600" />,
    iconBg: "bg-green-50",
    tag: "Low Priority",
    tagBg: "bg-green-100",
    tagText: "text-green-700",
    dotColor: "bg-green-600",
  },
  {
    label: "Being Reviewed",
    summaryKey: "inReview",
    icon: <Clock className="size-5 text-blue-600" />,
    iconBg: "bg-blue-50",
    tag: "In Review",
    tagBg: "bg-blue-100",
    tagText: "text-blue-700",
    dotColor: "bg-blue-600",
  },
];

export function AdminSummaryCards({
  summary,
}: {
  summary: AdminSafetySummary;
}) {
  return (
    <div className="grid grid-cols-5 gap-4">
      {CARDS.map((card) => (
        <Card
          key={card.summaryKey}
          className="flex flex-col gap-3 rounded-xl border bg-white p-5 font-dm shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-full",
                card.iconBg,
              )}
            >
              {card.icon}
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold text-xs",
                card.tagBg,
                card.tagText,
              )}
            >
              <span className={cn("size-1.5 rounded-full", card.dotColor)} />
              {card.tag}
            </span>
          </div>
          <div>
            <p className="font-bold text-3xl text-gray-900">
              {summary[card.summaryKey]}
            </p>
            <p className="mt-0.5 text-gray-500 text-sm">{card.label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
