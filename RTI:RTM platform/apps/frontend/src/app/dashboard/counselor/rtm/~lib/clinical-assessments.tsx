"use client";

import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Eye,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/lib/core-ui/badge";
import { cn } from "@/lib/tailwind-utils";

// ─── SCARED Assessment ──────────────────────────────────────────────
// Screen for Child Anxiety Related Disorders
// 41-item self-report measure for children ages 8-18
// Birmaher et al. (1997). JAACAP, 36(4), 545-553.

type SCAREDSubscale =
  | "panic_somatic"
  | "generalized_anxiety"
  | "separation_anxiety"
  | "social_anxiety"
  | "school_avoidance";

type SCAREDScore = {
  date: string;
  total: number;
  subscales: Record<SCAREDSubscale, number>;
};

const SCARED_SUBSCALE_INFO: Record<SCAREDSubscale, { label: string; cutoff: number; maxScore: number; color: string }> = {
  panic_somatic: { label: "Panic/Somatic", cutoff: 7, maxScore: 26, color: "#ef4444" },
  generalized_anxiety: { label: "Generalized Anxiety", cutoff: 9, maxScore: 18, color: "#f59e0b" },
  separation_anxiety: { label: "Separation Anxiety", cutoff: 5, maxScore: 16, color: "#8b5cf6" },
  social_anxiety: { label: "Social Anxiety", cutoff: 8, maxScore: 14, color: "#3b82f6" },
  school_avoidance: { label: "School Avoidance", cutoff: 3, maxScore: 8, color: "#10b981" },
};

const SCARED_TOTAL_CUTOFF = 25;
const SCARED_MAX_TOTAL = 82;

function getSCAREDSeverity(total: number): { label: string; color: string; bg: string } {
  if (total < 25) return { label: "Below Clinical Threshold", color: "text-emerald-700", bg: "bg-emerald-50" };
  if (total < 35) return { label: "Mild-Moderate Anxiety", color: "text-amber-700", bg: "bg-amber-50" };
  if (total < 50) return { label: "Moderate-Severe Anxiety", color: "text-orange-700", bg: "bg-orange-50" };
  return { label: "Severe Anxiety", color: "text-red-700", bg: "bg-red-50" };
}

// ─── SDQ Assessment ─────────────────────────────────────────────────
// Strengths and Difficulties Questionnaire
// Goodman, R. (1997). JAACAP, 36(11), 1553-1541.

type SDQSubscale =
  | "emotional_problems"
  | "conduct_problems"
  | "hyperactivity"
  | "peer_problems"
  | "prosocial";

type SDQScore = {
  date: string;
  totalDifficulties: number;
  subscales: Record<SDQSubscale, number>;
  impact: number;
};

const SDQ_SUBSCALE_INFO: Record<SDQSubscale, { label: string; normalMax: number; borderline: number; abnormal: number; maxScore: number; color: string; isStrength: boolean }> = {
  emotional_problems: { label: "Emotional Problems", normalMax: 3, borderline: 4, abnormal: 5, maxScore: 10, color: "#8b5cf6", isStrength: false },
  conduct_problems: { label: "Conduct Problems", normalMax: 2, borderline: 3, abnormal: 4, maxScore: 10, color: "#ef4444", isStrength: false },
  hyperactivity: { label: "Hyperactivity/Inattention", normalMax: 5, borderline: 6, abnormal: 7, maxScore: 10, color: "#f59e0b", isStrength: false },
  peer_problems: { label: "Peer Relationship Problems", normalMax: 2, borderline: 3, abnormal: 4, maxScore: 10, color: "#3b82f6", isStrength: false },
  prosocial: { label: "Prosocial Behavior", normalMax: 10, borderline: 5, abnormal: 4, maxScore: 10, color: "#10b981", isStrength: true },
};

function getSDQBand(total: number): { label: string; color: string; bg: string } {
  if (total <= 13) return { label: "Normal", color: "text-emerald-700", bg: "bg-emerald-50" };
  if (total <= 16) return { label: "Borderline", color: "text-amber-700", bg: "bg-amber-50" };
  return { label: "Abnormal", color: "text-red-700", bg: "bg-red-50" };
}

// ─── SEL Assessment ─────────────────────────────────────────────────
// Social-Emotional Learning (CASEL framework)

type SELDomain =
  | "self_awareness"
  | "self_management"
  | "social_awareness"
  | "relationship_skills"
  | "responsible_decision_making";

type SELScore = {
  date: string;
  overall: number;
  domains: Record<SELDomain, number>;
};

const SEL_DOMAIN_INFO: Record<SELDomain, { label: string; color: string }> = {
  self_awareness: { label: "Self-Awareness", color: "#8b5cf6" },
  self_management: { label: "Self-Management", color: "#3b82f6" },
  social_awareness: { label: "Social Awareness", color: "#10b981" },
  relationship_skills: { label: "Relationship Skills", color: "#f59e0b" },
  responsible_decision_making: { label: "Responsible Decision-Making", color: "#ef4444" },
};

// ─── Mock Data Generator ────────────────────────────────────────────

function generateSCAREDHistory(patientName: string): SCAREDScore[] {
  const seeds: Record<string, { start: number; trend: number }> = {
    "Sarah Mitchell": { start: 32, trend: -3 },
    "David Chen": { start: 18, trend: -1 },
    "Jessica Brown": { start: 38, trend: -2 },
    "Tyler Davis": { start: 42, trend: 1 },
    "Alex Patel": { start: 22, trend: -2 },
  };
  const seed = seeds[patientName] ?? { start: 28, trend: -1 };
  const dates = ["2025-10-15", "2025-11-15", "2025-12-15", "2026-01-15", "2026-02-15"];

  return dates.map((date, i) => {
    const total = Math.max(0, Math.min(SCARED_MAX_TOTAL, seed.start + seed.trend * i + (i % 2 === 0 ? 1 : -1)));
    const ratio = total / SCARED_MAX_TOTAL;
    return {
      date,
      total,
      subscales: {
        panic_somatic: Math.round(ratio * 26 * (0.7 + Math.sin(i) * 0.3)),
        generalized_anxiety: Math.round(ratio * 18 * (0.8 + Math.cos(i) * 0.2)),
        separation_anxiety: Math.round(ratio * 16 * (0.5 + Math.sin(i + 1) * 0.3)),
        social_anxiety: Math.round(ratio * 14 * (0.6 + Math.cos(i + 1) * 0.3)),
        school_avoidance: Math.round(ratio * 8 * (0.4 + Math.sin(i + 2) * 0.3)),
      },
    };
  });
}

