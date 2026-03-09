"use client";

import {
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Circle,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileCheck,
  MessageSquare,
  PenLine,
  Send,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/lib/core-ui/card";
import { cn } from "@/lib/tailwind-utils";

type PracticeBillingDashboardProps = {
  patientCount: number;
  providerCount: number;
};

// Mock data for billing
const revenueByMonth = [
  { month: "Oct", revenue: 12400, count: 52 },
  { month: "Nov", revenue: 14200, count: 58 },
  { month: "Dec", revenue: 16800, count: 68 },
  { month: "Jan", revenue: 18500, count: 74 },
  { month: "Feb", revenue: 19800, count: 78 },
  { month: "Mar", revenue: 21200, count: 84 },
];

const cptBreakdown = [
  { code: "98975", desc: "Education (One-Time)", count: 78, revenue: 1638, color: "bg-blue-600" },
  { code: "98978", desc: "Device Supply #1 (Monthly)", count: 68, revenue: 3740, color: "bg-blue-500" },
  { code: "98980", desc: "Treatment Management #1", count: 58, revenue: 2900, color: "bg-teal-600" },
  { code: "98981", desc: "Treatment Management #1A", count: 22, revenue: 880, color: "bg-teal-500" },
  { code: "98979", desc: "Treatment Management #2", count: 52, revenue: 1560, color: "bg-green-600" },
  { code: "98986", desc: "Device Supply #2 (Monthly)", count: 24, revenue: 960, color: "bg-orange-500" },
];

const providerBilling = [
  { name: "Dr. Sarah Johnson", patients: 24, eligible: 21, revenue: 5145 },
  { name: "Dr. Michael Chen", patients: 18, eligible: 15, revenue: 3675 },
  { name: "Lisa Martinez, LCSW", patients: 31, eligible: 28, revenue: 6860 },
  { name: "Dr. Emily Williams", patients: 22, eligible: 18, revenue: 4410 },
];

// Mock data for My Caseload billing table
const myCaseloadPatients = [
  { id: "p1", name: "James Wilson", diagnosis: "F41.1 GAD", status: "active" as const, dataDays: 22, providerMinutes: 35, comms: 3, cptCodes: ["98978", "98980"], reportStatus: "ready_for_review" as const, estAmount: 245 },
  { id: "p2", name: "Emma Thompson", diagnosis: "F33.1 MDD", status: "active" as const, dataDays: 18, providerMinutes: 28, comms: 2, cptCodes: ["98978", "98980"], reportStatus: "signed" as const, estAmount: 195 },
  { id: "p3", name: "Michael Brown", diagnosis: "F40.10 Social Phobia", status: "active" as const, dataDays: 8, providerMinutes: 15, comms: 1, cptCodes: ["98986"], reportStatus: null, estAmount: 0 },
  { id: "p4", name: "Sarah Davis", diagnosis: "F41.1 GAD", status: "paused" as const, dataDays: 5, providerMinutes: 10, comms: 0, cptCodes: [], reportStatus: null, estAmount: 0 },
  { id: "p5", name: "David Miller", diagnosis: "F93.0 Separation Anxiety", status: "active" as const, dataDays: 25, providerMinutes: 42, comms: 4, cptCodes: ["98978", "98980", "98981"], reportStatus: "submitted" as const, estAmount: 285 },
  { id: "p6", name: "Jennifer Garcia", diagnosis: "F33.1 MDD", status: "active" as const, dataDays: 16, providerMinutes: 22, comms: 2, cptCodes: ["98978", "98980"], reportStatus: "reviewed" as const, estAmount: 195 },
  { id: "p7", name: "Robert Martinez", diagnosis: "F41.9 Anxiety NOS", status: "active" as const, dataDays: 14, providerMinutes: 9, comms: 1, cptCodes: ["98986", "98979"], reportStatus: null, estAmount: 0 },
  { id: "p8", name: "Jessica Brown", diagnosis: "F43.10 PTSD", status: "active" as const, dataDays: 21, providerMinutes: 32, comms: 3, cptCodes: ["98978", "98980"], reportStatus: "ready_for_review" as const, estAmount: 195 },
];

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  change,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  change?: number;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
          {change !== undefined && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-green-600">
              <ArrowUp className="size-3" />
              +{change}% vs last month
            </p>
          )}
        </div>
        <div className={cn("rounded-lg p-2.5", color)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function CPTBadge({ eligible, label }: { eligible: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        eligible ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400",
      )}
    >
      {eligible ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
      {label}
    </span>
  );
}

