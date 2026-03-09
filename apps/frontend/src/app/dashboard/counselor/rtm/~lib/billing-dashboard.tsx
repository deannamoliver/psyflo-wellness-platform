"use client";

import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileText,
  MessageSquare,
  PenLine,
  SearchIcon,
  Send,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/lib/core-ui/badge";
import { Button } from "@/lib/core-ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/lib/core-ui/dialog";
import { Input } from "@/lib/core-ui/input";
import { cn } from "@/lib/tailwind-utils";
import {
  type BillingReport,
  type RTMPatient,
  type RealStudent,
  buildRTMPatients,
  generateBillingReports,
  getBillingEligibility,
} from "./mock-data";

type FilterStatus = "all" | "active" | "action_needed" | "paused" | "billable";

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
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

function StatusBadge({ status }: { status: RTMPatient["status"] }) {
  const config = {
    active: { label: "Active", className: "bg-emerald-50 text-emerald-700" },
    paused: { label: "Paused", className: "bg-amber-50 text-amber-700" },
    completed: { label: "Completed", className: "bg-blue-50 text-blue-700" },
  };
  const { label, className } = config[status];
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", className)}>{label}</span>;
}

const REPORT_STATUS_CONFIG: Record<BillingReport["status"], { label: string; color: string; icon: React.ElementType }> = {
  ready_for_review: { label: "Review", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Eye },
  reviewed: { label: "Reviewed", color: "bg-blue-50 text-blue-700 border-blue-200", icon: FileCheck },
  signed: { label: "Signed", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: PenLine },
  submitted: { label: "Submitted", color: "bg-violet-50 text-violet-700 border-violet-200", icon: Send },
};

