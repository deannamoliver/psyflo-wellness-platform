"use client";

import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  DollarSign,
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
const revenueByMonth = [
  { month: "Oct", revenue: 5100, count: 22 },
  { month: "Nov", revenue: 5800, count: 24 },
  { month: "Dec", revenue: 7100, count: 29 },
  { month: "Jan", revenue: 7800, count: 32 },
  { month: "Feb", revenue: 8200, count: 34 },
  { month: "Mar", revenue: 8820, count: 36 },
];

const cptBreakdown = [
  { code: "98978", desc: "RTM Device Monitoring (16+ days)", count: 28, revenue: 3724, color: "bg-teal-600" },
  { code: "98986", desc: "RTM Short-Period (2–15 days)", count: 6, revenue: 714, color: "bg-teal-500" },
  { code: "98980", desc: "RTM Mgmt First 20 min", count: 24, revenue: 2352, color: "bg-green-600" },
  { code: "98981", desc: "RTM Mgmt Addl 20 min", count: 8, revenue: 784, color: "bg-orange-500" },
];

const screenerTrajectories = [
  { label: "PHQ-9 Mean", intake: 14.2, d30: 11.8, d60: 9.4, d90: 7.6 },
  { label: "GAD-7 Mean", intake: 12.1, d30: 10.5, d60: 8.9, d90: 7.2 },
  { label: "SCARED Mean", intake: 28.4, d30: 24.1, d60: 21.3, d90: 18.7 },
  { label: "Wellness Score", intake: 2.4, d30: 2.9, d60: 3.3, d90: 3.7 },
];

const outcomeBreakdown = [
  { name: "PHQ-9 Improvement (≥5pt)", improved: 68, stable: 22, declined: 10 },
  { name: "GAD-7 Improvement (≥5pt)", improved: 62, stable: 25, declined: 13 },
  { name: "Wellness Score Trend", improved: 71, stable: 20, declined: 9 },
  { name: "Treatment Adherence", improved: 58, stable: 30, declined: 12 },
];

const diagnosisDistribution = [
  { label: "F41.1 GAD", count: 14, pct: 39, color: "bg-teal-600" },
  { label: "F33.1 MDD", count: 8, pct: 22, color: "bg-teal-500" },
  { label: "F40.10 Social Phobia", count: 6, pct: 17, color: "bg-green-600" },
  { label: "F93.0 Separation Anxiety", count: 4, pct: 11, color: "bg-orange-500" },
  { label: "Other", count: 4, pct: 11, color: "bg-gray-400" },
];

const engagementByAge = [
  { group: "8–12", avgDays: 18.2, avgAdherence: 72, count: 6 },
  { group: "13–17", avgDays: 21.4, avgAdherence: 78, count: 18 },
  { group: "18–25", avgDays: 19.8, avgAdherence: 68, count: 8 },
  { group: "26+", avgDays: 22.1, avgAdherence: 81, count: 4 },
];

const caseloadTable = [
  { name: "Jordan W.", age: 15, dx: "F41.1", daysUsed: 19, wellness: 3.8, trend: "up", adherence: 85, rtmStatus: "98978 Ready", crisis: "Feb 20" },
  { name: "Maya K.", age: 14, dx: "F33.1", daysUsed: 11, wellness: 2.1, trend: "down", adherence: 52, rtmStatus: "98986 Eligible", crisis: "None" },
  { name: "Alex R.", age: 17, dx: "F40.10", daysUsed: 6, wellness: 3.2, trend: "stable", adherence: 74, rtmStatus: "On Track", crisis: "None" },
  { name: "Priya S.", age: 13, dx: "F93.0", daysUsed: 3, wellness: 2.6, trend: "down", adherence: 38, rtmStatus: "Below Threshold", crisis: "None" },
  { name: "Daniel T.", age: 16, dx: "F41.1", daysUsed: 21, wellness: 4.3, trend: "up", adherence: 91, rtmStatus: "98978 Ready", crisis: "None" },
];

