"use client";

import {
  ArrowDown,
  ArrowUp,
  CheckSquare,
  FileText,
  Minus,
  ShieldAlert,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Card } from "@/lib/core-ui/card";
import { cn } from "@/lib/tailwind-utils";

type ViewMode = "weekly" | "quarterly";

// ── Time Period Helpers ─────────────────────────────────────────────
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

// ── Stat Card (admin style) ─────────────────────────────────────────
type StatCardConfig = {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBg: string;
  tag: string;
  tagBg: string;
  tagText: string;
  dotColor: string;
};

function StatCard({ card }: { card: StatCardConfig }) {
  return (
    <Card className="flex flex-col gap-3 rounded-xl border bg-white p-5 font-dm shadow-sm">
      <div className="flex items-center justify-between">
        <div className={cn("flex size-10 items-center justify-center rounded-full", card.iconBg)}>
          {card.icon}
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold text-xs",
            card.tagBg,
            card.tagText,
          )}
        >
          <span className={cn("size-1.5 rounded-full", card.dotColor)} />
          {card.tag}
        </span>
      </div>
      <div>
        <p className="font-bold text-3xl text-gray-900">{card.value}</p>
        <p className="mt-0.5 text-gray-500 text-sm">{card.label}</p>
        {card.change !== undefined && (
          <p className={cn(
            "mt-1 flex items-center gap-1 text-xs font-medium",
            card.change > 0 ? "text-green-600" : card.change < 0 ? "text-red-600" : "text-gray-400",
          )}>
            {card.change > 0 ? <ArrowUp className="size-3" /> : card.change < 0 ? <ArrowDown className="size-3" /> : <Minus className="size-3" />}
            {card.change > 0 ? "+" : ""}{card.change}% {card.changeLabel ?? "vs last period"}
          </p>
        )}
      </div>
    </Card>
  );
}

// ── Progress Bar ────────────────────────────────────────────────────
function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="w-36 text-gray-600 text-sm">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="w-10 text-right font-semibold text-gray-900 text-sm">{value}%</span>
    </div>
  );
}

// ── Mock Data ───────────────────────────────────────────────────────
const diagnosisDistribution = [
  { label: "F41.1 GAD", count: 14, pct: 39, color: "bg-teal-600" },
  { label: "F33.1 MDD", count: 8, pct: 22, color: "bg-teal-500" },
  { label: "F40.10 Social Phobia", count: 6, pct: 17, color: "bg-green-600" },
  { label: "F93.0 Separation Anxiety", count: 4, pct: 11, color: "bg-orange-500" },
  { label: "Other", count: 4, pct: 11, color: "bg-gray-400" },
];

const engagementByAge = [
  { group: "8–17", avgDays: 19.8, avgAdherence: 75, count: 24 },
  { group: "18–39", avgDays: 20.6, avgAdherence: 71, count: 8 },
  { group: "40–64", avgDays: 22.1, avgAdherence: 79, count: 3 },
  { group: "65+", avgDays: 23.4, avgAdherence: 82, count: 1 },
];

// ── Progress Chart Data ─────────────────────────────────────────────
const progressData = [
  { date: "Mon 12/8", pcl5: 72, phq9: 68 },
  { date: "Thu 12/12", pcl5: 70, phq9: 71 },
  { date: "Mon 12/16", pcl5: 68, phq9: 69 },
  { date: "Thu 12/20", pcl5: 65, phq9: 65 },
  { date: "Thu 1/1", pcl5: 62, phq9: 58 },
  { date: "Mon 1/6", pcl5: 58, phq9: 52 },
  { date: "Sat 1/24", pcl5: 45, phq9: 42 },
  { date: "Mon 2/3", pcl5: 42, phq9: 38 },
  { date: "Today", pcl5: 48, phq9: 45 },
];

