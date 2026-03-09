"use client";

import { cn } from "@/lib/tailwind-utils";

export type TrafficLightLevel = "green" | "yellow" | "red";

export interface TrafficLightProps {
  level: TrafficLightLevel;
  greenLabel?: string;
  yellowLabel?: string;
  redLabel?: string;
  size?: "sm" | "md" | "lg";
  orientation?: "horizontal" | "vertical";
  showLabels?: boolean;
}

export function TrafficLight({
  level,
  greenLabel = "Good",
  yellowLabel = "Caution",
  redLabel = "Alert",
  size = "md",
  orientation = "horizontal",
  showLabels = true,
}: TrafficLightProps) {
  const sizeClasses = {
    sm: { circle: "h-4 w-4", label: "text-[10px]", gap: "gap-1" },
    md: { circle: "h-6 w-6", label: "text-xs", gap: "gap-2" },
    lg: { circle: "h-8 w-8", label: "text-sm", gap: "gap-3" },
  };

  const sizes = sizeClasses[size];

  const lights: { key: TrafficLightLevel; activeColor: string; inactiveColor: string; label: string }[] = [
    { key: "green", activeColor: "bg-emerald-500 shadow-emerald-300", inactiveColor: "bg-emerald-200", label: greenLabel },
    { key: "yellow", activeColor: "bg-amber-500 shadow-amber-300", inactiveColor: "bg-amber-200", label: yellowLabel },
    { key: "red", activeColor: "bg-red-500 shadow-red-300", inactiveColor: "bg-red-200", label: redLabel },
  ];

  return (
    <div
      className={cn(
        "inline-flex items-center",
        orientation === "vertical" ? "flex-col" : "flex-row",
        sizes.gap
      )}
    >
      {lights.map((light) => (
        <div
          key={light.key}
          className={cn(
            "flex items-center",
            orientation === "vertical" ? "flex-row gap-2" : "flex-col gap-1"
          )}
        >
          <div
            className={cn(
              "rounded-full transition-all duration-300",
              sizes.circle,
              level === light.key
                ? cn(light.activeColor, "shadow-lg ring-2 ring-offset-1", 
                    light.key === "green" ? "ring-emerald-400" :
                    light.key === "yellow" ? "ring-amber-400" : "ring-red-400")
                : light.inactiveColor
            )}
          />
          {showLabels && (
            <span
              className={cn(
                sizes.label,
                "font-medium transition-colors",
                level === light.key ? "text-gray-900" : "text-gray-400"
              )}
            >
              {light.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
