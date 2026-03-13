"use client";

import { format } from "date-fns";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ClipboardList,
  DollarSign,
  Download,
  Eye,
  FileCheck,
  FileText,
  MessageSquare,
  PenLine,
  Send,
  Stethoscope,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/lib/core-ui/badge";
import { Button } from "@/lib/core-ui/button";
import { Card } from "@/lib/core-ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/lib/core-ui/dialog";
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

// Types for detailed billing data
type TreatmentPlanActivity = {
  id: string;
  name: string;
  category: string;
  completions: { date: string; time: string }[];
  targetCompletions: number;
};

type TreatmentPlan = {
  id: string;
  title: string;
  goals: string[];
  startDate: string;
  activities: TreatmentPlanActivity[];
};

type ProviderTimeEntry = {
  id: string;
  date: string;
  time: string;
  minutes: number;
  description: string;
  cptCode: string;
};

type PatientBillingDetail = {
  id: string;
  name: string;
  diagnosis: string;
  diagnosisCode: string;
  status: "active" | "paused";
  dataDays: number;
  providerMinutes: number;
  comms: number;
  cptCodes: string[];
  reportStatus: "ready_for_review" | "reviewed" | "signed" | "submitted" | null;
  estAmount: number;
  billingPeriod: { start: string; end: string };
  treatmentPlans: TreatmentPlan[];
  providerTimeEntries: ProviderTimeEntry[];
  patientActivityLog: { date: string; time: string; activity: string; duration: number }[];
};

