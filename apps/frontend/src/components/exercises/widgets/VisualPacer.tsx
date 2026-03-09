"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/tailwind-utils";
import { Button } from "@/lib/core-ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface VisualPacerProps {
  inhaleSeconds?: number;
  holdSeconds?: number;
  exhaleSeconds?: number;
  cycles?: number;
  onComplete?: () => void;
  className?: string;
}

type Phase = "idle" | "inhale" | "hold" | "exhale" | "complete";

const phaseLabels: Record<Phase, string> = {
  idle: "Ready",
  inhale: "Breathe In",
  hold: "Hold",
  exhale: "Breathe Out",
  complete: "Complete",
};

export function VisualPacer({
  inhaleSeconds = 4,
  holdSeconds = 7,
  exhaleSeconds = 8,
  cycles = 3,
  onComplete,
  className,
}: VisualPacerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [currentCycle, setCurrentCycle] = useState(1);
  const [progress, setProgress] = useState(0);
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState(0);

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const phaseDurationRef = useRef<number>(0);

  const getPhaseColor = (phase: Phase): string => {
    switch (phase) {
      case "inhale":
        return "from-blue-400 to-blue-600";
      case "hold":
        return "from-purple-400 to-purple-600";
      case "exhale":
        return "from-teal-400 to-teal-600";
      case "complete":
        return "from-green-400 to-green-600";
      default:
        return "from-gray-300 to-gray-400";
    }
  };

  const getCircleScale = (): number => {
    if (phase === "idle" || phase === "complete") return 0.6;
    if (phase === "inhale") return 0.6 + 0.4 * progress;
    if (phase === "hold") return 1;
    if (phase === "exhale") return 1 - 0.4 * progress;
    return 0.6;
  };

  const startNextPhase = useCallback(() => {
    if (phase === "idle" || phase === "complete") {
      setPhase("inhale");
      phaseDurationRef.current = inhaleSeconds * 1000;
    } else if (phase === "inhale") {
      if (holdSeconds > 0) {
        setPhase("hold");
        phaseDurationRef.current = holdSeconds * 1000;
      } else {
        setPhase("exhale");
        phaseDurationRef.current = exhaleSeconds * 1000;
      }
    } else if (phase === "hold") {
      setPhase("exhale");
      phaseDurationRef.current = exhaleSeconds * 1000;
    } else if (phase === "exhale") {
      if (currentCycle < cycles) {
        setCurrentCycle((c) => c + 1);
        setPhase("inhale");
        phaseDurationRef.current = inhaleSeconds * 1000;
      } else {
        setPhase("complete");
        setIsRunning(false);
        onComplete?.();
        return;
      }
    }
    startTimeRef.current = performance.now();
    setProgress(0);
  }, [phase, currentCycle, cycles, inhaleSeconds, holdSeconds, exhaleSeconds, onComplete]);

  const animate = useCallback(
    (timestamp: number) => {
      if (!isRunning) return;

      const elapsed = timestamp - startTimeRef.current;
      const duration = phaseDurationRef.current;
      const newProgress = Math.min(elapsed / duration, 1);

      setProgress(newProgress);
      setPhaseTimeRemaining(Math.ceil((duration - elapsed) / 1000));

      if (newProgress >= 1) {
        startNextPhase();
      }

      animationRef.current = requestAnimationFrame(animate);
    },
    [isRunning, startNextPhase]
  );

  useEffect(() => {
    if (isRunning && phase !== "complete") {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, phase, animate]);

  const handleStart = () => {
    if (phase === "idle" || phase === "complete") {
      setCurrentCycle(1);
      setPhase("inhale");
      phaseDurationRef.current = inhaleSeconds * 1000;
      startTimeRef.current = performance.now();
      setProgress(0);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhase("idle");
    setCurrentCycle(1);
    setProgress(0);
    setPhaseTimeRemaining(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const scale = getCircleScale();

  return (
    <div className={cn("flex flex-col items-center gap-6 p-6", className)}>
      {/* Cycle indicator */}
      <div className="text-sm font-medium text-gray-600">
        {phase === "idle" && "Press Start to begin"}
        {phase === "complete" && "Session complete!"}
        {phase !== "idle" && phase !== "complete" && `Breath ${currentCycle} of ${cycles}`}
      </div>

      {/* Animated circle */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute w-full h-full rounded-full border-4 border-gray-200" />

        {/* Animated breathing circle */}
        <div
          className={cn(
            "rounded-full bg-gradient-to-br transition-colors duration-500",
            getPhaseColor(phase)
          )}
          style={{
            width: `${scale * 100}%`,
            height: `${scale * 100}%`,
            transition: isRunning ? "none" : "all 0.3s ease-out",
          }}
        />

        {/* Phase label in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="text-2xl font-semibold drop-shadow-md">
            {phaseLabels[phase]}
          </span>
          {isRunning && phase !== "complete" && (
            <span className="text-4xl font-bold drop-shadow-md mt-1">
              {phaseTimeRemaining}
            </span>
          )}
        </div>
      </div>

      {/* Timing info */}
      <div className="flex gap-4 text-sm text-gray-500">
        <span>In: {inhaleSeconds}s</span>
        {holdSeconds > 0 && <span>Hold: {holdSeconds}s</span>}
        <span>Out: {exhaleSeconds}s</span>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!isRunning ? (
          <Button onClick={handleStart} className="gap-2">
            <Play className="w-4 h-4" />
            {phase === "idle" || phase === "complete" ? "Start" : "Resume"}
          </Button>
        ) : (
          <Button onClick={handlePause} variant="outline" className="gap-2">
            <Pause className="w-4 h-4" />
            Pause
          </Button>
        )}
        <Button onClick={handleReset} variant="outline" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}

export default VisualPacer;
