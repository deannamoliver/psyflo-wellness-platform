"use client";

import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Building2,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  DollarSign,
  FileText,
  Minus,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/lib/core-ui/card";
import { cn } from "@/lib/tailwind-utils";

type PracticeDashboardProps = {
  providerCount: number;
  patientCount: number;
  activePatientCount: number;
};

// Mock data for the dashboard
const recentProviders = [
  { id: "1", name: "Dr. Sarah Johnson", role: "Therapist", patients: 24, status: "active" },
  { id: "2", name: "Dr. Michael Chen", role: "Therapist", patients: 18, status: "active" },
  { id: "3", name: "Lisa Martinez, LCSW", role: "Wellness Coach", patients: 31, status: "active" },
  { id: "4", name: "Dr. Emily Williams", role: "Therapist", patients: 22, status: "active" },
];

const engagementMetrics = [
  { label: "Avg. Data Days/Patient", value: "18.4", change: 12, unit: "" },
  { label: "Avg. Provider Time/Patient", value: "24", change: 8, unit: "min" },
  { label: "Patient Engagement Rate", value: "87%", change: 5, unit: "" },
  { label: "Billing Eligible Patients", value: "78%", change: 3, unit: "" },
];

const billingOverview = [
  { code: "98978", label: "Device Monitoring", count: 42, eligible: 38 },
  { code: "98980", label: "Mgmt First 20 min", count: 42, eligible: 35 },
  { code: "98981", label: "Mgmt Addl 20 min", count: 42, eligible: 12 },
];

const recentActivity = [
  { id: "1", action: "New patient enrolled", details: "James Wilson assigned to Dr. Chen", time: "2 hours ago" },
  { id: "2", action: "Provider added", details: "Dr. Emily Williams joined the practice", time: "1 day ago" },
  { id: "3", action: "Billing submitted", details: "March billing cycle completed", time: "2 days ago" },
  { id: "4", action: "Patient status changed", details: "Sarah M. marked as inactive", time: "3 days ago" },
];

// Progress chart data
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

// Diagnosis distribution data
const diagnosisDistribution = [
  { label: "F41.1 GAD", count: 14, pct: 39, color: "bg-teal-600" },
  { label: "F33.1 MDD", count: 8, pct: 22, color: "bg-teal-500" },
  { label: "F40.10 Social Phobia", count: 6, pct: 17, color: "bg-green-600" },
  { label: "F93.0 Separation Anxiety", count: 4, pct: 11, color: "bg-orange-500" },
  { label: "Other", count: 4, pct: 11, color: "bg-gray-400" },
];

// Engagement by age group data
const engagementByAge = [
  { group: "8–17", avgDays: 19.8, avgAdherence: 75, count: 24 },
  { group: "18–39", avgDays: 20.6, avgAdherence: 71, count: 8 },
  { group: "40–64", avgDays: 22.1, avgAdherence: 79, count: 3 },
  { group: "65+", avgDays: 23.4, avgAdherence: 82, count: 1 },
];

// Progress Bar component
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

