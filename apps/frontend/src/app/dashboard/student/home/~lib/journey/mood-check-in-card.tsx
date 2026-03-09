import { Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { canCheckIn } from "@/lib/check-in/server-utils";
import { getCheckInStreak } from "@/lib/check-in/streak";
import { Button } from "@/lib/core-ui/button";
import { Small } from "@/lib/core-ui/typography";
import AvailabilityTimer from "../hitlist/timer";

export default async function MoodCheckInJourneyCard() {
  const [streak, canCheckInRes] = await Promise.all([
    getCheckInStreak(),
    canCheckIn(),
  ]);

  const isAvailable = canCheckInRes.value;

  return (
    <div className="relative flex h-full flex-col rounded-2xl border-2 border-blue-400 bg-blue-50 p-6">
      {/* Duration Badge - Top Right */}
      <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1">
        <Clock className="h-3 w-3 text-white" />
        <Small className="font-medium text-white text-xs">1 min</Small>
      </div>

      {/* Icon */}
      <div className="mb-4 flex h-32 items-center justify-center">
        <Image
          src="/home/mood-check-in-icon.png"
          alt="Mood Check-In"
          width={120}
          height={120}
          className="h-auto w-24"
        />
      </div>

      {/* Title */}
      <h3 className="mb-2 text-center font-semibold text-blue-600 text-xl">
        Mood Check-In
      </h3>

      {/* Subtitle / Timer */}
      <div className="mb-4 min-h-[48px] text-center">
        {isAvailable ? (
          <Small className="text-gray-700">
            How are you feeling right now?
          </Small>
        ) : (
          <Small className="text-gray-700">
            Next Mood Check Available In:{" "}
            {canCheckInRes.nextAvailableTime && (
              <AvailabilityTimer
                nextAvailableTime={canCheckInRes.nextAvailableTime}
                preText=""
              />
            )}
          </Small>
        )}
      </div>

      {/* Streak */}
      <div className="mb-4 flex items-center justify-center gap-1">
        <span className="text-lg">🔥</span>
        <Small className="font-medium text-gray-700">
          Streak: {streak} {streak === 1 ? "day" : "days"}
        </Small>
      </div>

      {/* Spacer to push button to bottom */}
      <div className="flex-1"></div>

      {/* Button */}
      <Button
        asChild
        disabled={!isAvailable}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        <Link href="/dashboard/student/check-in">Get Started</Link>
      </Button>
    </div>
  );
}
