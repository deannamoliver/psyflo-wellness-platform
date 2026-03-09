"use client";

import { cn } from "@/lib/tailwind-utils";

export function Filters({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)} />
  );
}