// Mock data for My Caseload billing table with detailed info
const myCaseloadPatients: PatientBillingDetail[] = [
  {
    id: "p1",
    name: "James Wilson",
    diagnosis: "Generalized Anxiety Disorder",
    diagnosisCode: "F41.1",
    status: "active",
    dataDays: 22,
    providerMinutes: 35,
    comms: 3,
    cptCodes: ["98978", "98980"],
    reportStatus: "ready_for_review",
    estAmount: 245,
    billingPeriod: { start: "2026-02-01", end: "2026-02-28" },
    treatmentPlans: [
      {
        id: "tp1",
        title: "Anxiety Management Plan",
        goals: ["Reduce GAD-7 score from 14 to below 10", "Develop 3 coping strategies", "Improve sleep to 6+ hours"],
        startDate: "2026-01-15",
        activities: [
          { id: "a1", name: "Daily Mood Journal", category: "journaling", completions: [
            { date: "2026-02-05", time: "8:30 AM" }, { date: "2026-02-06", time: "9:15 AM" }, { date: "2026-02-07", time: "8:45 AM" },
            { date: "2026-02-08", time: "8:20 AM" }, { date: "2026-02-10", time: "9:00 AM" }, { date: "2026-02-11", time: "8:35 AM" },
            { date: "2026-02-12", time: "8:50 AM" }, { date: "2026-02-13", time: "9:10 AM" }, { date: "2026-02-14", time: "8:25 AM" },
          ], targetCompletions: 28 },
          { id: "a2", name: "Guided Breathing Exercise", category: "mindfulness", completions: [
            { date: "2026-02-05", time: "7:00 AM" }, { date: "2026-02-05", time: "9:00 PM" }, { date: "2026-02-06", time: "7:15 AM" },
            { date: "2026-02-07", time: "7:00 AM" }, { date: "2026-02-08", time: "7:30 AM" }, { date: "2026-02-10", time: "7:00 AM" },
            { date: "2026-02-11", time: "7:00 AM" }, { date: "2026-02-12", time: "7:15 AM" },
          ], targetCompletions: 56 },
          { id: "a3", name: "Sleep Hygiene Checklist", category: "sleep", completions: [
            { date: "2026-02-05", time: "10:00 PM" }, { date: "2026-02-06", time: "10:15 PM" }, { date: "2026-02-07", time: "10:00 PM" },
            { date: "2026-02-08", time: "10:30 PM" }, { date: "2026-02-10", time: "10:00 PM" }, { date: "2026-02-11", time: "10:00 PM" },
          ], targetCompletions: 28 },
        ],
      },
    ],
    providerTimeEntries: [
      { id: "pte1", date: "2026-02-18", time: "2:30 PM", minutes: 15, description: "Reviewed weekly mood data and GAD-7 scores", cptCode: "98980" },
      { id: "pte2", date: "2026-02-18", time: "3:00 PM", minutes: 10, description: "Video check-in to discuss progress", cptCode: "98980" },
      { id: "pte3", date: "2026-02-10", time: "10:00 AM", minutes: 10, description: "Reviewed daily journal entries", cptCode: "98980" },
    ],
    patientActivityLog: [
      { date: "2026-02-18", time: "8:30 AM", activity: "Daily Mood Journal", duration: 5 },
      { date: "2026-02-18", time: "7:00 AM", activity: "Guided Breathing Exercise", duration: 5 },
      { date: "2026-02-17", time: "8:45 AM", activity: "Daily Mood Journal", duration: 5 },
      { date: "2026-02-17", time: "10:00 PM", activity: "Sleep Hygiene Checklist", duration: 3 },
      { date: "2026-02-16", time: "8:20 AM", activity: "Daily Mood Journal", duration: 5 },
      { date: "2026-02-16", time: "7:15 AM", activity: "Guided Breathing Exercise", duration: 5 },
    ],
  },
  {
    id: "p2",
    name: "Emma Thompson",
    diagnosis: "Major Depressive Disorder - Moderate",
    diagnosisCode: "F33.1",
    status: "active",
    dataDays: 18,
    providerMinutes: 28,
    comms: 2,
    cptCodes: ["98978", "98980"],
    reportStatus: "signed",
    estAmount: 195,
    billingPeriod: { start: "2026-02-01", end: "2026-02-28" },
    treatmentPlans: [
      {
        id: "tp2",
        title: "Depression Recovery Plan",
        goals: ["Reduce PHQ-9 score from 16 to below 10", "Establish daily routine", "Increase social engagement"],
        startDate: "2026-01-20",
        activities: [
          { id: "a4", name: "Gratitude Journal", category: "journaling", completions: [
            { date: "2026-02-03", time: "9:00 AM" }, { date: "2026-02-04", time: "9:30 AM" }, { date: "2026-02-05", time: "9:15 AM" },
            { date: "2026-02-06", time: "9:00 AM" }, { date: "2026-02-07", time: "9:45 AM" },
          ], targetCompletions: 28 },
          { id: "a5", name: "Physical Activity Log", category: "exercise", completions: [
            { date: "2026-02-04", time: "5:00 PM" }, { date: "2026-02-06", time: "5:30 PM" }, { date: "2026-02-08", time: "4:00 PM" },
          ], targetCompletions: 12 },
        ],
      },
    ],
    providerTimeEntries: [
      { id: "pte4", date: "2026-02-15", time: "11:00 AM", minutes: 18, description: "Reviewed PHQ-9 trend data", cptCode: "98980" },
      { id: "pte5", date: "2026-02-15", time: "11:30 AM", minutes: 10, description: "Phone call to discuss engagement", cptCode: "98980" },
    ],
    patientActivityLog: [
      { date: "2026-02-15", time: "9:00 AM", activity: "Gratitude Journal", duration: 5 },
      { date: "2026-02-14", time: "5:00 PM", activity: "Physical Activity Log", duration: 30 },
      { date: "2026-02-14", time: "9:15 AM", activity: "Gratitude Journal", duration: 5 },
    ],
  },
  {
    id: "p3",
    name: "Michael Brown",
    diagnosis: "Social Anxiety Disorder",
    diagnosisCode: "F40.10",
    status: "active",
    dataDays: 8,
    providerMinutes: 15,
    comms: 1,
    cptCodes: ["98986"],
    reportStatus: null,
    estAmount: 0,
    billingPeriod: { start: "2026-02-01", end: "2026-02-28" },
    treatmentPlans: [
      {
        id: "tp3",
        title: "Social Anxiety Exposure Plan",
        goals: ["Complete exposure hierarchy", "Reduce avoidance by 50%"],
        startDate: "2026-02-10",
        activities: [
          { id: "a6", name: "Cognitive Restructuring Worksheet", category: "coping", completions: [
            { date: "2026-02-12", time: "3:00 PM" }, { date: "2026-02-15", time: "4:00 PM" },
          ], targetCompletions: 8 },
        ],
      },
    ],
    providerTimeEntries: [
      { id: "pte6", date: "2026-02-12", time: "2:00 PM", minutes: 15, description: "Initial treatment plan review", cptCode: "98986" },
    ],
    patientActivityLog: [
      { date: "2026-02-15", time: "4:00 PM", activity: "Cognitive Restructuring Worksheet", duration: 15 },
      { date: "2026-02-12", time: "3:00 PM", activity: "Cognitive Restructuring Worksheet", duration: 20 },
    ],
  },
  { id: "p4", name: "Sarah Davis", diagnosis: "Generalized Anxiety Disorder", diagnosisCode: "F41.1", status: "paused", dataDays: 5, providerMinutes: 10, comms: 0, cptCodes: [], reportStatus: null, estAmount: 0, billingPeriod: { start: "2026-02-01", end: "2026-02-28" }, treatmentPlans: [], providerTimeEntries: [], patientActivityLog: [] },
  { id: "p5", name: "David Miller", diagnosis: "Separation Anxiety Disorder", diagnosisCode: "F93.0", status: "active", dataDays: 25, providerMinutes: 42, comms: 4, cptCodes: ["98978", "98980", "98981"], reportStatus: "submitted", estAmount: 285, billingPeriod: { start: "2026-02-01", end: "2026-02-28" }, treatmentPlans: [{ id: "tp5", title: "Separation Anxiety Treatment", goals: ["Reduce separation distress", "Build independence skills"], startDate: "2026-01-10", activities: [{ id: "a7", name: "Grounding Technique Practice", category: "coping", completions: [{ date: "2026-02-10", time: "8:00 AM" }, { date: "2026-02-11", time: "8:00 AM" }, { date: "2026-02-12", time: "8:00 AM" }], targetCompletions: 28 }] }], providerTimeEntries: [{ id: "pte7", date: "2026-02-20", time: "3:00 PM", minutes: 22, description: "Weekly data review", cptCode: "98980" }, { id: "pte8", date: "2026-02-20", time: "3:30 PM", minutes: 20, description: "Treatment plan update", cptCode: "98981" }], patientActivityLog: [{ date: "2026-02-20", time: "8:00 AM", activity: "Grounding Technique Practice", duration: 10 }] },
  { id: "p6", name: "Jennifer Garcia", diagnosis: "Major Depressive Disorder - Moderate", diagnosisCode: "F33.1", status: "active", dataDays: 16, providerMinutes: 22, comms: 2, cptCodes: ["98978", "98980"], reportStatus: "reviewed", estAmount: 195, billingPeriod: { start: "2026-02-01", end: "2026-02-28" }, treatmentPlans: [{ id: "tp6", title: "Depression Management", goals: ["Improve mood stability", "Increase activity levels"], startDate: "2026-01-25", activities: [{ id: "a8", name: "Daily Mood Journal", category: "journaling", completions: [{ date: "2026-02-08", time: "9:00 AM" }, { date: "2026-02-09", time: "9:00 AM" }], targetCompletions: 28 }] }], providerTimeEntries: [{ id: "pte9", date: "2026-02-18", time: "1:00 PM", minutes: 22, description: "Mood data review and check-in", cptCode: "98980" }], patientActivityLog: [{ date: "2026-02-18", time: "9:00 AM", activity: "Daily Mood Journal", duration: 5 }] },
  { id: "p7", name: "Robert Martinez", diagnosis: "Anxiety Disorder NOS", diagnosisCode: "F41.9", status: "active", dataDays: 14, providerMinutes: 9, comms: 1, cptCodes: ["98986", "98979"], reportStatus: null, estAmount: 0, billingPeriod: { start: "2026-02-01", end: "2026-02-28" }, treatmentPlans: [], providerTimeEntries: [{ id: "pte10", date: "2026-02-15", time: "4:00 PM", minutes: 9, description: "Brief data review", cptCode: "98979" }], patientActivityLog: [] },
  { id: "p8", name: "Jessica Brown", diagnosis: "Post-Traumatic Stress Disorder", diagnosisCode: "F43.10", status: "active", dataDays: 21, providerMinutes: 32, comms: 3, cptCodes: ["98978", "98980"], reportStatus: "ready_for_review", estAmount: 195, billingPeriod: { start: "2026-02-01", end: "2026-02-28" }, treatmentPlans: [{ id: "tp8", title: "Trauma Recovery & Stabilization", goals: ["Reduce PCL-5 score", "Develop grounding techniques"], startDate: "2026-02-01", activities: [{ id: "a9", name: "Grounding Technique Practice", category: "coping", completions: [{ date: "2026-02-10", time: "10:00 AM" }, { date: "2026-02-12", time: "10:00 AM" }, { date: "2026-02-14", time: "10:00 AM" }], targetCompletions: 28 }, { id: "a10", name: "Progressive Muscle Relaxation", category: "exercise", completions: [{ date: "2026-02-11", time: "9:00 PM" }, { date: "2026-02-13", time: "9:00 PM" }], targetCompletions: 28 }] }], providerTimeEntries: [{ id: "pte11", date: "2026-02-18", time: "11:00 AM", minutes: 20, description: "Trauma stabilization check-in", cptCode: "98980" }, { id: "pte12", date: "2026-02-10", time: "2:00 PM", minutes: 12, description: "Grounding technique review", cptCode: "98980" }], patientActivityLog: [{ date: "2026-02-18", time: "10:00 AM", activity: "Grounding Technique Practice", duration: 10 }, { date: "2026-02-17", time: "9:00 PM", activity: "Progressive Muscle Relaxation", duration: 15 }] },
];