// ── KPI Card Configs (admin style) ──────────────────────────────────
const KPI_CARDS: StatCardConfig[] = [
  {
    label: "Active RTM Caseload",
    value: 36,
    change: 12,
    icon: <Users className="size-5 text-teal-600" />,
    iconBg: "bg-teal-50",
    tag: "Active",
    tagBg: "bg-teal-100",
    tagText: "text-teal-700",
    dotColor: "bg-teal-600",
  },
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
    label: "Crisis Events (7d)",
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
    label: "Est. Revenue (Mo)",
    value: "$8,820",
    change: 10,
    icon: <DollarSign className="size-5 text-green-600" />,
    iconBg: "bg-green-50",
    tag: "On Track",
    tagBg: "bg-green-100",
    tagText: "text-green-700",
    dotColor: "bg-green-600",
  },
  {
    label: "Avg Wellness Score",
    value: "3.4",
    change: 6,
    icon: <Activity className="size-5 text-blue-600" />,
    iconBg: "bg-blue-50",
    tag: "Improving",
    tagBg: "bg-blue-100",
    tagText: "text-blue-700",
    dotColor: "bg-blue-600",
  },
  {
    label: "Avg Adherence",
    value: "74%",
    change: 3,
    icon: <CheckCircle2 className="size-5 text-teal-600" />,
    iconBg: "bg-teal-50",
    tag: "Good",
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

  const maxRevenue = Math.max(...revenueByMonth.map((d) => d.revenue));
  const totalRevenue = cptBreakdown.reduce((s, c) => s + c.revenue, 0);

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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {KPI_CARDS.map((card) => (
          <StatCard key={card.label} card={card} />
        ))}
      </div>

      {/* Revenue + CPT Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">RTM Revenue Trend</h3>
            <p className="text-gray-500 text-sm">Monthly estimated revenue from RTM CPT codes</p>
          </div>
          <div className="flex items-end gap-3" style={{ height: 200 }}>
            {revenueByMonth.map((d, i) => {
              const isLast = i === revenueByMonth.length - 1;
              return (
                <div key={d.month} className="group flex flex-1 flex-col items-center gap-1">
                  <span className={cn(
                    "text-xs font-semibold transition-opacity",
                    isLast ? "text-gray-900" : "text-gray-500 opacity-0 group-hover:opacity-100",
                  )}>
                    ${(d.revenue / 1000).toFixed(1)}k
                  </span>
                  <div
                    className={cn(
                      "w-full rounded-t-md transition-colors",
                      isLast ? "bg-teal-600" : "bg-gray-200 group-hover:bg-teal-400",
                    )}
                    style={{ height: `${(d.revenue / maxRevenue) * 160}px` }}
                  />
                  <span className={cn("text-xs", isLast ? "font-semibold text-gray-900" : "text-gray-500")}>{d.month}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <span className="text-gray-500 text-sm">6-month trend</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 font-semibold text-green-700 text-xs">
              <ArrowUp className="size-3" /> 73% growth
            </span>
          </div>
        </Card>

        <Card className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">CPT Code Breakdown</h3>
            <p className="text-gray-500 text-sm">Revenue by billing code</p>
          </div>
          <div className="space-y-3">
            {cptBreakdown.map((c) => {
              const pct = totalRevenue > 0 ? Math.round((c.revenue / totalRevenue) * 100) : 0;
              return (
                <div key={c.code} className="rounded-lg bg-gray-50 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("size-2.5 rounded-full", c.color)} />
                      <div>
                        <span className="font-semibold text-gray-900 text-sm">{c.code}</span>
                        <p className="text-gray-500 text-xs">{c.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">${c.revenue.toLocaleString()}</p>
                      <p className="text-gray-500 text-xs">{c.count} claims</p>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
                    <div className={cn("h-full rounded-full", c.color)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Clinical Outcome Trajectories */}
      <Card className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h3 className="font-semibold text-gray-900">Clinical Outcome Trajectories</h3>
          <p className="text-gray-500 text-sm">Mean screener scores from intake through 90 days across your caseload</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                {["Measure", "Intake", "30 Days", "60 Days", "90 Days", "Change", "Trajectory"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-500 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {screenerTrajectories.map((s) => {
                const change = s.d90 - s.intake;
                const isWellness = s.label === "Wellness Score";
                const isPositive = isWellness ? change > 0 : change < 0;
                return (
                  <tr key={s.label} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900 text-sm">{s.label}</td>
                    <td className="px-4 py-3 text-center text-red-600 text-sm">{s.intake}</td>
                    <td className="px-4 py-3 text-center text-orange-500 text-sm">{s.d30}</td>
                    <td className="px-4 py-3 text-center text-teal-600 text-sm">{s.d60}</td>
                    <td className={cn("px-4 py-3 text-center font-bold text-sm", isPositive ? "text-green-600" : "text-red-600")}>{s.d90}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("inline-flex items-center gap-0.5 font-semibold text-sm", isPositive ? "text-green-600" : "text-red-600")}>
                        {isPositive ? <ArrowDown className="size-3.5" /> : <ArrowUp className="size-3.5" />}
                        {Math.abs(change).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-0.5">
                        {[s.intake, s.d30, s.d60, s.d90].map((v, i) => {
                          const maxVal = Math.max(s.intake, s.d30, s.d60, s.d90);
                          const h = maxVal > 0 ? Math.max((v / maxVal) * 24, 4) : 4;
                          return (
                            <div
                              key={i}
                              className={cn("w-3 rounded-sm", i === 3 ? (isPositive ? "bg-green-500" : "bg-red-500") : "bg-gray-200")}
                              style={{ height: `${h}px` }}
                            />
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Population Outcomes + RTM Compliance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">Population Outcomes</h3>
            <p className="text-gray-500 text-sm">Aggregate clinical outcome trends across your caseload</p>
          </div>
          <div className="space-y-4">
            {outcomeBreakdown.map((o) => (
              <div key={o.name}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-gray-700 text-sm">{o.name}</span>
                  <span className="font-semibold text-green-600 text-xs">{o.improved}% improved</span>
                </div>
                <div className="flex h-2.5 overflow-hidden rounded-full">
                  <div className="bg-green-500" style={{ width: `${o.improved}%` }} />
                  <div className="bg-yellow-300" style={{ width: `${o.stable}%` }} />
                  <div className="bg-red-300" style={{ width: `${o.declined}%` }} />
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4 border-t pt-3">
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-green-500" />
                <span className="text-gray-500 text-xs">Improved</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-yellow-300" />
                <span className="text-gray-500 text-xs">Stable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-red-300" />
                <span className="text-gray-500 text-xs">Declined</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">RTM Data Capture Compliance</h3>
            <p className="text-gray-500 text-sm">Caseload engagement with required RTM data collection</p>
          </div>
          <div className="space-y-2">
            <ProgressBar label="Mood Check-ins" value={82} color="bg-green-500" />
            <ProgressBar label="Screener Completion" value={74} color="bg-teal-500" />
            <ProgressBar label="Exercise Adherence" value={61} color="bg-teal-400" />
            <ProgressBar label="Journal Entries" value={48} color="bg-orange-400" />
            <ProgressBar label="Chat Engagement" value={76} color="bg-teal-500" />
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

      {/* Caseload Engagement & Billing Readiness Table */}
      <Card className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Caseload Engagement &amp; Billing Readiness</h3>
              <p className="text-gray-500 text-sm">Individual patient RTM status, outcomes, and billing eligibility</p>
            </div>
            <button type="button" className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-gray-800">
              View Full Caseload
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                {["Patient", "Dx", "Days Active", "Wellness", "Adherence", "RTM Status", "Crisis"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-500 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {caseloadTable.map((p) => {
                const daysColor = p.daysUsed >= 16 ? "text-green-600" : p.daysUsed >= 2 ? "text-orange-500" : "text-red-600";
                const wellnessColor = p.wellness >= 4.0 ? "text-green-600" : p.wellness >= 3.0 ? "text-teal-600" : p.wellness >= 2.0 ? "text-orange-500" : "text-red-600";
                const statusColor = p.rtmStatus.includes("Ready") ? "bg-green-100 text-green-700" : p.rtmStatus.includes("Eligible") ? "bg-orange-100 text-orange-700" : p.rtmStatus === "On Track" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700";
                return (
                  <tr key={p.name} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                      <p className="text-gray-500 text-xs">Age {p.age}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{p.dx}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-14 overflow-hidden rounded-full bg-gray-200">
                          <div className={cn("h-full rounded-full", daysColor.replace("text-", "bg-"))} style={{ width: `${(p.daysUsed / 30) * 100}%` }} />
                        </div>
                        <span className={cn("font-bold text-sm", daysColor)}>{p.daysUsed}/30</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className={cn("font-bold text-sm", wellnessColor)}>{p.wellness}</span>
                        {p.trend === "up" ? (
                          <ArrowUp className="size-3.5 text-green-600" />
                        ) : p.trend === "down" ? (
                          <ArrowDown className="size-3.5 text-red-600" />
                        ) : (
                          <ArrowRight className="size-3.5 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={cn("h-full rounded-full", p.adherence >= 75 ? "bg-green-500" : p.adherence >= 50 ? "bg-orange-400" : "bg-red-500")}
                            style={{ width: `${Math.min(p.adherence, 100)}%` }}
                          />
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{p.adherence}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold text-xs", statusColor)}>
                        {p.rtmStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.crisis !== "None" ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-red-600 text-xs">
                          <AlertTriangle className="size-3.5" />
                          {p.crisis}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">None</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Billing Eligibility Summary */}
      <Card className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900">Billing Eligibility Summary</h3>
          <p className="text-gray-500 text-sm">Current period CPT code eligibility across your caseload</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { code: "98978", count: 28, label: "Device Monitoring", sub: "16+ data days met", iconBg: "bg-teal-50", textColor: "text-teal-700", dotColor: "bg-teal-600" },
            { code: "98986", count: 6, label: "Short-Period", sub: "2–15 data days", iconBg: "bg-teal-50", textColor: "text-teal-700", dotColor: "bg-teal-500" },
            { code: "98980", count: 24, label: "Mgmt First 20 min", sub: "20+ min provider time", iconBg: "bg-green-50", textColor: "text-green-700", dotColor: "bg-green-600" },
            { code: "98981", count: 8, label: "Mgmt Addl 20 min", sub: "Additional 20+ min", iconBg: "bg-orange-50", textColor: "text-orange-700", dotColor: "bg-orange-500" },
          ].map((b) => (
            <div key={b.code} className={cn("flex flex-col items-center gap-2 rounded-xl border p-5", b.iconBg)}>
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold text-xs", b.iconBg, b.textColor)}>
                <span className={cn("size-1.5 rounded-full", b.dotColor)} />
                {b.code}
              </span>
              <p className={cn("font-bold text-3xl", b.textColor)}>{b.count}</p>
              <p className={cn("font-medium text-sm", b.textColor)}>{b.label}</p>
              <p className="text-center text-gray-500 text-xs">{b.sub}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
          <p className="flex items-center gap-1.5 text-orange-700 text-sm">
            <AlertTriangle className="size-4 shrink-0" />
            <strong>Note:</strong> 98978 and 98986 are mutually exclusive — cannot both be billed for the same patient in the same 30-day period.
          </p>
        </div>
      </Card>
    </div>
  );
}