function generateSDQHistory(patientName: string): SDQScore[] {
  const seeds: Record<string, { start: number; trend: number }> = {
    "Sarah Mitchell": { start: 16, trend: -2 },
    "David Chen": { start: 20, trend: -1 },
    "Jessica Brown": { start: 22, trend: -2 },
    "Tyler Davis": { start: 18, trend: 1 },
    "Alex Patel": { start: 14, trend: -1 },
  };
  const seed = seeds[patientName] ?? { start: 17, trend: -1 };
  const dates = ["2025-10-15", "2025-11-15", "2025-12-15", "2026-01-15", "2026-02-15"];

  return dates.map((date, i) => {
    const total = Math.max(0, Math.min(40, seed.start + seed.trend * i + (i % 2 === 0 ? 1 : -1)));
    const ratio = total / 40;
    return {
      date,
      totalDifficulties: total,
      subscales: {
        emotional_problems: Math.round(ratio * 10 * (0.7 + Math.sin(i) * 0.2)),
        conduct_problems: Math.round(ratio * 10 * (0.5 + Math.cos(i) * 0.2)),
        hyperactivity: Math.round(ratio * 10 * (0.6 + Math.sin(i + 1) * 0.2)),
        peer_problems: Math.round(ratio * 10 * (0.5 + Math.cos(i + 1) * 0.2)),
        prosocial: Math.min(10, Math.round((1 - ratio) * 10 * (0.8 + Math.sin(i) * 0.2))),
      },
      impact: Math.round(ratio * 10 * (0.5 + Math.cos(i) * 0.3)),
    };
  });
}

function generateSELHistory(patientName: string): SELScore[] {
  const seeds: Record<string, { start: number; trend: number }> = {
    "Sarah Mitchell": { start: 62, trend: 5 },
    "David Chen": { start: 48, trend: 3 },
    "Jessica Brown": { start: 45, trend: 4 },
    "Tyler Davis": { start: 55, trend: -2 },
    "Alex Patel": { start: 70, trend: 3 },
  };
  const seed = seeds[patientName] ?? { start: 55, trend: 2 };
  const dates = ["2025-10-15", "2025-11-15", "2025-12-15", "2026-01-15", "2026-02-15"];

  return dates.map((date, i) => {
    const overall = Math.max(0, Math.min(100, seed.start + seed.trend * i + (i % 2 === 0 ? 2 : -1)));
    return {
      date,
      overall,
      domains: {
        self_awareness: Math.min(100, Math.max(0, overall + (i % 3 === 0 ? 5 : -3))),
        self_management: Math.min(100, Math.max(0, overall + (i % 2 === 0 ? -4 : 6))),
        social_awareness: Math.min(100, Math.max(0, overall + (i % 3 === 1 ? 8 : -2))),
        relationship_skills: Math.min(100, Math.max(0, overall + (i % 2 === 1 ? -5 : 4))),
        responsible_decision_making: Math.min(100, Math.max(0, overall + (i % 3 === 2 ? 3 : -1))),
      },
    };
  });
}

// ─── Shared Trend Indicator ─────────────────────────────────────────

function TrendIndicator({ current, previous, lowerIsBetter = true }: { current: number; previous: number; lowerIsBetter?: boolean }) {
  const diff = current - previous;
  if (diff === 0) return <span className="text-[10px] text-gray-400">No change</span>;

  const isImproving = lowerIsBetter ? diff < 0 : diff > 0;
  return (
    <span className={cn("flex items-center gap-0.5 text-[10px] font-medium", isImproving ? "text-emerald-600" : "text-red-600")}>
      {isImproving ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
      {Math.abs(diff)} pts {isImproving ? "improved" : "worsened"}
    </span>
  );
}

// ─── Shared Score Bar ───────────────────────────────────────────────

function ScoreBar({ value, max, cutoff, color, label }: { value: number; max: number; cutoff?: number; color: string; label: string }) {
  const pct = (value / max) * 100;
  const cutoffPct = cutoff ? (cutoff / max) * 100 : undefined;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-600">{label}</span>
        <span className="text-[11px] font-semibold text-gray-700">{value}/{max}</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
        {cutoffPct !== undefined && (
          <div className="absolute top-0 h-full w-0.5 bg-red-400" style={{ left: `${cutoffPct}%` }} title={`Clinical cutoff: ${cutoff}`} />
        )}
      </div>
    </div>
  );
}

// ─── Format date for chart axis ─────────────────────────────────────

function formatChartDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

// ─── Screener Questions & Responses Modal ───────────────────────────

type ScreenerQuestion = {
  id: number;
  text: string;
  response: number;
  responseLabel: string;
  domain?: string;
};

type ScreenerQuestionsData = {
  title: string;
  subtitle: string;
  completedDate: string;
  responseScale: string[];
  questions: ScreenerQuestion[];
};

const PHQ9_RESPONSE_SCALE = ["Not at all", "Several days", "More than half the days", "Nearly every day"];

function generatePHQ9Questions(): ScreenerQuestion[] {
  const items = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself — or that you are a failure",
    "Trouble concentrating on things, such as reading or watching TV",
    "Moving or speaking so slowly that others noticed, or being fidgety/restless",
    "Thoughts that you would be better off dead, or of hurting yourself",
  ];
  const responses = [2, 1, 3, 2, 1, 2, 1, 0, 0];
  return items.map((text, i) => ({
    id: i + 1,
    text,
    response: responses[i]!,
    responseLabel: PHQ9_RESPONSE_SCALE[responses[i]!]!,
  }));
}

const GAD7_RESPONSE_SCALE = ["Not at all", "Several days", "More than half the days", "Nearly every day"];

function generateGAD7Questions(): ScreenerQuestion[] {
  const items = [
    "Feeling nervous, anxious, or on edge",
    "Not being able to stop or control worrying",
    "Worrying too much about different things",
    "Trouble relaxing",
    "Being so restless that it's hard to sit still",
    "Becoming easily annoyed or irritable",
    "Feeling afraid, as if something awful might happen",
  ];
  const responses = [2, 2, 3, 1, 1, 2, 1];
  return items.map((text, i) => ({
    id: i + 1,
    text,
    response: responses[i]!,
    responseLabel: GAD7_RESPONSE_SCALE[responses[i]!]!,
  }));
}