// Detailed Billing Report Modal
function BillingReportModal({
  patient,
  open,
  onOpenChange,
}: {
  patient: PatientBillingDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const totalPatientActivities = patient.treatmentPlans.reduce(
    (sum, plan) => sum + plan.activities.reduce((s, a) => s + a.completions.length, 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-blue-600" />
            Billing Report — {patient.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Header Summary */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Billing Period: {format(new Date(patient.billingPeriod.start), "MMM d")} – {format(new Date(patient.billingPeriod.end), "MMM d, yyyy")}
              </p>
              <p className="text-xs text-gray-500">
                {patient.dataDays} data days · {patient.providerMinutes} provider minutes · {patient.comms} communications
              </p>
            </div>
            {patient.reportStatus && (
              <ReportStatusBadge status={patient.reportStatus} />
            )}
          </div>

          {/* Diagnosis & CPT Codes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-semibold text-gray-900">Diagnosis</h4>
              </div>
              <p className="text-sm text-gray-700">{patient.diagnosis}</p>
              <p className="text-xs text-gray-500 mt-1">ICD-10: {patient.diagnosisCode}</p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <h4 className="text-sm font-semibold text-gray-900">CPT Codes & Estimated Amount</h4>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {patient.cptCodes.length > 0 ? (
                  patient.cptCodes.map((code) => (
                    <Badge key={code} variant="secondary" className="bg-emerald-50 text-emerald-700">{code}</Badge>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">No eligible codes</span>
                )}
              </div>
              {patient.estAmount > 0 && (
                <p className="text-lg font-bold text-gray-900">${patient.estAmount.toFixed(2)}</p>
              )}
            </div>
          </div>

          {/* Treatment Plans */}
          {patient.treatmentPlans.length > 0 && (
            <div className="rounded-lg border">
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50">
                <ClipboardList className="h-4 w-4 text-violet-600" />
                <h4 className="text-sm font-semibold text-gray-900">Treatment Plans ({patient.treatmentPlans.length})</h4>
              </div>
              <div className="divide-y">
                {patient.treatmentPlans.map((plan) => (
                  <div key={plan.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{plan.title}</h5>
                      <span className="text-xs text-gray-500">Started {format(new Date(plan.startDate), "MMM d, yyyy")}</span>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Goals:</p>
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        {plan.goals.map((goal, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-gray-400">•</span>
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {plan.activities.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Activities Completed This Period:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {plan.activities.map((activity) => (
                            <div key={activity.id} className="rounded-lg bg-blue-50 px-3 py-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-blue-900">{activity.name}</span>
                                <span className="text-xs text-blue-600">
                                  {activity.completions.length}/{activity.targetCompletions}
                                </span>
                              </div>
                              <p className="text-xs text-blue-700 capitalize">{activity.category}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Provider Actions/Times */}
          <div className="rounded-lg border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-teal-50">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-teal-600" />
                <h4 className="text-sm font-semibold text-gray-900">Provider Actions</h4>
              </div>
              <span className="text-xs font-medium text-teal-700">
                Total: {patient.providerMinutes} minutes
              </span>
            </div>
            {patient.providerTimeEntries.length > 0 ? (
              <div className="divide-y">
                {patient.providerTimeEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center text-center min-w-[60px]">
                        <span className="text-xs font-medium text-gray-900">
                          {format(new Date(entry.date), "MMM d")}
                        </span>
                        <span className="text-xs text-gray-500">{entry.time}</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{entry.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{entry.cptCode}</Badge>
                          <span className="text-xs text-gray-500">{entry.minutes} min</span>
                        </div>
                      </div>
                    </div>
                    <Clock className="h-4 w-4 text-teal-500" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                No provider time entries this period
              </div>
            )}
          </div>

          {/* Patient Actions/Times */}
          <div className="rounded-lg border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-blue-50">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-semibold text-gray-900">Patient Activities</h4>
              </div>
              <span className="text-xs font-medium text-blue-700">
                Total: {totalPatientActivities} completions
              </span>
            </div>
            {patient.patientActivityLog.length > 0 ? (
              <div className="divide-y max-h-[200px] overflow-y-auto">
                {patient.patientActivityLog.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center text-center min-w-[60px]">
                        <span className="text-xs font-medium text-gray-900">
                          {format(new Date(entry.date), "MMM d")}
                        </span>
                        <span className="text-xs text-gray-500">{entry.time}</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{entry.activity}</p>
                        <span className="text-xs text-gray-500">{entry.duration} min</span>
                      </div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                No patient activities logged this period
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t pt-4">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <div className="flex items-center gap-2">
              {(patient.reportStatus === "ready_for_review" || patient.reportStatus === "reviewed") && (
                <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <PenLine className="h-4 w-4" />
                  E-Sign
                </Button>
              )}
              {patient.reportStatus === "signed" && (
                <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4" />
                  Submit
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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

// Provider-level billing metrics (same as provider billing page)
const providerMetrics = {
  caseload: 36,
  activePatients: 32,
  inactivePatients: 4,
  billableThisPeriod: 28,
  reportsToSign: 5,
  estimatedRevenue: 6860,
};

export function PracticeBillingDashboard({
  patientCount,
  providerCount,
}: PracticeBillingDashboardProps) {
  const [filter, setFilter] = useState<"all" | "active" | "billable" | "action_needed">("all");
  const [selectedPatient, setSelectedPatient] = useState<PatientBillingDetail | null>(null);
  
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
      {/* Provider-Level Billing Metrics (same as provider billing page) */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Provider Metrics</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Caseload"
            value={providerMetrics.caseload}
            subtitle={`${providerMetrics.activePatients} active · ${providerMetrics.inactivePatients} inactive`}
            icon={Users}
            color="bg-blue-500"
          />
          <SummaryCard
            title="Billable This Period"
            value={providerMetrics.billableThisPeriod}
            subtitle="Meeting all RTM requirements"
            icon={CheckCircle2}
            color="bg-emerald-500"
          />
          <SummaryCard
            title="Reports to Sign"
            value={providerMetrics.reportsToSign}
            subtitle="Missing billing requirements"
            icon={AlertTriangle}
            color="bg-amber-500"
          />
          <SummaryCard
            title="Est. Revenue"
            value={`$${providerMetrics.estimatedRevenue.toLocaleString()}`}
            subtitle="This billing period"
            icon={TrendingUp}
            color="bg-violet-500"
          />
        </div>
      </div>

      {/* Organization-Level Billing Metrics */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Organization Metrics</h3>
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
      </div>

      {/* CPT Code Breakdown - Horizontal */}
      <Card className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900">CPT Code Breakdown</h3>
          <p className="text-gray-500 text-sm">Revenue by billing code</p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {cptBreakdown.map((c) => (
            <div key={c.code} className="rounded-lg bg-gray-50 p-3 text-center">
              <div className={cn("mx-auto mb-2 size-3 rounded-full", c.color)} />
              <p className="font-bold text-gray-900 text-lg">{c.code}</p>
              <p className="text-gray-500 text-xs mb-2">{c.desc}</p>
              <p className="font-bold text-gray-900 text-sm">${c.revenue.toLocaleString()}</p>
              <p className="text-gray-500 text-xs">{c.count} claims</p>
            </div>
          ))}
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
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        Details <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Billing Report Modal */}
      {selectedPatient && (
        <BillingReportModal
          patient={selectedPatient}
          open={!!selectedPatient}
          onOpenChange={(open) => !open && setSelectedPatient(null)}
        />
      )}
    </div>
  );
}
