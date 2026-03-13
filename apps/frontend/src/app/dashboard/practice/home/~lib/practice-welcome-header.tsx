"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/tailwind-utils";

type ViewMode = "weekly" | "quarterly";

type School = {
  id: string;
  name: string;
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Inspirational quotes for practice managers
const quotes = [
  {
    text: "The curious paradox is that when I accept myself just as I am, then I can change.",
    author: "Carl Rogers",
  },
  {
    text: "Out of your vulnerabilities will come your strength.",
    author: "Sigmund Freud",
  },
  {
    text: "Between stimulus and response there is a space. In that space is our power to choose our response.",
    author: "Viktor Frankl",
  },
  {
    text: "The good life is a process, not a state of being.",
    author: "Carl Rogers",
  },
];

function getQuoteOfTheDay() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  return quotes[dayOfYear % quotes.length];
}

function generateWeekOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 156; i++) {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);
    const fmt = (d: Date) =>
      `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
    const year = weekEnd.getFullYear();
    options.push({
      value: `w-${i}`,
      label: `${fmt(weekStart)} – ${fmt(weekEnd)}, ${year}`,
    });
  }
  return options;
}

function generateQuarterOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);
  for (let i = 0; i < 12; i++) {
    let q = currentQuarter - (i % 4);
    let y = currentYear - Math.floor(i / 4);
    if (q <= 0) {
      q += 4;
      y -= 1;
    }
    options.push({
      value: `q${q}-${y}`,
      label: `Q${q} ${y}`,
    });
  }
  return options;
}

export function PracticeWelcomeHeader({
  name,
  schools,
  currentSchoolId,
}: {
  name: string;
  schools: School[];
  currentSchoolId: string;
}) {
  const weekOptions = useMemo(() => generateWeekOptions(), []);
  const quarterOptions = useMemo(() => generateQuarterOptions(), []);

  const [viewMode, setViewMode] = useState<ViewMode>("quarterly");
  const [selectedWeek, setSelectedWeek] = useState("w-0");
  const [selectedQuarter, setSelectedQuarter] = useState(() => quarterOptions[0]?.value ?? "q1-2026");
  const [selectedSchool, setSelectedSchool] = useState(currentSchoolId);

  const currentPeriodLabel = viewMode === "weekly"
    ? weekOptions.find((w) => w.value === selectedWeek)?.label ?? "This Week"
    : quarterOptions.find((q) => q.value === selectedQuarter)?.label ?? "This Quarter";

  const currentSchoolName = schools.find((s) => s.id === selectedSchool)?.name ?? schools[0]?.name ?? "All Locations";

  const now = new Date();
  const quote = getQuoteOfTheDay();

  return (
    <div className="space-y-4">
      {/* Welcome Header with Location */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <h1 className="scroll-m-20 py-2 font-semibold text-3xl text-gray-900 tracking-tight first:mt-0">
            Welcome Back, {name}
          </h1>
          <p className="text-muted-foreground leading-5">
            "{quote?.text}" - {quote?.author}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 font-medium text-base text-muted-foreground leading-5">
            {schools.length > 1 ? (
              <div className="relative">
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="appearance-none bg-transparent pr-6 text-right font-medium text-base text-gray-900 outline-none cursor-pointer"
                >
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
              </div>
            ) : (
              <span className="font-medium text-base text-gray-900">{currentSchoolName}</span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">{formatDate(now)}</p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {(["weekly", "quarterly"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setViewMode(m)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
                viewMode === m
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50",
              )}
            >
              {m === "weekly" ? "Weekly" : "Quarterly"}
            </button>
          ))}
        </div>

        {viewMode === "weekly" ? (
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-900 text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
          >
            {weekOptions.map((w) => (
              <option key={w.value} value={w.value}>{w.label}</option>
            ))}
          </select>
        ) : (
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-900 text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
          >
            {quarterOptions.map((q) => (
              <option key={q.value} value={q.value}>{q.label}</option>
            ))}
          </select>
        )}

        <p className="ml-auto text-gray-400 text-sm">
          Showing data for <span className="font-medium text-gray-600">{currentPeriodLabel}</span>
        </p>
      </div>
    </div>
  );
}
