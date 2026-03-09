"use client";

import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Loader2,
  PenLine,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import type { MoodName } from "./sidebar-data";

// ─── Sentiment Analysis (Client-Side) ───────────────────────────────

type SentimentResult = {
  label: "positive" | "negative" | "neutral" | "mixed";
  score: number;
  emotions: { name: string; intensity: number }[];
  summary: string;
};

const POSITIVE_WORDS = new Set([
  "happy", "glad", "grateful", "thankful", "hopeful", "excited", "proud",
  "calm", "peaceful", "relaxed", "confident", "strong", "motivated",
  "inspired", "joyful", "content", "satisfied", "accomplished", "loved",
  "supported", "safe", "comfortable", "optimistic", "energized", "better",
  "good", "great", "wonderful", "amazing", "awesome", "fantastic",
  "beautiful", "kind", "gentle", "warm", "bright", "progress", "growth",
  "healing", "improving", "learning", "courage", "brave", "resilient",
]);

const NEGATIVE_WORDS = new Set([
  "sad", "angry", "anxious", "worried", "scared", "afraid", "lonely",
  "hopeless", "helpless", "worthless", "guilty", "ashamed", "frustrated",
  "overwhelmed", "stressed", "exhausted", "tired", "drained", "numb",
  "empty", "lost", "confused", "hurt", "pain", "suffering", "terrible",
  "awful", "horrible", "bad", "worse", "worst", "hate", "ugly", "stupid",
  "failure", "broken", "trapped", "stuck", "panic", "depressed",
  "miserable", "disgusted", "irritated", "furious", "devastated",
]);

const EMOTION_PATTERNS: { pattern: RegExp; emotion: string; valence: "positive" | "negative" }[] = [
  { pattern: /\b(anxious|anxiety|worried|worry|nervous|panic)\b/gi, emotion: "Anxiety", valence: "negative" },
  { pattern: /\b(sad|sadness|crying|tears|grief|mourning|loss)\b/gi, emotion: "Sadness", valence: "negative" },
  { pattern: /\b(angry|anger|furious|rage|irritated|mad)\b/gi, emotion: "Anger", valence: "negative" },
  { pattern: /\b(afraid|fear|scared|terrified|frightened)\b/gi, emotion: "Fear", valence: "negative" },
  { pattern: /\b(lonely|alone|isolated|abandoned)\b/gi, emotion: "Loneliness", valence: "negative" },
  { pattern: /\b(guilty|guilt|shame|ashamed|regret)\b/gi, emotion: "Guilt/Shame", valence: "negative" },
  { pattern: /\b(hopeless|helpless|worthless|despair)\b/gi, emotion: "Hopelessness", valence: "negative" },
  { pattern: /\b(happy|joy|joyful|excited|thrilled|delighted)\b/gi, emotion: "Joy", valence: "positive" },
  { pattern: /\b(grateful|thankful|appreciation|blessed)\b/gi, emotion: "Gratitude", valence: "positive" },
  { pattern: /\b(calm|peaceful|serene|relaxed|tranquil)\b/gi, emotion: "Calm", valence: "positive" },
  { pattern: /\b(proud|accomplished|achievement|success)\b/gi, emotion: "Pride", valence: "positive" },
  { pattern: /\b(hopeful|optimistic|looking forward|excited about)\b/gi, emotion: "Hope", valence: "positive" },
  { pattern: /\b(loved|love|cared|supported|connected)\b/gi, emotion: "Connection", valence: "positive" },
  { pattern: /\b(overwhelmed|stressed|burnout|exhausted|drained)\b/gi, emotion: "Overwhelm", valence: "negative" },
];

