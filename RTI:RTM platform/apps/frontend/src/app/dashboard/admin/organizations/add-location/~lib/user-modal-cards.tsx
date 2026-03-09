"use client";

import { cn } from "@/lib/tailwind-utils";

export type RoleOption = {
  value: string;
  label: string;
  color: string;
  description: string;
  idealFor: string;
};

export function RoleCard({
  role,
  selected,
  onSelect,
}: {
  role: RoleOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-lg border-2 p-4 text-left transition-colors",
        selected
          ? "border-blue-600 bg-blue-50/30"
          : "border-gray-200 bg-white hover:bg-gray-50",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <div
          className={cn(
            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
            selected ? "border-blue-600" : "border-gray-300",
          )}
        >
          {selected && <div className="h-2 w-2 rounded-full bg-blue-600" />}
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-semibold text-xs",
            role.color,
          )}
        >
          {role.label}
        </span>
      </div>
      <p className="mb-2 text-gray-600 text-xs leading-relaxed">
        {role.description}
      </p>
      <p className="text-xs">
        <span className="font-semibold text-gray-700">Ideal for:</span>{" "}
        <span className="text-gray-500">{role.idealFor}</span>
      </p>
    </button>
  );
}
