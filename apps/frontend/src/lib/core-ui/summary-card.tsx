import { Card } from "@/lib/core-ui/card";
import { cn } from "@/lib/tailwind-utils";

export type SummaryCardProps = {
  label: string;
  value: number | string;
  sublabel: string;
  icon: React.ReactNode;
  iconBgColor: string;
  valueColor?: string;
  labelClassName?: string;
};

/**
 * Unified stat/summary card used on Conversations, Safety, and Home.
 * Same layout everywhere: icon + value on first row, label + sublabel below.
 */
export function SummaryCard({
  label,
  value,
  sublabel,
  icon,
  iconBgColor,
  valueColor = "text-gray-900",
  labelClassName,
}: SummaryCardProps) {
  return (
    <Card className="flex flex-1 flex-col gap-3 rounded-xl border bg-white p-5 font-dm shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            iconBgColor,
          )}
        >
          {icon}
        </div>
        <span className={cn("font-semibold text-3xl", valueColor)}>
          {value}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span
          className={cn("font-medium text-gray-900 text-sm", labelClassName)}
        >
          {label}
        </span>
        <span className="text-gray-500 text-xs">{sublabel}</span>
      </div>
    </Card>
  );
}

export const SUMMARY_CARDS_GRID_CLASS =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4";