function analyzeSentiment(text: string): SentimentResult {
  if (!text.trim()) {
    return { label: "neutral", score: 0, emotions: [], summary: "" };
  }

  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of words) {
    const cleaned = word.replace(/[^a-z]/g, "");
    if (POSITIVE_WORDS.has(cleaned)) positiveCount++;
    if (NEGATIVE_WORDS.has(cleaned)) negativeCount++;
  }

  const detectedEmotions: { name: string; intensity: number; valence: "positive" | "negative" }[] = [];
  for (const { pattern, emotion, valence } of EMOTION_PATTERNS) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      detectedEmotions.push({
        name: emotion,
        intensity: Math.min(matches.length / 3, 1),
        valence,
      });
    }
  }

  const total = positiveCount + negativeCount;
  let label: SentimentResult["label"];
  let score: number;

  if (total === 0) {
    label = "neutral";
    score = 0;
  } else if (positiveCount > 0 && negativeCount > 0 && Math.abs(positiveCount - negativeCount) <= 1) {
    label = "mixed";
    score = (positiveCount - negativeCount) / total;
  } else if (positiveCount > negativeCount) {
    label = "positive";
    score = positiveCount / total;
  } else {
    label = "negative";
    score = -(negativeCount / total);
  }

  const emotions = detectedEmotions
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 4)
    .map(({ name, intensity }) => ({ name, intensity }));

  let summary = "";
  if (label === "positive") {
    summary = "Your writing reflects positive emotions and resilience.";
  } else if (label === "negative") {
    summary = "Your writing suggests some difficult feelings. Remember, acknowledging them is the first step.";
  } else if (label === "mixed") {
    summary = "Your entry shows a mix of emotions — that's completely normal and healthy.";
  } else {
    summary = "Keep writing to help identify and process your feelings.";
  }

  return { label, score, emotions, summary };
}

