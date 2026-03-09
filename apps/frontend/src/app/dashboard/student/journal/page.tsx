"use client";

import {
  ArrowLeft,
  BookOpen,
  Lightbulb,
  Loader2,
  PenLine,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import { saveJournalEntry } from "./~lib/journal-actions";

// ─── Sentiment Analysis ──────────────────────────────────────────────

type SentimentResult = {
  label: "positive" | "negative" | "neutral" | "mixed";
  score: number;
  emotions: { name: string; intensity: number }[];
  summary: string;
};

const POSITIVE_WORDS = new Set([
  "happy","glad","grateful","thankful","hopeful","excited","proud",
  "calm","peaceful","relaxed","confident","strong","motivated",
  "inspired","joyful","content","satisfied","accomplished","loved",
  "supported","safe","comfortable","optimistic","energized","better",
  "good","great","wonderful","amazing","awesome","fantastic",
  "beautiful","kind","gentle","warm","bright","progress","growth",
  "healing","improving","learning","courage","brave","resilient",
]);

const NEGATIVE_WORDS = new Set([
  "sad","angry","anxious","worried","scared","afraid","lonely",
  "hopeless","helpless","worthless","guilty","ashamed","frustrated",
  "overwhelmed","stressed","exhausted","tired","drained","numb",
  "empty","lost","confused","hurt","pain","suffering","terrible",
  "awful","horrible","bad","worse","worst","hate","ugly","stupid",
  "failure","broken","trapped","stuck","panic","depressed",
  "miserable","disgusted","irritated","furious","devastated",
]);

const EMOTION_PATTERNS: { pattern: RegExp; emotion: string; valence: "positive" | "negative" }[] = [
  { pattern: /\b(anxious|anxiety|worried|worry|nervous|panic)\b/gi, emotion: "Anxiety", valence: "negative" },
  { pattern: /\b(sad|sadness|crying|tears|grief|mourning|loss)\b/gi, emotion: "Sadness", valence: "negative" },
  { pattern: /\b(angry|anger|furious|rage|irritated|mad)\b/gi, emotion: "Anger", valence: "negative" },
  { pattern: /\b(happy|joy|joyful|excited|thrilled|delighted)\b/gi, emotion: "Joy", valence: "positive" },
  { pattern: /\b(grateful|thankful|appreciation|blessed)\b/gi, emotion: "Gratitude", valence: "positive" },
  { pattern: /\b(calm|peaceful|serene|relaxed|tranquil)\b/gi, emotion: "Calm", valence: "positive" },
  { pattern: /\b(proud|accomplished|achievement|success)\b/gi, emotion: "Pride", valence: "positive" },
  { pattern: /\b(overwhelmed|stressed|burnout|exhausted|drained)\b/gi, emotion: "Overwhelm", valence: "negative" },
];

function analyzeSentiment(text: string): SentimentResult {
  if (!text.trim()) return { label: "neutral", score: 0, emotions: [], summary: "" };
  const words = text.toLowerCase().split(/\s+/);
  let pos = 0, neg = 0;
  for (const w of words) {
    const c = w.replace(/[^a-z]/g, "");
    if (POSITIVE_WORDS.has(c)) pos++;
    if (NEGATIVE_WORDS.has(c)) neg++;
  }
  const detected: { name: string; intensity: number; valence: "positive"|"negative" }[] = [];
  for (const { pattern, emotion, valence } of EMOTION_PATTERNS) {
    const m = text.match(pattern);
    if (m?.length) detected.push({ name: emotion, intensity: Math.min(m.length / 3, 1), valence });
  }
  const total = pos + neg;
  let label: SentimentResult["label"];
  let score: number;
  if (total === 0) { label = "neutral"; score = 0; }
  else if (pos > 0 && neg > 0 && Math.abs(pos - neg) <= 1) { label = "mixed"; score = (pos - neg) / total; }
  else if (pos > neg) { label = "positive"; score = pos / total; }
  else { label = "negative"; score = -(neg / total); }
  const emotions = detected.sort((a, b) => b.intensity - a.intensity).slice(0, 4).map(({ name, intensity }) => ({ name, intensity }));
  let summary = "";
  if (label === "positive") summary = "Your writing reflects positive emotions and resilience.";
  else if (label === "negative") summary = "Your writing suggests some difficult feelings. Remember, acknowledging them is the first step.";
  else if (label === "mixed") summary = "Your entry shows a mix of emotions — that's completely normal and healthy.";
  else summary = "Keep writing to help identify and process your feelings.";
  return { label, score, emotions, summary };
}

// ─── Types ───────────────────────────────────────────────────────────

type JournalPrompt = {
  id: string;
  text: string;
  category: "reflection" | "gratitude" | "cbt" | "dbt" | "growth" | "emotion";
  categoryLabel: string;
};

type JournalEntry = {
  id: string;
  text: string;
  prompt: JournalPrompt | null;
  sentiment: SentimentResult;
  createdAt: string;
};

const JOURNAL_PROMPTS: JournalPrompt[] = [
  { id: "r1", text: "What's one thing that happened today that you want to remember?", category: "reflection", categoryLabel: "Reflection" },
  { id: "r2", text: "If you could describe your day in three words, what would they be and why?", category: "reflection", categoryLabel: "Reflection" },
  { id: "g1", text: "Name three things you're grateful for right now, no matter how small.", category: "gratitude", categoryLabel: "Gratitude" },
  { id: "g2", text: "Who is someone that made your day better recently? What did they do?", category: "gratitude", categoryLabel: "Gratitude" },
  { id: "c1", text: "What negative thought kept coming back today? Can you find evidence for and against it?", category: "cbt", categoryLabel: "Thought Check" },
  { id: "c2", text: "Describe a situation that upset you. What were you thinking? What's another way to see it?", category: "cbt", categoryLabel: "Thought Check" },
  { id: "d1", text: "Right now, what does your Wise Mind know that your Emotion Mind might be ignoring?", category: "dbt", categoryLabel: "Mindful Check" },
  { id: "d2", text: "What emotion are you feeling right now? Where do you feel it in your body?", category: "dbt", categoryLabel: "Mindful Check" },
  { id: "gr1", text: "What's one small step you took today toward a goal that matters to you?", category: "growth", categoryLabel: "Growth" },
  { id: "e1", text: "If your current emotion had a color and shape, what would it look like?", category: "emotion", categoryLabel: "Emotion" },
  { id: "e2", text: "What emotion surprised you today? What triggered it?", category: "emotion", categoryLabel: "Emotion" },
  { id: "e3", text: "Write a letter to your future self about how you're feeling right now.", category: "emotion", categoryLabel: "Emotion" },
];

const CATEGORY_COLORS: Record<string, string> = {
  reflection: "bg-blue-100 text-blue-700",
  gratitude: "bg-emerald-100 text-emerald-700",
  cbt: "bg-violet-100 text-violet-700",
  dbt: "bg-purple-100 text-purple-700",
  growth: "bg-amber-100 text-amber-700",
  emotion: "bg-pink-100 text-pink-700",
};

const SENTIMENT_CONFIG = {
  positive: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: "😊", barColor: "bg-emerald-400" },
  negative: { color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", icon: "😔", barColor: "bg-rose-400" },
  mixed: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: "🤔", barColor: "bg-amber-400" },
  neutral: { color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200", icon: "😐", barColor: "bg-gray-400" },
};

function SentimentBadge({ sentiment }: { sentiment: SentimentResult }) {
  const config = SENTIMENT_CONFIG[sentiment.label];
  return (
    <div className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1", config.bg, config.border)}>
      <span className="text-sm">{config.icon}</span>
      <span className={cn("text-xs font-medium capitalize", config.color)}>{sentiment.label}</span>
    </div>
  );
}

function SentimentPanel({ sentiment }: { sentiment: SentimentResult }) {
  if (sentiment.label === "neutral" && sentiment.emotions.length === 0) return null;
  const config = SENTIMENT_CONFIG[sentiment.label];
  return (
    <div className={cn("rounded-xl border p-3 space-y-2", config.bg, config.border)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className={cn("h-3.5 w-3.5", config.color)} />
          <span className={cn("text-xs font-semibold", config.color)}>Sentiment Analysis</span>
        </div>
        <SentimentBadge sentiment={sentiment} />
      </div>
      {sentiment.emotions.length > 0 && (
        <div className="space-y-1.5">
          {sentiment.emotions.map((emotion) => (
            <div key={emotion.name} className="flex items-center gap-2">
              <span className="text-[10px] w-20 text-gray-600 truncate">{emotion.name}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/60">
                <div className={cn("h-full rounded-full transition-all", config.barColor)} style={{ width: `${Math.max(emotion.intensity * 100, 15)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-[11px] text-gray-600 leading-relaxed">{sentiment.summary}</p>
    </div>
  );
}

// ─── Main Journal Page ───────────────────────────────────────────────

export default function JournalPage() {
  const [journalText, setJournalText] = useState("");
  const [activePrompt, setActivePrompt] = useState<JournalPrompt | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("feelwell_journal_entries");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);

  const currentPrompt = JOURNAL_PROMPTS[promptIndex % JOURNAL_PROMPTS.length]!;
  const sentiment = useMemo(() => analyzeSentiment(journalText), [journalText]);

  const todayEntryCount = useMemo(() => {
    const today = new Date().toDateString();
    return entries.filter((e) => new Date(e.createdAt).toDateString() === today).length;
  }, [entries]);

  useEffect(() => {
    try { localStorage.setItem("feelwell_journal_entries", JSON.stringify(entries.slice(0, 50))); } catch {}
  }, [entries]);

  const handleNewPrompt = useCallback(() => setPromptIndex((p) => p + 1), []);
  const handleSelectPrompt = useCallback((prompt: JournalPrompt) => { setActivePrompt(prompt); setJournalText(""); }, []);

  const handleSaveEntry = useCallback(() => {
    if (!journalText.trim()) return;
    setIsSaving(true);
    const sentimentResult = analyzeSentiment(journalText);
    const newEntry: JournalEntry = {
      id: `journal-${Date.now()}`,
      text: journalText.trim(),
      prompt: activePrompt,
      sentiment: sentimentResult,
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [newEntry, ...prev]);
    // Also persist to backend (once journal_entries table exists)
    saveJournalEntry({
      text: journalText.trim(),
      promptText: activePrompt?.text ?? null,
      promptCategory: activePrompt?.category ?? null,
      sentimentLabel: sentimentResult.label,
      sentimentScore: sentimentResult.score,
      emotions: sentimentResult.emotions,
      wordCount: journalText.trim().split(/\s+/).length,
    }).catch(() => { /* localStorage is the fallback */ });
    setJournalText("");
    setActivePrompt(null);
    setTimeout(() => setIsSaving(false), 500);
  }, [journalText, activePrompt]);

  const sentimentTrend = useMemo(() => {
    const recent = entries.slice(0, 7);
    if (recent.length === 0) return null;
    const avg = recent.map((e) => e.sentiment.score).reduce((a, b) => a + b, 0) / recent.length;
    if (avg > 0.2) return { label: "Trending positive", color: "text-emerald-600", bg: "bg-emerald-50" };
    if (avg < -0.2) return { label: "Needs attention", color: "text-rose-600", bg: "bg-rose-50" };
    return { label: "Balanced", color: "text-amber-600", bg: "bg-amber-50" };
  }, [entries]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-lg px-4 py-6 space-y-5">

        {/* ─── Header ─── */}
        <div>
          <Link href="/dashboard/student/home" className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-xl text-gray-900">My Journal</h1>
            {todayEntryCount > 0 && (
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                {todayEntryCount} today
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            A safe space to reflect and process your thoughts
          </p>
        </div>

        {/* ─── Sentiment Trend ─── */}
        {sentimentTrend && entries.length >= 3 && (
          <div className={cn("rounded-2xl p-4 border", sentimentTrend.bg, sentimentTrend.color === "text-emerald-600" ? "border-emerald-200" : sentimentTrend.color === "text-rose-600" ? "border-rose-200" : "border-amber-200")}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className={cn("h-4 w-4", sentimentTrend.color)} />
              <span className={cn("text-sm font-semibold", sentimentTrend.color)}>{sentimentTrend.label}</span>
            </div>
            <div className="flex items-end gap-1 h-8">
              {entries.slice(0, 14).reverse().map((entry) => {
                const height = Math.abs(entry.sentiment.score) * 100;
                const isPositive = entry.sentiment.score >= 0;
                return (
                  <div key={entry.id} className="flex-1 flex flex-col justify-end">
                    <div
                      className={cn("w-full rounded-t-sm min-h-[2px]", isPositive ? "bg-emerald-400" : "bg-rose-400")}
                      style={{ height: `${Math.max(height, 10)}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── AI Prompt Card ─── */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold text-gray-700">Today's Prompt</span>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", CATEGORY_COLORS[currentPrompt.category])}>
                {currentPrompt.categoryLabel}
              </span>
            </div>
            <button type="button" onClick={handleNewPrompt} className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-100 transition-colors">
              <RefreshCw className="h-3 w-3" /> New
            </button>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            {activePrompt ? activePrompt.text : currentPrompt.text}
          </p>
          {!activePrompt && (
            <div className="flex gap-2">
              <button type="button" onClick={() => handleSelectPrompt(currentPrompt)} className="flex items-center gap-1.5 rounded-xl bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition-colors">
                <PenLine className="h-3.5 w-3.5" /> Write about this
              </button>
              <button type="button" onClick={() => { setActivePrompt(null); setJournalText(""); }} className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                <BookOpen className="h-3.5 w-3.5" /> Free write
              </button>
            </div>
          )}
        </div>

        {/* ─── Writing Area ─── */}
        {(activePrompt !== null || journalText.length > 0) && (
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 space-y-4">
            {activePrompt && (
              <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3">
                <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">{activePrompt.text}</p>
              </div>
            )}
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder={activePrompt ? "Start writing your thoughts..." : "What's on your mind today?"}
              className="w-full resize-none rounded-xl border border-gray-200 p-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all min-h-[160px]"
              rows={7}
            />
            {journalText.length > 20 && <SentimentPanel sentiment={sentiment} />}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-gray-400">{journalText.length} characters</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setActivePrompt(null); setJournalText(""); }} className="rounded-xl px-4 py-2 text-xs text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                <button type="button" onClick={handleSaveEntry} disabled={!journalText.trim() || isSaving} className="flex items-center gap-1.5 rounded-xl bg-blue-500 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── More Prompts ─── */}
        {activePrompt === null && journalText.length === 0 && (
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">More Prompts</p>
            <div className="space-y-2">
              {JOURNAL_PROMPTS.slice(1, 5).map((prompt) => (
                <button key={prompt.id} type="button" onClick={() => handleSelectPrompt(prompt)} className="flex w-full items-start gap-2.5 rounded-xl border border-gray-100 p-3 text-left hover:border-blue-200 hover:bg-blue-50/50 transition-all">
                  <span className={cn("mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold", CATEGORY_COLORS[prompt.category])}>{prompt.categoryLabel}</span>
                  <span className="text-xs text-gray-600 leading-relaxed">{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Journal History ─── */}
        {entries.length > 0 && (
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">History</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">{entries.length}</span>
            </div>
            <div className="space-y-4">
              {entries.slice(0, 10).map((entry) => (
                <div key={entry.id} className="border-t border-gray-100 pt-3 first:border-0 first:pt-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-gray-400">
                      {new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </span>
                    <SentimentBadge sentiment={entry.sentiment} />
                  </div>
                  {entry.prompt && (
                    <p className="text-[10px] text-blue-500 mb-1 italic">Prompt: {entry.prompt.text.slice(0, 60)}...</p>
                  )}
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{entry.text}</p>
                </div>
              ))}
              {entries.length > 10 && (
                <p className="text-center text-[11px] text-gray-400">+ {entries.length - 10} more entries</p>
              )}
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}