function generatePHQAQuestions(): ScreenerQuestion[] {
  const items = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, irritable, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite, weight loss, or overeating",
    "Feeling bad about yourself — or that you are a failure",
    "Trouble concentrating on things, such as schoolwork",
    "Moving or speaking so slowly that others noticed, or being fidgety/restless",
    "Thoughts that you would be better off dead, or of hurting yourself",
  ];
  const responses = [2, 3, 2, 2, 1, 2, 1, 1, 0];
  return items.map((text, i) => ({
    id: i + 1,
    text,
    response: responses[i]!,
    responseLabel: PHQ9_RESPONSE_SCALE[responses[i]!]!,
  }));
}

const GAD2_RESPONSE_SCALE = ["Not at all", "Several days", "More than half the days", "Nearly every day"];

function generateGAD2Questions(): ScreenerQuestion[] {
  const items = [
    "Feeling nervous, anxious, or on edge",
    "Not being able to stop or control worrying",
  ];
  const responses = [2, 1];
  return items.map((text, i) => ({
    id: i + 1,
    text,
    response: responses[i]!,
    responseLabel: GAD2_RESPONSE_SCALE[responses[i]!]!,
  }));
}

const SCARED_RESPONSE_SCALE = ["Not true / Hardly ever true", "Somewhat true / Sometimes true", "Very true / Often true"];

function generateSCAREDQuestions(): ScreenerQuestion[] {
  const items = [
    "When I feel frightened, it is hard to breathe",
    "I get headaches when I am at school",
    "I don't like to be with people I don't know well",
    "I get scared if I sleep away from home",
    "I worry about other people liking me",
    "When I get frightened, I feel like passing out",
    "I am nervous",
    "I follow my mother or father wherever they go",
    "People tell me that I look nervous",
    "I feel nervous with people I don't know well",
  ];
  const responses = [2, 1, 1, 0, 2, 1, 2, 0, 1, 2];
  return items.map((text, i) => ({
    id: i + 1,
    text,
    response: responses[i]!,
    responseLabel: SCARED_RESPONSE_SCALE[responses[i]!]!,
  }));
}

const SDQ_RESPONSE_SCALE = ["Not true", "Somewhat true", "Certainly true"];

function generateSDQQuestions(): ScreenerQuestion[] {
  const items = [
    "I try to be nice to other people. I care about their feelings",
    "I am restless, I cannot stay still for long",
    "I get a lot of headaches, stomach-aches, or sickness",
    "I usually share with others (food, games, pens, etc.)",
    "I get very angry and often lose my temper",
    "I am usually on my own. I generally play alone",
    "I usually do as I am told",
    "I worry a lot",
    "I am helpful if someone is hurt, upset, or feeling ill",
    "I am constantly fidgeting or squirming",
  ];
  const responses = [2, 1, 1, 2, 0, 1, 2, 2, 2, 1];
  return items.map((text, i) => ({
    id: i + 1,
    text,
    response: responses[i]!,
    responseLabel: SDQ_RESPONSE_SCALE[responses[i]!]!,
  }));
}

const SEL_RESPONSE_SCALE = ["Not at all like me", "A little like me", "Somewhat like me", "A lot like me", "Exactly like me"];

const SEL_DOMAIN_COLORS: Record<string, { bg: string; text: string; accent: string; icon: string }> = {
  "Self-Awareness": { bg: "bg-violet-50", text: "text-violet-700", accent: "border-violet-200", icon: "text-violet-500" },
  "Self-Management": { bg: "bg-blue-50", text: "text-blue-700", accent: "border-blue-200", icon: "text-blue-500" },
  "Social Awareness": { bg: "bg-emerald-50", text: "text-emerald-700", accent: "border-emerald-200", icon: "text-emerald-500" },
  "Relationship Skills": { bg: "bg-amber-50", text: "text-amber-700", accent: "border-amber-200", icon: "text-amber-500" },
  "Responsible Decision-Making": { bg: "bg-rose-50", text: "text-rose-700", accent: "border-rose-200", icon: "text-rose-500" },
};

function generateSELQuestions(): ScreenerQuestion[] {
  const domains: { domain: string; items: string[]; responses: number[] }[] = [
    {
      domain: "Self-Awareness",
      items: [
        "I can describe my emotions accurately",
        "I know what makes me feel stressed",
        "I can recognize my strengths and weaknesses",
        "I understand how my emotions affect my behavior",
        "I feel confident in my ability to handle challenges",
      ],
      responses: [3, 2, 3, 2, 3],
    },
    {
      domain: "Self-Management",
      items: [
        "I can calm myself down when I'm upset",
        "I can set goals and work toward them",
        "I can stay focused on a task even when it's difficult",
        "I can manage my time well for schoolwork and activities",
        "I can control my temper in frustrating situations",
      ],
      responses: [2, 3, 2, 3, 2],
    },
    {
      domain: "Social Awareness",
      items: [
        "I can understand how other people feel",
        "I respect people who are different from me",
        "I notice when someone is being treated unfairly",
        "I try to understand things from another person's point of view",
        "I appreciate the diversity in my school and community",
      ],
      responses: [4, 3, 3, 3, 4],
    },
    {
      domain: "Relationship Skills",
      items: [
        "I can work well with others in a group",
        "I can resolve conflicts without fighting",
        "I can communicate my needs clearly to others",
        "I can ask for help when I need it",
        "I can be a good listener when someone is talking to me",
      ],
      responses: [2, 3, 3, 2, 3],
    },
    {
      domain: "Responsible Decision-Making",
      items: [
        "I think about how my choices affect others",
        "I can say no to things that are wrong",
        "I consider the consequences before I act",
        "I try to make choices that are safe and healthy",
        "I can evaluate whether information I see online is trustworthy",
      ],
      responses: [3, 4, 3, 3, 2],
    },
  ];

  let id = 1;
  const questions: ScreenerQuestion[] = [];
  for (const d of domains) {
    for (let i = 0; i < d.items.length; i++) {
      questions.push({
        id: id++,
        text: d.items[i]!,
        response: d.responses[i]!,
        responseLabel: SEL_RESPONSE_SCALE[d.responses[i]!]!,
        domain: d.domain,
      });
    }
  }
  return questions;
}

