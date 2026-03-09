"use client";

import { AlertTriangle, CheckCircle2, Clock, ListTodo } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";

type TasksSummary = {
  total: number;
  urgent: number;
  todo: number;
  completed: number;
};

type CardConfig = {
  key: keyof TasksSummary;
  label: string;
  sublabel: string;
  icon: typeof ListTodo;
  iconBg: string;
  iconColor: string;
};

const CARDS: CardConfig[] = [
  {
    key: "total",
    label: "Total Tasks",
    sublabel: "All active tasks",
    icon: ListTodo,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    key: "urgent",
    label: "Urgent",
    sublabel: "Requires immediate attention",
    icon: AlertTriangle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    key: "todo",
    label: "To Do",
    sublabel: "Awaiting action",
    icon: Clock,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    key: "completed",
    label: "Completed",
    sublabel: "This week",
    icon: CheckCircle2,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
];

export function TasksSummaryCards({ summary }: { summary: TasksSummary }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-xl",
                card.iconBg
              )}
            >
              <Icon className={cn("size-6", card.iconColor)} />
            </div>
            <div>
              <p className="font-bold text-2xl text-gray-900">
                {summary[card.key]}
              </p>
              <p className="font-medium text-gray-700 text-sm">{card.label}</p>
              <p className="text-gray-500 text-xs">{card.sublabel}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
