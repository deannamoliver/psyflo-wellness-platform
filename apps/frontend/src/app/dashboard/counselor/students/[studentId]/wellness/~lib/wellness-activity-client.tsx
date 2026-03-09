"use client";

import {
  BookOpen,
  Heart,
  Music,
  Wind,
} from "lucide-react";
import { cn } from "@/lib/tailwind-utils";

// ─── Types ──────────────────────────────────────────────────────────

type JournalEntry = {
  id: string;
  date: string;
  category: string;
  sentiment: "positive" | "neutral" | "negative";
};

type BreathingSession = {
  id: string;
  date: string;
  duration: string;
  type: string;
};

type MeditationSession = {
  id: string;
  date: string;
  duration: string;
  type: string;
};

// ─── Mock Data ──────────────────────────────────────────────────────

const MOCK_JOURNAL_ENTRIES: JournalEntry[] = [
  { id: "j1", date: "2026-03-08", category: "Gratitude", sentiment: "positive" },
  { id: "j2", date: "2026-03-07", category: "Reflection", sentiment: "neutral" },
  { id: "j3", date: "2026-03-05", category: "Goals", sentiment: "positive" },
  { id: "j4", date: "2026-03-03", category: "Challenges", sentiment: "negative" },
  { id: "j5", date: "2026-03-01", category: "Gratitude", sentiment: "positive" },
];

const MOCK_BREATHING_SESSIONS: BreathingSession[] = [
  { id: "b1", date: "2026-03-08", duration: "5 min", type: "Box Breathing" },
  { id: "b2", date: "2026-03-07", duration: "3 min", type: "4-7-8 Breathing" },
  { id: "b3", date: "2026-03-06", duration: "5 min", type: "Box Breathing" },
  { id: "b4", date: "2026-03-04", duration: "4 min", type: "Deep Breathing" },
];

const MOCK_MEDITATION_SESSIONS: MeditationSession[] = [
  { id: "m1", date: "2026-03-08", duration: "10 min", type: "Guided Meditation" },
  { id: "m2", date: "2026-03-06", duration: "15 min", type: "Body Scan" },
  { id: "m3", date: "2026-03-04", duration: "10 min", type: "Mindfulness" },
  { id: "m4", date: "2026-03-02", duration: "5 min", type: "Calming Music" },
];

// ─── Component ──────────────────────────────────────────────────────

type WellnessActivityClientProps = {
  studentId: string;
  showSummaryOnly?: boolean;
  showActivitiesOnly?: boolean;
};

export function WellnessActivityClient({ studentId: _studentId, showSummaryOnly, showActivitiesOnly }: WellnessActivityClientProps) {
  const getSentimentColor = (sentiment: JournalEntry["sentiment"]) => {
    switch (sentiment) {
      case "positive":
        return "bg-emerald-100 text-emerald-700";
      case "neutral":
        return "bg-gray-100 text-gray-600";
      case "negative":
        return "bg-amber-100 text-amber-700";
    }
  };

  // Self-Care Engagement Summary Card
  const SummaryCard = () => (
    <div className="rounded-xl border bg-white h-full">
      <div className="flex items-center gap-2 border-b px-5 py-4">
        <Heart className="h-5 w-5 text-pink-500" />
        <h3 className="text-sm font-semibold text-gray-900">Self-Care Engagement Summary</h3>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Journal Entries", count: MOCK_JOURNAL_ENTRIES.length, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Breathing Sessions", count: MOCK_BREATHING_SESSIONS.length, color: "text-cyan-600", bg: "bg-cyan-50" },
            { label: "Meditation Sessions", count: MOCK_MEDITATION_SESSIONS.filter(s => !s.type.includes("Music")).length, color: "text-pink-600", bg: "bg-pink-50" },
            { label: "Music Sessions", count: MOCK_MEDITATION_SESSIONS.filter(s => s.type.includes("Music")).length, color: "text-violet-600", bg: "bg-violet-50" },
          ].map((item) => (
            <div key={item.label} className={cn("rounded-lg p-4", item.bg)}>
              <p className="text-2xl font-bold text-gray-900">{item.count}</p>
              <p className={cn("text-xs font-medium", item.color)}>{item.label}</p>
              <p className="text-[10px] text-gray-400 mt-1">This billing period</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // If showing summary only, just return the summary card
  if (showSummaryOnly) {
    return <SummaryCard />;
  }

  // Activities section (journaling, breathing, meditation)
  const ActivitiesSection = () => (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Journaling Entries */}
      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-900">Journal Entries</h3>
          </div>
          <span className="text-xs text-gray-400">{MOCK_JOURNAL_ENTRIES.length}</span>
        </div>
        <div className="divide-y max-h-[250px] overflow-y-auto">
          {MOCK_JOURNAL_ENTRIES.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{entry.category}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", getSentimentColor(entry.sentiment))}>
                {entry.sentiment}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Breathing Exercises */}
      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-cyan-500" />
            <h3 className="text-sm font-semibold text-gray-900">Breathing Exercises</h3>
          </div>
          <span className="text-xs text-gray-400">{MOCK_BREATHING_SESSIONS.length}</span>
        </div>
        <div className="divide-y max-h-[250px] overflow-y-auto">
          {MOCK_BREATHING_SESSIONS.map((session) => (
            <div key={session.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50">
                  <Wind className="h-4 w-4 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{session.type}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(session.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-medium text-cyan-700">
                {session.duration}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Meditation & Music */}
      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-pink-500" />
            <h3 className="text-sm font-semibold text-gray-900">Meditation & Music</h3>
          </div>
          <span className="text-xs text-gray-400">{MOCK_MEDITATION_SESSIONS.length}</span>
        </div>
        <div className="divide-y max-h-[250px] overflow-y-auto">
          {MOCK_MEDITATION_SESSIONS.map((session) => (
            <div key={session.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50">
                  {session.type.includes("Music") ? (
                    <Music className="h-4 w-4 text-pink-600" />
                  ) : (
                    <Heart className="h-4 w-4 text-pink-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{session.type}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(session.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-medium text-pink-700">
                {session.duration}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // If showing activities only
  if (showActivitiesOnly) {
    return <ActivitiesSection />;
  }

  // Default: show everything
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SummaryCard />
      </div>
      <ActivitiesSection />
    </div>
  );
}
