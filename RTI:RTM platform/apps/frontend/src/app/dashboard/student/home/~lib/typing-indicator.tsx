"use client";

import { cn } from "@/lib/tailwind-utils";

type TypingIndicatorProps = {
  className?: string;
  dotClassName?: string;
};

const DOTS = [0, 1, 2];

export function TypingIndicator({
  className,
  dotClassName,
}: TypingIndicatorProps) {
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="status"
      aria-label="Assistant is typing"
    >
      {DOTS.map((index) => (
        <span
          key={index}
          className={cn("typing-dot", dotClassName)}
          style={{ animationDelay: `${index * 0.15}s` }}
        />
      ))}
    </div>
  );
}