function ProgressChart() {
  const [showPcl5, setShowPcl5] = useState(true);
  const [showPhq9, setShowPhq9] = useState(true);

  const maxValue = 100;
  const minValue = 0;
  const chartHeight = 160;
  const chartWidth = 100; // percentage

  const getY = (value: number) => {
    return chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
  };

  const createPath = (key: "pcl5" | "phq9") => {
    const points = progressData.map((d, i) => {
      const x = (i / (progressData.length - 1)) * 100;
      const y = getY(d[key]);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
    return points;
  };

  return (
    <Card className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Progress</h3>
      </div>
      
      <div className="relative" style={{ height: chartHeight + 40 }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 flex h-full flex-col justify-between text-gray-400 text-xs">
          <span>High</span>
          <span>Low</span>
        </div>
        
        {/* Chart area */}
        <div className="ml-8 h-full">
          <svg
            viewBox={`0 0 100 ${chartHeight}`}
            preserveAspectRatio="none"
            className="h-full w-full"
            style={{ height: chartHeight }}
          >
            {/* Grid lines */}
            <line x1="0" y1={chartHeight * 0.25} x2="100" y2={chartHeight * 0.25} stroke="#f3f4f6" strokeWidth="0.5" />
            <line x1="0" y1={chartHeight * 0.5} x2="100" y2={chartHeight * 0.5} stroke="#f3f4f6" strokeWidth="0.5" />
            <line x1="0" y1={chartHeight * 0.75} x2="100" y2={chartHeight * 0.75} stroke="#f3f4f6" strokeWidth="0.5" />
            
            {/* PCL-5 line */}
            {showPcl5 && (
              <>
                <path
                  d={createPath("pcl5")}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                {progressData.map((d, i) => (
                  <circle
                    key={`pcl5-${i}`}
                    cx={(i / (progressData.length - 1)) * 100}
                    cy={getY(d.pcl5)}
                    r="3"
                    fill="#3b82f6"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </>
            )}
            
            {/* PHQ-9 line */}
            {showPhq9 && (
              <>
                <path
                  d={createPath("phq9")}
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                {progressData.map((d, i) => (
                  <circle
                    key={`phq9-${i}`}
                    cx={(i / (progressData.length - 1)) * 100}
                    cy={getY(d.phq9)}
                    r="3"
                    fill="#93c5fd"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </>
            )}
          </svg>
          
          {/* X-axis labels */}
          <div className="mt-1 flex justify-between text-gray-400 text-xs">
            <span>Mon 12/8</span>
            <span>Thu 1/1</span>
            <span>Sat 1/24</span>
            <span>Today</span>
          </div>
        </div>
      </div>
      
      {/* Legend with checkboxes */}
      <div className="mt-4 flex items-center gap-6">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={showPcl5}
            onChange={(e) => setShowPcl5(e.target.checked)}
            className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-blue-500" />
            <span className="text-gray-700 text-sm font-medium">PCL-5 (Monthly)</span>
          </span>
          <span className="text-gray-400 text-xs">Trauma</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={showPhq9}
            onChange={(e) => setShowPhq9(e.target.checked)}
            className="size-4 rounded border-gray-300 text-blue-300 focus:ring-blue-300"
          />
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-blue-300" />
            <span className="text-gray-700 text-sm font-medium">PHQ-9</span>
          </span>
          <span className="text-gray-400 text-xs">Depression</span>
        </label>
      </div>
    </Card>
  );
}

// ── KPI Card Configs (admin style) ──────────────────────────────────
const KPI_CARDS: StatCardConfig[] = [
  {
    label: "Reports to Sign",
    value: 5,
    change: -2,
    changeLabel: "from last week",
    icon: <FileText className="size-5 text-orange-500" />,
    iconBg: "bg-orange-50",
    tag: "Pending",
    tagBg: "bg-orange-100",
    tagText: "text-orange-700",
    dotColor: "bg-orange-500",
  },
  {
    label: "Safety Alerts (7d)",
    value: 2,
    change: 0,
    icon: <ShieldAlert className="size-5 text-red-600" />,
    iconBg: "bg-red-50",
    tag: "Urgent",
    tagBg: "bg-red-100",
    tagText: "text-red-700",
    dotColor: "bg-red-600",
  },
  {
    label: "Open Tasks",
    value: 8,
    change: -3,
    changeLabel: "from last week",
    icon: <CheckSquare className="size-5 text-blue-600" />,
    iconBg: "bg-blue-50",
    tag: "Pending",
    tagBg: "bg-blue-100",
    tagText: "text-blue-700",
    dotColor: "bg-blue-600",
  },
  {
    label: "Patient Caseload",
    value: 36,
    change: 12,
    changeLabel: "32 active. 4 inactive.",
    icon: <Users className="size-5 text-teal-600" />,
    iconBg: "bg-teal-50",
    tag: "Active",
    tagBg: "bg-teal-100",
    tagText: "text-teal-700",
    dotColor: "bg-teal-600",
  },
];

// ── Main Component ──────────────────────────────────────────────────
export function InsightsDashboard() {
  const weekOptions = useMemo(() => generateWeekOptions(), []);
  const quarterOptions = useMemo(() => generateQuarterOptions(), []);

  const [viewMode, setViewMode] = useState<ViewMode>("quarterly");
  const [selectedWeek, setSelectedWeek] = useState("w-0");
  const [selectedQuarter, setSelectedQuarter] = useState(() => quarterOptions[0]?.value ?? "q1-2026");

  const currentPeriodLabel = viewMode === "weekly"
    ? weekOptions.find((w) => w.value === selectedWeek)?.label ?? "This Week"
    : quarterOptions.find((q) => q.value === selectedQuarter)?.label ?? "This Quarter";

  return (
    <div className="flex flex-col gap-6 font-dm">
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

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPI_CARDS.map((card) => (
          <StatCard key={card.label} card={card} />
        ))}
      </div>

      {/* Progress Chart + RTM Compliance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProgressChart />

        <Card className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">RTM Data Capture Compliance</h3>
            <p className="text-gray-500 text-sm">Caseload engagement with required RTM data collection</p>
          </div>
          <div className="space-y-2">
            <ProgressBar label="Daily Check-ins" value={82} color="bg-green-500" />
            <ProgressBar label="Screener Completion" value={74} color="bg-teal-500" />
            <ProgressBar label="Exercise Adherence" value={61} color="bg-teal-400" />
          </div>
          <div className="mt-4 rounded-lg bg-blue-50 p-3">
            <p className="text-blue-700 text-sm">
              <strong>Billing Tip:</strong> 16+ data days/month required for CPT 98978. Currently 87.5% of your caseload meets this threshold.
            </p>
          </div>
        </Card>
      </div>

      {/* Diagnosis Distribution + Engagement by Age */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">Diagnosis Distribution</h3>
            <p className="text-gray-500 text-sm">ICD-10 primary diagnosis breakdown across caseload</p>
          </div>
          <div className="space-y-3">
            {diagnosisDistribution.map((d) => (
              <div key={d.label} className="flex items-center gap-3">
                <div className={cn("size-3 shrink-0 rounded-sm", d.color)} />
                <span className="w-44 text-gray-700 text-sm">{d.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div className={cn("h-full rounded-full", d.color)} style={{ width: `${d.pct}%` }} />
                </div>
                <span className="w-16 text-right font-semibold text-gray-900 text-xs">{d.count} ({d.pct}%)</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">Engagement by Age Group</h3>
            <p className="text-gray-500 text-sm">Average data days and adherence by patient age cohort</p>
          </div>
          <div className="space-y-3">
            {engagementByAge.map((g) => (
              <div key={g.group} className="rounded-lg bg-gray-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">Ages {g.group}</span>
                    <span className="ml-2 text-gray-500 text-xs">{g.count} patients</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">{g.avgDays}</p>
                      <p className="text-gray-500 text-xs">avg days</p>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-bold text-sm", g.avgAdherence >= 75 ? "text-green-600" : g.avgAdherence >= 50 ? "text-orange-500" : "text-red-600")}>{g.avgAdherence}%</p>
                      <p className="text-gray-500 text-xs">adherence</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </div>
  );
}
