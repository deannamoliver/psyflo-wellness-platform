"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/tailwind-utils";
import { Button } from "@/lib/core-ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface TimerWidgetProps {
  durationSeconds: number;
  label?: string;
  onComplete?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TimerWidget({
  durationSeconds,
  label,
  onComplete,
  className,
  size = "md",
}: TimerWidgetProps) {
  const [timeRemaining, setTimeRemaining] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const sizeConfig = {
    sm: { ring: 120, stroke: 6, fontSize: "text-2xl" },
    md: { ring: 160, stroke: 8, fontSize: "text-3xl" },
    lg: { ring: 200, stroke: 10, fontSize: "text-4xl" },
  };

  const config = sizeConfig[size];
  const radius = (config.ring - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = timeRemaining / durationSeconds;
  const strokeDashoffset = circumference * (1 - progress);

  const playCompletionSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;

      // Create a simple beep
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);

      // Play a second beep after a short delay
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1000;
        osc2.type = "sine";
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.5);
      }, 200);
    } catch (e) {
      console.warn("Could not play audio:", e);
    }
  }, []);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            playCompletionSound();
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining, onComplete, playCompletionSound]);

  const handleStart = () => {
    if (isComplete) {
      setTimeRemaining(durationSeconds);
      setIsComplete(false);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsComplete(false);
    setTimeRemaining(durationSeconds);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressColor = (): string => {
    if (isComplete) return "stroke-green-500";
    if (progress <= 0.25) return "stroke-red-500";
    if (progress <= 0.5) return "stroke-orange-500";
    return "stroke-blue-500";
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {label && (
        <div className="text-sm font-medium text-gray-700">{label}</div>
      )}

      {/* Progress ring */}
      <div className="relative" style={{ width: config.ring, height: config.ring }}>
        <svg
          className="transform -rotate-90"
          width={config.ring}
          height={config.ring}
        >
          {/* Background circle */}
          <circle
            cx={config.ring / 2}
            cy={config.ring / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.stroke}
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx={config.ring / 2}
            cy={config.ring / 2}
            r={radius}
            fill="none"
            strokeWidth={config.stroke}
            strokeLinecap="round"
            className={cn("transition-all duration-1000", getProgressColor())}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>

        {/* Time display in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold text-gray-800", config.fontSize)}>
            {formatTime(timeRemaining)}
          </span>
          {isComplete && (
            <span className="text-sm font-medium text-green-600">Done!</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!isRunning ? (
          <Button onClick={handleStart} size="sm" className="gap-1.5">
            <Play className="w-3.5 h-3.5" />
            {isComplete ? "Restart" : timeRemaining < durationSeconds ? "Resume" : "Start"}
          </Button>
        ) : (
          <Button onClick={handlePause} variant="outline" size="sm" className="gap-1.5">
            <Pause className="w-3.5 h-3.5" />
            Pause
          </Button>
        )}
        <Button onClick={handleReset} variant="outline" size="sm" className="gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </Button>
      </div>
    </div>
  );
}

export default TimerWidget;
