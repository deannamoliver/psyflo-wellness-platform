import { Clock } from "lucide-react";
import Image from "next/image";
import { Small } from "@/lib/core-ui/typography";

export default function WellnessCheckJourneyCard() {
  return (
    <div className="relative flex h-full flex-col rounded-2xl border-2 border-purple-400 bg-purple-50 p-6">
      {/* Duration Badge - Top Right */}
      <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1">
        <Clock className="h-3 w-3 text-white" />
        <Small className="font-medium text-white text-xs">3 min</Small>
      </div>

      {/* Icon */}
      <div className="mb-4 flex h-32 items-center justify-center">
        <Image
          src="/home/wellness-check-icon.png"
          alt="Wellness Check"
          width={140}
          height={140}
          className="h-auto w-32"
        />
      </div>

      {/* Title */}
      <h3 className="mb-2 text-center font-semibold text-purple-600 text-xl">
        Wellness Check
      </h3>

      {/* Subtitle */}
      <div className="mb-4 min-h-[48px] text-center">
        <Small className="text-gray-700">How are you doing?</Small>
      </div>

      {/* Spacer to push button to bottom */}
      <div className="flex-1"></div>

      {/* Info text */}
      <p className="text-center text-purple-600 text-sm">
        Start from the sidebar
      </p>
    </div>
  );
}
