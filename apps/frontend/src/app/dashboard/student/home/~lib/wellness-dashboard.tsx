"use client";

import {
  Award,
  BookOpen,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Lightbulb,
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

type WellnessDashboardProps = {
  firstName: string;
  soliStateData: SoliStateData;
};

const MOOD_OPTIONS = [
  { label: "Great", color: "bg-emerald-400 hover:bg-emerald-500", value: "great" },
  { label: "Good", color: "bg-cyan-400 hover:bg-cyan-500", value: "good" },
  { label: "Okay", color: "bg-yellow-400 hover:bg-yellow-500", value: "okay" },
  { label: "Not Great", color: "bg-orange-400 hover:bg-orange-500", value: "not_great" },
  { label: "Struggling", color: "bg-pink-400 hover:bg-pink-500", value: "struggling" },
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
  {
    title: "Conversation Starter",
    subtitle: "50 chats completed",
    color: "bg-blue-100",
    iconColor: "bg-blue-400",
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
  {
    quote: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
  },
  {
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
  },
] as const;

const DAILY_TIPS = [
  "Taking a few deep breaths can help reset your mind and reduce stress in just 60 seconds. Try it now!",
  "A 5-minute walk can boost your mood and energy levels significantly.",
  "Drinking water throughout the day helps maintain focus and energy.",
  "Taking short breaks every hour can improve productivity and reduce fatigue.",
] as const;

type ActivityType = "wellness-check" | "daily-goals" | "morning-meditation" | null;

function ActivityContent({
  activityType,
  onBack,
}: {
  activityType: ActivityType;
  onBack: () => void;
}) {
  if (activityType === "wellness-check") {
    return (
      <div>
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-gray-500 text-sm hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100">
            <Heart className="h-5 w-5 text-cyan-600" />
          </div>
          <h2 className="font-bold text-gray-900 text-xl">Wellness Check</h2>
        </div>
        <div className="space-y-6">
          <p className="text-gray-600">
            Take a moment to reflect on your overall wellness. This quick assessment helps track your progress.
          </p>
          <div className="rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 p-6">
            <h3 className="mb-4 font-semibold text-gray-800">How are you feeling physically?</h3>
            <div className="flex flex-wrap gap-2">
              {["Energized", "Good", "Tired", "Exhausted"].map((option) => (
                <button
                  key={option}
                  className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm text-cyan-700 transition-all hover:bg-cyan-50"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 p-6">
            <h3 className="mb-4 font-semibold text-gray-800">How are you feeling emotionally?</h3>
            <div className="flex flex-wrap gap-2">
              {["Happy", "Calm", "Anxious", "Sad", "Stressed"].map((option) => (
                <button
                  key={option}
                  className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm text-cyan-700 transition-all hover:bg-cyan-50"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <button className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 py-4 font-semibold text-white transition-colors hover:from-cyan-600 hover:to-teal-600">
            Complete Wellness Check
          </button>
        </div>
      </div>
    );
  }

  if (activityType === "daily-goals") {
    return (
      <div>
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-gray-500 text-sm hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
            <Target className="h-5 w-5 text-yellow-600" />
          </div>
          <h2 className="font-bold text-gray-900 text-xl">Daily Goals</h2>
        </div>
        <div className="space-y-6">
          <p className="text-gray-600">
            Set your intentions for today. What do you want to accomplish?
          </p>
          <div className="space-y-3">
            {["Practice mindfulness for 5 minutes", "Take a walk outside", "Drink 8 glasses of water", "Connect with a friend"].map((goal) => (
              <label
                key={goal}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-yellow-100 bg-yellow-50 p-4 transition-all hover:bg-yellow-100"
              >
                <input type="checkbox" className="h-5 w-5 rounded border-yellow-300 text-yellow-500" />
                <span className="text-gray-700">{goal}</span>
              </label>
            ))}
          </div>
          <div className="rounded-xl border-2 border-dashed border-yellow-200 bg-yellow-50/50 p-4">
            <input
              type="text"
              placeholder="Add your own goal..."
              className="w-full bg-transparent text-gray-700 placeholder-gray-400 outline-none"
            />
          </div>
          <button className="w-full rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 py-4 font-semibold text-white transition-colors hover:from-yellow-500 hover:to-orange-500">
            Save Goals
          </button>
        </div>
      </div>
    );
  }

  if (activityType === "morning-meditation") {
    return (
      <div>
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-gray-500 text-sm hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <h2 className="font-bold text-gray-900 text-xl">Morning Meditation</h2>
        </div>
        <div className="space-y-6">
          <div className="flex flex-col items-center rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 p-8">
            <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 shadow-lg">
              <Sparkles className="h-16 w-16 text-white" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-800 text-lg">5-Minute Calm</h3>
            <p className="mb-6 text-center text-gray-600 text-sm">
              A guided meditation to start your day with peace and clarity
            </p>
            <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:from-purple-600 hover:to-indigo-600 hover:shadow-xl">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                ▶
              </span>
              Start Meditation
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-purple-50 p-4 text-center">
              <p className="font-bold text-2xl text-purple-600">5</p>
              <p className="text-gray-500 text-sm">Minutes</p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-4 text-center">
              <p className="font-bold text-2xl text-indigo-600">Beginner</p>
              <p className="text-gray-500 text-sm">Level</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

const START_YOUR_DAY_ITEMS = [
  {
    id: "wellness-check" as const,
    title: "Wellness Check",
    description: "Quick health assessment",
    icon: Heart,
    color: "bg-cyan-50",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },
  {
    id: "daily-goals" as const,
    title: "Daily Goals",
    description: "Set your intentions",
    icon: Target,
    color: "bg-yellow-50",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  {
    id: "morning-meditation" as const,
    title: "Morning Meditation",
    description: "5-minute guided session",
    icon: Sparkles,
    color: "bg-purple-50",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
];

export default function WellnessDashboard({
  firstName,
  soliStateData,
}: WellnessDashboardProps) {
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
  const [checkInCompleted, setCheckInCompleted] = useState(false);
  const [activeActivity, setActiveActivity] = useState<ActivityType>(null);

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
  const completedDays = 5; // Demo: 5 days completed

  return (
    <div className="flex h-full w-full gap-8 overflow-y-auto px-16 py-6">
      {/* Left Column - Main Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {/* Welcome Header */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="mb-4 font-bold text-3xl text-gray-900">
            Welcome back, {firstName}!
          </h1>
          <div className="rounded-xl border-l-4 border-primary bg-gray-50 p-4">
            <p className="text-gray-700 italic">"{dailyQuote.quote}"</p>
            <p className="mt-2 text-gray-500 text-sm">— {dailyQuote.author}</p>
          </div>
        </div>

        {/* Main Content Area - Shows Check-In, Completed State, or Activity */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          {activeActivity ? (
            /* Activity Content */
            <ActivityContent
              activityType={activeActivity}
              onBack={() => setActiveActivity(null)}
            />
          ) : checkInCompleted ? (
            /* Check-In Completed State */
            <div className="flex flex-col items-center py-8">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500">
                <Check className="h-10 w-10 text-white" />
              </div>
              <h2 className="mb-2 font-bold text-2xl text-gray-900">
                Check-In Complete! 🎉
              </h2>
              <p className="mb-6 text-center text-gray-500">
                Great job taking care of yourself today. Keep up the momentum!
              </p>
              <div className="w-full rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-primary">What's Next?</span>
                </div>
                <p className="mb-4 text-gray-600 text-sm">
                  Continue your wellness journey with today's activities:
                </p>
                <div className="space-y-2">
                  {START_YOUR_DAY_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveActivity(item.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all hover:scale-[1.01]",
                        item.color
                      )}
                    >
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", item.iconBg)}>
                        <item.icon className={cn("h-4 w-4", item.iconColor)} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                        <p className="text-gray-500 text-xs">{item.description}</p>
                      </div>
                      <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Daily Check-In Form */
            <>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h2 className="font-bold text-gray-900 text-xl">Daily Check-In</h2>
              </div>

              {/* Mood Selection */}
              <div className="mb-6">
                <p className="mb-3 text-gray-700">How are you feeling today?</p>
                <div className="flex flex-wrap gap-2">
                  {MOOD_OPTIONS.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className={cn(
                        "rounded-full px-4 py-2 font-medium text-sm text-white transition-all",
                        mood.color,
                        selectedMood === mood.value && "ring-2 ring-offset-2 ring-gray-400"
                      )}
                    >
                      {selectedMood === mood.value ? "✓ " : ""}{mood.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptom Sliders */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <h3 className="mb-4 font-semibold text-gray-800">
                  How would you rate these symptoms today?
                </h3>
                <div className="space-y-6">
                  {SYMPTOM_SLIDERS.map((symptom) => (
                    <div key={symptom.key}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-gray-700 text-sm">{symptom.label}</span>
                        <span className="font-semibold text-primary">
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
                      <div className="mt-1 flex justify-between text-gray-400 text-xs">
                        <span>{symptom.key === "sleep" ? "Poor" : "None"}</span>
                        <span>{symptom.key === "sleep" ? "Fair" : "Mild"}</span>
                        <span>{symptom.key === "sleep" ? "Good" : "Moderate"}</span>
                        <span>{symptom.key === "sleep" ? "Very Good" : "Severe"}</span>
                        <span>{symptom.key === "sleep" ? "Excellent" : "Extreme"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complete Check-In Button */}
              <button
                onClick={() => setCheckInCompleted(true)}
                className="mt-6 w-full rounded-xl bg-primary py-4 font-semibold text-white transition-colors hover:bg-primary/90"
              >
                Complete Check-In
              </button>
            </>
          )}
        </div>

        {/* Wellness Toolbox */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100">
                <Sparkles className="h-5 w-5 text-cyan-600" />
              </div>
              <h2 className="font-bold text-gray-900 text-xl">Wellness Toolbox</h2>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50">
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <button className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50">
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {WELLNESS_TOOLS.map((tool) => (
              <div
                key={tool.title}
                className={cn(
                  "rounded-xl p-5 shadow-md transition-transform hover:scale-[1.02]",
                  tool.color
                )}
              >
                <div
                  className={cn(
                    "mb-3 flex h-12 w-12 items-center justify-center rounded-xl",
                    tool.iconBg
                  )}
                >
                  <tool.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">{tool.title}</h3>
                <p className="mb-3 text-sm opacity-90">{tool.description}</p>
                <Link
                  href={tool.link}
                  className="inline-flex items-center gap-1 font-medium text-sm opacity-90 hover:opacity-100"
                >
                  {tool.linkText} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Sidebar */}
      <div className="flex w-80 flex-shrink-0 flex-col gap-6">
        {/* Status Card */}
        <div className="rounded-2xl bg-gradient-to-br from-primary to-cyan-500 p-6 text-white shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold">You are thriving!</span>
              <span>🎉</span>
            </div>
            {soliImage && !isLoading ? (
              <Image
                src={soliImage}
                alt="Soli"
                width={48}
                height={48}
                className="object-contain"
              />
            ) : (
              <Skeleton className="h-12 w-12 rounded-full bg-white/20" />
            )}
          </div>

          {/* Stats */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white/10 p-3 text-center">
              <p className="font-bold text-2xl">{soliStateData.streak}</p>
              <p className="text-white/80 text-xs">Days</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 text-center">
              <p className="font-bold text-2xl">42</p>
              <p className="text-white/80 text-xs">Check-ins</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 text-center">
              <p className="font-bold text-2xl">15</p>
              <p className="text-white/80 text-xs">Badges</p>
            </div>
          </div>

          {/* Weekly Progress */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm">Weekly Progress</span>
              <span className="text-sm">{completedDays}/7</span>
            </div>
            <div className="flex gap-1">
              {weekDays.map((day, i) => (
                <div
                  key={day + i}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg text-xs",
                    i < completedDays
                      ? "bg-white text-primary"
                      : "bg-white/20 text-white/60"
                  )}
                >
                  {i < completedDays ? <Check className="h-4 w-4" /> : day}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Start Your Day */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
              <Sparkles className="h-5 w-5 text-yellow-600" />
            </div>
            <h2 className="font-bold text-gray-900 text-lg">Start Your Day</h2>
          </div>

          <div className="space-y-3">
            {START_YOUR_DAY_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCheckInCompleted(true);
                  setActiveActivity(item.id);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all hover:scale-[1.02]",
                  item.color,
                  activeActivity === item.id && "ring-2 ring-primary ring-offset-2"
                )}
              >
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", item.iconBg)}>
                  <item.icon className={cn("h-4 w-4", item.iconColor)} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                  <p className="text-gray-500 text-xs">{item.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100">
              <Award className="h-5 w-5 text-pink-600" />
            </div>
            <h2 className="font-bold text-gray-900 text-lg">Achievements</h2>
          </div>

          <div className="space-y-3">
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
        <div className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 p-6 text-white shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            <h2 className="font-bold text-lg">Daily Tip</h2>
          </div>
          <p className="mb-4 text-sm text-white/90">"{dailyTip}"</p>
          <button className="rounded-full bg-white px-4 py-2 font-medium text-pink-600 text-sm transition-colors hover:bg-white/90">
            Try Breathing Exercise
          </button>
        </div>
      </div>
    </div>
  );
}
