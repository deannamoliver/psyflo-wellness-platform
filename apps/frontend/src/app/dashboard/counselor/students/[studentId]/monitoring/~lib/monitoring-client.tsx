"use client";

import {
  Activity,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/tailwind-utils";
import { AssessmentManager } from "../../assessments/~lib/assessment-manager";

// ─── Types ──────────────────────────────────────────────────────────

type SymptomEntry = {
  date: string;
  mood: number;
  anxiety: number;
  sleep: number;
  energy: number;
};

type AdherenceDetail = {
  type: "check-ins" | "exercises" | "assessments";
  label: string;
  completed: number;
  total: number;
  percentage: number;
};

// ─── Mock Data ──────────────────────────────────────────────────────

const MOCK_SYMPTOM_HISTORY: SymptomEntry[] = [
  { date: "2026-03-08", mood: 7, anxiety: 3, sleep: 8, energy: 6 },
  { date: "2026-03-07", mood: 6, anxiety: 4, sleep: 7, energy: 5 },
  { date: "2026-03-06", mood: 5, anxiety: 5, sleep: 6, energy: 4 },
  { date: "2026-03-05", mood: 6, anxiety: 4, sleep: 7, energy: 5 },
  { date: "2026-03-04", mood: 7, anxiety: 3, sleep: 8, energy: 6 },
  { date: "2026-03-03", mood: 4, anxiety: 6, sleep: 5, energy: 3 },
  { date: "2026-03-02", mood: 5, anxiety: 5, sleep: 6, energy: 4 },
];

const MOCK_ADHERENCE: AdherenceDetail[] = [
  { type: "check-ins", label: "Daily Check-ins", completed: 12, total: 14, percentage: 86 },
  { type: "exercises", label: "Assigned Exercises", completed: 8, total: 10, percentage: 80 },
  { type: "assessments", label: "Scheduled Assessments", completed: 3, total: 3, percentage: 100 },
];

// ─── Component ──────────────────────────────────────────────────────

export function MonitoringClient({ studentId }: { studentId: string }) {

  return (
    <div className="space-y-6">
      {/* Adherence Detail - moved to top */}
      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <h3 className="text-sm font-semibold text-gray-900">Adherence Detail</h3>
          </div>
          <span className="text-xs text-gray-400">This billing period</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-4">
            {MOCK_ADHERENCE.map((item) => (
              <div key={item.type} className="rounded-lg border bg-gray-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-600">{item.label}</p>
                  <span className={cn("text-lg font-bold", item.percentage >= 80 ? "text-emerald-600" : item.percentage >= 60 ? "text-amber-600" : "text-red-600")}>
                    {item.percentage}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={cn("h-full rounded-full transition-all", item.percentage >= 80 ? "bg-emerald-500" : item.percentage >= 60 ? "bg-amber-500" : "bg-red-500")}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400">{item.completed} of {item.total} completed</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Check-in Symptom Tracking */}
      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-900">Daily Check-in History</h3>
          </div>
          <span className="text-xs text-gray-400">Last 7 days</span>
        </div>
        <div className="p-5">
          {/* Simple trend visualization */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {[
              { label: "Mood", key: "mood", color: "bg-blue-500", avg: 5.7 },
              { label: "Anxiety", key: "anxiety", color: "bg-amber-500", avg: 4.3 },
              { label: "Sleep", key: "sleep", color: "bg-violet-500", avg: 6.7 },
              { label: "Energy", key: "energy", color: "bg-emerald-500", avg: 4.7 },
            ].map((metric) => (
              <div key={metric.key} className="rounded-lg border bg-gray-50 p-3">
                <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-gray-900">{metric.avg.toFixed(1)}</span>
                  <span className="text-xs text-gray-400 mb-1">/10 avg</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div className={cn("h-full rounded-full", metric.color)} style={{ width: `${metric.avg * 10}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* History table */}
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-xs font-medium text-gray-500">
                  <th className="px-4 py-2.5 text-left">Date</th>
                  <th className="px-4 py-2.5 text-center">Mood</th>
                  <th className="px-4 py-2.5 text-center">Anxiety</th>
                  <th className="px-4 py-2.5 text-center">Sleep</th>
                  <th className="px-4 py-2.5 text-center">Energy</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {MOCK_SYMPTOM_HISTORY.map((entry) => (
                  <tr key={entry.date} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-700">{new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium", entry.mood >= 7 ? "bg-emerald-100 text-emerald-700" : entry.mood >= 5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>
                        {entry.mood}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium", entry.anxiety <= 3 ? "bg-emerald-100 text-emerald-700" : entry.anxiety <= 5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>
                        {entry.anxiety}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium", entry.sleep >= 7 ? "bg-emerald-100 text-emerald-700" : entry.sleep >= 5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>
                        {entry.sleep}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium", entry.energy >= 7 ? "bg-emerald-100 text-emerald-700" : entry.energy >= 5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>
                        {entry.energy}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Standardized Assessments - using existing AssessmentManager component */}
      <AssessmentManager patientId={studentId} />
    </div>
  );
}
