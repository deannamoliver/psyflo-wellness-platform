"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";

export interface StreakCounterProps {
  streakDays: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function StreakCounter({
  streakDays,
  size = "md",
  showLabel = true,
}: StreakCounterProps) {
  const sizeClasses = {
    sm: { container: "gap-1 px-2 py-1", icon: "h-4 w-4", number: "text-sm", label: "text-xs" },
    md: { container: "gap-1.5 px-3 py-1.5", icon: "h-5 w-5", number: "text-lg", label: "text-xs" },
    lg: { container: "gap-2 px-4 py-2", icon: "h-6 w-6", number: "text-2xl", label: "text-sm" },
  };

  const sizes = sizeClasses[size];

  const isActive = streakDays > 0;
  const isMilestone = streakDays >= 7;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full",
        sizes.container,
        isActive
          ? isMilestone
            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
            : "bg-orange-100 text-orange-700"
          : "bg-gray-100 text-gray-400"
      )}
    >
      <Flame
        className={cn(
          sizes.icon,
          isActive && "animate-pulse"
        )}
      />
      <span className={cn("font-bold", sizes.number)}>{streakDays}</span>
      {showLabel && (
        <span className={cn("font-medium", sizes.label)}>
          day{streakDays !== 1 ? "s" : ""} streak
        </span>
      )}
    </div>
  );
}