// ─── Sentiment Display ──────────────────────────────────────────────

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
      <span className={cn("text-xs font-medium capitalize", config.color)}>
        {sentiment.label}
      </span>
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
                <div
                  className={cn("h-full rounded-full transition-all", config.barColor)}
                  style={{ width: `${Math.max(emotion.intensity * 100, 15)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed">{sentiment.summary}</p>
    </div>
  );
}

// ─── AI Journal Prompts ─────────────────────────────────────────────

type JournalPrompt = {
  id: string;
  text: string;
  category: "reflection" | "gratitude" | "cbt" | "dbt" | "growth" | "emotion";
  categoryLabel: string;
};

const JOURNAL_PROMPTS: JournalPrompt[] = [
  // Reflection
  { id: "r1", text: "What's one thing that happened today that you want to remember?", category: "reflection", categoryLabel: "Reflection" },
  { id: "r2", text: "If you could describe your day in three words, what would they be and why?", category: "reflection", categoryLabel: "Reflection" },
  { id: "r3", text: "What's something you learned about yourself recently?", category: "reflection", categoryLabel: "Reflection" },
  { id: "r4", text: "What moment today made you feel most like yourself?", category: "reflection", categoryLabel: "Reflection" },

  // Gratitude
  { id: "g1", text: "Name three things you're grateful for right now, no matter how small.", category: "gratitude", categoryLabel: "Gratitude" },
  { id: "g2", text: "Who is someone that made your day better recently? What did they do?", category: "gratitude", categoryLabel: "Gratitude" },
  { id: "g3", text: "What's a simple pleasure you enjoyed today?", category: "gratitude", categoryLabel: "Gratitude" },

  // CBT-Informed
  { id: "c1", text: "What negative thought kept coming back today? Can you find evidence for and against it?", category: "cbt", categoryLabel: "Thought Check" },
  { id: "c2", text: "Describe a situation that upset you. What were you thinking? What's another way to see it?", category: "cbt", categoryLabel: "Thought Check" },
  { id: "c3", text: "What's a worry you have right now? On a scale of 1-10, how likely is it to actually happen?", category: "cbt", categoryLabel: "Thought Check" },
  { id: "c4", text: "Think of a time you predicted something bad would happen. Did it turn out as bad as you thought?", category: "cbt", categoryLabel: "Thought Check" },

  // DBT-Informed
  { id: "d1", text: "Right now, what does your Wise Mind know that your Emotion Mind might be ignoring?", category: "dbt", categoryLabel: "Mindful Check" },
  { id: "d2", text: "What emotion are you feeling right now? Where do you feel it in your body?", category: "dbt", categoryLabel: "Mindful Check" },
  { id: "d3", text: "Describe a moment today when you successfully managed a strong emotion. What skill did you use?", category: "dbt", categoryLabel: "Mindful Check" },
  { id: "d4", text: "What's one thing you're struggling to accept right now? What would radical acceptance look like?", category: "dbt", categoryLabel: "Mindful Check" },

  // Growth
  { id: "gr1", text: "What's one small step you took today toward a goal that matters to you?", category: "growth", categoryLabel: "Growth" },
  { id: "gr2", text: "What challenge are you facing right now? What strengths can you bring to it?", category: "growth", categoryLabel: "Growth" },
  { id: "gr3", text: "What would you tell your best friend if they were going through what you're going through?", category: "growth", categoryLabel: "Growth" },

  // Emotion Processing
  { id: "e1", text: "If your current emotion had a color and shape, what would it look like?", category: "emotion", categoryLabel: "Emotion" },
  { id: "e2", text: "What emotion surprised you today? What triggered it?", category: "emotion", categoryLabel: "Emotion" },
  { id: "e3", text: "Write a letter to your future self about how you're feeling right now.", category: "emotion", categoryLabel: "Emotion" },
];

function getMoodAwarePrompts(currentMood: MoodName | null): JournalPrompt[] {
  if (!currentMood) return JOURNAL_PROMPTS;

  const moodPromptWeights: Record<string, string[]> = {
    sad: ["cbt", "gratitude", "growth", "emotion"],
    angry: ["dbt", "reflection", "emotion"],
    afraid: ["cbt", "dbt", "growth"],
    lonely: ["gratitude", "reflection", "emotion"],
    bad: ["cbt", "dbt", "gratitude"],
    calm: ["reflection", "gratitude", "growth"],
    happy: ["gratitude", "reflection", "growth"],
    proud: ["reflection", "gratitude", "growth"],
    surprised: ["reflection", "emotion"],
    disgusted: ["dbt", "cbt", "emotion"],
  };

  const preferredCategories = moodPromptWeights[currentMood] ?? [];

  const sorted = [...JOURNAL_PROMPTS].sort((a, b) => {
    const aWeight = preferredCategories.includes(a.category) ? 0 : 1;
    const bWeight = preferredCategories.includes(b.category) ? 0 : 1;
    return aWeight - bWeight;
  });

  return sorted;
}

// ─── Journal Entry Type ─────────────────────────────────────────────

type JournalEntry = {
  id: string;
  text: string;
  prompt: JournalPrompt | null;
  sentiment: SentimentResult;
  createdAt: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  reflection: "bg-blue-100 text-blue-700",
  gratitude: "bg-emerald-100 text-emerald-700",
  cbt: "bg-violet-100 text-violet-700",
  dbt: "bg-purple-100 text-purple-700",
  growth: "bg-amber-100 text-amber-700",
  emotion: "bg-pink-100 text-pink-700",
};

// ─── Main Journal Component ─────────────────────────────────────────

export function JournalSection({ currentMood }: { currentMood: MoodName | null }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [activePrompt, setActivePrompt] = useState<JournalPrompt | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("feelwell_journal_entries");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);

  const moodPrompts = useMemo(() => getMoodAwarePrompts(currentMood), [currentMood]);
  const currentPrompt = moodPrompts[promptIndex % moodPrompts.length]!;

  const sentiment = useMemo(() => analyzeSentiment(journalText), [journalText]);

  const todayEntryCount = useMemo(() => {
    const today = new Date().toDateString();
    return entries.filter((e) => new Date(e.createdAt).toDateString() === today).length;
  }, [entries]);

  // Persist entries to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("feelwell_journal_entries", JSON.stringify(entries.slice(0, 50)));
    } catch {
      // Storage full or unavailable
    }
  }, [entries]);

  const handleNewPrompt = useCallback(() => {
    setPromptIndex((prev) => prev + 1);
  }, []);

  const handleSelectPrompt = useCallback((prompt: JournalPrompt) => {
    setActivePrompt(prompt);
    setJournalText("");
  }, []);

  const handleSaveEntry = useCallback(() => {
    if (!journalText.trim()) return;
    setIsSaving(true);

    const newEntry: JournalEntry = {
      id: `journal-${Date.now()}`,
      text: journalText.trim(),
      prompt: activePrompt,
      sentiment: analyzeSentiment(journalText),
      createdAt: new Date().toISOString(),
    };

    setEntries((prev) => [newEntry, ...prev]);
    setJournalText("");
    setActivePrompt(null);

    setTimeout(() => setIsSaving(false), 500);
  }, [journalText, activePrompt]);

  // Sentiment trend from recent entries
  const sentimentTrend = useMemo(() => {
    const recent = entries.slice(0, 7);
    if (recent.length === 0) return null;

    const scores = recent.map((e) => e.sentiment.score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

    if (avg > 0.2) return { label: "Trending positive", color: "text-emerald-600" };
    if (avg < -0.2) return { label: "Needs attention", color: "text-rose-600" };
    return { label: "Balanced", color: "text-amber-600" };
  }, [entries]);

  return (
    <div className="mt-6">
      <button
        type="button"
        className="mb-3 flex w-full items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-gray-800 text-lg">Journal</h2>
          {todayEntryCount > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
              {todayEntryCount} today
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-3">
          {/* AI Prompt Card */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-semibold text-gray-700">AI Prompt</span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", CATEGORY_COLORS[currentPrompt.category])}>
                  {currentPrompt.categoryLabel}
                </span>
              </div>
              <button
                type="button"
                onClick={handleNewPrompt}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                New
              </button>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              {activePrompt ? activePrompt.text : currentPrompt.text}
            </p>

            {!activePrompt && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPrompt(currentPrompt)}
                  className="flex items-center gap-1.5 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 transition-colors"
                >
                  <PenLine className="h-3 w-3" />
                  Write about this
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePrompt(null);
                    setJournalText("");
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <BookOpen className="h-3 w-3" />
                  Free write
                </button>
              </div>
            )}
          </div>

          {/* Journal Text Area */}
          {(activePrompt !== null || journalText.length > 0) && (
            <div className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
              {activePrompt && (
                <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-2.5">
                  <Lightbulb className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-700 leading-relaxed">{activePrompt.text}</p>
                </div>
              )}

              <textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder={activePrompt ? "Start writing your thoughts..." : "What's on your mind today?"}
                className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-200 transition-colors"
                rows={5}
              />

              {/* Live Sentiment */}
              {journalText.length > 20 && (
                <SentimentPanel sentiment={sentiment} />
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">
                  {journalText.length} characters
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePrompt(null);
                      setJournalText("");
                    }}
                    className="rounded-full px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEntry}
                    disabled={!journalText.trim() || isSaving}
                    className="flex items-center gap-1.5 rounded-full bg-blue-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSaving ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                    Save Entry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Prompt Suggestions */}
          {activePrompt === null && journalText.length === 0 && (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                More Prompts
              </p>
              <div className="space-y-2">
                {moodPrompts.slice(1, 4).map((prompt) => (
                  <button
                    key={prompt.id}
                    type="button"
                    onClick={() => handleSelectPrompt(prompt)}
                    className="flex w-full items-start gap-2 rounded-lg border border-gray-100 p-2.5 text-left hover:border-blue-200 hover:bg-blue-50 transition-colors"
                  >
                    <span className={cn("mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium", CATEGORY_COLORS[prompt.category])}>
                      {prompt.categoryLabel}
                    </span>
                    <span className="text-xs text-gray-600 leading-relaxed">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sentiment Trend + History */}
          {entries.length > 0 && (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <button
                type="button"
                className="flex w-full items-center justify-between"
                onClick={() => setShowHistory(!showHistory)}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-700">
                    Journal History ({entries.length})
                  </span>
                  {sentimentTrend && (
                    <span className={cn("text-[10px] font-medium", sentimentTrend.color)}>
                      {sentimentTrend.label}
                    </span>
                  )}
                </div>
                {showHistory ? (
                  <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                )}
              </button>

              {showHistory && (
                <div className="mt-3 space-y-3">
                  {/* Sentiment Timeline */}
                  {entries.length >= 3 && (
                    <div className="mb-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                        Sentiment Over Time
                      </p>
                      <div className="flex items-end gap-1 h-10">
                        {entries.slice(0, 14).reverse().map((entry) => {
                          const height = Math.abs(entry.sentiment.score) * 100;
                          const isPositive = entry.sentiment.score >= 0;
                          return (
                            <div
                              key={entry.id}
                              className="flex-1 flex flex-col justify-end"
                              title={`${entry.sentiment.label} (${new Date(entry.createdAt).toLocaleDateString()})`}
                            >
                              <div
                                className={cn(
                                  "w-full rounded-t-sm min-h-[2px] transition-all",
                                  isPositive ? "bg-emerald-400" : "bg-rose-400",
                                )}
                                style={{ height: `${Math.max(height, 10)}%` }}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[9px] text-gray-400">Older</span>
                        <span className="text-[9px] text-gray-400">Recent</span>
                      </div>
                    </div>
                  )}

                  {/* Entry List */}
                  {entries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="border-t border-gray-100 pt-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-400">
                          {new Date(entry.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        <SentimentBadge sentiment={entry.sentiment} />
                      </div>
                      {entry.prompt && (
                        <p className="text-[10px] text-blue-500 mb-1 italic">
                          Prompt: {entry.prompt.text.slice(0, 60)}...
                        </p>
                      )}
                      <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                        {entry.text}
                      </p>
                    </div>
                  ))}

                  {entries.length > 5 && (
                    <p className="text-center text-[10px] text-gray-400">
                      + {entries.length - 5} more entries
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Mood Sentiment Summary (alongside Mood History) ────────────────

export function MoodSentimentSummary({ moodByDate }: { moodByDate: Record<string, MoodName | null> }) {
  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const mood of Object.values(moodByDate)) {
      if (mood) {
        counts[mood] = (counts[mood] ?? 0) + 1;
      }
    }
    return counts;
  }, [moodByDate]);

  const totalMoods = Object.values(moodCounts).reduce((a, b) => a + b, 0);
  if (totalMoods === 0) return null;

  const positiveMoods = ["happy", "calm", "proud", "surprised"];
  const negativeMoods = ["sad", "angry", "afraid", "bad", "disgusted", "lonely"];

  let positiveCount = 0;
  let negativeCount = 0;

  for (const [mood, count] of Object.entries(moodCounts)) {
    if (positiveMoods.includes(mood)) positiveCount += count;
    if (negativeMoods.includes(mood)) negativeCount += count;
  }

  const positivePercent = Math.round((positiveCount / totalMoods) * 100);
  const negativePercent = Math.round((negativeCount / totalMoods) * 100);
  const neutralPercent = 100 - positivePercent - negativePercent;

  let overallLabel: string;
  let overallColor: string;
  if (positivePercent >= 60) {
    overallLabel = "Mostly positive this week";
    overallColor = "text-emerald-600";
  } else if (negativePercent >= 60) {
    overallLabel = "A tough week — be gentle with yourself";
    overallColor = "text-rose-600";
  } else {
    overallLabel = "A balanced mix of emotions";
    overallColor = "text-amber-600";
  }

  return (
    <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Weekly Mood Sentiment
          </span>
        </div>
      </div>

      {/* Sentiment Bar */}
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        {positivePercent > 0 && (
          <div className="bg-emerald-400 transition-all" style={{ width: `${positivePercent}%` }} />
        )}
        {neutralPercent > 0 && (
          <div className="bg-gray-300 transition-all" style={{ width: `${neutralPercent}%` }} />
        )}
        {negativePercent > 0 && (
          <div className="bg-rose-400 transition-all" style={{ width: `${negativePercent}%` }} />
        )}
      </div>

      <div className="flex justify-between text-[10px]">
        <span className="text-emerald-600">{positivePercent}% positive</span>
        <span className="text-rose-600">{negativePercent}% challenging</span>
      </div>

      <p className={cn("text-xs font-medium", overallColor)}>{overallLabel}</p>
    </div>
  );
}