function DataDaysProgress({ days, max = 30 }: { days: number; max?: number }) {
  const percentage = Math.min((days / max) * 100, 100);
  const metTarget = days >= 16;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn("h-full rounded-full transition-all", metTarget ? "bg-emerald-500" : days >= 12 ? "bg-amber-400" : "bg-red-400")}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={cn("text-xs font-medium", metTarget ? "text-emerald-600" : "text-gray-500")}>{days}/{max}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: "active" | "paused" }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
      status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500",
    )}>
      {status}
    </span>
  );
}

function ReportStatusBadge({ status }: { status: "ready_for_review" | "reviewed" | "signed" | "submitted" | null }) {
  if (!status) return <span className="text-xs text-gray-400">—</span>;
  
  const config = {
    ready_for_review: { icon: PenLine, label: "Review", bg: "bg-amber-50", text: "text-amber-700" },
    reviewed: { icon: FileCheck, label: "Reviewed", bg: "bg-blue-50", text: "text-blue-700" },
    signed: { icon: CheckCircle2, label: "Signed", bg: "bg-emerald-50", text: "text-emerald-700" },
    submitted: { icon: Send, label: "Submitted", bg: "bg-violet-50", text: "text-violet-700" },
  };
  
  const c = config[status];
  const Icon = c.icon;
  
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", c.bg, c.text)}>
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

export function PracticeBillingDashboard({
  patientCount,
  providerCount,
}: PracticeBillingDashboardProps) {
  const [filter, setFilter] = useState<"all" | "active" | "billable" | "action_needed">("all");
  
  const maxRevenue = Math.max(...revenueByMonth.map((d) => d.revenue));
  const totalCptRevenue = cptBreakdown.reduce((s, c) => s + c.revenue, 0);
  const totalEligible = providerBilling.reduce((s, p) => s + p.eligible, 0);
  const totalPatients = providerBilling.reduce((s, p) => s + p.patients, 0);
  const eligibilityRate = Math.round((totalEligible / totalPatients) * 100);
  
  // Filter my caseload patients
  const filteredCaseload = myCaseloadPatients.filter((p) => {
    if (filter === "all") return true;
    if (filter === "active") return p.status === "active";
    if (filter === "billable") return p.cptCodes.length > 0 && p.dataDays >= 16;
    if (filter === "action_needed") return p.reportStatus === "ready_for_review" || (p.status === "active" && p.cptCodes.length === 0);
    return true;
  });
  
  const actionNeededCount = myCaseloadPatients.filter((p) => p.reportStatus === "ready_for_review" || (p.status === "active" && p.cptCodes.length === 0)).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Patients"
          value={patientCount}
          subtitle="Enrolled in RTM"
          icon={Users}
          color="bg-blue-500"
        />
        <SummaryCard
          title="Billing Eligible"
          value={`${eligibilityRate}%`}
          subtitle={`${totalEligible} of ${totalPatients} patients`}
          icon={CheckCircle2}
          color="bg-emerald-500"
          change={5}
        />
        <SummaryCard
          title="Est. Monthly Revenue"
          value={`$${(revenueByMonth[revenueByMonth.length - 1]?.revenue ?? 0).toLocaleString()}`}
          subtitle="Based on current eligibility"
          icon={DollarSign}
          color="bg-violet-500"
          change={7}
        />
        <SummaryCard
          title="Active Providers"
          value={providerCount}
          subtitle="Billing patients"
          icon={TrendingUp}
          color="bg-teal-500"
        />
      </div>

      {/* RTM Revenue Trend + CPT Code Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">Practice Revenue Trend</h3>
            <p className="text-gray-500 text-sm">Monthly estimated revenue from RTM CPT codes</p>
          </div>
          <div className="flex items-end gap-3" style={{ height: 200 }}>
            {revenueByMonth.map((d, i) => {
              const isLast = i === revenueByMonth.length - 1;
              return (
                <div key={d.month} className="group flex flex-1 flex-col items-center gap-1">
                  <span
                    className={cn(
                      "text-xs font-semibold transition-opacity",
                      isLast ? "text-gray-900" : "text-gray-500 opacity-0 group-hover:opacity-100",
                    )}
                  >
                    ${(d.revenue / 1000).toFixed(1)}k
                  </span>
                  <div
                    className={cn(
                      "w-full rounded-t-md transition-colors",
                      isLast ? "bg-teal-600" : "bg-gray-200 group-hover:bg-teal-400",
                    )}
                    style={{ height: `${(d.revenue / maxRevenue) * 160}px` }}
                  />
                  <span className={cn("text-xs", isLast ? "font-semibold text-gray-900" : "text-gray-500")}>
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <span className="text-gray-500 text-sm">6-month trend</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 font-semibold text-green-700 text-xs">
              <ArrowUp className="size-3" /> 71% growth
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
              const pct = totalCptRevenue > 0 ? Math.round((c.revenue / totalCptRevenue) * 100) : 0;
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

      {/* RTM Code Eligibility - Compact */}
      <Card className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">RTM Code Eligibility</h3>
            <p className="text-gray-500 text-sm">Eligible patients by CPT code</p>
          </div>
          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-medium text-orange-700">
            98978/98986 and 98980/98979 are mutually exclusive
          </span>
        </div>
        <div className="grid grid-cols-6 gap-3">
          <div className="flex flex-col items-center gap-1 rounded-lg border bg-blue-50 p-3">
            <span className="text-xs font-semibold text-blue-700">98975</span>
            <p className="text-xl font-bold text-blue-700">78</p>
            <p className="text-[10px] text-gray-500">Education</p>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg border bg-blue-50 p-3">
            <span className="text-xs font-semibold text-blue-700">98978</span>
            <p className="text-xl font-bold text-blue-700">68</p>
            <p className="text-[10px] text-gray-500">Device #1</p>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg border bg-orange-50 p-3">
            <span className="text-xs font-semibold text-orange-700">98986</span>
            <p className="text-xl font-bold text-orange-700">24</p>
            <p className="text-[10px] text-gray-500">Device #2</p>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg border bg-teal-50 p-3">
            <span className="text-xs font-semibold text-teal-700">98980</span>
            <p className="text-xl font-bold text-teal-700">58</p>
            <p className="text-[10px] text-gray-500">Tx Mgmt</p>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg border bg-green-50 p-3">
            <span className="text-xs font-semibold text-green-700">98979</span>
            <p className="text-xl font-bold text-green-700">52</p>
            <p className="text-[10px] text-gray-500">Tx Mgmt Alt</p>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg border bg-teal-50 p-3">
            <span className="text-xs font-semibold text-teal-700">98981</span>
            <p className="text-xl font-bold text-teal-700">22</p>
            <p className="text-[10px] text-gray-500">Addl 20min</p>
          </div>
        </div>
      </Card>

      {/* Provider Billing Performance */}
      <Card className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h3 className="font-semibold text-gray-900">Provider Billing Performance</h3>
            <p className="text-gray-500 text-sm">Billing metrics by provider</p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="size-4" />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Provider
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total Patients
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Billing Eligible
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Eligibility Rate
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Est. Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {providerBilling.map((provider) => {
                const rate = Math.round((provider.eligible / provider.patients) * 100);
                return (
                  <tr key={provider.name} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-teal-100 text-sm font-medium text-teal-700">
                          {provider.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{provider.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{provider.patients}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-600">{provider.eligible}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              rate >= 80 ? "bg-emerald-500" : rate >= 60 ? "bg-amber-400" : "bg-red-400",
                            )}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{rate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      ${provider.revenue.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* My Caseload Billing Table */}
      <Card className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h3 className="font-semibold text-gray-900">My Caseload</h3>
            <p className="text-gray-500 text-sm">Patient billing status for your assigned patients</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {([
                { key: "all", label: "All" },
                { key: "active", label: "Active" },
                { key: "billable", label: "Billable" },
                { key: "action_needed", label: "Action Needed" },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    filter === key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                  )}
                >
                  {label}
                  {key === "action_needed" && actionNeededCount > 0 && (
                    <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-white">{actionNeededCount}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Data Days</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <div className="flex items-center gap-1"><Clock className="h-3 w-3" />Time</div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <div className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />Comms</div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">CPT Codes</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Report</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCaseload.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">No patients match your filters.</td></tr>
              ) : (
                filteredCaseload.map((patient) => (
                  <tr key={patient.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{patient.name}</p>
                        <p className="text-xs text-gray-400">{patient.diagnosis}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={patient.status} /></td>
                    <td className="px-4 py-3.5"><DataDaysProgress days={patient.dataDays} /></td>
                    <td className="px-4 py-3.5">
                      <span className={cn("text-sm font-medium", patient.providerMinutes >= 20 ? "text-emerald-600" : "text-gray-500")}>
                        {patient.providerMinutes} min
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn("text-sm font-medium", patient.comms >= 1 ? "text-emerald-600" : "text-gray-500")}>
                        {patient.comms}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {patient.cptCodes.length > 0 ? (
                          patient.cptCodes.map((code) => (
                            <CPTBadge key={code} eligible label={code} />
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <ReportStatusBadge status={patient.reportStatus} />
                        {patient.reportStatus && (
                          <button
                            type="button"
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            title="View report"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/dashboard/practice/patients/${patient.id}/overview`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
                      >
                        Details <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
