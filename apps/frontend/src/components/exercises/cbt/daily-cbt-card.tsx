"use client";

import { useState, useCallback, useMemo } from "react";
import { Check, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";

// ─── Rotating daily content ──────────────────────────────────────────

const DAILY_EXERCISES = [
  {
    id: "flip-1",
    type: "thought-flip" as const,
    prompt: "Pick the thought that's bugging you:",
    thoughts: [
      { emoji: "\u{1F61E}", label: "I'll mess this up" },
      { emoji: "\u{1F624}", label: "Nobody gets me" },
      { emoji: "\u{1F630}", label: "Too much going on" },
      { emoji: "\u{1F614}", label: "Not good enough" },
    ],
    reframes: {
      "I'll mess this up": ["\u{1F3AF} I can try my best", "\u{1F4AA} Mistakes help me grow", "\u{1F331} I've done hard stuff before"],
      "Nobody gets me": ["\u{1F91D} One person is enough", "\u{1F4AC} I can let someone in", "\u{1F31F} I know myself well"],
      "Too much going on": ["\u{1FAC1} One thing at a time", "\u{1F9E9} I don't have to fix it now", "\u{1F30A} This will pass"],
      "Not good enough": ["\u{1F50D} I'm comparing unfairly", "\u{1F3C6} I've done hard things", "\u{1F499} Good enough is enough"],
    } as Record<string, string[]>,
  },
  {
    id: "boost-1",
    type: "mood-boost" as const,
    prompt: "Pick one tiny thing to try today:",
    thoughts: [
      { emoji: "\u{1F3B5}", label: "Play a song" },
      { emoji: "\u{1F6B6}", label: "Take 5 steps outside" },
      { emoji: "\u{1F4A7}", label: "Drink some water" },
      { emoji: "\u{1F62E}\u200D\u{1F4A8}", label: "3 deep breaths" },
      { emoji: "\u{1F4F1}", label: "Text someone nice" },
      { emoji: "\u270F\uFE0F", label: "Doodle for a sec" },
    ],
    reframes: {} as Record<string, string[]>,
  },
] as const;

function getDailyExercise() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );
  return DAILY_EXERCISES[dayOfYear % DAILY_EXERCISES.length]!;
}

// ─── Component ───────────────────────────────────────────────────────

export function DailyCbtCard() {
  const exercise = useMemo(getDailyExercise, []);
  const isFlip = exercise.type === "thought-flip";

  const [step, setStep] = useState(0); // 0=pick, 1=reframe (flip only), 2=done
  const [picked, setPicked] = useState<string | null>(null);
  const [reframePicked, setReframePicked] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const handlePick = useCallback(
    (label: string) => {
      setPicked(label);
      if (isFlip) {
        setTimeout(() => setStep(1), 350);
      } else {
        setTimeout(() => {
          setStep(2);
          setCompleted(true);
        }, 350);
      }
    },
    [isFlip],
  );

  const handleReframe = useCallback((label: string) => {
    setReframePicked(label);
    setTimeout(() => {
      setStep(2);
      setCompleted(true);
    }, 400);
  }, []);

  const handleReset = useCallback(() => {
    setStep(0);
    setPicked(null);
    setReframePicked(null);
    setCompleted(false);
  }, []);

  const reframes = isFlip && picked ? (exercise.reframes[picked] ?? []) : [];

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-all duration-300",
        completed
          ? "border-emerald-200 bg-emerald-50"
          : isFlip
            ? "border-violet-200 bg-gradient-to-br from-violet-50 to-white"
            : "border-teal-200 bg-gradient-to-br from-teal-50 to-white",
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{isFlip ? "\u{1F9E0}" : "\u26A1"}</span>
          <div>
            <p className="text-sm font-bold text-gray-900">
              {isFlip ? "Thought Flip" : "Mood Boost"}
            </p>
            <p className="text-[10px] text-gray-400">
              {isFlip ? "Cognitive Restructuring" : "Behavioral Activation"} &middot; &lt; 1 min
            </p>
          </div>
        </div>
        {completed && (
          <div className="flex items-center gap-2">
            <span className="animate-[cbt-bounce-in_400ms_ease-out] rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
              +10 XP
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Step 0: Pick */}
      {step === 0 && (
        <div className="animate-[cbt-fade-in_250ms_ease-out]">
          <p className="mb-2.5 text-xs font-medium text-gray-600">{exercise.prompt}</p>
          <div className={cn("grid gap-2", exercise.thoughts.length > 4 ? "grid-cols-3" : "grid-cols-2")}>
            {exercise.thoughts.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => handlePick(t.label)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border-2 bg-white p-3 transition-all duration-200",
                  picked === t.label
                    ? isFlip
                      ? "scale-105 border-violet-400 shadow-md"
                      : "scale-105 border-teal-400 shadow-md"
                    : picked !== null
                      ? "border-gray-100 opacity-40"
                      : "border-gray-100 hover:shadow-sm active:scale-95",
                )}
              >
                <span className="text-2xl">{t.emoji}</span>
                <span className="text-center text-[11px] font-medium text-gray-700 leading-tight">
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Reframe (Thought Flip only) */}
      {step === 1 && isFlip && (
        <div className="animate-[cbt-fade-in_250ms_ease-out]">
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5">
            <span className="text-xs text-gray-500 line-through">{picked}</span>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <span className="text-xs font-medium text-violet-600">Pick a better thought</span>
          </div>
          <div className="space-y-2">
            {reframes.map((r) => {
              const isSelected = reframePicked === r;
              const isOther = reframePicked !== null && !isSelected;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => !reframePicked && handleReframe(r)}
                  disabled={!!reframePicked}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl border-2 bg-white px-3 py-3 text-left transition-all duration-250",
                    isSelected
                      ? "border-violet-400 shadow-md"
                      : isOther
                        ? "border-gray-100 opacity-30"
                        : "border-gray-100 hover:border-violet-200 active:scale-[0.98]",
                  )}
                >
                  <span className="text-sm font-semibold text-gray-800">{r}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Done */}
      {step === 2 && (
        <div className="flex items-center gap-3 animate-[cbt-fade-in_300ms_ease-out]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 animate-[cbt-bounce-in_400ms_ease-out]">
            <Check className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-800">
              {isFlip ? "Thought flipped!" : "You've got this!"}
            </p>
            <p className="text-[11px] text-emerald-600">
              {isFlip
                ? "Nice reframe. That's a real skill."
                : `Try "${picked?.toLowerCase()}" when you're ready.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
