"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/lib/core-ui/button";
import { cn } from "@/lib/tailwind-utils";
import { submitCheckIn } from "./action";

type MoodConfig = {
  id: string;
  name: string;
  image: string;
  color: string;
  specificId?: string;
};

const MOODS: MoodConfig[] = [
  {
    id: "happy",
    name: "Happy",
    image: "/images/moods/happy.svg",
    color: "text-yellow-500",
    specificId: "joyful",
  },
  {
    id: "sad",
    name: "Sad",
    image: "/images/moods/sad.svg",
    color: "text-blue-600",
    specificId: "hurt",
  },
  {
    id: "surprised",
    name: "Excited",
    image: "/images/moods/excited.svg",
    color: "text-orange-500",
    specificId: "excited",
  },
  {
    id: "angry",
    name: "Angry",
    image: "/images/moods/angry.svg",
    color: "text-red-500",
    specificId: "mad",
  },
  {
    id: "happy",
    name: "Proud",
    image: "/images/moods/proud.svg",
    color: "text-cyan-500",
    specificId: "confident",
  },
  {
    id: "afraid",
    name: "Worried",
    image: "/images/moods/worried.svg",
    color: "text-purple-500",
    specificId: "worried",
  },
  {
    id: "happy",
    name: "Calm",
    image: "/images/moods/calm.svg",
    color: "text-green-600",
    specificId: "peaceful",
  },
  {
    id: "sad",
    name: "Lonely",
    image: "/images/moods/lonely.svg",
    color: "text-pink-500",
    specificId: "lonely",
  },
];

export default function CheckInPage() {
  const [isPending, startTransition] = useTransition();
  const [selectedMood, setSelectedMood] = useState<MoodConfig | null>(null);

  const handleSubmit = () => {
    if (!selectedMood) return;

    startTransition(async () => {
      try {
        await submitCheckIn({
          universalEmotion: selectedMood.id,
          specificEmotion: selectedMood.specificId || selectedMood.id,
        });
        // Server action will handle redirect after database write completes
        // Note: redirect() throws a special error that Next.js handles automatically
      } catch (error) {
        // Only show error toast for actual errors, not redirects
        // Next.js redirect() throws a special error that we should let propagate
        const isRedirectError =
          error &&
          typeof error === "object" &&
          "digest" in error &&
          typeof error.digest === "string" &&
          error.digest.includes("NEXT_REDIRECT");

        if (!isRedirectError) {
          console.error("Error submitting check-in:", error);
          toast.error("Failed to submit check-in");
        }
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 md:px-8">
        {/* Check-In Badge with decorative sparkle */}
        <div className="relative mb-4 md:mb-8">
          {/* Sparkle decoration - top right of badge */}
          <Image
            src="/images/sparkle-1.svg"
            alt=""
            width={32}
            height={33}
            className="-top-5 -right-6 md:-top-6 md:-right-7 absolute h-6 w-6 md:h-8 md:w-8"
          />
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-900 bg-white px-4 py-1.5 md:px-6 md:py-2.5">
            <span className="font-medium text-gray-900 text-sm md:text-xl">
              Check-In
            </span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="mb-8 font-semibold text-4xl text-gray-800 md:mb-20 md:text-6xl">
          How are you feeling?
        </h1>

        {/* Mood Grid - 2 rows of 4 */}
        <div className="grid w-full grid-cols-4 gap-x-4 gap-y-6 md:w-auto md:gap-x-20 md:gap-y-16">
          {MOODS.map((mood) => {
            const isSelected = selectedMood?.name === mood.name;
            const hasSelection = selectedMood !== null;

            return (
              <button
                key={mood.name}
                onClick={() => setSelectedMood(mood)}
                disabled={isPending}
                className={cn(
                  "flex flex-col items-center p-1 transition-all md:p-4",
                  isPending && "cursor-not-allowed",
                  !isPending && "hover:scale-105",
                )}
              >
                <Image
                  src={mood.image}
                  alt={mood.name}
                  width={80}
                  height={80}
                  className={cn(
                    "mb-2 h-14 w-14 transition-opacity md:mb-3 md:h-20 md:w-20",
                    hasSelection && !isSelected && "opacity-40",
                  )}
                />
                <span
                  className={cn(
                    "text-sm transition-all md:text-lg",
                    mood.color,
                    isSelected ? "font-bold" : "font-medium",
                    hasSelection && !isSelected && "opacity-40",
                  )}
                >
                  {mood.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Submit Button - Always reserve space to prevent layout shift */}
        <div className="mt-8 flex h-12 items-center justify-center md:mt-12">
          {selectedMood && (
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              size="lg"
              className={cn(
                "rounded-full text-base md:text-xl",
                isPending
                  ? "h-12 w-12 p-0 md:h-14 md:w-14"
                  : "px-8 py-6 md:px-[20px] md:py-7",
              )}
            >
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
