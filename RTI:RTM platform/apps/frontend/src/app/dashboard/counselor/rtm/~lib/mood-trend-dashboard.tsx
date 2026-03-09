"use client";

import {
  ChevronDown,
  ChevronUp,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/lib/core-ui/badge";
import { cn } from "@/lib/tailwind-utils";

// ─── Mood Data Types ────────────────────────────────────────────────

type MoodEntry = {
  date: string;
  mood: string;
  specificMood: string | null;
  intensity: number; // 1-5
  journalSnippet: string | null;
};

type MoodCategory = "positive" | "negative" | "neutral";

const MOOD_CATEGORY_MAP: Record<string, MoodCategory> = {
  happy: "positive",
  calm: "positive",
  proud: "positive",
  excited: "positive",
  grateful: "positive",
  joyful: "positive",
  confident: "positive",
  peaceful: "positive",
  sad: "negative",
  angry: "negative",
  afraid: "negative",
  anxious: "negative",
  lonely: "negative",
  bad: "negative",
  disgusted: "negative",
  frustrated: "negative",
  overwhelmed: "negative",
  hurt: "negative",
  worried: "negative",
  surprised: "neutral",
};

const MOOD_COLORS: Record<string, string> = {
  happy: "#22c55e",
  calm: "#3b82f6",
  proud: "#8b5cf6",
  excited: "#f59e0b",
  sad: "#6366f1",
  angry: "#ef4444",
  afraid: "#a855f7",
  anxious: "#f97316",
  lonely: "#6b7280",
  bad: "#dc2626",
  disgusted: "#84cc16",
  surprised: "#eab308",
  frustrated: "#e11d48",
  overwhelmed: "#d946ef",
  grateful: "#14b8a6",
  peaceful: "#06b6d4",
};

const CATEGORY_COLORS = {
  positive: "#10b981",
  negative: "#ef4444",
  neutral: "#94a3b8",
};

// ─── Mock Mood History Generator ────────────────────────────────────

function generateMoodHistory(patientName: string): MoodEntry[] {
  const profiles: Record<string, { moods: string[]; weights: number[]; baseIntensity: number }> = {
    "Sarah Mitchell": {
      moods: ["anxious", "calm", "worried", "happy", "grateful", "afraid", "peaceful"],
      weights: [0.25, 0.15, 0.15, 0.12, 0.1, 0.13, 0.1],
      baseIntensity: 3,
    },
    "David Chen": {
      moods: ["sad", "lonely", "bad", "calm", "happy", "frustrated", "overwhelmed"],
      weights: [0.25, 0.15, 0.12, 0.12, 0.1, 0.14, 0.12],
      baseIntensity: 3,
    },
    "Jessica Brown": {
      moods: ["afraid", "anxious", "overwhelmed", "calm", "sad", "angry", "peaceful"],
      weights: [0.2, 0.18, 0.15, 0.12, 0.12, 0.13, 0.1],
      baseIntensity: 4,
    },
    "Tyler Davis": {
      moods: ["anxious", "lonely", "sad", "frustrated", "calm", "happy", "afraid"],
      weights: [0.22, 0.18, 0.15, 0.13, 0.1, 0.1, 0.12],
      baseIntensity: 3,
    },
    "Alex Patel": {
      moods: ["happy", "excited", "calm", "anxious", "proud", "overwhelmed", "sad"],
      weights: [0.2, 0.15, 0.18, 0.12, 0.12, 0.13, 0.1],
      baseIntensity: 3,
    },
  };

  const profile = profiles[patientName] ?? {
    moods: ["calm", "happy", "sad", "anxious", "angry"],
    weights: [0.25, 0.2, 0.2, 0.2, 0.15],
    baseIntensity: 3,
  };

  const entries: MoodEntry[] = [];
  const startDate = new Date("2026-01-01");
  const endDate = new Date("2026-02-23");

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // Skip some days randomly (based on date hash)
    const dayHash = d.getDate() * 31 + d.getMonth() * 7;
    if (dayHash % 7 === 0) continue;

    // Pick mood based on weighted distribution
    const rand = (dayHash * 13 + d.getDate() * 17) % 100 / 100;
    let cumulative = 0;
    let selectedMood = profile.moods[0]!;
    for (let i = 0; i < profile.moods.length; i++) {
      cumulative += profile.weights[i]!;
      if (rand < cumulative) {
        selectedMood = profile.moods[i]!;
        break;
      }
    }

    // Simulate improvement over time (more positive moods later)
    const daysSinceStart = Math.floor((d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const improvementFactor = daysSinceStart / 54; // 0 to 1 over the period
    if (improvementFactor > 0.5 && dayHash % 3 === 0) {
      const positiveOptions = profile.moods.filter((m) => MOOD_CATEGORY_MAP[m] === "positive");
      if (positiveOptions.length > 0) {
        selectedMood = positiveOptions[dayHash % positiveOptions.length]!;
      }
    }

    const intensity = Math.max(1, Math.min(5,
      profile.baseIntensity + (dayHash % 3 - 1) + (MOOD_CATEGORY_MAP[selectedMood] === "negative" ? 1 : 0),
    ));

    entries.push({
      date: d.toISOString().split("T")[0]!,
      mood: selectedMood,
      specificMood: null,
      intensity,
      journalSnippet: null,
    });
  }

  return entries;
}

// ─── Mood Trend Analysis ────────────────────────────────────────────

function analyzeMoodTrends(entries: MoodEntry[]) {
  // Weekly aggregation
  const weeklyData: { week: string; positive: number; negative: number; neutral: number; avgIntensity: number; total: number }[] = [];
  const weekMap = new Map<string, MoodEntry[]>();

  for (const entry of entries) {
    const d = new Date(entry.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const weekKey = weekStart.toISOString().split("T")[0]!;
    if (!weekMap.has(weekKey)) weekMap.set(weekKey, []);
    weekMap.get(weekKey)!.push(entry);
  }

  for (const [week, weekEntries] of Array.from(weekMap.entries()).sort()) {
    let positive = 0, negative = 0, neutral = 0;
    let totalIntensity = 0;
    for (const e of weekEntries) {
      const cat = MOOD_CATEGORY_MAP[e.mood] ?? "neutral";
      if (cat === "positive") positive++;
      else if (cat === "negative") negative++;
      else neutral++;
      totalIntensity += e.intensity;
    }
    const total = weekEntries.length;
    weeklyData.push({
      week: new Date(week).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      positive: Math.round((positive / total) * 100),
      negative: Math.round((negative / total) * 100),
      neutral: Math.round((neutral / total) * 100),
      avgIntensity: Math.round((totalIntensity / total) * 10) / 10,
      total,
    });
  }

  // Mood frequency
  const moodFreq: Record<string, number> = {};
  for (const e of entries) {
    moodFreq[e.mood] = (moodFreq[e.mood] ?? 0) + 1;
  }

  // Daily intensity trend
  const dailyIntensity = entries.map((e) => ({
    date: new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    intensity: e.intensity,
    mood: e.mood,
    category: MOOD_CATEGORY_MAP[e.mood] ?? "neutral",
  }));

  // Overall stats
  const totalEntries = entries.length;
  const positiveTotal = entries.filter((e) => MOOD_CATEGORY_MAP[e.mood] === "positive").length;
  const negativeTotal = entries.filter((e) => MOOD_CATEGORY_MAP[e.mood] === "negative").length;
  const avgIntensity = entries.reduce((sum, e) => sum + e.intensity, 0) / totalEntries;

  // Trend direction (compare first half to second half)
  const midpoint = Math.floor(entries.length / 2);
  const firstHalf = entries.slice(0, midpoint);
  const secondHalf = entries.slice(midpoint);
  const firstPositiveRate = firstHalf.filter((e) => MOOD_CATEGORY_MAP[e.mood] === "positive").length / firstHalf.length;
  const secondPositiveRate = secondHalf.filter((e) => MOOD_CATEGORY_MAP[e.mood] === "positive").length / secondHalf.length;
  const trendDirection = secondPositiveRate > firstPositiveRate + 0.05 ? "improving" : secondPositiveRate < firstPositiveRate - 0.05 ? "declining" : "stable";

  return { weeklyData, moodFreq, dailyIntensity, totalEntries, positiveTotal, negativeTotal, avgIntensity, trendDirection };
}

// ─── Custom Tooltip ─────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2.5 shadow-md">
      <p className="text-[10px] font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-[10px]" style={{ color: entry.color }}>
          {entry.name}: {entry.value}{typeof entry.value === "number" && entry.name !== "Avg Intensity" ? "%" : ""}
        </p>
      ))}
    </div>
  );
}

