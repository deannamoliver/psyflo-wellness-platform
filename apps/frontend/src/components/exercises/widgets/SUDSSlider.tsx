"use client";

import React from "react";
import { cn } from "@/lib/tailwind-utils";

interface SUDSSliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
  showLabels?: boolean;
}

const sudsLabels = [
  { value: 0, label: "No Anxiety", shortLabel: "0" },
  { value: 25, label: "Mild", shortLabel: "25" },
  { value: 50, label: "Moderate", shortLabel: "50" },
  { value: 75, label: "Severe", shortLabel: "75" },
  { value: 100, label: "Worst Possible", shortLabel: "100" },
];

function getSUDSDescription(value: number): string {
  if (value === 0) return "Completely calm, no anxiety at all";
  if (value <= 10) return "Minimal anxiety, barely noticeable";
  if (value <= 25) return "Mild anxiety, slight discomfort";
  if (value <= 40) return "Noticeable anxiety, somewhat uncomfortable";
  if (value <= 50) return "Moderate anxiety, definitely uncomfortable";
  if (value <= 60) return "Significant anxiety, hard to ignore";
  if (value <= 75) return "Severe anxiety, very distressing";
  if (value <= 85) return "Intense anxiety, overwhelming";
  if (value <= 95) return "Extreme anxiety, panic-level distress";
  return "Maximum anxiety, worst imaginable";
}

function getSUDSColor(value: number): string {
  if (value <= 25) return "text-green-600";
  if (value <= 50) return "text-yellow-600";
  if (value <= 75) return "text-orange-600";
  return "text-red-600";
}

export function SUDSSlider({
  value,
  onChange,
  label,
  className,
  showLabels = true,
}: SUDSSliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value));
  };

  // Calculate gradient position for the filled portion
  const gradientStyle = {
    background: `linear-gradient(to right, 
      #22c55e 0%, 
      #84cc16 25%, 
      #eab308 50%, 
      #f97316 75%, 
      #ef4444 100%
    )`,
  };

  return (
    <div className={cn("w-full space-y-3", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}

      {/* Current value display */}
      <div className="flex items-center justify-center gap-3">
        <span className={cn("text-4xl font-bold", getSUDSColor(value))}>
          {value}
        </span>
        <span className="text-gray-500">/100</span>
      </div>

      {/* Description */}
      <p className={cn("text-sm text-center font-medium", getSUDSColor(value))}>
        {getSUDSDescription(value)}
      </p>

      {/* Slider */}
      <div className="relative pt-1">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={handleChange}
          className="w-full h-3 rounded-lg appearance-none cursor-pointer"
          style={gradientStyle}
        />

        {/* Custom thumb indicator */}
        <div
          className="absolute top-0 w-1 h-5 bg-gray-800 rounded pointer-events-none"
          style={{
            left: `calc(${value}% - 2px)`,
            marginTop: "-1px",
          }}
        />
      </div>

      {/* Labels */}
      {showLabels && (
        <div className="relative h-12">
          {sudsLabels.map((item) => (
            <div
              key={item.value}
              className="absolute transform -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${item.value}%` }}
            >
              <div className="w-0.5 h-2 bg-gray-400" />
              <span className="text-xs text-gray-600 font-medium mt-1">
                {item.shortLabel}
              </span>
              <span className="text-[10px] text-gray-500 whitespace-nowrap">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Color legend */}
      <div className="flex justify-between text-xs text-gray-500 px-1">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>Mild</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-500" />
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>Severe</span>
        </div>
      </div>
    </div>
  );
}

export default SUDSSlider;
