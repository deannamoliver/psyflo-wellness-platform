"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { SpecificEmotion, UniversalEmotion } from "@/lib/check-in/utils";
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
  },
  {
    id: "sad",
    name: "Sad",
    image: "/images/moods/sad.svg",
    color: "text-blue-600",
  },
  {
    id: "surprised",
    name: "Excited",
    image: "/images/moods/excited.svg",
    color: "text-orange-500",
  },
  {
    id: "angry",
    name: "Angry",
    image: "/images/moods/angry.svg",
    color: "text-red-500",
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

export default function CheckInForm({ streak }: { streak: number }) {
  const [isPending, startTransition] = useTransition();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleMoodSelect = (mood: (typeof MOODS)[number]) => {
    setSelectedMood(mood.name);

    startTransition(async () => {
      try {
        await submitCheckIn({
          universalEmotion: mood.id as UniversalEmotion,
          specificEmotion: (mood.specificId || mood.id) as SpecificEmotion,
        });
        toast.success("Check-in submitted!");
        window.location.href = "/dashboard/student/home";
      } catch (error) {
        console.error("Error submitting check-in:", error);
        toast.error("Failed to submit check-in");
        setSelectedMood(null);
      }
    });
  };

  return (
    <div className="flex flex-col items-center">
      {/* Decorative sparkle */}
      <div className="mb-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L14 8L20 8L15 12L17 18L12 14L7 18L9 12L4 8L10 8L12 2Z"
            stroke="#3B82F6"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Check-In Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
        <span className="text-gray-600 text-sm">Check-In</span>
      </div>

      {/* Heading */}
      <h1 className="mb-12 font-semibold text-4xl text-gray-800 md:text-5xl">
        How are you feeling?
      </h1>

      {/* Mood Grid */}
      <div className="grid grid-cols-4 gap-x-8 gap-y-6">
        {MOODS.map((mood) => (
          <button
            key={mood.name}
            onClick={() => handleMoodSelect(mood)}
            disabled={isPending}
            className={cn(
              "flex flex-col items-center transition-transform hover:scale-105",
              isPending && "cursor-not-allowed opacity-50",
              selectedMood === mood.name && "scale-110",
            )}
          >
            <div className="relative mb-2 h-16 w-16 md:h-20 md:w-20">
              <Image
                src={mood.image}
                alt={mood.name}
                fill
                className="object-contain"
              />
            </div>
            <span className={cn("font-medium text-sm", mood.color)}>
              {mood.name}
            </span>
          </button>
        ))}
      </div>

      {/* Streak */}
      {streak > 0 && (
        <p className="mt-12 font-medium text-gray-500">
          🔥 {streak} day streak!
        </p>
      )}
    </div>
  );
}
