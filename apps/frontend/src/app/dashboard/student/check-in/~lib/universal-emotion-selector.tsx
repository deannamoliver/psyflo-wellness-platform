"use client";

import type { UniversalEmotion } from "@/lib/check-in/utils";
import { emotionConfigs } from "@/lib/check-in/utils";
import type { Mood } from "@/lib/emotion/mood";
import MoodComponent from "@/lib/emotion/mood";
import { cn } from "@/lib/tailwind-utils";

export default function UniversalEmotionGrid({
  onSelect,
  selectedEmotion,
  className,
}: {
  onSelect: (emotion: UniversalEmotion) => void;
  selectedEmotion: UniversalEmotion | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-4",
        className,
      )}
    >
      {emotionConfigs.map((emotion) => {
        const isSelected = selectedEmotion === emotion.id;
        return (
          <div
            key={emotion.name}
            className={cn(
              "flex h-32 w-36 cursor-pointer flex-col items-center justify-center rounded-2xl bg-white/20 px-20 py-18 transition-colors hover:bg-white/10",
              isSelected ? "border-4" : "border-4 border-transparent",
            )}
            onClick={() => onSelect(emotion.id)}
          >
            <div
              className="mb-2 flex items-center justify-center rounded-full p-2 shadow-md"
              style={{ backgroundColor: emotion.color }}
            >
              <MoodComponent
                mood={emotion.name.toLowerCase() as Mood}
                className="h-14 w-14"
                withShadow={false}
              />
            </div>
            <span className="mt-1 font-semibold text-sm">{emotion.name}</span>
          </div>
        );
      })}
    </div>
  );
}
