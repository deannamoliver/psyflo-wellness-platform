"use client";

import {
  Award,
  BookOpen,
  Calendar,
  Check,
  Heart,
  Lightbulb,
  Menu,
  Sparkles,
  Target,
  Wind,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SoliStateData } from "@/lib/check-in/soli-state";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { cn } from "@/lib/tailwind-utils";
import {
  getSoliImage,
  syncSoliSettingsToLocalStorage,
} from "@/lib/user/soli-settings";

type MobileWellnessDashboardProps = {
  firstName: string;
  soliStateData: SoliStateData;
};

const MOOD_OPTIONS = [
  { label: "Great", color: "bg-emerald-400", value: "great" },
  { label: "Good", color: "bg-cyan-400", value: "good" },
  { label: "Okay", color: "bg-yellow-400", value: "okay" },
  { label: "Not Great", color: "bg-orange-400", value: "not_great" },
  { label: "Struggling", color: "bg-pink-400", value: "struggling" },
];

const SYMPTOM_SLIDERS = [
  { label: "Anxiety Level", key: "anxiety" },
  { label: "Stress Level", key: "stress" },
  { label: "Fatigue Level", key: "fatigue" },
  { label: "Sleep Quality", key: "sleep" },
];

const WELLNESS_TOOLS = [
  {
    title: "Meditation",
    description: "Guided sessions to calm your mind",
    icon: Heart,
    color: "bg-gradient-to-br from-cyan-400 to-teal-500 text-white",
    iconBg: "bg-white/20",
    link: "/dashboard/student/toolbox/meditation",
    linkText: "Start Session",
  },
  {
    title: "Breathing",
    description: "Exercises to reduce stress instantly",
    icon: Wind,
    color: "bg-gradient-to-br from-blue-400 to-indigo-500 text-white",
    iconBg: "bg-white/20",
    link: "/dashboard/student/toolbox/breathing",
    linkText: "Try Now",
  },
  {
    title: "Journaling",
    description: "Express your thoughts and feelings",
    icon: BookOpen,
    color: "bg-gradient-to-br from-orange-400 to-pink-500 text-white",
    iconBg: "bg-white/20",
    link: "/dashboard/student/toolbox/journaling",
    linkText: "Open Journal",
  },
];

const ACHIEVEMENTS = [
  {
    title: "Week Warrior",
    subtitle: "7-day streak achieved!",
    color: "bg-pink-100",
    iconColor: "bg-pink-400",
  },
  {
    title: "Early Bird",
    subtitle: "Morning check-ins",
    color: "bg-yellow-100",
    iconColor: "bg-yellow-400",
  },
];