// ─── Main Mood Trend Dashboard ──────────────────────────────────────

export function MoodTrendDashboard({ patientName }: { patientName: string }) {
  const [expanded, setExpanded] = useState(true);
  const [activeView, setActiveView] = useState<"weekly" | "daily" | "distribution">("weekly");

  const entries = useMemo(() => generateMoodHistory(patientName), [patientName]);
  const analysis = useMemo(() => analyzeMoodTrends(entries), [entries]);

  // Pie chart data for mood distribution
  const pieData = useMemo(() => {
    const sorted = Object.entries(analysis.moodFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);
    return sorted.map(([mood, count]) => ({
      name: mood.charAt(0).toUpperCase() + mood.slice(1),
      value: count,
      color: MOOD_COLORS[mood] ?? "#94a3b8",
    }));
  }, [analysis.moodFreq]);

  const trendConfig = {
    improving: { label: "Improving", color: "text-emerald-600", bg: "bg-emerald-50", icon: TrendingUp },
    declining: { label: "Declining", color: "text-red-600", bg: "bg-red-50", icon: TrendingDown },
    stable: { label: "Stable", color: "text-blue-600", bg: "bg-blue-50", icon: TrendingUp },
  };

  const trend = trendConfig[analysis.trendDirection as keyof typeof trendConfig];
  const TrendIcon = trend.icon;

  return (
    <div className="rounded-xl border bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between p-5"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Mood Check-In Trends
        </h3>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className={cn("text-[10px] gap-1", trend.color, trend.bg)}>
            <TrendIcon className="h-3 w-3" />
            {trend.label}
          </Badge>
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t px-5 pb-5 pt-4 space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-lg border border-gray-100 p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{analysis.totalEntries}</p>
              <p className="text-[10px] text-gray-500">Check-ins</p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-700">
                {Math.round((analysis.positiveTotal / analysis.totalEntries) * 100)}%
              </p>
              <p className="text-[10px] text-emerald-600">Positive</p>
            </div>
            <div className="rounded-lg border border-red-100 bg-red-50/50 p-3 text-center">
              <p className="text-2xl font-bold text-red-700">
                {Math.round((analysis.negativeTotal / analysis.totalEntries) * 100)}%
              </p>
              <p className="text-[10px] text-red-600">Challenging</p>
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">
                {analysis.avgIntensity.toFixed(1)}
              </p>
              <p className="text-[10px] text-blue-600">Avg Intensity</p>
            </div>
          </div>

          {/* View Tabs */}
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {([
              { key: "weekly" as const, label: "Weekly Trend" },
              { key: "daily" as const, label: "Daily View" },
              { key: "distribution" as const, label: "Distribution" },
            ]).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveView(key)}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  activeView === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Weekly Stacked Area Chart */}
          {activeView === "weekly" && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Weekly Mood Composition (% of check-ins)
              </p>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={analysis.weeklyData}>
                  <defs>
                    <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="neuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="positive" name="Positive" stackId="1" stroke="#10b981" fill="url(#posGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="neutral" name="Neutral" stackId="1" stroke="#94a3b8" fill="url(#neuGrad)" strokeWidth={1} />
                  <Area type="monotone" dataKey="negative" name="Challenging" stackId="1" stroke="#ef4444" fill="url(#negGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>

              {/* Weekly Intensity Overlay */}
              <p className="mt-4 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Average Weekly Intensity
              </p>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={analysis.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="avgIntensity" name="Avg Intensity" radius={[4, 4, 0, 0]}>
                    {analysis.weeklyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.avgIntensity >= 4 ? "#ef4444" : entry.avgIntensity >= 3 ? "#f59e0b" : "#10b981"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Daily Scatter/Line View */}
          {activeView === "daily" && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Daily Mood Intensity (color = mood valence)
              </p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={analysis.dailyIntensity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 8, fill: "#94a3b8" }}
                    interval={Math.floor(analysis.dailyIntensity.length / 10)}
                  />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                    formatter={(value: number, _name: string, props: { payload?: { mood?: string } }) => [
                      `${value} (${props?.payload?.mood ?? ""})`,
                      "Intensity",
                    ]}
                  />
                  <Bar dataKey="intensity" name="Intensity" radius={[2, 2, 0, 0]}>
                    {analysis.dailyIntensity.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[entry.category] ?? "#94a3b8"}
                        opacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="mt-2 flex items-center justify-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-gray-500">Positive</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="text-[10px] text-gray-500">Challenging</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
                  <span className="text-[10px] text-gray-500">Neutral</span>
                </div>
              </div>

              {/* 7-day moving average line */}
              <p className="mt-4 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                7-Day Moving Average Intensity
              </p>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart
                  data={analysis.dailyIntensity.map((d, i, arr) => {
                    const window = arr.slice(Math.max(0, i - 6), i + 1);
                    const avg = window.reduce((sum, e) => sum + e.intensity, 0) / window.length;
                    return { ...d, movingAvg: Math.round(avg * 10) / 10 };
                  })}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 8, fill: "#94a3b8" }}
                    interval={Math.floor(analysis.dailyIntensity.length / 10)}
                  />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Line type="monotone" dataKey="movingAvg" name="7-Day Avg" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Distribution View */}
          {activeView === "distribution" && (
            <div>
              <div className="grid grid-cols-2 gap-4">
                {/* Pie Chart */}
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Mood Distribution
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                        formatter={(value: number) => [`${value} check-ins`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Frequency Bars */}
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Top Moods
                  </p>
                  <div className="space-y-2">
                    {pieData.slice(0, 6).map((item) => {
                      const pct = Math.round((item.value / analysis.totalEntries) * 100);
                      return (
                        <div key={item.name} className="space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-gray-600">{item.name}</span>
                            <span className="text-[10px] font-medium text-gray-500">{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Category Breakdown Bar */}
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Overall Sentiment Breakdown
                </p>
                <div className="flex h-4 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-emerald-400 transition-all"
                    style={{ width: `${Math.round((analysis.positiveTotal / analysis.totalEntries) * 100)}%` }}
                  />
                  <div
                    className="bg-gray-300 transition-all"
                    style={{ width: `${Math.round(((analysis.totalEntries - analysis.positiveTotal - analysis.negativeTotal) / analysis.totalEntries) * 100)}%` }}
                  />
                  <div
                    className="bg-red-400 transition-all"
                    style={{ width: `${Math.round((analysis.negativeTotal / analysis.totalEntries) * 100)}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[10px]">
                  <span className="text-emerald-600">
                    {Math.round((analysis.positiveTotal / analysis.totalEntries) * 100)}% Positive
                  </span>
                  <span className="text-gray-500">
                    {Math.round(((analysis.totalEntries - analysis.positiveTotal - analysis.negativeTotal) / analysis.totalEntries) * 100)}% Neutral
                  </span>
                  <span className="text-red-600">
                    {Math.round((analysis.negativeTotal / analysis.totalEntries) * 100)}% Challenging
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Clinical Insight */}
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Clinical Insight</p>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              {analysis.trendDirection === "improving"
                ? `Patient's mood trend is improving over the monitoring period. Positive check-ins increased from ${Math.round(
                    (entries.slice(0, Math.floor(entries.length / 2)).filter((e) => MOOD_CATEGORY_MAP[e.mood] === "positive").length /
                      Math.floor(entries.length / 2)) * 100,
                  )}% to ${Math.round(
                    (entries.slice(Math.floor(entries.length / 2)).filter((e) => MOOD_CATEGORY_MAP[e.mood] === "positive").length /
                      (entries.length - Math.floor(entries.length / 2))) * 100,
                  )}%. Current interventions appear effective.`
                : analysis.trendDirection === "declining"
                  ? "Patient's mood trend shows decline. Consider reviewing treatment plan, assessing for new stressors, and increasing check-in frequency."
                  : "Patient's mood pattern is stable. Monitor for changes and continue current treatment approach."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
