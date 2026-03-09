"use client";

import { ArrowLeft, Clock, Heart, Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";

const MEDITATION_SESSIONS = [
  {
    id: "calm-mind",
    title: "5-Minute Calm",
    description: "A quick meditation to center yourself",
    duration: "5 min",
    level: "Beginner",
    color: "from-cyan-400 to-teal-500",
  },
  {
    id: "stress-relief",
    title: "Stress Relief",
    description: "Release tension and find peace",
    duration: "10 min",
    level: "Intermediate",
    color: "from-blue-400 to-indigo-500",
  },
  {
    id: "deep-relaxation",
    title: "Deep Relaxation",
    description: "Full body relaxation journey",
    duration: "15 min",
    level: "All Levels",
    color: "from-purple-400 to-pink-500",
  },
  {
    id: "morning-energy",
    title: "Morning Energy",
    description: "Start your day with positivity",
    duration: "7 min",
    level: "Beginner",
    color: "from-orange-400 to-yellow-500",
  },
  {
    id: "sleep-well",
    title: "Sleep Well",
    description: "Drift into peaceful sleep",
    duration: "20 min",
    level: "All Levels",
    color: "from-indigo-400 to-purple-500",
  },
  {
    id: "focus-boost",
    title: "Focus Boost",
    description: "Sharpen your concentration",
    duration: "8 min",
    level: "Intermediate",
    color: "from-emerald-400 to-cyan-500",
  },
];

export default function MeditationPage() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const activeSession = MEDITATION_SESSIONS.find((s) => s.id === selectedSession);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#EDF2F9]">
      {/* Header */}
      <header className="flex items-center gap-4 bg-white px-8 py-4 shadow-sm">
        <Link
          href="/dashboard/student/home"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-xl">Meditation</h1>
            <p className="text-gray-500 text-sm">Guided sessions to calm your mind</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {selectedSession && activeSession ? (
          /* Player View */
          <div className="mx-auto max-w-2xl">
            <button
              onClick={() => {
                setSelectedSession(null);
                setIsPlaying(false);
                setProgress(0);
              }}
              className="mb-6 flex items-center gap-2 text-gray-500 text-sm hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" /> Back to sessions
            </button>

            <div
              className={cn(
                "mb-8 flex flex-col items-center rounded-3xl bg-gradient-to-br p-12 text-white",
                activeSession.color
              )}
            >
              <div className="mb-6 flex h-40 w-40 items-center justify-center rounded-full bg-white/20 shadow-lg">
                <Heart className="h-20 w-20 text-white" />
              </div>
              <h2 className="mb-2 font-bold text-2xl">{activeSession.title}</h2>
              <p className="mb-8 text-white/80">{activeSession.description}</p>

              {/* Progress Bar */}
              <div className="mb-4 w-full max-w-md">
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-sm text-white/60">
                  <span>0:00</span>
                  <span>{activeSession.duration}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-6">
                <button className="rounded-full p-3 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                  <SkipBack className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg transition-transform hover:scale-105"
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8" />
                  ) : (
                    <Play className="ml-1 h-8 w-8" />
                  )}
                </button>
                <button className="rounded-full p-3 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                  <SkipForward className="h-6 w-6" />
                </button>
              </div>

              {/* Volume */}
              <div className="mt-6 flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-white/60" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="80"
                  className="h-1 w-32 cursor-pointer appearance-none rounded-full bg-white/30"
                />
              </div>
            </div>

            {/* Session Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white p-4 text-center shadow-sm">
                <Clock className="mx-auto mb-2 h-6 w-6 text-cyan-500" />
                <p className="font-bold text-gray-900">{activeSession.duration}</p>
                <p className="text-gray-500 text-sm">Duration</p>
              </div>
              <div className="rounded-xl bg-white p-4 text-center shadow-sm">
                <Heart className="mx-auto mb-2 h-6 w-6 text-pink-500" />
                <p className="font-bold text-gray-900">{activeSession.level}</p>
                <p className="text-gray-500 text-sm">Level</p>
              </div>
            </div>
          </div>
        ) : (
          /* Session List */
          <div className="mx-auto max-w-4xl">
            <div className="mb-6">
              <h2 className="mb-2 font-bold text-2xl text-gray-900">Choose a Session</h2>
              <p className="text-gray-500">Select a meditation that fits your mood and time</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {MEDITATION_SESSIONS.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session.id)}
                  className={cn(
                    "flex flex-col rounded-2xl bg-gradient-to-br p-6 text-left text-white shadow-lg transition-transform hover:scale-[1.02]",
                    session.color
                  )}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                    <Heart className="h-6 w-6" />
                  </div>
                  <h3 className="mb-1 font-bold text-lg">{session.title}</h3>
                  <p className="mb-4 text-sm text-white/80">{session.description}</p>
                  <div className="mt-auto flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {session.duration}
                    </span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                      {session.level}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
