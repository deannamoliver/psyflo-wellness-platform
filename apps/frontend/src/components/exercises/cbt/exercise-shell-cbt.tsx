"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";

interface ExerciseShellCbtProps {
  children: React.ReactNode;
  totalScreens: number;
  currentScreen: number;
  onExit: () => void;
  primaryColor: "violet" | "teal";
}

const COLOR_MAP = {
  violet: {
    dot: "bg-violet-600",
    dotInactive: "bg-violet-200",
  },
  teal: {
    dot: "bg-teal-600",
    dotInactive: "bg-teal-200",
  },
};

export function ExerciseShellCbt({
  children,
  totalScreens,
  currentScreen,
  onExit,
  primaryColor,
}: ExerciseShellCbtProps) {
  const colors = COLOR_MAP[primaryColor];
  const [direction, setDirection] = useState<"left" | "right">("left");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevScreen = useRef(currentScreen);

  useEffect(() => {
    if (currentScreen !== prevScreen.current) {
      setDirection(currentScreen > prevScreen.current ? "left" : "right");
      setIsTransitioning(true);
      prevScreen.current = currentScreen;
      const timer = setTimeout(() => setIsTransitioning(false), 20);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={onExit}
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalScreens }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                i <= currentScreen ? colors.dot : colors.dotInactive,
                i === currentScreen && "scale-125",
              )}
            />
          ))}
        </div>

        <div className="h-10 w-10" />
      </div>

      {/* Content area with slide transition */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 flex flex-col",
            isTransitioning
              ? direction === "left"
                ? "translate-x-[100%]"
                : "translate-x-[-100%]"
              : "translate-x-0 transition-transform duration-300 ease-out",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