const SCREENER_QUESTIONS_MAP: Record<string, () => ScreenerQuestionsData> = {
  "PHQ-9": () => ({
    title: "PHQ-9",
    subtitle: "Patient Health Questionnaire (Depression)",
    completedDate: "Feb 15, 2026",
    responseScale: PHQ9_RESPONSE_SCALE,
    questions: generatePHQ9Questions(),
  }),
  "GAD-7": () => ({
    title: "GAD-7",
    subtitle: "Generalized Anxiety Disorder Scale",
    completedDate: "Feb 15, 2026",
    responseScale: GAD7_RESPONSE_SCALE,
    questions: generateGAD7Questions(),
  }),
  "PHQ-A": () => ({
    title: "PHQ-A",
    subtitle: "Patient Health Questionnaire — Adolescent",
    completedDate: "Feb 15, 2026",
    responseScale: PHQ9_RESPONSE_SCALE,
    questions: generatePHQAQuestions(),
  }),
  "GAD-2": () => ({
    title: "GAD-2",
    subtitle: "Generalized Anxiety Disorder — 2-Item Screener",
    completedDate: "Feb 15, 2026",
    responseScale: GAD2_RESPONSE_SCALE,
    questions: generateGAD2Questions(),
  }),
  SCARED: () => ({
    title: "SCARED",
    subtitle: "Screen for Child Anxiety Related Disorders",
    completedDate: "Feb 15, 2026",
    responseScale: SCARED_RESPONSE_SCALE,
    questions: generateSCAREDQuestions(),
  }),
  SDQ: () => ({
    title: "SDQ",
    subtitle: "Strengths & Difficulties Questionnaire",
    completedDate: "Feb 15, 2026",
    responseScale: SDQ_RESPONSE_SCALE,
    questions: generateSDQQuestions(),
  }),
  SEL: () => ({
    title: "SEL Assessment",
    subtitle: "Social-Emotional Learning (CASEL)",
    completedDate: "Feb 15, 2026",
    responseScale: SEL_RESPONSE_SCALE,
    questions: generateSELQuestions(),
  }),
};