function ReportStatusBadge({ status }: { status: BillingReport["status"] }) {
  const cfg = REPORT_STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium", cfg.color)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function ReportDetailModal({ report, open, onOpenChange, onSign, onSubmit }: { report: BillingReport; open: boolean; onOpenChange: (open: boolean) => void; onSign: (id: string) => void; onSubmit: (id: string) => void }) {
  const handleDownloadPdf = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>RTM Billing Report — ${report.patientName}</title>
      <style>body{font-family:system-ui,sans-serif;padding:40px;color:#111;font-size:13px}
      h1{font-size:18px;margin-bottom:4px} h2{font-size:14px;margin-top:24px;margin-bottom:8px;color:#333}
      table{width:100%;border-collapse:collapse;margin-top:8px} th,td{text-align:left;padding:6px 10px;border-bottom:1px solid #e5e7eb}
      th{background:#f9fafb;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280}
      .badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600}
      .met{background:#ecfdf5;color:#047857} .unmet{background:#fef3c7;color:#92400e}
      @media print{body{padding:0}}</style></head><body>
      <h1>RTM Billing Report</h1>
      <p style="color:#6b7280;font-size:12px">${report.patientName} · Generated ${format(new Date(report.generatedAt), "MMM d, yyyy 'at' h:mm a")}</p>
      <h2>Billing Period</h2><p>${format(new Date(report.periodStart), "MMM d")} – ${format(new Date(report.periodEnd), "MMM d, yyyy")}</p>
      <h2>CPT Codes</h2><p>${report.cptCodes.join(", ")}</p>
      <h2>Estimated Amount</h2><p>$${report.estimatedAmount.toFixed(2)}</p>
      <h2>Evidence Summary</h2>
      <table><thead><tr><th>Metric</th><th>Value</th><th>Status</th></tr></thead><tbody>
      <tr><td>Data Days</td><td>${report.evidence.dataDaysCollected} days</td><td><span class="badge ${report.evidence.dataDaysCollected >= 2 ? "met" : "unmet"}">${report.evidence.dataDaysCollected >= 2 ? "Met" : "Unmet"}</span></td></tr>
      <tr><td>Clinician Time</td><td>${report.evidence.clinicianMinutesLogged} min</td><td><span class="badge ${report.evidence.clinicianMinutesLogged >= 20 ? "met" : "unmet"}">${report.evidence.clinicianMinutesLogged >= 20 ? "Met" : "Unmet"}</span></td></tr>
      <tr><td>Communications</td><td>${report.evidence.interactiveCommunications}</td><td><span class="badge ${report.evidence.interactiveCommunications >= 1 ? "met" : "unmet"}">${report.evidence.interactiveCommunications >= 1 ? "Met" : "Unmet"}</span></td></tr>
      <tr><td>Treatment Plan</td><td>${report.evidence.treatmentPlanActive ? "Active" : "None"}</td><td><span class="badge ${report.evidence.treatmentPlanActive ? "met" : "unmet"}">${report.evidence.treatmentPlanActive ? "Active" : "None"}</span></td></tr>
      </tbody></table>
      <p style="margin-top:24px;color:#6b7280;font-size:11px">Status: ${report.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}${report.signedAt ? " · Signed " + format(new Date(report.signedAt), "MMM d, yyyy") : ""}${report.submittedAt ? " · Submitted " + format(new Date(report.submittedAt), "MMM d, yyyy") : ""}</p>
      </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-blue-600" />
            RTM Billing Report — {report.patientName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Billing Period: {format(new Date(report.periodStart), "MMM d")} – {format(new Date(report.periodEnd), "MMM d, yyyy")}</p>
              <p className="text-xs text-gray-500">Generated {format(new Date(report.generatedAt), "MMM d, yyyy 'at' h:mm a")}</p>
            </div>
            <ReportStatusBadge status={report.status} />
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-900">CPT Codes</h4>
            <div className="flex flex-wrap gap-2">
              {report.cptCodes.map((code) => (
                <Badge key={code} variant="secondary" className="bg-emerald-50 text-emerald-700">{code}</Badge>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-gray-500">Estimated: <span className="font-semibold text-gray-900">${report.estimatedAmount.toFixed(2)}</span></p>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-900">Evidence Summary</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Data Days", value: `${report.evidence.dataDaysCollected} days`, met: report.evidence.dataDaysCollected >= 2 },
                { label: "Clinician Time", value: `${report.evidence.clinicianMinutesLogged} min`, met: report.evidence.clinicianMinutesLogged >= 20 },
                { label: "Communications", value: `${report.evidence.interactiveCommunications}`, met: report.evidence.interactiveCommunications >= 1 },
                { label: "Treatment Plan", value: report.evidence.treatmentPlanActive ? "Active" : "None", met: report.evidence.treatmentPlanActive },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2">
                  {item.met ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <Clock className="h-4 w-4 shrink-0 text-amber-400" />}
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-sm font-medium text-gray-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadPdf}><Download className="h-4 w-4" />Download PDF</Button>
            <div className="flex items-center gap-2">
              {(report.status === "ready_for_review" || report.status === "reviewed") && (
                <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => onSign(report.id)}><PenLine className="h-4 w-4" />E-Sign</Button>
              )}
              {report.status === "signed" && (
                <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => onSubmit(report.id)}><Send className="h-4 w-4" />Submit</Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Revenue Trend Data ──────────────────────────────────────────────
const revenueByMonth = [
  { month: "Oct", revenue: 5100, count: 22 },
  { month: "Nov", revenue: 5800, count: 24 },
  { month: "Dec", revenue: 7100, count: 29 },
  { month: "Jan", revenue: 7800, count: 32 },
  { month: "Feb", revenue: 8200, count: 34 },
  { month: "Mar", revenue: 8820, count: 36 },
];

const cptBreakdown = [
  { code: "98975", desc: "Education (One-Time)", count: 32, revenue: 672, color: "bg-blue-600" },
  { code: "98978", desc: "Device Supply #1 (Monthly)", count: 28, revenue: 1540, color: "bg-blue-500" },
  { code: "98980", desc: "Treatment Management #1", count: 24, revenue: 1200, color: "bg-teal-600" },
  { code: "98981", desc: "Treatment Management #1A", count: 8, revenue: 320, color: "bg-teal-500" },
  { code: "98979", desc: "Treatment Management #2", count: 22, revenue: 660, color: "bg-green-600" },
  { code: "98986", desc: "Device Supply #2 (Monthly)", count: 18, revenue: 720, color: "bg-orange-500" },
];

export default function BillingDashboard({ realStudents }: { realStudents: RealStudent[] }) {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<BillingReport | null>(null);

  const patients = useMemo(() => buildRTMPatients(realStudents), [realStudents]);
  const [reports, setReports] = useState<BillingReport[]>(() => generateBillingReports(patients));

  const reportsMap = useMemo(() => {
    const m: Record<string, BillingReport> = {};
    for (const r of reports) m[r.patientId] = r;
    return m;
  }, [reports]);

  const activePatients = patients.filter((p) => p.status === "active");
  const inactivePatients = patients.filter((p) => p.status !== "active");
  const totalBillable = patients.filter((p) => !!reportsMap[p.id]);
  const actionNeeded = patients.filter((p) => {
    const elig = getBillingEligibility(p);
    const isBillable = (elig.cpt98978.eligible && elig.cpt98980.eligible) || (elig.cpt98986.eligible && elig.cpt98979.eligible);
    return p.status === "active" && !isBillable;
  });
  const estimatedRevenue = reports.reduce((sum, r) => sum + r.estimatedAmount, 0);

  const filteredPatients = useMemo(() => {
    let result = patients;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.diagnosis.toLowerCase().includes(q));
    }
    if (filter === "active") result = result.filter((p) => p.status === "active");
    else if (filter === "paused") result = result.filter((p) => p.status === "paused");
    else if (filter === "billable") result = result.filter((p) => !!reportsMap[p.id]);
    else if (filter === "action_needed") {
      result = result.filter((p) => {
        const elig = getBillingEligibility(p);
        const isBillable = (elig.cpt98978.eligible && elig.cpt98980.eligible) || (elig.cpt98986.eligible && elig.cpt98979.eligible);
        return p.status === "active" && !isBillable;
      });
    }
    return result;
  }, [patients, search, filter, reportsMap]);

  function handleSign(id: string) {
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: "signed" as const, signedAt: new Date().toISOString() } : r));
    setSelectedReport((prev) => prev?.id === id ? { ...prev, status: "signed", signedAt: new Date().toISOString() } : prev);
  }

  function handleSubmit(id: string) {
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: "submitted" as const, submittedAt: new Date().toISOString() } : r));
    setSelectedReport((prev) => prev?.id === id ? { ...prev, status: "submitted", submittedAt: new Date().toISOString() } : prev);
  }

  const maxRevenue = Math.max(...revenueByMonth.map((d) => d.revenue));
  const totalCptRevenue = cptBreakdown.reduce((s, c) => s + c.revenue, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Caseload" value={patients.length} subtitle={`${activePatients.length} active · ${inactivePatients.length} inactive`} icon={Users} color="bg-blue-500" />
        <SummaryCard title="Billable This Period" value={totalBillable.length} subtitle="Meeting all RTM requirements" icon={CheckCircle2} color="bg-emerald-500" />
        <SummaryCard title="Reports to Sign" value={actionNeeded.length} subtitle="Missing billing requirements" icon={XCircle} color="bg-amber-500" />
        <SummaryCard title="Est. Revenue" value={`$${estimatedRevenue.toFixed(0)}`} subtitle="This billing period" icon={TrendingUp} color="bg-violet-500" />
      </div>

      {/* RTM Revenue Trend + CPT Code Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
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
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
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
        </div>
      </div>

      {/* RTM Code Eligibility - Compact */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
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
            <p className="text-xl font-bold text-blue-700">32</p>
            <p className="text-[10px] text-gray-500">Education</p>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg border bg-blue-50 p-3">
            <span className="text-xs font-semibold text-blue-700">98978</span>
            <p className="text-xl font-bold text-blue-700">28</p>
            <p className="text-[10px] text-gray-500">Device #1</p>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg border bg-orange-50 p-3">
            <span className="text-xs font-semibold text-orange-700">98986</span>
            <p className="text-xl font-bold text-orange-700">18</p>
            <p className="text-[10px] text-gray-500">Device #2</p>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg border bg-teal-50 p-3">
            <span className="text-xs font-semibold text-teal-700">98980</span>
            <p className="text-xl font-bold text-teal-700">24</p>
            <p className="text-[10px] text-gray-500">Tx Mgmt</p>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg border bg-green-50 p-3">
            <span className="text-xs font-semibold text-green-700">98979</span>
            <p className="text-xl font-bold text-green-700">22</p>
            <p className="text-[10px] text-gray-500">Tx Mgmt Alt</p>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg border bg-teal-50 p-3">
            <span className="text-xs font-semibold text-teal-700">98981</span>
            <p className="text-xl font-bold text-teal-700">8</p>
            <p className="text-[10px] text-gray-500">Addl 20min</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative min-w-[240px] max-w-xs">
            <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-gray-400" />
            <Input
              placeholder="Search patient or diagnosis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 border-gray-200 bg-white pl-10 text-sm"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {([
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "billable", label: "Billable" },
              { key: "action_needed", label: "Action Needed" },
              { key: "paused", label: "Paused" },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  filter === key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                )}
              >
                {label}
                {key === "action_needed" && actionNeeded.length > 0 && (
                  <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-white">{actionNeeded.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
          onClick={() => {
            const rows = filteredPatients.map((p) => {
              const elig = getBillingEligibility(p);
              const report = reportsMap[p.id];
              return [
                p.name,
                p.diagnosis,
                p.status,
                p.dataCollectionDays,
                p.clinicianMinutesLogged,
                p.interactiveCommunications,
                elig.pathway === "short" ? [elig.cpt98986.eligible ? "98986" : "", elig.cpt98979.eligible ? "98979" : ""].filter(Boolean).join("; ") : [elig.cpt98978.eligible ? "98978" : "", elig.cpt98980.eligible ? "98980" : "", elig.cpt98981.eligible ? "98981" : ""].filter(Boolean).join("; "),
                report ? report.status.replace(/_/g, " ") : "",
                report ? `$${report.estimatedAmount.toFixed(2)}` : "",
              ].join(",");
            });
            const csv = ["Patient,Diagnosis,Status,Data Days,Time (min),Comms,Eligible CPT,Report Status,Est. Amount", ...rows].join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `rtm-billing-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Unified Patient Billing Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
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
            {filteredPatients.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">No patients match your filters.</td></tr>
            ) : (
              filteredPatients.map((patient) => {
                const elig = getBillingEligibility(patient);
                const report = reportsMap[patient.id];
                return (
                  <tr key={patient.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{patient.name}</p>
                        <p className="text-xs text-gray-400">{patient.diagnosis}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={patient.status} /></td>
                    <td className="px-4 py-3.5"><DataDaysProgress days={patient.dataCollectionDays} /></td>
                    <td className="px-4 py-3.5">
                      <span className={cn("text-sm font-medium", patient.clinicianMinutesLogged >= 20 ? "text-emerald-600" : "text-gray-500")}>
                        {patient.clinicianMinutesLogged} min
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn("text-sm font-medium", patient.interactiveCommunications >= 1 ? "text-emerald-600" : "text-gray-500")}>
                        {patient.interactiveCommunications}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {elig.pathway === "short" ? (
                          <>
                            <CPTBadge eligible={elig.cpt98986.eligible} label="98986" />
                            <CPTBadge eligible={elig.cpt98979.eligible} label="98979" />
                          </>
                        ) : (
                          <>
                            <CPTBadge eligible={elig.cpt98978.eligible} label="98978" />
                            <CPTBadge eligible={elig.cpt98980.eligible} label="98980" />
                            {elig.cpt98981.eligible && <CPTBadge eligible label="98981" />}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {report ? (
                        <div className="flex items-center gap-1.5">
                          <ReportStatusBadge status={report.status} />
                          <button
                            type="button"
                            onClick={() => setSelectedReport(report)}
                            className="text-[10px] font-medium text-blue-600 hover:text-blue-800"
                          >
                            View
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <Link href={`/dashboard/counselor/rtm/${patient.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                        Details <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          open={!!selectedReport}
          onOpenChange={(open) => !open && setSelectedReport(null)}
          onSign={handleSign}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
