"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/tailwind-utils";
import { ExerciseShellCbt } from "./exercise-shell-cbt";
import type { CbtExerciseProps, CbtExerciseResult } from "./types";

// ─── Data ────────────────────────────────────────────────────────────

const THOUGHTS = [
  { id: "mess-up", emoji: "\u{1F61E}", label: "I'll mess this up" },
  { id: "nobody-gets-me", emoji: "\u{1F624}", label: "Nobody gets me" },
  { id: "too-much", emoji: "\u{1F630}", label: "Everything feels too much" },
  { id: "not-enough", emoji: "\u{1F614}", label: "I'm not good enough" },
] as const;

type ThoughtId = (typeof THOUGHTS)[number]["id"];

const REFRAMES: Record<ThoughtId, { emoji: string; label: string }[]> = {
  "mess-up": [
    { emoji: "\u{1F3AF}", label: "I can try my best" },
    { emoji: "\u{1F4AA}", label: "Mistakes help me learn" },
    { emoji: "\u{1F331}", label: "I've handled hard things before" },
  ],
  "nobody-gets-me": [
    { emoji: "\u{1F91D}", label: "One person understands me" },
    { emoji: "\u{1F4AC}", label: "I can let someone in" },
    { emoji: "\u{1F31F}", label: "I know myself well" },
  ],
  "too-much": [
    { emoji: "\u{1FAC1}", label: "One thing at a time" },
    { emoji: "\u{1F9E9}", label: "I don't have to solve it now" },
    { emoji: "\u{1F30A}", label: "This feeling will pass" },
  ],
  "not-enough": [
    { emoji: "\u{1F50D}", label: "Comparing inside to their outside" },
    { emoji: "\u{1F3C6}", label: "I've done hard things before" },
    { emoji: "\u{1F499}", label: "Good enough is enough today" },
  ],
};

// ─── Component ───────────────────────────────────────────────────────

export function ThoughtFlip({ onComplete, onExit }: CbtExerciseProps) {
  const [screen, setScreen] = useState(0);
  const [selectedThought, setSelectedThought] = useState<ThoughtId | null>(null);
  const [selectedReframe, setSelectedReframe] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);

  const handleThoughtSelect = useCallback((id: ThoughtId) => {
    setSelectedThought(id);
    setTimeout(() => setScreen(1), 400);
  }, []);

  const handleReframeSelect = useCallback((label: string) => {
    setSelectedReframe(label);
    setFlipped(true);
    setTimeout(() => setScreen(2), 1050);
  }, []);

  const handleDone = useCallback(() => {
    const result: CbtExerciseResult = {
      exerciseId: "thought-flip",
      completedAt: new Date().toISOString(),
      selections: {
        thought: selectedThought ?? "",
        reframe: selectedReframe ?? "",
      },
      xpEarned: 10,
    };
    onComplete(result);
  }, [selectedThought, selectedReframe, onComplete]);

  return (
    <ExerciseShellCbt
      totalScreens={3}
      currentScreen={screen}
      onExit={onExit}
      primaryColor="violet"
    >
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        {/* ─── Screen 1: Pick the thought ─── */}
        {screen === 0 && (
          <div className="w-full max-w-sm animate-[cbt-fade-in_300ms_ease-out]">
            <h2 className="mb-1 text-center text-xl font-bold text-gray-900">
              What's stuck in your head?
            </h2>
            <p className="mb-6 text-center text-xs text-gray-400">
              Tap the one that fits right now.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {THOUGHTS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleThoughtSelect(t.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl border-2 bg-white p-5 transition-all duration-300",
                    selectedThought === t.id
                      ? "scale-110 border-violet-400 shadow-lg shadow-violet-100"
                      : selectedThought !== null
                        ? "scale-95 border-gray-100 opacity-60"
                        : "border-gray-100 hover:border-violet-200 hover:shadow-md active:scale-95",
                  )}
                >
                  <span className="text-5xl">{t.emoji}</span>
                  <span className="text-center text-sm font-bold text-gray-700">
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Screen 2: The Flip ─── */}
        {screen === 1 && selectedThought && (
          <div className="w-full max-w-sm animate-[cbt-fade-in_300ms_ease-out]">
            {/* Selected thought bubble */}
            <div className="mb-6 rotate-[-3deg] rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-center">
              <span className="text-2xl">
                {THOUGHTS.find((t) => t.id === selectedThought)?.emoji}
              </span>
              <p className="mt-1 text-sm font-medium text-gray-500">
                {THOUGHTS.find((t) => t.id === selectedThought)?.label}
              </p>
            </div>

            <h2 className="mb-1 text-center text-xl font-bold text-gray-900">
              Pick a better thought.
            </h2>
            <p className="mb-5 text-center text-xs text-gray-400">
              Doesn't have to be perfect. Just a little better.
            </p>

            <div className="space-y-3">
              {REFRAMES[selectedThought].map((r, i) => {
                const isSelected = selectedReframe === r.label;
                const isOther = selectedReframe !== null && !isSelected;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => !selectedReframe && handleReframeSelect(r.label)}
                    disabled={!!selectedReframe}
                    className={cn(
                      "relative flex w-full items-center gap-3 rounded-2xl border-2 bg-white px-4 py-4 text-left transition-all duration-300",
                      isSelected
                        ? "border-violet-400 shadow-lg shadow-violet-100"
                        : isOther
                          ? "translate-y-4 border-gray-100 opacity-0"
                          : "border-gray-100 hover:border-violet-200 active:scale-[0.98]",
                    )}
                    style={{ perspective: "600px" }}
                  >
                    <div
                      className={cn(
                        "relative h-8 w-8 shrink-0",
                        isSelected && flipped && "animate-[cbt-card-flip_450ms_ease-in-out]",
                      )}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <span className="text-2xl">{isSelected && flipped ? "\u2728" : r.emoji}</span>
                    </div>
                    <span className="text-base font-bold text-gray-800">
                      {r.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Screen 3: Completion ─── */}
        {screen === 2 && (
          <div className="flex w-full max-w-sm flex-col items-center rounded-3xl bg-gradient-to-b from-violet-600 to-indigo-700 px-6 py-10">
            {/* Confetti particles */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full animate-[cbt-confetti_800ms_ease-out_forwards]"
                  style={{
                    backgroundColor: ["#7C3AED", "#F59E0B", "#FFFFFF", "#A78BFA", "#FCD34D"][i % 5],
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
              {"\u{1F9E0}"}
            </span>
            <h2 className="mt-4 text-2xl font-bold text-white">
              Thought flipped.
            </h2>
            <p className="mt-1 text-sm text-white/80">
              That's a real skill.
            </p>
            <div className="mt-4 animate-[cbt-bounce-in_400ms_ease-out_200ms_both] rounded-full bg-amber-400 px-4 py-1.5 text-sm font-bold text-amber-900">
              +10 XP
            </div>

            <button
              type="button"
              onClick={handleDone}
              className="mt-8 w-full rounded-2xl bg-white py-4 text-base font-bold text-violet-700 transition-transform active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </ExerciseShellCbt>
  );
}
