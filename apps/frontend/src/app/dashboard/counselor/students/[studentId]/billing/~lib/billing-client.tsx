"use client";

import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  DollarSign,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import { Button } from "@/lib/core-ui/button";

// ─── Types ──────────────────────────────────────────────────────────

type CPTCode = {
  code: string;
  description: string;
  requirement: string;
  status: "eligible" | "in-progress" | "not-eligible";
  progress?: number;
  progressLabel?: string;
};

type TimeEntry = {
  id: string;
  date: string;
  minutes: number;
  description: string;
  type: "data_review" | "communication" | "care_management";
};

type BillingPeriod = {
  id: string;
  startDate: string;
  endDate: string;
  status: "current" | "completed" | "upcoming";
};

// ─── Mock Data ──────────────────────────────────────────────────────

const MOCK_CPT_CODES: CPTCode[] = [
  {
    code: "98975",
    description: "RTM Initial Setup & Patient Education",
    requirement: "One-time setup, device provision, patient education",
    status: "eligible",
  },
  {
    code: "98977",
    description: "RTM Device Supply (Respiratory/Musculoskeletal)",
    requirement: "≥16 days of monitoring data in billing period",
    status: "in-progress",
    progress: 87.5,
    progressLabel: "14 of 16 days",
  },
  {
    code: "98980",
    description: "RTM Treatment Management (First 20 min)",
    requirement: "≥20 minutes of care management time",
    status: "eligible",
    progress: 100,
    progressLabel: "32 minutes logged",
  },
  {
    code: "98981",
    description: "RTM Treatment Management (Each additional 20 min)",
    requirement: "Each additional 20 minutes beyond first 20",
    status: "not-eligible",
    progress: 60,
    progressLabel: "12 of 20 additional minutes",
  },
];

const MOCK_TIME_ENTRIES: TimeEntry[] = [
  { id: "te-1", date: "2026-03-08", minutes: 15, description: "Reviewed weekly mood data and screener results. Noted improvement in GAD-7 scores.", type: "data_review" },
  { id: "te-2", date: "2026-03-07", minutes: 10, description: "Video check-in to discuss progress and adjust breathing exercise frequency.", type: "communication" },
  { id: "te-3", date: "2026-03-05", minutes: 8, description: "Reviewed daily mood journal entries and sleep data for the week.", type: "data_review" },
  { id: "te-4", date: "2026-03-03", minutes: 12, description: "Phone call to discuss medication side effects and coping strategies.", type: "communication" },
  { id: "te-5", date: "2026-03-01", minutes: 7, description: "Updated treatment plan based on assessment results.", type: "care_management" },
];

const MOCK_BILLING_PERIODS: BillingPeriod[] = [
  { id: "bp-1", startDate: "2026-03-01", endDate: "2026-03-31", status: "current" },
  { id: "bp-2", startDate: "2026-02-01", endDate: "2026-02-28", status: "completed" },
  { id: "bp-3", startDate: "2026-01-01", endDate: "2026-01-31", status: "completed" },
];

// ─── Component ──────────────────────────────────────────────────────

export function BillingClient({ studentId: _studentId }: { studentId: string }) {
  const [selectedPeriod, setSelectedPeriod] = useState(MOCK_BILLING_PERIODS[0]!.id);

  const totalMinutes = MOCK_TIME_ENTRIES.reduce((sum, e) => sum + e.minutes, 0);

  const getStatusColor = (status: CPTCode["status"]) => {
    switch (status) {
      case "eligible":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "in-progress":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "not-eligible":
        return "bg-gray-50 text-gray-500 border-gray-200";
    }
  };

  const getStatusIcon = (status: CPTCode["status"]) => {
    switch (status) {
      case "eligible":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "not-eligible":
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };


  return (
    <div className="space-y-6">
      {/* Billing Period Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {MOCK_BILLING_PERIODS.map((period) => (
              <option key={period.id} value={period.id}>
                {new Date(period.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(period.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                {period.status === "current" && " (Current)"}
              </option>
            ))}
          </select>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* CPT Code Eligibility Tracker */}
      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            <h3 className="text-sm font-semibold text-gray-900">CPT Code Eligibility</h3>
          </div>
          <span className="text-xs text-gray-400">RTM Billing Codes</span>
        </div>
        <div className="divide-y">
          {MOCK_CPT_CODES.map((cpt) => (
            <div key={cpt.code} className="px-5 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getStatusIcon(cpt.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{cpt.code}</span>
                      <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", getStatusColor(cpt.status))}>
                        {cpt.status === "eligible" ? "Eligible" : cpt.status === "in-progress" ? "In Progress" : "Not Yet Eligible"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-700">{cpt.description}</p>
                    <p className="mt-1 text-xs text-gray-400">{cpt.requirement}</p>
                  </div>
                </div>
                {cpt.progress !== undefined && (
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-700">{cpt.progressLabel}</span>
                    <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={cn("h-full rounded-full", cpt.status === "eligible" ? "bg-emerald-500" : cpt.status === "in-progress" ? "bg-amber-500" : "bg-gray-400")}
                        style={{ width: `${Math.min(cpt.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Log - Simplified */}
      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-900">Time Captured</h3>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Clock className="h-3 w-3" />
            Log Time
          </Button>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border bg-gray-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <p className="text-xs font-medium text-gray-600">Profile Review</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">23 min</p>
              <p className="text-[10px] text-gray-400 mt-1">Data review, treatment updates</p>
            </div>
            <div className="rounded-lg border bg-gray-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <p className="text-xs font-medium text-gray-600">Action Items</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">29 min</p>
              <p className="text-[10px] text-gray-400 mt-1">Follow-ups, communications</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
            <span className="text-sm font-medium text-gray-700">Total Time This Period</span>
            <span className="text-lg font-bold text-blue-600">{totalMinutes} minutes</span>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-violet-50 p-5">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Billing Period Summary</h4>
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg bg-white/80 p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">2</p>
            <p className="text-xs text-gray-500">Codes Eligible</p>
          </div>
          <div className="rounded-lg bg-white/80 p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">1</p>
            <p className="text-xs text-gray-500">In Progress</p>
          </div>
          <div className="rounded-lg bg-white/80 p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{totalMinutes}</p>
            <p className="text-xs text-gray-500">Minutes Logged</p>
          </div>
          <div className="rounded-lg bg-white/80 p-3 text-center">
            <p className="text-2xl font-bold text-violet-600">14</p>
            <p className="text-xs text-gray-500">Monitoring Days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