function getResponseColor(response: number, maxResponse: number): string {
  const ratio = response / maxResponse;
  if (ratio === 0) return "bg-emerald-100 text-emerald-700";
  if (ratio <= 0.33) return "bg-blue-100 text-blue-700";
  if (ratio <= 0.66) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function ViewQuestionsModal({ screenerKey, onClose }: { screenerKey: string; onClose: () => void }) {
  const data = SCREENER_QUESTIONS_MAP[screenerKey]?.();
  if (!data) return null;

  const maxResponse = data.responseScale.length - 1;
  const totalScore = data.questions.reduce((sum, q) => sum + q.response, 0);
  const maxTotal = data.questions.length * maxResponse;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative mx-4 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">{data.title}</h2>
            <p className="text-gray-500 text-sm">{data.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-bold text-gray-900 text-sm">{totalScore}/{maxTotal}</p>
              <p className="text-gray-400 text-[10px]">{data.completedDate}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Response Scale Legend */}
        <div className="border-b bg-gray-50 px-6 py-2.5">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Response Scale</p>
          <div className="flex flex-wrap gap-1.5">
            {data.responseScale.map((label, i) => (
              <span key={label} className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", getResponseColor(i, maxResponse))}>
                {i} = {label}
              </span>
            ))}
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-2">
            {data.questions.map((q) => (
              <div key={q.id} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3 transition-colors hover:bg-gray-50">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">
                  {q.id}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">{q.text}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", getResponseColor(q.response, maxResponse))}>
                      {q.response}
                    </span>
                    <span className="text-[11px] text-gray-500">{q.responseLabel}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-3">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-xs">{data.questions.length} questions · Most recent administration</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SELFlowModal({ onClose }: { onClose: () => void }) {
  const data = SCREENER_QUESTIONS_MAP["SEL"]!();
  const maxResponse = data.responseScale.length - 1;
  const [activeDomain, setActiveDomain] = useState(0);

  const domainNames = Object.keys(SEL_DOMAIN_COLORS);
  const grouped = domainNames.map((name) => ({
    name,
    colors: SEL_DOMAIN_COLORS[name]!,
    questions: data.questions.filter((q) => q.domain === name),
  }));

  const current = grouped[activeDomain]!;
  const domainScore = current.questions.reduce((s, q) => s + q.response, 0);
  const domainMax = current.questions.length * maxResponse;
  const totalScore = data.questions.reduce((s, q) => s + q.response, 0);
  const totalMax = data.questions.length * maxResponse;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative mx-4 flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">SEL Assessment</h2>
            <p className="text-gray-500 text-sm">Social-Emotional Learning (CASEL) · {data.questions.length} questions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-bold text-gray-900 text-sm">{totalScore}/{totalMax}</p>
              <p className="text-gray-400 text-[10px]">{data.completedDate}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Domain Tabs */}
        <div className="border-b bg-gray-50 px-4 py-2">
          <div className="flex gap-1">
            {grouped.map((g, i) => {
              const gScore = g.questions.reduce((s, q) => s + q.response, 0);
              const gMax = g.questions.length * maxResponse;
              const pct = Math.round((gScore / gMax) * 100);
              return (
                <button
                  key={g.name}
                  type="button"
                  onClick={() => setActiveDomain(i)}
                  className={cn(
                    "flex-1 rounded-lg px-2 py-2 text-center transition-all",
                    i === activeDomain
                      ? cn("border shadow-sm bg-white", g.colors.accent)
                      : "hover:bg-gray-100",
                  )}
                >
                  <p className={cn("text-[10px] font-semibold leading-tight", i === activeDomain ? g.colors.text : "text-gray-500")}>
                    {g.name}
                  </p>
                  <p className={cn("mt-0.5 text-xs font-bold", i === activeDomain ? "text-gray-900" : "text-gray-400")}>
                    {pct}%
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Domain Header */}
        <div className={cn("flex items-center justify-between px-6 py-3 border-b", current.colors.bg)}>
          <div className="flex items-center gap-2">
            <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg bg-white/80")}>
              <ClipboardList className={cn("h-3.5 w-3.5", current.colors.icon)} />
            </div>
            <div>
              <p className={cn("text-sm font-semibold", current.colors.text)}>{current.name}</p>
              <p className="text-[10px] text-gray-500">{current.questions.length} questions in this domain</p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn("text-sm font-bold", current.colors.text)}>{domainScore}/{domainMax}</p>
            <p className="text-[10px] text-gray-400">{Math.round((domainScore / domainMax) * 100)}% score</p>
          </div>
        </div>

        {/* Response Scale Legend */}
        <div className="border-b px-6 py-2">
          <div className="flex flex-wrap gap-1.5">
            {data.responseScale.map((label, i) => (
              <span key={label} className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", getResponseColor(i, maxResponse))}>
                {i} = {label}
              </span>
            ))}
          </div>
        </div>

        {/* Questions */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-2">
            {current.questions.map((q, idx) => (
              <div key={q.id} className={cn("flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50", current.colors.accent, "bg-white")}>
                <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", current.colors.bg, current.colors.text)}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">{q.text}</p>
                  <div className="mt-2 flex items-center gap-1">
                    {data.responseScale.map((_, ri) => (
                      <div
                        key={ri}
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold transition-all",
                          ri === q.response
                            ? cn("ring-2 ring-offset-1", getResponseColor(ri, maxResponse), ri <= 1 ? "ring-emerald-300" : ri <= 2 ? "ring-blue-300" : ri <= 3 ? "ring-amber-300" : "ring-red-300")
                            : "bg-gray-100 text-gray-400",
                        )}
                      >
                        {ri}
                      </div>
                    ))}
                    <span className="ml-2 text-[11px] text-gray-500">{q.responseLabel}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with navigation */}
        <div className="border-t bg-gray-50 px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveDomain(Math.max(0, activeDomain - 1))}
              disabled={activeDomain === 0}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                activeDomain === 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100",
              )}
            >
              ← Previous Domain
            </button>
            <p className="text-[10px] text-gray-400">
              Domain {activeDomain + 1} of {grouped.length}
            </p>
            {activeDomain < grouped.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveDomain(activeDomain + 1)}
                className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800"
              >
                Next Domain →
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewResponsesButton({ screenerKey }: { screenerKey: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        <Eye className="h-3.5 w-3.5" />
        View Responses
      </button>
      {open && (
        screenerKey === "SEL"
          ? <SELFlowModal onClose={() => setOpen(false)} />
          : <ViewQuestionsModal screenerKey={screenerKey} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

// ─── SCARED Card ────────────────────────────────────────────────────

function SCAREDCard({ patientName }: { patientName: string }) {
  const [expanded, setExpanded] = useState(false);
  const history = generateSCAREDHistory(patientName);
  const latest = history[history.length - 1]!;
  const previous = history.length >= 2 ? history[history.length - 2]! : null;
  const severity = getSCAREDSeverity(latest.total);

  const chartData = history.map((s) => ({
    date: formatChartDate(s.date),
    Total: s.total,
    ...Object.fromEntries(
      Object.entries(s.subscales).map(([k, v]) => [SCARED_SUBSCALE_INFO[k as SCAREDSubscale].label, v]),
    ),
  }));

  return (
    <div className="rounded-xl border bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between p-5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
            <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-900">SCARED</h3>
            <p className="text-[10px] text-gray-400">Screen for Child Anxiety Related Disorders</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{latest.total}</span>
              <span className="text-xs text-gray-400">/ {SCARED_MAX_TOTAL}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={cn("text-[10px]", severity.color, severity.bg)}>
                {severity.label}
              </Badge>
              {previous && <TrendIndicator current={latest.total} previous={previous.total} />}
            </div>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t px-5 pb-5 pt-4 space-y-4">
          {/* Trend Chart */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Score Trend</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="scaredGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis domain={[0, SCARED_MAX_TOTAL]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Area type="monotone" dataKey="Total" stroke="#ef4444" fill="url(#scaredGrad)" strokeWidth={2} dot={{ r: 3, fill: "#ef4444" }} />
                {/* Clinical cutoff reference line */}
                <Line type="monotone" dataKey={() => SCARED_TOTAL_CUTOFF} stroke="#dc2626" strokeDasharray="6 3" strokeWidth={1} dot={false} name="Cutoff (25)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Subscale Breakdown */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Subscale Breakdown (Latest)</p>
            <div className="space-y-2">
              {(Object.entries(SCARED_SUBSCALE_INFO) as [SCAREDSubscale, typeof SCARED_SUBSCALE_INFO[SCAREDSubscale]][]).map(([key, info]) => (
                <ScoreBar
                  key={key}
                  value={latest.subscales[key]}
                  max={info.maxScore}
                  cutoff={info.cutoff}
                  color={info.color}
                  label={info.label}
                />
              ))}
            </div>
          </div>

          {/* Subscale Trend Chart */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Subscale Trends</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {Object.values(SCARED_SUBSCALE_INFO).map((info) => (
                  <Line key={info.label} type="monotone" dataKey={info.label} stroke={info.color} strokeWidth={1.5} dot={{ r: 2 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Clinical Note */}
          <ViewResponsesButton screenerKey="SCARED" />
        </div>
      )}
    </div>
  );
}

// ─── SDQ Card ───────────────────────────────────────────────────────

function SDQCard({ patientName }: { patientName: string }) {
  const [expanded, setExpanded] = useState(false);
  const history = generateSDQHistory(patientName);
  const latest = history[history.length - 1]!;
  const previous = history.length >= 2 ? history[history.length - 2]! : null;
  const band = getSDQBand(latest.totalDifficulties);

  const chartData = history.map((s) => ({
    date: formatChartDate(s.date),
    "Total Difficulties": s.totalDifficulties,
    Impact: s.impact,
    ...Object.fromEntries(
      Object.entries(s.subscales).map(([k, v]) => [SDQ_SUBSCALE_INFO[k as SDQSubscale].label, v]),
    ),
  }));

  return (
    <div className="rounded-xl border bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between p-5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
            <ClipboardList className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-900">SDQ</h3>
            <p className="text-[10px] text-gray-400">Strengths & Difficulties Questionnaire</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{latest.totalDifficulties}</span>
              <span className="text-xs text-gray-400">/ 40</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={cn("text-[10px]", band.color, band.bg)}>
                {band.label}
              </Badge>
              {previous && <TrendIndicator current={latest.totalDifficulties} previous={previous.totalDifficulties} />}
            </div>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t px-5 pb-5 pt-4 space-y-4">
          {/* Trend Chart */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Total Difficulties Trend</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sdqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis domain={[0, 40]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Area type="monotone" dataKey="Total Difficulties" stroke="#f59e0b" fill="url(#sdqGrad)" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b" }} />
                {/* Normal/Borderline boundary */}
                <Line type="monotone" dataKey={() => 14} stroke="#f59e0b" strokeDasharray="6 3" strokeWidth={1} dot={false} name="Borderline (14)" />
                {/* Borderline/Abnormal boundary */}
                <Line type="monotone" dataKey={() => 17} stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1} dot={false} name="Abnormal (17)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Subscale Breakdown */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Subscale Breakdown (Latest)</p>
            <div className="space-y-2">
              {(Object.entries(SDQ_SUBSCALE_INFO) as [SDQSubscale, typeof SDQ_SUBSCALE_INFO[SDQSubscale]][]).map(([key, info]) => (
                <ScoreBar
                  key={key}
                  value={latest.subscales[key]}
                  max={info.maxScore}
                  cutoff={info.isStrength ? undefined : info.abnormal}
                  color={info.color}
                  label={`${info.label}${info.isStrength ? " (Strength)" : ""}`}
                />
              ))}
            </div>
          </div>

          {/* Subscale Trends */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Subscale Trends</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {Object.values(SDQ_SUBSCALE_INFO).map((info) => (
                  <Line key={info.label} type="monotone" dataKey={info.label} stroke={info.color} strokeWidth={1.5} dot={{ r: 2 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Impact Score */}
          <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
            <span className="text-xs text-gray-500">Impact Score:</span>
            <span className="text-sm font-bold text-gray-900">{latest.impact}/10</span>
            <span className={cn("text-[10px]", latest.impact >= 2 ? "text-red-600" : "text-emerald-600")}>
              {latest.impact >= 2 ? "Significant impact on daily functioning" : "Low impact"}
            </span>
          </div>

          {/* Clinical Note */}
          <ViewResponsesButton screenerKey="SDQ" />
        </div>
      )}
    </div>
  );
}

// ─── SEL Card ───────────────────────────────────────────────────────

function SELCard({ patientName }: { patientName: string }) {
  const [expanded, setExpanded] = useState(false);
  const history = generateSELHistory(patientName);
  const latest = history[history.length - 1]!;
  const previous = history.length >= 2 ? history[history.length - 2]! : null;

  const getLevel = (score: number) => {
    if (score >= 80) return { label: "Strong", color: "text-emerald-700", bg: "bg-emerald-50" };
    if (score >= 60) return { label: "Developing", color: "text-blue-700", bg: "bg-blue-50" };
    if (score >= 40) return { label: "Emerging", color: "text-amber-700", bg: "bg-amber-50" };
    return { label: "Needs Support", color: "text-red-700", bg: "bg-red-50" };
  };

  const level = getLevel(latest.overall);

  const chartData = history.map((s) => ({
    date: formatChartDate(s.date),
    Overall: s.overall,
    ...Object.fromEntries(
      Object.entries(s.domains).map(([k, v]) => [SEL_DOMAIN_INFO[k as SELDomain].label, v]),
    ),
  }));

  return (
    <div className="rounded-xl border bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between p-5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
            <ClipboardList className="h-4.5 w-4.5 text-violet-500" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-900">SEL Assessment</h3>
            <p className="text-[10px] text-gray-400">Social-Emotional Learning (CASEL)</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{latest.overall}</span>
              <span className="text-xs text-gray-400">/ 100</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={cn("text-[10px]", level.color, level.bg)}>
                {level.label}
              </Badge>
              {previous && <TrendIndicator current={latest.overall} previous={previous.overall} lowerIsBetter={false} />}
            </div>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t px-5 pb-5 pt-4 space-y-4">
          {/* Trend Chart */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Overall SEL Trend</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="selGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Area type="monotone" dataKey="Overall" stroke="#8b5cf6" fill="url(#selGrad)" strokeWidth={2} dot={{ r: 3, fill: "#8b5cf6" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Domain Breakdown */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Domain Breakdown (Latest)</p>
            <div className="space-y-2">
              {(Object.entries(SEL_DOMAIN_INFO) as [SELDomain, typeof SEL_DOMAIN_INFO[SELDomain]][]).map(([key, info]) => (
                <ScoreBar
                  key={key}
                  value={latest.domains[key]}
                  max={100}
                  color={info.color}
                  label={info.label}
                />
              ))}
            </div>
          </div>

          {/* Domain Trends */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Domain Trends</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {Object.values(SEL_DOMAIN_INFO).map((info) => (
                  <Line key={info.label} type="monotone" dataKey={info.label} stroke={info.color} strokeWidth={1.5} dot={{ r: 2 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <ViewResponsesButton screenerKey="SEL" />
        </div>
      )}
    </div>
  );
}

// ─── PHQ-9 Assessment ───────────────────────────────────────────────
// Patient Health Questionnaire-9 (Depression)
// Kroenke, Spitzer & Williams (2001). J Gen Intern Med, 16(9), 606-613.

const PHQ9_MAX = 27;

type PHQ9Score = {
  date: string;
  total: number;
};

function getPHQ9Severity(total: number): { label: string; color: string; bg: string } {
  if (total <= 4) return { label: "Minimal Depression", color: "text-emerald-700", bg: "bg-emerald-50" };
  if (total <= 9) return { label: "Mild Depression", color: "text-blue-700", bg: "bg-blue-50" };
  if (total <= 14) return { label: "Moderate Depression", color: "text-amber-700", bg: "bg-amber-50" };
  if (total <= 19) return { label: "Moderately Severe", color: "text-orange-700", bg: "bg-orange-50" };
  return { label: "Severe Depression", color: "text-red-700", bg: "bg-red-50" };
}

function generatePHQ9History(patientName: string): PHQ9Score[] {
  const seeds: Record<string, { start: number; trend: number }> = {
    "Sarah Mitchell": { start: 16, trend: -2 },
    "David Chen": { start: 10, trend: -1 },
    "Jessica Brown": { start: 20, trend: -3 },
    "Tyler Davis": { start: 14, trend: 1 },
    "Alex Patel": { start: 8, trend: -1 },
  };
  const seed = seeds[patientName] ?? { start: 13, trend: -1 };
  const dates = ["2025-10-15", "2025-11-15", "2025-12-15", "2026-01-15", "2026-02-15"];
  return dates.map((date, i) => ({
    date,
    total: Math.max(0, Math.min(PHQ9_MAX, seed.start + seed.trend * i + (i % 2 === 0 ? 1 : -1))),
  }));
}

function PHQ9Card({ patientName }: { patientName: string }) {
  const [expanded, setExpanded] = useState(false);
  const history = generatePHQ9History(patientName);
  const latest = history[history.length - 1]!;
  const previous = history.length >= 2 ? history[history.length - 2]! : null;
  const severity = getPHQ9Severity(latest.total);

  const chartData = history.map((s) => ({
    date: formatChartDate(s.date),
    Total: s.total,
  }));

  return (
    <div className="rounded-xl border bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between p-5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
            <ClipboardList className="h-4.5 w-4.5 text-violet-500" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-900">PHQ-9</h3>
            <p className="text-[10px] text-gray-400">Patient Health Questionnaire (Depression)</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{latest.total}</span>
              <span className="text-xs text-gray-400">/ {PHQ9_MAX}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={cn("text-[10px]", severity.color, severity.bg)}>
                {severity.label}
              </Badge>
              {previous && <TrendIndicator current={latest.total} previous={previous.total} />}
            </div>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t px-5 pb-5 pt-4 space-y-4">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Score Trend</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="phq9Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis domain={[0, PHQ9_MAX]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Area type="monotone" dataKey="Total" stroke="#8b5cf6" fill="url(#phq9Grad)" strokeWidth={2} dot={{ r: 3, fill: "#8b5cf6" }} />
                <Line type="monotone" dataKey={() => 10} stroke="#f59e0b" strokeDasharray="6 3" strokeWidth={1} dot={false} name="Moderate (10)" />
                <Line type="monotone" dataKey={() => 20} stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1} dot={false} name="Severe (20)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <ViewResponsesButton screenerKey="PHQ-9" />
        </div>
      )}
    </div>
  );
}

// ─── GAD-7 Assessment ───────────────────────────────────────────────
// Generalized Anxiety Disorder 7-item scale
// Spitzer, Kroenke, Williams & Löwe (2006). Arch Intern Med, 166(10), 1092-1097.

const GAD7_MAX = 21;

type GAD7Score = {
  date: string;
  total: number;
};

function getGAD7Severity(total: number): { label: string; color: string; bg: string } {
  if (total <= 4) return { label: "Minimal Anxiety", color: "text-emerald-700", bg: "bg-emerald-50" };
  if (total <= 9) return { label: "Mild Anxiety", color: "text-blue-700", bg: "bg-blue-50" };
  if (total <= 14) return { label: "Moderate Anxiety", color: "text-amber-700", bg: "bg-amber-50" };
  return { label: "Severe Anxiety", color: "text-red-700", bg: "bg-red-50" };
}

function generateGAD7History(patientName: string): GAD7Score[] {
  const seeds: Record<string, { start: number; trend: number }> = {
    "Sarah Mitchell": { start: 14, trend: -2 },
    "David Chen": { start: 8, trend: -1 },
    "Jessica Brown": { start: 17, trend: -2 },
    "Tyler Davis": { start: 12, trend: 1 },
    "Alex Patel": { start: 6, trend: -1 },
  };
  const seed = seeds[patientName] ?? { start: 11, trend: -1 };
  const dates = ["2025-10-15", "2025-11-15", "2025-12-15", "2026-01-15", "2026-02-15"];
  return dates.map((date, i) => ({
    date,
    total: Math.max(0, Math.min(GAD7_MAX, seed.start + seed.trend * i + (i % 2 === 0 ? 1 : -1))),
  }));
}

function GAD7Card({ patientName }: { patientName: string }) {
  const [expanded, setExpanded] = useState(false);
  const history = generateGAD7History(patientName);
  const latest = history[history.length - 1]!;
  const previous = history.length >= 2 ? history[history.length - 2]! : null;
  const severity = getGAD7Severity(latest.total);

  const chartData = history.map((s) => ({
    date: formatChartDate(s.date),
    Total: s.total,
  }));

  return (
    <div className="rounded-xl border bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between p-5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
            <ClipboardList className="h-4.5 w-4.5 text-blue-500" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-900">GAD-7</h3>
            <p className="text-[10px] text-gray-400">Generalized Anxiety Disorder Scale</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{latest.total}</span>
              <span className="text-xs text-gray-400">/ {GAD7_MAX}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={cn("text-[10px]", severity.color, severity.bg)}>
                {severity.label}
              </Badge>
              {previous && <TrendIndicator current={latest.total} previous={previous.total} />}
            </div>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t px-5 pb-5 pt-4 space-y-4">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Score Trend</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gad7Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis domain={[0, GAD7_MAX]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Area type="monotone" dataKey="Total" stroke="#3b82f6" fill="url(#gad7Grad)" strokeWidth={2} dot={{ r: 3, fill: "#3b82f6" }} />
                <Line type="monotone" dataKey={() => 10} stroke="#f59e0b" strokeDasharray="6 3" strokeWidth={1} dot={false} name="Moderate (10)" />
                <Line type="monotone" dataKey={() => 15} stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1} dot={false} name="Severe (15)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <ViewResponsesButton screenerKey="GAD-7" />
        </div>
      )}
    </div>
  );
}

// ─── PHQ-A Assessment ───────────────────────────────────────────────
// Patient Health Questionnaire for Adolescents (Modified PHQ-9)
// Johnson, Harris, Spitzer & Williams (2002). J Adolesc Health, 30(3), 196-204.

const PHQA_MAX = 27;

type PHQAScore = {
  date: string;
  total: number;
};

function getPHQASeverity(total: number): { label: string; color: string; bg: string } {
  if (total <= 4) return { label: "Minimal Depression", color: "text-emerald-700", bg: "bg-emerald-50" };
  if (total <= 9) return { label: "Mild Depression", color: "text-blue-700", bg: "bg-blue-50" };
  if (total <= 14) return { label: "Moderate Depression", color: "text-amber-700", bg: "bg-amber-50" };
  if (total <= 19) return { label: "Moderately Severe", color: "text-orange-700", bg: "bg-orange-50" };
  return { label: "Severe Depression", color: "text-red-700", bg: "bg-red-50" };
}

function generatePHQAHistory(patientName: string): PHQAScore[] {
  const seeds: Record<string, { start: number; trend: number }> = {
    "Sarah Mitchell": { start: 18, trend: -2 },
    "David Chen": { start: 12, trend: -1 },
    "Jessica Brown": { start: 22, trend: -3 },
    "Tyler Davis": { start: 15, trend: 1 },
    "Alex Patel": { start: 9, trend: -1 },
  };
  const seed = seeds[patientName] ?? { start: 14, trend: -1 };
  const dates = ["2025-10-15", "2025-11-15", "2025-12-15", "2026-01-15", "2026-02-15"];
  return dates.map((date, i) => ({
    date,
    total: Math.max(0, Math.min(PHQA_MAX, seed.start + seed.trend * i + (i % 2 === 0 ? 1 : -1))),
  }));
}

function PHQACard({ patientName }: { patientName: string }) {
  const [expanded, setExpanded] = useState(false);
  const history = generatePHQAHistory(patientName);
  const latest = history[history.length - 1]!;
  const previous = history.length >= 2 ? history[history.length - 2]! : null;
  const severity = getPHQASeverity(latest.total);

  const chartData = history.map((s) => ({
    date: formatChartDate(s.date),
    Total: s.total,
  }));

  return (
    <div className="rounded-xl border bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between p-5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
            <ClipboardList className="h-4.5 w-4.5 text-purple-500" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-900">PHQ-A</h3>
            <p className="text-[10px] text-gray-400">Patient Health Questionnaire — Adolescent (Depression)</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{latest.total}</span>
              <span className="text-xs text-gray-400">/ {PHQA_MAX}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={cn("text-[10px]", severity.color, severity.bg)}>
                {severity.label}
              </Badge>
              {previous && <TrendIndicator current={latest.total} previous={previous.total} />}
            </div>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t px-5 pb-5 pt-4 space-y-4">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Score Trend</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="phqaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis domain={[0, PHQA_MAX]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Area type="monotone" dataKey="Total" stroke="#a855f7" fill="url(#phqaGrad)" strokeWidth={2} dot={{ r: 3, fill: "#a855f7" }} />
                <Line type="monotone" dataKey={() => 10} stroke="#f59e0b" strokeDasharray="6 3" strokeWidth={1} dot={false} name="Moderate (10)" />
                <Line type="monotone" dataKey={() => 20} stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1} dot={false} name="Severe (20)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <ViewResponsesButton screenerKey="PHQ-A" />
        </div>
      )}
    </div>
  );
}

// ─── GAD-2 Assessment ───────────────────────────────────────────────
// Generalized Anxiety Disorder 2-item (Ultra-brief screener)
// Kroenke, Spitzer, Williams & Löwe (2007). Ann Intern Med, 146(5), 317-325.

const GAD2_MAX = 6;

type GAD2Score = {
  date: string;
  total: number;
};

function getGAD2Severity(total: number): { label: string; color: string; bg: string } {
  if (total <= 2) return { label: "Below Threshold", color: "text-emerald-700", bg: "bg-emerald-50" };
  return { label: "Above Threshold — Further Eval", color: "text-red-700", bg: "bg-red-50" };
}

function generateGAD2History(patientName: string): GAD2Score[] {
  const seeds: Record<string, { start: number; trend: number }> = {
    "Sarah Mitchell": { start: 4, trend: -1 },
    "David Chen": { start: 2, trend: 0 },
    "Jessica Brown": { start: 5, trend: -1 },
    "Tyler Davis": { start: 3, trend: 0 },
    "Alex Patel": { start: 1, trend: 0 },
  };
  const seed = seeds[patientName] ?? { start: 3, trend: 0 };
  const dates = ["2025-10-15", "2025-11-15", "2025-12-15", "2026-01-15", "2026-02-15"];
  return dates.map((date, i) => ({
    date,
    total: Math.max(0, Math.min(GAD2_MAX, seed.start + seed.trend * i + (i % 2 === 0 ? 1 : -1))),
  }));
}

function GAD2Card({ patientName }: { patientName: string }) {
  const [expanded, setExpanded] = useState(false);
  const history = generateGAD2History(patientName);
  const latest = history[history.length - 1]!;
  const previous = history.length >= 2 ? history[history.length - 2]! : null;
  const severity = getGAD2Severity(latest.total);

  const chartData = history.map((s) => ({
    date: formatChartDate(s.date),
    Total: s.total,
  }));

  return (
    <div className="rounded-xl border bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between p-5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50">
            <ClipboardList className="h-4.5 w-4.5 text-cyan-500" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-900">GAD-2</h3>
            <p className="text-[10px] text-gray-400">Generalized Anxiety Disorder — 2-Item Screener</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{latest.total}</span>
              <span className="text-xs text-gray-400">/ {GAD2_MAX}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={cn("text-[10px]", severity.color, severity.bg)}>
                {severity.label}
              </Badge>
              {previous && <TrendIndicator current={latest.total} previous={previous.total} />}
            </div>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t px-5 pb-5 pt-4 space-y-4">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Score Trend</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gad2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis domain={[0, GAD2_MAX]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Area type="monotone" dataKey="Total" stroke="#06b6d4" fill="url(#gad2Grad)" strokeWidth={2} dot={{ r: 3, fill: "#06b6d4" }} />
                <Line type="monotone" dataKey={() => 3} stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1} dot={false} name="Threshold (3)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <ViewResponsesButton screenerKey="GAD-2" />
        </div>
      )}
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────

export function ClinicalAssessmentsDashboard({ patientName }: { patientName: string }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
        Clinical Assessments & Score Trends
      </h3>
      <div className="space-y-3">
        <PHQ9Card patientName={patientName} />
        <GAD7Card patientName={patientName} />
        <PHQACard patientName={patientName} />
        <GAD2Card patientName={patientName} />
        <SCAREDCard patientName={patientName} />
        <SDQCard patientName={patientName} />
        <SELCard patientName={patientName} />
      </div>
    </div>
  );
}