const MOTIVATIONAL_QUOTES = [
  {
    quote: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela",
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
] as const;

const DAILY_TIPS = [
  "Taking a few deep breaths can help reset your mind and reduce stress in just 60 seconds. Try it now!",
  "A 5-minute walk can boost your mood and energy levels significantly.",
] as const;

export default function MobileWellnessDashboard({
  firstName,
  soliStateData,
}: MobileWellnessDashboardProps) {
  const [soliImage, setSoliImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [symptomValues, setSymptomValues] = useState<Record<string, number>>({
    anxiety: 5,
    stress: 5,
    fatigue: 5,
    sleep: 5,
  });
  const [dailyQuote] = useState(
    () => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)] ?? MOTIVATIONAL_QUOTES[0]
  );
  const [dailyTip] = useState(
    () => DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)] ?? DAILY_TIPS[0]
  );

  // Load Soli settings
  useEffect(() => {
    let isMounted = true;
    const checkAndLoad = async () => {
      const storedColor = localStorage.getItem("soliColor");
      const storedShape = localStorage.getItem("soliShape");
      if (storedColor && storedShape) {
        if (isMounted) {
          setSoliImage(
            getSoliImage(storedColor, storedShape, soliStateData.state)
          );
          setIsLoading(false);
        }
      } else {
        try {
          const settings = await syncSoliSettingsToLocalStorage();
          if (!isMounted) return;
          if (settings) {
            setSoliImage(
              getSoliImage(
                settings.soliColor,
                settings.soliShape,
                soliStateData.state
              )
            );
          }
        } catch (error: unknown) {
          console.error("Failed to sync soli settings:", error);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      }
    };
    checkAndLoad();
    return () => {
      isMounted = false;
    };
  }, [soliStateData.state]);

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
  const completedDays = 5;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          {soliImage && !isLoading ? (
            <Image
              src={soliImage}
              alt="Soli"
              width={32}
              height={32}
              className="object-contain"
            />
          ) : (
            <Skeleton className="h-8 w-8 rounded-full bg-gray-100" />
          )}
          <span className="font-semibold text-gray-900">Psyflo</span>
        </div>
        <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-50">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Status Card */}
        <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_20px_-5px_rgba(210,233,255,0.5)]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">You are thriving!</span>
              <span>🎉</span>
            </div>
            {soliImage && !isLoading ? (
              <Image
                src={soliImage}
                alt="Soli"
                width={40}
                height={40}
                className="object-contain"
              />
            ) : (
              <Skeleton className="h-10 w-10 rounded-full bg-gray-100" />
            )}
          </div>

          {/* Stats */}
          <div className="mb-3 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-blue-50 p-2 text-center">
              <p className="font-bold text-gray-900 text-xl">{soliStateData.streak}</p>
              <p className="text-gray-500 text-xs">Days</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-2 text-center">
              <p className="font-bold text-gray-900 text-xl">42</p>
              <p className="text-gray-500 text-xs">Check-ins</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-2 text-center">
              <p className="font-bold text-gray-900 text-xl">15</p>
              <p className="text-gray-500 text-xs">Badges</p>
            </div>
          </div>

          {/* Weekly Progress */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-gray-700 text-xs">Weekly Progress</span>
              <span className="text-gray-700 text-xs">{completedDays}/7</span>
            </div>
            <div className="flex gap-1">
              {weekDays.map((day, i) => (
                <div
                  key={day + i}
                  className={cn(
                    "flex h-7 w-7 flex-1 items-center justify-center rounded-full text-xs font-medium",
                    i < completedDays
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-400"
                  )}
                >
                  {i < completedDays ? <Check className="h-3 w-3" /> : day}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Welcome Header */}
        <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_20px_-5px_rgba(210,233,255,0.5)]">
          <h1 className="mb-2 font-bold text-xl text-gray-900">
            Welcome back, {firstName}!
          </h1>
          <div className="rounded-xl border-l-4 border-primary bg-gray-50 p-3">
            <p className="text-gray-700 text-sm italic">"{dailyQuote.quote}"</p>
            <p className="mt-1 text-gray-500 text-xs">— {dailyQuote.author}</p>
          </div>
        </div>

        {/* Daily Check-In Card */}
        <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_20px_-5px_rgba(210,233,255,0.5)]">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <h2 className="font-bold text-gray-900 text-lg">Daily Check-In</h2>
          </div>

          {/* Mood Selection */}
          <div className="mb-4">
            <p className="mb-2 text-gray-700 text-sm">How are you feeling today?</p>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={cn(
                    "rounded-full px-3 py-1.5 font-medium text-xs text-white transition-all",
                    mood.color,
                    selectedMood === mood.value && "ring-2 ring-offset-1 ring-gray-400"
                  )}
                >
                  {selectedMood === mood.value ? "✓ " : ""}{mood.label}
                </button>
              ))}
            </div>
          </div>

          {/* Symptom Sliders */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <h3 className="mb-3 font-semibold text-gray-800 text-sm">
              How would you rate these symptoms today?
            </h3>
            <div className="space-y-4">
              {SYMPTOM_SLIDERS.map((symptom) => (
                <div key={symptom.key}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-gray-700 text-xs">{symptom.label}</span>
                    <span className="font-semibold text-primary text-xs">
                      {symptomValues[symptom.key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={symptomValues[symptom.key]}
                    onChange={(e) =>
                      setSymptomValues((prev) => ({
                        ...prev,
                        [symptom.key]: Number(e.target.value),
                      }))
                    }
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-primary"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Complete Check-In Button */}
          <button className="mt-4 w-full rounded-full bg-gray-900 py-3 font-semibold text-white text-sm transition-colors hover:bg-gray-800">
            Complete Check-In
          </button>
        </div>

        {/* Start Your Day */}
        <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_20px_-5px_rgba(255,234,209,0.5)]">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100">
              <Sparkles className="h-4 w-4 text-yellow-600" />
            </div>
            <h2 className="font-bold text-gray-900">Start Your Day</h2>
          </div>

          <div className="space-y-2">
            {/* Daily Check-In - shows completion status based on whether check-in form is completed */}
            <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">Daily Check-In</p>
                <p className="text-gray-500 text-xs">How are you feeling today?</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-cyan-50 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100">
                <Heart className="h-4 w-4 text-cyan-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Wellness Check</p>
                <p className="text-gray-500 text-xs">Quick health assessment</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-yellow-50 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100">
                <Target className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Daily Goals</p>
                <p className="text-gray-500 text-xs">Set your intentions</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-purple-50 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                <Sparkles className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Morning Meditation</p>
                <p className="text-gray-500 text-xs">5-minute guided session</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wellness Toolbox */}
        <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_20px_-5px_rgba(240,228,255,0.5)]">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100">
              <Sparkles className="h-4 w-4 text-cyan-600" />
            </div>
            <h2 className="font-bold text-gray-900">Wellness Toolbox</h2>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {WELLNESS_TOOLS.map((tool) => (
              <Link
                key={tool.title}
                href={tool.link}
                className={cn(
                  "rounded-xl p-3 text-center shadow-md",
                  tool.color
                )}
              >
                <div
                  className={cn(
                    "mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl",
                    tool.iconBg
                  )}
                >
                  <tool.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-xs">{tool.title}</h3>
                <p className="text-xs opacity-90">{tool.linkText} →</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_20px_-5px_rgba(255,220,235,0.5)]">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100">
              <Award className="h-4 w-4 text-pink-600" />
            </div>
            <h2 className="font-bold text-gray-900">Achievements</h2>
          </div>

          <div className="space-y-2">
            {ACHIEVEMENTS.map((achievement) => (
              <div
                key={achievement.title}
                className={cn("flex items-center gap-3 rounded-xl p-3", achievement.color)}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    achievement.iconColor
                  )}
                >
                  <Award className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {achievement.title}
                  </p>
                  <p className="text-gray-600 text-xs">{achievement.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Tip */}
        <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_20px_-5px_rgba(255,220,235,0.5)]">
          <div className="mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-pink-500" />
            <h2 className="font-bold text-gray-900">Daily Tip</h2>
          </div>
          <p className="mb-3 text-gray-600 text-sm">"{dailyTip}"</p>
          <button className="rounded-full bg-gray-900 px-4 py-2 font-medium text-white text-sm hover:bg-gray-800">
            Try Breathing Exercise
          </button>
        </div>
      </div>
    </div>
  );
}
