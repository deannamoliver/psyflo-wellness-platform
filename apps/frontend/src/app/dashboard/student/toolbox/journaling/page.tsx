"use client";

import { ArrowLeft, BookOpen, Calendar, ChevronRight, Plus, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";

const JOURNAL_PROMPTS = [
  "What are three things you're grateful for today?",
  "How are you feeling right now, and why?",
  "What's one thing you'd like to accomplish this week?",
  "Describe a moment that made you smile recently.",
  "What's something you're looking forward to?",
  "What's a challenge you're facing, and how might you overcome it?",
];

const PAST_ENTRIES = [
  {
    id: "1",
    date: "Today",
    preview: "Feeling grateful for the sunny weather and...",
    mood: "happy",
  },
  {
    id: "2",
    date: "Yesterday",
    preview: "Had a challenging day but managed to...",
    mood: "okay",
  },
  {
    id: "3",
    date: "Mar 7",
    preview: "Spent time with friends and felt really...",
    mood: "great",
  },
];

const MOOD_COLORS = {
  great: "bg-emerald-100 text-emerald-600",
  happy: "bg-cyan-100 text-cyan-600",
  okay: "bg-yellow-100 text-yellow-600",
  sad: "bg-blue-100 text-blue-600",
  stressed: "bg-pink-100 text-pink-600",
};

export default function JournalingPage() {
  const [isWriting, setIsWriting] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const randomPrompt: string = JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)] ?? JOURNAL_PROMPTS[0] ?? "";

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-pink-500">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-xl">Journaling</h1>
            <p className="text-gray-500 text-sm">Express your thoughts and feelings</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto max-w-4xl">
          {isWriting ? (
            /* Writing View */
            <div>
              <button
                onClick={() => setIsWriting(false)}
                className="mb-6 flex items-center gap-2 text-gray-500 text-sm hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4" /> Back to journal
              </button>

              <div className="rounded-2xl bg-white p-8 shadow-sm">
                {/* Date */}
                <div className="mb-6 flex items-center gap-2 text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {/* Mood Selection */}
                <div className="mb-6">
                  <p className="mb-3 font-medium text-gray-700">How are you feeling?</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(MOOD_COLORS).map(([mood, colors]) => (
                      <button
                        key={mood}
                        onClick={() => setSelectedMood(mood)}
                        className={cn(
                          "rounded-full px-4 py-2 font-medium text-sm capitalize transition-all",
                          colors,
                          selectedMood === mood && "ring-2 ring-offset-2 ring-gray-400"
                        )}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt Suggestion */}
                {!selectedPrompt && (
                  <div className="mb-6 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-orange-500" />
                      <span className="font-medium text-orange-700 text-sm">Writing Prompt</span>
                    </div>
                    <p className="mb-3 text-gray-700">{randomPrompt}</p>
                    <button
                      onClick={() => setSelectedPrompt(randomPrompt)}
                      className="text-orange-600 text-sm hover:underline"
                    >
                      Use this prompt →
                    </button>
                  </div>
                )}

                {selectedPrompt && (
                  <div className="mb-4 rounded-xl bg-orange-50 p-3">
                    <p className="text-gray-700 text-sm italic">"{selectedPrompt}"</p>
                  </div>
                )}

                {/* Text Area */}
                <textarea
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  placeholder="Start writing your thoughts..."
                  className="mb-6 h-64 w-full resize-none rounded-xl border border-gray-200 p-4 text-gray-700 placeholder-gray-400 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                />

                {/* Save Button */}
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-400 to-pink-500 py-4 font-semibold text-white transition-colors hover:from-orange-500 hover:to-pink-600">
                  <Save className="h-5 w-5" />
                  Save Entry
                </button>
              </div>
            </div>
          ) : (
            /* Journal Home */
            <div>
              {/* New Entry Card */}
              <button
                onClick={() => setIsWriting(true)}
                className="mb-6 flex w-full items-center gap-4 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 p-6 text-left text-white shadow-lg transition-transform hover:scale-[1.01]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                  <Plus className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="font-bold text-xl">New Journal Entry</h2>
                  <p className="text-white/80">Start writing your thoughts for today</p>
                </div>
                <ChevronRight className="ml-auto h-6 w-6" />
              </button>

              {/* Writing Prompts */}
              <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-500" />
                  <h3 className="font-bold text-gray-900">Writing Prompts</h3>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {JOURNAL_PROMPTS.slice(0, 4).map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedPrompt(prompt);
                        setIsWriting(true);
                      }}
                      className="rounded-xl border border-orange-100 bg-orange-50 p-4 text-left text-gray-700 text-sm transition-all hover:bg-orange-100"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Past Entries */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-bold text-gray-900">Recent Entries</h3>
                <div className="space-y-3">
                  {PAST_ENTRIES.map((entry) => (
                    <button
                      key={entry.id}
                      className="flex w-full items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 text-left transition-all hover:bg-gray-100"
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          MOOD_COLORS[entry.mood as keyof typeof MOOD_COLORS]
                        )}
                      >
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{entry.date}</p>
                        <p className="text-gray-500 text-sm">{entry.preview}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
