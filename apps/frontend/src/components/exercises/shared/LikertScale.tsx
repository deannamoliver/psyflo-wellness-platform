"use client";

import { cn } from "@/lib/tailwind-utils";

export interface LikertScaleProps {
  min: number;
  max: number;
  value?: number;
  onChange?: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function LikertScale({
  min,
  max,
  value,
  onChange,
  minLabel,
  maxLabel,
  disabled = false,
  size = "md",
}: LikertScaleProps) {
  const points = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  const sizeClasses = {
    sm: { circle: "h-6 w-6 text-xs", gap: "gap-1" },
    md: { circle: "h-8 w-8 text-sm", gap: "gap-2" },
    lg: { circle: "h-10 w-10 text-base", gap: "gap-3" },
  };

  const sizes = sizeClasses[size];

  return (
    <div className="flex flex-col gap-2">
      <div className={cn("flex items-center justify-center", sizes.gap)}>
        {points.map((point) => (
          <button
            key={point}
            type="button"
            onClick={() => !disabled && onChange?.(point)}
            disabled={disabled}
            className={cn(
              "flex items-center justify-center rounded-full border-2 font-medium transition-all",
              sizes.circle,
              value === point
                ? "border-blue-600 bg-blue-600 text-white shadow-md"
                : "border-gray-300 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50",
              disabled && "cursor-not-allowed opacity-50"
            )}
            aria-label={`Select ${point}`}
          >
            {point}
          </button>
        ))}
      </div>
      {(minLabel || maxLabel) && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-gray-500">{minLabel}</span>
          <span className="text-xs text-gray-500">{maxLabel}</span>
        </div>
      )}
    </div>
  );
}
