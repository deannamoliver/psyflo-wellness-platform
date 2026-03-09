"use client";

import { Lock, LockOpen } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";

const GRADE_LABELS = [
  "Kindergarten",
  "1st Grade",
  "2nd Grade",
  "3rd Grade",
  "4th Grade",
  "5th Grade",
  "6th Grade",
  "7th Grade",
  "8th Grade",
  "9th Grade",
  "10th Grade",
  "11th Grade",
  "12th Grade",
];

export function AccessRestrictionsSection({
  restrictedGrades,
  restrictedCount,
}: {
  restrictedGrades: number[];
  restrictedCount: number;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
          <Lock className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-lg">
            Access Restrictions
          </h2>
          <p className="text-gray-500 text-sm">
            Current platform access limitations by grade level
          </p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
          Restricted Grade Levels
        </h3>
        <span className="text-gray-500 text-sm">
          {restrictedCount} grades restricted
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {GRADE_LABELS.map((label, i) => {
          const restricted = restrictedGrades.includes(i);
          return (
            <div
              key={label}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3",
                restricted
                  ? "border border-red-200 bg-red-50"
                  : "border border-gray-200 bg-gray-50",
              )}
            >
              {restricted ? (
                <Lock className="h-4 w-4 text-red-500" />
              ) : (
                <LockOpen className="h-4 w-4 text-green-500" />
              )}
              <div>
                <div className="font-medium text-gray-900 text-sm">{label}</div>
                <div
                  className={cn(
                    "text-xs",
                    restricted ? "text-red-600" : "text-green-600",
                  )}
                >
                  {restricted ? "Access Restricted" : "Access Allowed"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
