"use client";

import { ArrowLeft, Clock, Pause, Play, Wind } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/tailwind-utils";

const BREATHING_EXERCISES = [
  {
    id: "box-breathing",
    title: "Box Breathing",
    description: "4-4-4-4 pattern for calm and focus",
    duration: "4 min",
    pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
    color: "from-blue-400 to-indigo-500",
  },
  {
    id: "4-7-8",
    title: "4-7-8 Relaxation",
    description: "Deep relaxation technique",
    duration: "5 min",
    pattern: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
    color: "from-purple-400 to-pink-500",
  },
  {
    id: "energizing",
    title: "Energizing Breath",
    description: "Quick energy boost",
    duration: "2 min",
    pattern: { inhale: 2, hold1: 0, exhale: 2, hold2: 0 },
    color: "from-orange-400 to-yellow-500",
  },
  {
    id: "calm-down",
    title: "Calm Down",
    description: "Longer exhale for relaxation",
    duration: "3 min",
    pattern: { inhale: 4, hold1: 2, exhale: 6, hold2: 0 },
    color: "from-cyan-400 to-teal-500",
  },
];

type BreathPhase = "inhale" | "hold1" | "exhale" | "hold2" | "idle";

export default function BreathingPage() {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("idle");
  const [countdown, setCountdown] = useState(0);
  const [cycles, setCycles] = useState(0);

  const activeExercise = BREATHING_EXERCISES.find((e) => e.id === selectedExercise);

  useEffect(() => {
    if (!isActive || !activeExercise) return;

    const pattern = activeExercise.pattern;
    const phases: { name: BreathPhase; duration: number }[] = [
      { name: "inhale", duration: pattern.inhale },
      { name: "hold1", duration: pattern.hold1 },
      { name: "exhale", duration: pattern.exhale },
      { name: "hold2", duration: pattern.hold2 },
    ].filter((p) => p.duration > 0);

    let currentPhaseIndex = 0;
    let currentCountdown = phases[0]?.duration ?? 0;

    setPhase(phases[0]?.name ?? "idle");
    setCountdown(currentCountdown);

    const interval = setInterval(() => {
      currentCountdown--;

      if (currentCountdown <= 0) {
        currentPhaseIndex++;
        if (currentPhaseIndex >= phases.length) {
          currentPhaseIndex = 0;
          setCycles((c) => c + 1);
        }
        const nextPhase = phases[currentPhaseIndex];
        if (nextPhase) {
          currentCountdown = nextPhase.duration;
          setPhase(nextPhase.name);
        }
      }

      setCountdown(currentCountdown);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, activeExercise]);

  const getPhaseLabel = (p: BreathPhase) => {
    switch (p) {
      case "inhale":
        return "Breathe In";
      case "hold1":
      case "hold2":
        return "Hold";
      case "exhale":
        return "Breathe Out";
      default:
        return "Ready";
    }
  };

  const getCircleScale = (p: BreathPhase) => {
    switch (p) {
      case "inhale":
        return "scale-100";
      case "hold1":
        return "scale-100";
      case "exhale":
        return "scale-75";
      case "hold2":
        return "scale-75";
      default:
        return "scale-90";
    }
  };

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500">
            <Wind className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-xl">Breathing Exercises</h1>
            <p className="text-gray-500 text-sm">Reduce stress instantly</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {selectedExercise && activeExercise ? (
          /* Exercise View */
          <div className="mx-auto max-w-2xl">
            <button
              onClick={() => {
                setSelectedExercise(null);
                setIsActive(false);
                setPhase("idle");
                setCycles(0);
              }}
              className="mb-6 flex items-center gap-2 text-gray-500 text-sm hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" /> Back to exercises
            </button>

            <div
              className={cn(
                "mb-8 flex flex-col items-center rounded-3xl bg-gradient-to-br p-12 text-white",
                activeExercise.color
              )}
            >
              {/* Breathing Circle */}
              <div className="relative mb-8">
                <div
                  className={cn(
                    "flex h-48 w-48 items-center justify-center rounded-full bg-white/20 shadow-lg transition-transform duration-1000",
                    getCircleScale(phase)
                  )}
                >
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-4xl">{countdown}</span>
                    <span className="text-lg text-white/80">{getPhaseLabel(phase)}</span>
                  </div>
                </div>
                {/* Outer ring animation */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-full border-4 border-white/30 transition-transform duration-1000",
                    getCircleScale(phase)
                  )}
                />
              </div>

              <h2 className="mb-2 font-bold text-2xl">{activeExercise.title}</h2>
              <p className="mb-4 text-white/80">{activeExercise.description}</p>

              {/* Cycles Counter */}
              <div className="mb-6 rounded-full bg-white/20 px-4 py-2">
                <span className="text-sm">Cycles completed: {cycles}</span>
              </div>

              {/* Controls */}
              <button
                onClick={() => setIsActive(!isActive)}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg transition-transform hover:scale-105"
              >
                {isActive ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="ml-1 h-8 w-8" />
                )}
              </button>
            </div>

            {/* Pattern Info */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900">Breathing Pattern</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="font-bold text-blue-600 text-xl">{activeExercise.pattern.inhale}s</p>
                  <p className="text-gray-500 text-xs">Inhale</p>
                </div>
                {activeExercise.pattern.hold1 > 0 && (
                  <div className="rounded-lg bg-purple-50 p-3">
                    <p className="font-bold text-purple-600 text-xl">{activeExercise.pattern.hold1}s</p>
                    <p className="text-gray-500 text-xs">Hold</p>
                  </div>
                )}
                <div className="rounded-lg bg-cyan-50 p-3">
                  <p className="font-bold text-cyan-600 text-xl">{activeExercise.pattern.exhale}s</p>
                  <p className="text-gray-500 text-xs">Exhale</p>
                </div>
                {activeExercise.pattern.hold2 > 0 && (
                  <div className="rounded-lg bg-pink-50 p-3">
                    <p className="font-bold text-pink-600 text-xl">{activeExercise.pattern.hold2}s</p>
                    <p className="text-gray-500 text-xs">Hold</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Exercise List */
          <div className="mx-auto max-w-4xl">
            <div className="mb-6">
              <h2 className="mb-2 font-bold text-2xl text-gray-900">Choose an Exercise</h2>
              <p className="text-gray-500">Select a breathing technique that fits your needs</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {BREATHING_EXERCISES.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => setSelectedExercise(exercise.id)}
                  className={cn(
                    "flex flex-col rounded-2xl bg-gradient-to-br p-6 text-left text-white shadow-lg transition-transform hover:scale-[1.02]",
                    exercise.color
                  )}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                    <Wind className="h-6 w-6" />
                  </div>
                  <h3 className="mb-1 font-bold text-lg">{exercise.title}</h3>
                  <p className="mb-4 text-sm text-white/80">{exercise.description}</p>
                  <div className="mt-auto flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {exercise.duration}
                    </span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                      {exercise.pattern.inhale}-{exercise.pattern.hold1}-{exercise.pattern.exhale}
                      {exercise.pattern.hold2 > 0 ? `-${exercise.pattern.hold2}` : ""}
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
