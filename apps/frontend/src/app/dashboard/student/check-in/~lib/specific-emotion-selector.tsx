"use client";

import { Check } from "lucide-react";
import {
  type SpecificEmotion,
  type UniversalEmotion,
  universalToSpecificEmotion,
} from "@/lib/check-in/utils";
import { H4, P } from "@/lib/core-ui/typography";
import { cn } from "@/lib/tailwind-utils";

export default function SpecificEmotionSelector({
  universalEmotion,
  selectedEmotion,
  onSelect,
  className,
}: {
  universalEmotion: UniversalEmotion | null;
  selectedEmotion: SpecificEmotion | null;
  onSelect: (emotion: SpecificEmotion) => void;
  className?: string;
}) {
  if (!universalEmotion) return null;
  const emotion = universalToSpecificEmotion[universalEmotion];

  const handleEmotionClick = (emotionId: SpecificEmotion) => {
    onSelect(emotionId);
  };

  return (
    <div className={className}>
      <div className="text-center">
        <H4>What word best describes how you feel?</H4>
        <P className="font-semibold text-gray-500">
          Select one of the following:
        </P>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {emotion.map((emotion) => (
          <span
            key={emotion.id}
            onClick={() => handleEmotionClick(emotion.id)}
            className={cn(
              "flex cursor-pointer items-center rounded-sm border px-4 py-2 font-medium text-sm",
              selectedEmotion === emotion.id
                ? "border-blue-900 bg-blue-900 text-white"
                : "border-gray-300 bg-white text-gray-700",
            )}
          >
            {emotion.label}
            {selectedEmotion === emotion.id && (
              <Check className="ml-2 h-4 w-4" />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
