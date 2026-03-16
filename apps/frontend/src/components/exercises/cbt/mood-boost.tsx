"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/tailwind-utils";
import { ExerciseShellCbt } from "./exercise-shell-cbt";
import type { CbtExerciseProps, CbtExerciseResult } from "./types";

// ─── Data ────────────────────────────────────────────────────────────

const ACTIVITIES = [
  { id: "song", emoji: "\u{1F3B5}", label: "Play a song" },
  { id: "steps", emoji: "\u{1F6B6}", label: "Take 5 steps outside" },
  { id: "water", emoji: "\u{1F4A7}", label: "Drink some water" },
  { id: "soft", emoji: "\u{1F33F}", label: "Touch something soft" },
  { id: "doodle", emoji: "\u270F\uFE0F", label: "Doodle for a sec" },
  { id: "breathe", emoji: "\u{1F62E}\u200D\u{1F4A8}", label: "Take 3 deep breaths" },
  { id: "text", emoji: "\u{1F4F1}", label: "Text someone you like" },
  { id: "window", emoji: "\u{1FA9F}", label: "Look out a window" },
  { id: "comfy", emoji: "\u{1F9E6}", label: "Put on comfy clothes" },
] as const;

type ActivityId = (typeof ACTIVITIES)[number]["id"];

const MOOD_PREDICTIONS = [
  { id: "calm", emoji: "\u{1F60C}", label: "Calm me down a little" },
  { id: "boost", emoji: "\u26A1", label: "Give me a boost" },
  { id: "connect", emoji: "\u{1F91D}", label: "Feel less alone" },
] as const;

// ─── Component ───────────────────────────────────────────────────────

export function MoodBoost({ onComplete, onExit }: CbtExerciseProps) {
  const [screen, setScreen] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState<ActivityId | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);

  const handleActivitySelect = useCallback((id: ActivityId) => {
    setSelectedActivity(id);
    setTimeout(() => setScreen(1), 400);
  }, []);

  const handlePredictionSelect = useCallback((id: string) => {
    setSelectedPrediction(id);
    setTimeout(() => setScreen(2), 500);
  }, []);

  const handleDone = useCallback(() => {
    const result: CbtExerciseResult = {
      exerciseId: "mood-boost",
      completedAt: new Date().toISOString(),
      selections: {
        activity: selectedActivity ?? "",
        prediction: selectedPrediction ?? "",
      },
      xpEarned: 10,
    };
    onComplete(result);
  }, [selectedActivity, selectedPrediction, onComplete]);

  const selectedActivityData = ACTIVITIES.find((a) => a.id === selectedActivity);

  return (
    <ExerciseShellCbt
      totalScreens={3}
      currentScreen={screen}
      onExit={onExit}
      primaryColor="teal"
    >
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        {/* ─── Screen 1: Pick an activity ─── */}
        {screen === 0 && (
          <div className="w-full max-w-sm animate-[cbt-fade-in_300ms_ease-out]">
            <h2 className="mb-1 text-center text-xl font-bold text-gray-900">
              Do one tiny good thing.
            </h2>
            <p className="mb-6 text-center text-xs text-gray-400">
              Pick what sounds doable right now.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {ACTIVITIES.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => handleActivitySelect(a.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 bg-white p-3 transition-all duration-250",
                    "min-h-[100px] min-w-[100px]",
                    selectedActivity === a.id
                      ? "scale-115 border-teal-400 shadow-lg shadow-teal-100"
                      : selectedActivity !== null
                        ? "border-gray-100 opacity-50"
                        : "border-gray-100 hover:border-teal-200 hover:shadow-md active:scale-95",
                  )}
                >
                  <span className="text-4xl">{a.emoji}</span>
                  <span className="text-center text-xs font-medium text-gray-600">
                    {a.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Screen 2: Mood prediction ─── */}
        {screen === 1 && selectedActivityData && (
          <div className="w-full max-w-sm animate-[cbt-fade-in_300ms_ease-out]">
            {/* Selected activity card */}
            <div className="mx-auto mb-6 flex h-[120px] w-[120px] flex-col items-center justify-center rounded-2xl border-2 border-teal-100 bg-white shadow-md">
              <span className="text-5xl">{selectedActivityData.emoji}</span>
              <span className="mt-1.5 text-center text-xs font-semibold text-gray-700">
                {selectedActivityData.label}
              </span>
            </div>

            <h2 className="mb-1 text-center text-xl font-bold text-gray-900">
              How might this help?
            </h2>
            <p className="mb-5 text-center text-xs text-gray-400">
              Go with your gut.
            </p>

            <div className="space-y-3">
              {MOOD_PREDICTIONS.map((p) => {
                const isSelected = selectedPrediction === p.id;
                const isOther = selectedPrediction !== null && !isSelected;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => !selectedPrediction && handlePredictionSelect(p.id)}
                    disabled={!!selectedPrediction}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border-2 bg-white px-4 py-[18px] text-left transition-all duration-300",
                      isSelected
                        ? "border-teal-400 bg-teal-50 shadow-md"
                        : isOther
                          ? "border-gray-100 opacity-40"
                          : "border-gray-100 hover:border-teal-200 active:scale-[0.98]",
                    )}
                  >
                    {isSelected && (
                      <span className="mr-1 animate-[cbt-slide-in-left_300ms_ease-out] text-lg text-teal-600">
                        {"\u2713"}
                      </span>
                    )}
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="text-base font-bold text-gray-800">
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Screen 3: Commit ─── */}
        {screen === 2 && selectedActivityData && (
          <div className="flex w-full max-w-sm flex-col items-center rounded-3xl bg-gradient-to-b from-teal-500 to-teal-700 px-6 py-10">
            {/* Confetti particles */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full animate-[cbt-confetti_800ms_ease-out_forwards]"
                  style={{
                    backgroundColor: ["#0D9488", "#F59E0B", "#FFFFFF", "#5EEAD4", "#FCD34D"][i % 5],
                    animationDelay: `${i * 60}ms`,
                    // biome-ignore lint: CSS custom properties for random spread
                    ["--cbt-x" as string]: `${(Math.random() - 0.5) * 200}px`,
                    // biome-ignore lint: CSS custom properties for random spread
                    ["--cbt-y" as string]: `${-80 - Math.random() * 120}px`,
                  }}
                />
              ))}
            </div>

            <span className="text-6xl animate-[cbt-bounce-in_400ms_ease-out]">
              {selectedActivityData.emoji}
            </span>
            <h2 className="mt-4 text-2xl font-bold text-white">
              You've got this.
            </h2>
            <p className="mt-1 text-center text-sm text-white/80">
              Try {selectedActivityData.label.toLowerCase()} when you're ready.
            </p>
            <div className="mt-4 animate-[cbt-bounce-in_400ms_ease-out_200ms_both] rounded-full bg-amber-400 px-4 py-1.5 text-sm font-bold text-amber-900">
              +10 XP
            </div>

            <button
              type="button"
              onClick={handleDone}
              className="mt-8 w-full rounded-2xl bg-white py-4 text-base font-bold text-teal-700 transition-transform active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </ExerciseShellCbt>
  );
}
