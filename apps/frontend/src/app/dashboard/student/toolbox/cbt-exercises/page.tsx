"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/tailwind-utils";
import { CBT_EXERCISES } from "@/components/exercises/cbt/types";

const DEFAULT_COLORS = { bg: "bg-violet-100", text: "text-violet-700" };

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  violet: { bg: "bg-violet-100", text: "text-violet-700" },
  teal: { bg: "bg-teal-100", text: "text-teal-700" },
};

export default function CbtExerciseLibraryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-lg px-4 py-6 space-y-5">
        {/* Header */}
        <div>
          <Link
            href="/dashboard/student/toolbox"
            className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Toolbox
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Exercises</h1>
          <p className="mt-1 text-xs text-gray-400">
            Quick activities from your care team.
          </p>
        </div>

        {/* Exercise Cards */}
        <div className="space-y-3">
          {CBT_EXERCISES.map((exercise) => {
            const colors = COLOR_MAP[exercise.primaryColor] ?? DEFAULT_COLORS;
            return (
              <Link
                key={exercise.id}
                href={`/dashboard/student/toolbox/cbt-exercises/${exercise.id}`}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-gray-200 hover:shadow-md active:scale-[0.99]"
              >
                {/* Emoji circle */}
                <div
                  className={cn(
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
                    colors.bg,
                  )}
                >
                  <span className="text-3xl">{exercise.emoji}</span>
                </div>

                {/* Title + tagline */}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-base text-gray-900">
                    {exercise.title}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {exercise.tagline}
                  </p>
                </div>

                {/* Pills */}
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-500">
                    &lt; 1 min
                  </span>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                    +{exercise.xpReward} XP
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
