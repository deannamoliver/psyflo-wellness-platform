"use client";

import {
  Dumbbell,
  Home,
  MessageCircle,
  PenLine,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/tailwind-utils";

const TABS = [
  { href: "/dashboard/student/home", label: "Home", icon: Home },
  { href: "/dashboard/student/exercises", label: "Exercises", icon: Dumbbell },
  { href: "/dashboard/student/chat", label: "Chat", icon: MessageCircle, highlight: true },
  { href: "/dashboard/student/journal", label: "Journal", icon: PenLine },
] as const;

const HIDDEN_PATTERNS = [
  "/dashboard/student/check-in",
  "/dashboard/student/wellness-check",
  "/dashboard/student/toolbox/cbt-exercises/thought-flip",
  "/dashboard/student/toolbox/cbt-exercises/mood-boost",
];

export default function BottomTabNav() {
  const pathname = usePathname();

  const shouldHide = HIDDEN_PATTERNS.some((p) => pathname.startsWith(p));
  if (shouldHide) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white/98 backdrop-blur-lg lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-1 pb-[env(safe-area-inset-bottom)] pt-1">
        {TABS.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          const isHighlight = "highlight" in tab && tab.highlight;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all",
                isActive
                  ? "text-blue-600"
                  : "text-gray-400 active:text-gray-500",
              )}
            >
              {isHighlight ? (
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full -mt-3 shadow-md transition-all",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gradient-to-b from-blue-500 to-blue-600 text-white",
                )}>
                  <Icon className="h-5 w-5" />
                </div>
              ) : (
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive && "stroke-[2.5]",
                  )}
                />
              )}
              <span className={cn(
                "text-[10px]",
                isActive ? "font-semibold" : "font-medium",
                isHighlight && "-mt-0.5",
              )}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
