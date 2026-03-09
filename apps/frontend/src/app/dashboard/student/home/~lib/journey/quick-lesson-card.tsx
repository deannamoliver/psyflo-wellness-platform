import Image from "next/image";
import { Button } from "@/lib/core-ui/button";
import { Small } from "@/lib/core-ui/typography";

export default function QuickLessonJourneyCard() {
  return (
    <div className="relative flex h-full flex-col rounded-2xl border-2 border-green-400 bg-green-50 p-6">
      {/* Focus Badge - Top Right */}
      <div className="absolute top-4 right-4 rounded-full bg-green-600 px-3 py-1">
        <Small className="font-medium text-white text-xs">Focus</Small>
      </div>

      {/* Icon */}
      <div className="mb-4 flex h-32 items-center justify-center">
        <Image
          src="/home/quick-lesson-icon.png"
          alt="Quick Lesson"
          width={120}
          height={120}
          className="h-auto w-24"
        />
      </div>

      {/* Title */}
      <h3 className="mb-2 text-center font-semibold text-green-700 text-xl">
        Quick Lesson
      </h3>

      {/* Description */}
      <div className="mb-3 min-h-[48px] text-center">
        <Small className="text-gray-700">
          Center your thoughts with guided practices.
        </Small>
      </div>

      {/* Tags */}
      <div className="mb-4 text-center">
        <Small className="text-gray-600 text-xs">
          5min Sessions • Nature Sounds • Mindfulness
        </Small>
      </div>

      {/* Spacer to push button to bottom */}
      <div className="flex-1"></div>

      {/* Button */}
      <Button disabled className="w-full bg-green-600 hover:bg-green-700">
        Coming Soon
      </Button>
    </div>
  );
}
