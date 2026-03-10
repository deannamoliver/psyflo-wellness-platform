"use client";

import {
  ArrowLeft,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Smile,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Mood, { type Mood as MoodType } from "@/lib/emotion/mood";
import { cn } from "@/lib/tailwind-utils";

const MOOD_OPTIONS: { label: string; value: MoodType; color: string; bgColor: string; description: string }[] = [
  { label: "Happy", value: "happy", color: "text-emerald-500", bgColor: "bg-emerald-50", description: "Feeling joyful and content" },
  { label: "Calm", value: "calm", color: "text-cyan-500", bgColor: "bg-cyan-50", description: "Peaceful and relaxed" },
  { label: "Proud", value: "proud", color: "text-purple-500", bgColor: "bg-purple-50", description: "Accomplished and confident" },
  { label: "Surprised", value: "surprised", color: "text-yellow-500", bgColor: "bg-yellow-50", description: "Excited or amazed" },
  { label: "Sad", value: "sad", color: "text-blue-500", bgColor: "bg-blue-50", description: "Feeling down or blue" },
  { label: "Afraid", value: "afraid", color: "text-orange-500", bgColor: "bg-orange-50", description: "Worried or anxious" },
  { label: "Angry", value: "angry", color: "text-red-500", bgColor: "bg-red-50", description: "Frustrated or upset" },
  { label: "Lonely", value: "lonely", color: "text-indigo-500", bgColor: "bg-indigo-50", description: "Feeling isolated" },
];

type MoodEntry = {
  id: string;
  date: string;
  time: string;
  mood: MoodType;
  factors: string[];
};

const MOOD_INFLUENCES = [
  { label: "Good sleep", emoji: "😴" },
  { label: "Poor sleep", emoji: "😫" },
  { label: "Exercise", emoji: "🏃" },
  { label: "Healthy eating", emoji: "🥗" },
  { label: "School stress", emoji: "📚" },
  { label: "Social time", emoji: "👥" },
  { label: "Achievement", emoji: "🏆" },
  { label: "Conflict", emoji: "😤" },
  { label: "Weather", emoji: "🌤️" },
  { label: "Health issues", emoji: "🤒" },
  { label: "Family time", emoji: "👨‍👩‍👧" },
  { label: "Screen time", emoji: "📱" },
];

const MOOD_HISTORY: MoodEntry[] = [
  { id: "1", date: "Today", time: "9:30 AM", mood: "happy", factors: ["Good sleep", "Exercise"] },
  { id: "2", date: "Yesterday", time: "8:15 PM", mood: "calm", factors: ["Family time"] },
  { id: "3", date: "Yesterday", time: "2:00 PM", mood: "proud", factors: ["Achievement"] },
  { id: "4", date: "2 days ago", time: "6:45 PM", mood: "sad", factors: ["School stress", "Poor sleep"] },
  { id: "5", date: "3 days ago", time: "10:00 AM", mood: "happy", factors: ["Exercise", "Social time"] },
  { id: "6", date: "4 days ago", time: "3:30 PM", mood: "afraid", factors: ["School stress"] },
  { id: "7", date: "5 days ago", time: "11:00 AM", mood: "calm", factors: ["Good sleep", "Weather"] },
];

export default function MoodTrackerPage() {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"log" | "history" | "insights">("log");

  const getMoodData = (value: MoodType) => MOOD_OPTIONS.find((m) => m.value === value);
  const getInfluenceData = (label: string) => MOOD_INFLUENCES.find((i) => i.label === label);

  const toggleFactor = (factor: string) => {
    setSelectedFactors((prev) =>
      prev.includes(factor) ? prev.filter((f) => f !== factor) : [...prev, factor]
    );
  };

  const moodCounts = MOOD_HISTORY.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as MoodType | undefined;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#EDF2F9]">
      {/* Header */}
      <header className="flex items-center justify-between bg-white px-8 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/student/home"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500">
              <Smile className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-xl">Mood Tracker</h1>
              <p className="text-gray-500 text-sm">Track your daily moods and emotions</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto max-w-4xl">
          {/* Stats Row */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 p-5 text-white shadow-lg">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Calendar className="h-5 w-5" />
              </div>
              <p className="font-bold text-3xl">7</p>
              <p className="text-white/80 text-sm">Day Streak</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 p-5 text-white shadow-lg">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <TrendingUp className="h-5 w-5" />
              </div>
              <p className="font-bold text-3xl">5</p>
              <p className="text-white/80 text-sm">Good Days</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 p-5 text-white shadow-lg">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <BarChart3 className="h-5 w-5" />
              </div>
              <p className="font-bold text-3xl">{MOOD_HISTORY.length}</p>
              <p className="text-white/80 text-sm">Total Entries</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-lg">
              <p className="mb-2 text-gray-500 text-sm">Top Mood</p>
              {topMood && (
                <div className="flex items-center gap-2">
                  <Mood mood={topMood} withShadow={false} className="h-10 w-10" />
                  <span className="font-bold text-gray-900">{getMoodData(topMood)?.label}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setActiveTab("log")}
              className={cn(
                "flex items-center gap-2 rounded-full px-6 py-2 font-medium text-sm transition-all",
                activeTab === "log"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              <Plus className="h-4 w-4" />
              Log Mood
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={cn(
                "flex items-center gap-2 rounded-full px-6 py-2 font-medium text-sm transition-all",
                activeTab === "history"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              <Clock className="h-4 w-4" />
              History
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={cn(
                "flex items-center gap-2 rounded-full px-6 py-2 font-medium text-sm transition-all",
                activeTab === "insights"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              <BarChart3 className="h-4 w-4" />
              Insights
            </button>
          </div>

          {activeTab === "log" && (
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-center font-bold text-gray-900 text-xl">How are you feeling right now?</h2>
              
              {/* Mood Selection Grid */}
              <div className="mb-8 grid grid-cols-4 gap-4">
                {MOOD_OPTIONS.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={cn(
                      "flex flex-col items-center gap-3 rounded-2xl p-5 transition-all",
                      selectedMood === mood.value
                        ? `${mood.bgColor} ring-2 ring-offset-2 ${mood.color.replace("text-", "ring-")}`
                        : "bg-gray-50 hover:bg-gray-100"
                    )}
                  >
                    <Mood mood={mood.value} withShadow={false} className="h-14 w-14" />
                    <div className="text-center">
                      <p className={cn("font-semibold", selectedMood === mood.value ? mood.color : "text-gray-900")}>
                        {mood.label}
                      </p>
                      <p className="text-gray-500 text-xs">{mood.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              {selectedMood && (
                <div className="space-y-6">
                  {/* What's influencing your mood */}
                  <div>
                    <p className="mb-3 font-medium text-gray-700 text-sm">
                      What's influencing your mood? <span className="text-gray-400">(select all that apply)</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {MOOD_INFLUENCES.map((influence) => (
                        <button
                          key={influence.label}
                          onClick={() => toggleFactor(influence.label)}
                          className={cn(
                            "flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all",
                            selectedFactors.includes(influence.label)
                              ? "bg-gray-900 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          )}
                        >
                          <span>{influence.emoji}</span>
                          <span>{influence.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  <button className="w-full rounded-full bg-gray-900 py-4 font-semibold text-white transition-colors hover:bg-gray-800">
                    Save Mood Entry
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              {/* Week Navigation */}
              <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100">
                  <ChevronLeft className="h-5 w-5" />
                  Previous
                </button>
                <span className="font-semibold text-gray-900">This Week</span>
                <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-gray-400" disabled>
                  Next
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Mood Entries */}
              {MOOD_HISTORY.map((entry) => {
                const moodData = getMoodData(entry.mood);
                return (
                  <div key={entry.id} className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={cn("rounded-2xl p-3", moodData?.bgColor)}>
                        <Mood mood={entry.mood} withShadow={false} className="h-12 w-12" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <span className={cn("font-bold", moodData?.color)}>{moodData?.label}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500 text-sm">{entry.date}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-400 text-sm">{entry.time}</span>
                        </div>
                        {entry.factors.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {entry.factors.map((factor) => {
                              const influenceData = getInfluenceData(factor);
                              return (
                                <span
                                  key={factor}
                                  className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-gray-600 text-sm"
                                >
                                  <span>{influenceData?.emoji}</span>
                                  <span>{factor}</span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "insights" && (
            <div className="space-y-6">
              {/* Mood-Factor Correlations */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-bold text-gray-900 text-lg">Mood & Influence Patterns</h3>
                <p className="mb-4 text-gray-500 text-sm">Based on your mood entries, here's how different factors correlate with your moods:</p>
                <div className="space-y-4">
                  {/* Positive correlations */}
                  <div className="rounded-xl bg-emerald-50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-lg">😊</span>
                      <span className="font-semibold text-emerald-700">Positive Mood Boosters</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>🏃</span>
                          <span className="text-gray-700">Exercise</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-emerald-200">
                            <div className="h-full w-[85%] rounded-full bg-emerald-500" />
                          </div>
                          <span className="text-emerald-600 text-sm">85% happy</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>😴</span>
                          <span className="text-gray-700">Good sleep</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-emerald-200">
                            <div className="h-full w-[80%] rounded-full bg-emerald-500" />
                          </div>
                          <span className="text-emerald-600 text-sm">80% calm</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>👥</span>
                          <span className="text-gray-700">Social time</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-emerald-200">
                            <div className="h-full w-[75%] rounded-full bg-emerald-500" />
                          </div>
                          <span className="text-emerald-600 text-sm">75% happy</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Negative correlations */}
                  <div className="rounded-xl bg-red-50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-lg">😔</span>
                      <span className="font-semibold text-red-700">Mood Challenges</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>📚</span>
                          <span className="text-gray-700">School stress</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-red-200">
                            <div className="h-full w-[70%] rounded-full bg-red-500" />
                          </div>
                          <span className="text-red-600 text-sm">70% anxious</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>😫</span>
                          <span className="text-gray-700">Poor sleep</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-red-200">
                            <div className="h-full w-[65%] rounded-full bg-red-500" />
                          </div>
                          <span className="text-red-600 text-sm">65% sad</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Mood Calendar */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-bold text-gray-900 text-lg">This Week at a Glance</h3>
                <div className="grid grid-cols-7 gap-2">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => {
                    const dayMood = index < 5 ? MOOD_OPTIONS[index % MOOD_OPTIONS.length] : null;
                    return (
                      <div key={index} className="flex flex-col items-center gap-2">
                        <span className="text-gray-500 text-xs">{day}</span>
                        <div className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl",
                          dayMood ? dayMood.bgColor : "bg-gray-100"
                        )}>
                          {dayMood ? (
                            <Mood mood={dayMood.value} withShadow={false} className="h-8 w-8" />
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Patterns Summary */}
              <div className="rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 p-6 text-white shadow-lg">
                <h3 className="mb-3 font-bold text-lg">Key Insights</h3>
                <ul className="space-y-3 text-white/90">
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-sm">🏃</span>
                    <span><strong>Exercise</strong> is strongly linked to your happiest days</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-sm">�</span>
                    <span><strong>Good sleep</strong> helps you feel calm and relaxed</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-sm">📚</span>
                    <span><strong>School stress</strong> is your most common challenge factor</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