// Progress Chart component
function ProgressChart() {
  const [showPcl5, setShowPcl5] = useState(true);
  const [showPhq9, setShowPhq9] = useState(true);

  const chartHeight = 160;

  const getY = (value: number) => {
    return chartHeight - (value / 100) * chartHeight;
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
        <div className="absolute left-0 top-0 flex h-full flex-col justify-between text-gray-400 text-xs">
          <span>High</span>
          <span>Low</span>
        </div>
        
        <div className="ml-8 h-full">
          <svg
            viewBox={`0 0 100 ${chartHeight}`}
            preserveAspectRatio="none"
            className="h-full w-full"
            style={{ height: chartHeight }}
          >
            <line x1="0" y1={chartHeight * 0.25} x2="100" y2={chartHeight * 0.25} stroke="#f3f4f6" strokeWidth="0.5" />
            <line x1="0" y1={chartHeight * 0.5} x2="100" y2={chartHeight * 0.5} stroke="#f3f4f6" strokeWidth="0.5" />
            <line x1="0" y1={chartHeight * 0.75} x2="100" y2={chartHeight * 0.75} stroke="#f3f4f6" strokeWidth="0.5" />
            
            {showPcl5 && (
              <>
                <path d={createPath("pcl5")} fill="none" stroke="#3b82f6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                {progressData.map((d, i) => (
                  <circle key={`pcl5-${i}`} cx={(i / (progressData.length - 1)) * 100} cy={getY(d.pcl5)} r="3" fill="#3b82f6" vectorEffect="non-scaling-stroke" />
                ))}
              </>
            )}
            
            {showPhq9 && (
              <>
                <path d={createPath("phq9")} fill="none" stroke="#93c5fd" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                {progressData.map((d, i) => (
                  <circle key={`phq9-${i}`} cx={(i / (progressData.length - 1)) * 100} cy={getY(d.phq9)} r="3" fill="#93c5fd" vectorEffect="non-scaling-stroke" />
                ))}
              </>
            )}
          </svg>
          
          <div className="mt-1 flex justify-between text-gray-400 text-xs">
            <span>Mon 12/8</span>
            <span>Thu 1/1</span>
            <span>Sat 1/24</span>
            <span>Today</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-6">
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={showPcl5} onChange={(e) => setShowPcl5(e.target.checked)} className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-blue-500" />
            <span className="text-gray-700 text-sm font-medium">PCL-5 (Monthly)</span>
          </span>
          <span className="text-gray-400 text-xs">Trauma</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={showPhq9} onChange={(e) => setShowPhq9(e.target.checked)} className="size-4 rounded border-gray-300 text-blue-300 focus:ring-blue-300" />
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

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  href,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  iconBg: string;
  href?: string;
}) {
  const content = (
    <Card className="flex flex-col gap-3 rounded-xl border bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={cn("flex size-10 items-center justify-center rounded-full", iconBg)}>
          <Icon className="size-5 text-white" />
        </div>
        {href && <ArrowRight className="size-4 text-gray-400" />}
      </div>
      <div>
        <p className="font-bold text-3xl text-gray-900">{value}</p>
        <p className="mt-0.5 text-gray-500 text-sm">{title}</p>
        <p className="mt-1 text-gray-400 text-xs">{subtitle}</p>
      </div>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

// Provider-level KPI card config (same as counselor dashboard)
type ProviderKpiCard = {
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

const PROVIDER_KPI_CARDS: ProviderKpiCard[] = [
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
    label: "Avg. Data Days",
    value: 18,
    change: 8,
    changeLabel: "vs last month",
    icon: <Calendar className="size-5 text-violet-600" />,
    iconBg: "bg-violet-50",
    tag: "On Track",
    tagBg: "bg-violet-100",
    tagText: "text-violet-700",
    dotColor: "bg-violet-600",
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
    icon: <UsersRound className="size-5 text-teal-600" />,
    iconBg: "bg-teal-50",
    tag: "Active",
    tagBg: "bg-teal-100",
    tagText: "text-teal-700",
    dotColor: "bg-teal-600",
  },
];

function ProviderKpiCard({ card }: { card: ProviderKpiCard }) {
  return (
    <Card className="flex flex-col gap-3 rounded-xl border bg-white p-5 shadow-sm">
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

export function PracticeDashboard({
  providerCount,
  patientCount,
  activePatientCount,
}: PracticeDashboardProps) {
  const inactivePatientCount = patientCount - activePatientCount;
  const estimatedRevenue = activePatientCount * 245; // Rough estimate per billable patient

  return (
    <div className="space-y-6">
      {/* Provider-Level KPI Cards (same as counselor dashboard) */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Provider Metrics</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {PROVIDER_KPI_CARDS.map((card) => (
            <ProviderKpiCard key={card.label} card={card} />
          ))}
        </div>
      </div>

      {/* Organization-Level KPI Cards */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Organization Metrics</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            title="Total Providers"
            value={providerCount}
            subtitle="Active clinicians"
            icon={Users}
            iconBg="bg-blue-500"
            href="/dashboard/practice/providers"
          />
          <StatCard
            title="Caseload"
            value={patientCount}
            subtitle={`${activePatientCount} active, ${inactivePatientCount} inactive`}
            icon={Building2}
            iconBg="bg-teal-500"
            href="/dashboard/practice/patients"
          />
          <StatCard
            title="Billing Eligible"
            value={`${Math.round((activePatientCount / patientCount) * 100)}%`}
            subtitle="Meeting RTM requirements"
            icon={CheckCircle2}
            iconBg="bg-emerald-500"
            href="/dashboard/practice/billing"
          />
          <StatCard
            title="Est. Monthly Revenue"
            value={`$${estimatedRevenue.toLocaleString()}`}
            subtitle="Based on current eligibility"
            icon={DollarSign}
            iconBg="bg-violet-500"
            href="/dashboard/practice/billing"
          />
        </div>
      </div>

      {/* Provider Roster + Engagement Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Provider Roster Preview */}
        <Card className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h3 className="font-semibold text-gray-900">Provider Roster</h3>
              <p className="text-gray-500 text-sm">Active clinicians in your practice</p>
            </div>
            <Link
              href="/dashboard/practice/providers"
              className="flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              View All
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="divide-y">
            {recentProviders.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-teal-100 text-sm font-medium text-teal-700">
                    {provider.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{provider.name}</p>
                    <p className="text-gray-500 text-xs">{provider.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 text-sm">{provider.patients}</p>
                  <p className="text-gray-500 text-xs">patients</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Engagement Metrics */}
        <Card className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">Aggregate Engagement Metrics</h3>
            <p className="text-gray-500 text-sm">Practice-wide performance indicators</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {engagementMetrics.map((metric) => (
              <div key={metric.label} className="rounded-lg bg-gray-50 p-4">
                <p className="text-gray-500 text-xs">{metric.label}</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <p className="font-bold text-2xl text-gray-900">{metric.value}</p>
                  {metric.unit && <span className="text-gray-500 text-sm">{metric.unit}</span>}
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <ArrowUp className="size-3 text-green-600" />
                  <span className="text-green-600 text-xs font-medium">+{metric.change}%</span>
                  <span className="text-gray-400 text-xs">vs last month</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Progress Chart + RTM Data Capture Compliance */}
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

      {/* Billing Overview + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Billing Overview */}
        <Card className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Billing Eligibility Overview</h3>
              <p className="text-gray-500 text-sm">CPT code eligibility across all patients</p>
            </div>
            <Link
              href="/dashboard/practice/billing"
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              View Details
            </Link>
          </div>
          <div className="space-y-3">
            {billingOverview.map((item) => {
              const pct = Math.round((item.eligible / item.count) * 100);
              return (
                <div key={item.code} className="rounded-lg bg-gray-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-900 text-sm">{item.code}</span>
                      <p className="text-gray-500 text-xs">{item.label}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">{item.eligible}/{item.count}</p>
                      <p className="text-gray-500 text-xs">eligible</p>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-400" : "bg-red-400",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-gray-500 text-sm">Latest updates across your practice</p>
          </div>
          <div className="divide-y">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 px-5 py-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <Activity className="size-4 text-gray-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm">{activity.action}</p>
                  <p className="text-gray-500 text-xs">{activity.details}</p>
                </div>
                <span className="shrink-0 text-gray-400 text-xs">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-900">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/practice/users?action=invite"
            className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            <UserPlus className="size-4" />
            Invite Provider
          </Link>
          <Link
            href="/dashboard/practice/patients?action=add"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <UserCheck className="size-4" />
            Add Patient
          </Link>
          <Link
            href="/dashboard/practice/billing"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <DollarSign className="size-4" />
            View Billing
          </Link>
          <Link
            href="/dashboard/practice/providers"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Users className="size-4" />
            Manage Providers
          </Link>
        </div>
      </Card>
    </div>
  );
}
