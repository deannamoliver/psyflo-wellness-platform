"use client";

import {
  Calendar,
  ChevronDown,
  ClipboardList,
  Download,
  FileText,
  Stethoscope,
  Target,
  User,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { cn } from "@/lib/tailwind-utils";

// ─── Mock Patient Data ──────────────────────────────────────────────

type PatientReportData = {
  name: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  enrolledDate: string;
  status: string;
  diagnoses: { code: string; description: string }[];
  treatmentPlans: {
    title: string;
    startDate: string;
    reviewDate: string;
    goals: string[];
    notes: string;
    exercises: { name: string; frequency: string; status: string }[];
  }[];
  assessments: {
    name: string;
    frequency: string;
    latestScore: number;
    maxScore: number;
    severity: string;
    trend: string;
    history: { date: string; score: number; severity: string }[];
  }[];
  sessions: {
    date: string;
    type: string;
    duration: string;
    summary: string;
  }[];
  safetyAlerts: {
    date: string;
    level: string;
    description: string;
    status: string;
  }[];
  clinicalNotes: string;
  providerName: string;
  providerCredentials: string;
  reportDate: string;
};

const MOCK_REPORT: PatientReportData = {
  name: "Patient",
  dateOfBirth: "2008-05-14",
  age: 17,
  gender: "Female",
  enrolledDate: "2026-01-10",
  status: "Active",
  diagnoses: [
    { code: "F41.1", description: "Generalized anxiety disorder" },
    { code: "F33.1", description: "Major depressive disorder, recurrent, moderate" },
  ],
  treatmentPlans: [
    {
      title: "Anxiety & Depression Management",
      startDate: "2026-01-15",
      reviewDate: "2026-04-15",
      goals: [
        "Reduce anxiety symptoms as measured by GAD-7 score below 10",
        "Improve mood stability with PHQ-9 score below 10",
        "Develop 3+ healthy coping strategies for use in daily life",
        "Improve sleep hygiene and achieve 7+ hours of sleep per night",
      ],
      notes: "Patient is motivated and engaged. Family involvement has been positive. Continue with current treatment approach with adjustments as needed based on assessment scores.",
      exercises: [
        { name: "Anxiety & Panic — Coping Tools", frequency: "3x / week", status: "Active" },
        { name: "Coping with Big Feelings", frequency: "Daily", status: "Completed" },
        { name: "Focus & Distractibility", frequency: "2x / week", status: "Active" },
        { name: "Sleep, Energy & Rest", frequency: "Daily", status: "Active" },
      ],
    },
  ],
  assessments: [
    {
      name: "PHQ-9 (Depression)", frequency: "Biweekly", latestScore: 12, maxScore: 27, severity: "Moderate", trend: "Improving (↓3 since baseline)",
      history: [
        { date: "2026-01-15", score: 15, severity: "Mod. Severe" },
        { date: "2026-01-29", score: 14, severity: "Moderate" },
        { date: "2026-02-12", score: 13, severity: "Moderate" },
        { date: "2026-02-26", score: 12, severity: "Moderate" },
      ],
    },
    {
      name: "GAD-7 (Anxiety)", frequency: "Monthly", latestScore: 11, maxScore: 21, severity: "Moderate", trend: "Improving (↓4 since baseline)",
      history: [
        { date: "2026-01-15", score: 15, severity: "Severe" },
        { date: "2026-02-15", score: 13, severity: "Moderate" },
        { date: "2026-02-28", score: 11, severity: "Moderate" },
      ],
    },
    {
      name: "C-SSRS (Suicide Risk)", frequency: "Monthly", latestScore: 0, maxScore: 5, severity: "No Risk", trend: "Stable",
      history: [
        { date: "2026-01-15", score: 1, severity: "Wish to Die" },
        { date: "2026-02-15", score: 0, severity: "No Risk" },
        { date: "2026-02-28", score: 0, severity: "No Risk" },
      ],
    },
  ],
  sessions: [
    { date: "2026-02-24", type: "Individual Therapy", duration: "50 min", summary: "Reviewed coping strategies progress. Patient reports improved sleep and reduced frequency of panic episodes." },
    { date: "2026-02-17", type: "Individual Therapy", duration: "50 min", summary: "Focused on mood tracking results. Patient identified 3 key triggers for low mood." },
    { date: "2026-02-10", type: "Individual Therapy", duration: "50 min", summary: "Processed recent family stressor. Practiced grounding techniques (5-4-3-2-1)." },
    { date: "2026-02-03", type: "Individual Therapy", duration: "50 min", summary: "Reviewed treatment goals. Adjusted sleep hygiene plan based on sleep diary data." },
    { date: "2026-01-27", type: "Individual Therapy", duration: "50 min", summary: "Initial treatment plan review. Began psychoeducation on anxiety and depression cycle." },
  ],
  safetyAlerts: [
    { date: "2026-01-15", level: "Moderate", description: "Endorsed passive suicidal ideation on C-SSRS (wish to be dead). No plan or intent.", status: "Resolved" },
  ],
  clinicalNotes: "Patient has shown consistent engagement with treatment since enrollment. Assessment scores indicate a positive trajectory with clinically meaningful improvement in both depression and anxiety symptoms. Suicidal ideation has resolved as of the most recent assessment. The patient is actively using coping strategies learned in therapy and reports improved functioning at school and home. Recommend continuing current treatment frequency with reassessment at the 3-month mark.",
  providerName: "Dr. Sarah Thompson",
  providerCredentials: "PhD, LMHC",
  reportDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
};

// ─── Report Type Definitions ────────────────────────────────────────

type ReportType = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bg: string;
};

const REPORT_TYPES: ReportType[] = [
  { id: "comprehensive", title: "Comprehensive Patient Chart", description: "Full clinical report with all patient data", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "assessment", title: "Assessment Summary", description: "Assessment scores, severity, and trend analysis", icon: Stethoscope, color: "text-violet-600", bg: "bg-violet-50" },
  { id: "treatment", title: "Treatment Progress", description: "Treatment plan goals and intervention adherence", icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "session", title: "Session Notes", description: "Session history with clinical summaries", icon: Calendar, color: "text-teal-600", bg: "bg-teal-50" },
  { id: "billing", title: "Billing Summary", description: "CPT codes, time logged, and billing eligibility", icon: ClipboardList, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "discharge", title: "Discharge Summary", description: "End-of-care summary and recommendations", icon: User, color: "text-gray-600", bg: "bg-gray-100" },
];

// ─── PDF Export ──────────────────────────────────────────────────────

const PDF_STYLES = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #111827; padding: 0.5in; line-height: 1.5; }
h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
h2 { font-size: 14px; font-weight: 700; color: #1f2937; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #e5e7eb; }
h3 { font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px; }
.section { margin-bottom: 20px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; }
.label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
.value { font-size: 12px; color: #111827; font-weight: 500; }
.badge { display: inline-block; padding: 1px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; }
.badge-green { background: #ecfdf5; color: #065f46; }
.badge-yellow { background: #fffbeb; color: #92400e; }
.badge-orange { background: #fff7ed; color: #9a3412; }
.badge-red { background: #fef2f2; color: #991b1b; }
.badge-blue { background: #eff6ff; color: #1e40af; }
.badge-gray { background: #f3f4f6; color: #374151; }
table { width: 100%; border-collapse: collapse; margin-top: 6px; }
th { text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; font-weight: 600; padding: 6px 8px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
td { padding: 6px 8px; border-bottom: 1px solid #f3f4f6; font-size: 11px; }
.header-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 3px solid #3b82f6; }
.notes-box { background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-top: 6px; font-size: 11px; color: #1e40af; }
.alert-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 8px 10px; margin-bottom: 6px; }
.goal-item { display: flex; gap: 6px; margin-bottom: 4px; }
.goal-bullet { color: #3b82f6; font-weight: 700; }
.footer { margin-top: 24px; padding-top: 12px; border-top: 2px solid #e5e7eb; font-size: 10px; color: #6b7280; }
@media print { body { padding: 0.3in; } .section { page-break-inside: avoid; } }
`;

function exportToPdf(element: HTMLDivElement, title: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>${PDF_STYLES}</style></head><body>${element.innerHTML}</body></html>`);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 400);
}

// ─── Shared Components ──────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const s = severity.toLowerCase();
  let cls = "badge-gray";
  if (s.includes("minimal") || s.includes("no risk") || s.includes("normal") || s.includes("resolved") || s.includes("active") || s.includes("completed")) cls = "badge-green";
  else if (s.includes("mild") || s.includes("wish")) cls = "badge-yellow";
  else if (s.includes("moderate") || s.includes("borderline")) cls = "badge-orange";
  else if (s.includes("severe") || s.includes("significant") || s.includes("intent") || s.includes("clinical")) cls = "badge-red";
  else if (s.includes("improving") || s.includes("stable")) cls = "badge-blue";
  return <span className={`badge ${cls}`}>{severity}</span>;
}

function ReportHeader({ data, reportTitle }: { data: PatientReportData; reportTitle: string }) {
  return (
    <div className="header-bar">
      <div>
        <h1>{data.name}</h1>
        <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
          DOB: {new Date(data.dateOfBirth).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · Age {data.age} · {data.gender}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#1f2937" }}>{reportTitle}</div>
        <div style={{ fontSize: "10px", color: "#6b7280" }}>{data.reportDate}</div>
      </div>
    </div>
  );
}

function ReportFooter({ data }: { data: PatientReportData }) {
  return (
    <div className="footer">
      <div className="grid-2">
        <div>
          <div style={{ fontWeight: 600, color: "#374151" }}>{data.providerName}, {data.providerCredentials}</div>
          <div>Report generated: {data.reportDate}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ marginTop: "20px", borderTop: "1px solid #9ca3af", paddingTop: "4px", display: "inline-block", width: "200px" }}>Provider Signature</div>
        </div>
      </div>
      <div style={{ marginTop: "8px", fontSize: "9px", color: "#9ca3af" }}>
        CONFIDENTIAL — This document contains protected health information (PHI). Unauthorized disclosure is prohibited under HIPAA regulations.
      </div>
    </div>
  );
}

// ─── Report: Comprehensive ──────────────────────────────────────────

function ComprehensiveReport({ data }: { data: PatientReportData }) {
  return (
    <div>
      <ReportHeader data={data} reportTitle="Comprehensive Patient Report" />
      <div className="section">
        <h2>Patient Information</h2>
        <div className="grid-3">
          <div><span className="label">Enrolled</span><div className="value">{data.enrolledDate}</div></div>
          <div><span className="label">Provider</span><div className="value">{data.providerName}, {data.providerCredentials}</div></div>
          <div><span className="label">Status</span><div className="value"><SeverityBadge severity={data.status} /></div></div>
        </div>
      </div>
      <div className="section">
        <h2>Diagnoses (ICD-10)</h2>
        <table><thead><tr><th>Code</th><th>Description</th></tr></thead>
          <tbody>{data.diagnoses.map((d) => (<tr key={d.code}><td style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e40af" }}>{d.code}</td><td>{d.description}</td></tr>))}</tbody>
        </table>
      </div>
      {data.treatmentPlans.map((plan, idx) => (
        <div key={idx} className="section">
          <h2>Treatment Plan: {plan.title}</h2>
          <div className="grid-2" style={{ marginBottom: "8px" }}>
            <div><span className="label">Start</span><div className="value">{plan.startDate}</div></div>
            <div><span className="label">Review</span><div className="value">{plan.reviewDate}</div></div>
          </div>
          <h3>Goals</h3>
          <div style={{ marginBottom: "8px" }}>{plan.goals.map((g, i) => (<div key={i} className="goal-item"><span className="goal-bullet">•</span><span>{g}</span></div>))}</div>
          {plan.notes && <div className="notes-box"><strong>Notes:</strong> {plan.notes}</div>}
          <h3 style={{ marginTop: "10px" }}>Interventions</h3>
          <table><thead><tr><th>Name</th><th>Frequency</th><th>Status</th></tr></thead>
            <tbody>{plan.exercises.map((ex, i) => (<tr key={i}><td>{ex.name}</td><td>{ex.frequency}</td><td><SeverityBadge severity={ex.status} /></td></tr>))}</tbody>
          </table>
        </div>
      ))}
      <div className="section">
        <h2>Assessment Results</h2>
        {data.assessments.map((a, idx) => (
          <div key={idx} style={{ marginBottom: "12px" }}>
            <h3>{a.name} <span style={{ fontWeight: 400, color: "#6b7280", fontSize: "10px" }}>({a.frequency})</span></h3>
            <div className="grid-3" style={{ marginBottom: "4px" }}>
              <div><span className="label">Latest</span><div className="value">{a.latestScore}/{a.maxScore}</div></div>
              <div><span className="label">Severity</span><div className="value"><SeverityBadge severity={a.severity} /></div></div>
              <div><span className="label">Trend</span><div className="value"><SeverityBadge severity={a.trend} /></div></div>
            </div>
            <table><thead><tr><th>Date</th><th>Score</th><th>Severity</th></tr></thead>
              <tbody>{a.history.map((h, i) => (<tr key={i}><td>{new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td><td style={{ fontWeight: 600 }}>{h.score}/{a.maxScore}</td><td><SeverityBadge severity={h.severity} /></td></tr>))}</tbody>
            </table>
          </div>
        ))}
      </div>
      {data.safetyAlerts.length > 0 && (
        <div className="section">
          <h2>Safety Alerts</h2>
          {data.safetyAlerts.map((a, i) => (<div key={i} className="alert-box"><div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}><span style={{ fontWeight: 600 }}>{a.level} Risk — {new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span><SeverityBadge severity={a.status} /></div><div style={{ fontSize: "11px", color: "#374151" }}>{a.description}</div></div>))}
        </div>
      )}
      <div className="section">
        <h2>Session History</h2>
        <table><thead><tr><th>Date</th><th>Type</th><th>Duration</th><th>Summary</th></tr></thead>
          <tbody>{data.sessions.map((s, i) => (<tr key={i}><td style={{ whiteSpace: "nowrap" }}>{new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td><td style={{ whiteSpace: "nowrap" }}>{s.type}</td><td style={{ whiteSpace: "nowrap" }}>{s.duration}</td><td>{s.summary}</td></tr>))}</tbody>
        </table>
      </div>
      <div className="section"><h2>Clinical Summary</h2><div className="notes-box">{data.clinicalNotes}</div></div>
      <ReportFooter data={data} />
    </div>
  );
}

// ─── Report: Assessment Summary ─────────────────────────────────────

function AssessmentReport({ data }: { data: PatientReportData }) {
  return (
    <div>
      <ReportHeader data={data} reportTitle="Assessment Summary Report" />
      <div className="section">
        <h2>Assessment Overview</h2>
        <table>
          <thead><tr><th>Assessment</th><th>Frequency</th><th>Latest Score</th><th>Severity</th><th>Trend</th></tr></thead>
          <tbody>{data.assessments.map((a, i) => (
            <tr key={i}><td style={{ fontWeight: 600 }}>{a.name}</td><td>{a.frequency}</td><td>{a.latestScore}/{a.maxScore}</td><td><SeverityBadge severity={a.severity} /></td><td><SeverityBadge severity={a.trend} /></td></tr>
          ))}</tbody>
        </table>
      </div>
      {data.assessments.map((a, idx) => (
        <div key={idx} className="section">
          <h2>{a.name} — Score History</h2>
          <table>
            <thead><tr><th>Date</th><th>Score</th><th>Severity</th><th>Change</th></tr></thead>
            <tbody>{a.history.map((h, i) => {
              const prev = i > 0 ? a.history[i - 1]!.score : h.score;
              const diff = h.score - prev;
              const changeStr = i === 0 ? "Baseline" : diff === 0 ? "No change" : diff > 0 ? `+${diff}` : `${diff}`;
              return (<tr key={i}><td>{new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td><td style={{ fontWeight: 600 }}>{h.score}/{a.maxScore}</td><td><SeverityBadge severity={h.severity} /></td><td><SeverityBadge severity={changeStr} /></td></tr>);
            })}</tbody>
          </table>
        </div>
      ))}
      {data.safetyAlerts.length > 0 && (
        <div className="section">
          <h2>Safety Alerts from Assessments</h2>
          {data.safetyAlerts.map((a, i) => (<div key={i} className="alert-box"><span style={{ fontWeight: 600 }}>{a.level} — {new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span><div style={{ fontSize: "11px", color: "#374151", marginTop: "2px" }}>{a.description}</div></div>))}
        </div>
      )}
      <div className="section"><h2>Clinical Interpretation</h2><div className="notes-box">{data.clinicalNotes}</div></div>
      <ReportFooter data={data} />
    </div>
  );
}

// ─── Report: Treatment Progress ─────────────────────────────────────

function TreatmentReport({ data }: { data: PatientReportData }) {
  return (
    <div>
      <ReportHeader data={data} reportTitle="Treatment Progress Report" />
      <div className="section">
        <h2>Diagnoses</h2>
        <table><thead><tr><th>ICD-10</th><th>Description</th></tr></thead>
          <tbody>{data.diagnoses.map((d) => (<tr key={d.code}><td style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e40af" }}>{d.code}</td><td>{d.description}</td></tr>))}</tbody>
        </table>
      </div>
      {data.treatmentPlans.map((plan, idx) => (
        <div key={idx} className="section">
          <h2>{plan.title}</h2>
          <div className="grid-2" style={{ marginBottom: "8px" }}>
            <div><span className="label">Start</span><div className="value">{plan.startDate}</div></div>
            <div><span className="label">Next Review</span><div className="value">{plan.reviewDate}</div></div>
          </div>
          <h3>Treatment Goals & Progress</h3>
          <table>
            <thead><tr><th>#</th><th>Goal</th><th>Status</th></tr></thead>
            <tbody>{plan.goals.map((g, i) => (<tr key={i}><td>{i + 1}</td><td>{g}</td><td><SeverityBadge severity={i < 2 ? "Improving" : "In Progress"} /></td></tr>))}</tbody>
          </table>
          <h3 style={{ marginTop: "12px" }}>Intervention Adherence</h3>
          <table>
            <thead><tr><th>Intervention</th><th>Frequency</th><th>Status</th><th>Adherence</th></tr></thead>
            <tbody>{plan.exercises.map((ex, i) => (
              <tr key={i}><td>{ex.name}</td><td>{ex.frequency}</td><td><SeverityBadge severity={ex.status} /></td><td style={{ fontWeight: 600 }}>{ex.status === "Completed" ? "100%" : `${70 + i * 5}%`}</td></tr>
            ))}</tbody>
          </table>
          {plan.notes && <div className="notes-box" style={{ marginTop: "8px" }}><strong>Provider Notes:</strong> {plan.notes}</div>}
        </div>
      ))}
      <div className="section">
        <h2>Outcome Measures</h2>
        <table>
          <thead><tr><th>Assessment</th><th>Baseline</th><th>Current</th><th>Change</th><th>Target Met?</th></tr></thead>
          <tbody>{data.assessments.map((a, i) => {
            const baseline = a.history[0]?.score ?? 0;
            const change = a.latestScore - baseline;
            return (<tr key={i}><td style={{ fontWeight: 600 }}>{a.name}</td><td>{baseline}/{a.maxScore}</td><td>{a.latestScore}/{a.maxScore}</td><td><SeverityBadge severity={change <= 0 ? `${change}` : `+${change}`} /></td><td><SeverityBadge severity={a.latestScore <= a.maxScore * 0.4 ? "Yes" : "Not yet"} /></td></tr>);
          })}</tbody>
        </table>
      </div>
      <ReportFooter data={data} />
    </div>
  );
}

// ─── Report: Session Notes ──────────────────────────────────────────

function SessionReport({ data }: { data: PatientReportData }) {
  return (
    <div>
      <ReportHeader data={data} reportTitle="Session Notes Report" />
      <div className="section">
        <h2>Session Summary</h2>
        <div className="grid-3" style={{ marginBottom: "12px" }}>
          <div><span className="label">Total Sessions</span><div className="value">{data.sessions.length}</div></div>
          <div><span className="label">Session Type</span><div className="value">Individual Therapy</div></div>
          <div><span className="label">Avg Duration</span><div className="value">50 min</div></div>
        </div>
      </div>
      {data.sessions.map((s, idx) => (
        <div key={idx} className="section">
          <h2>Session {idx + 1} — {new Date(s.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</h2>
          <div className="grid-3" style={{ marginBottom: "6px" }}>
            <div><span className="label">Type</span><div className="value">{s.type}</div></div>
            <div><span className="label">Duration</span><div className="value">{s.duration}</div></div>
            <div><span className="label">Provider</span><div className="value">{data.providerName}</div></div>
          </div>
          <div className="notes-box"><strong>Session Notes:</strong> {s.summary}</div>
        </div>
      ))}
      <ReportFooter data={data} />
    </div>
  );
}

// ─── Report: Billing Summary ────────────────────────────────────────

function BillingReport({ data }: { data: PatientReportData }) {
  return (
    <div>
      <ReportHeader data={data} reportTitle="Billing Summary Report" />
      <div className="section">
        <h2>Patient & Billing Information</h2>
        <div className="grid-4">
          <div><span className="label">Patient</span><div className="value">{data.name}</div></div>
          <div><span className="label">DOB</span><div className="value">{new Date(data.dateOfBirth).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div></div>
          <div><span className="label">Period</span><div className="value">Feb 1 – Feb 28, 2026</div></div>
          <div><span className="label">Status</span><div className="value"><SeverityBadge severity="Active" /></div></div>
        </div>
      </div>
      <div className="section">
        <h2>Eligible CPT Codes</h2>
        <table>
          <thead><tr><th>CPT Code</th><th>Description</th><th>Criteria</th><th>Status</th><th>Est. Amount</th></tr></thead>
          <tbody>
            <tr><td style={{ fontFamily: "monospace", fontWeight: 700 }}>98978</td><td>Device Supply (16+ days)</td><td>22 data collection days</td><td><SeverityBadge severity="Eligible" /></td><td>$47.27</td></tr>
            <tr><td style={{ fontFamily: "monospace", fontWeight: 700 }}>98980</td><td>Provider Management (20+ min)</td><td>35 min logged</td><td><SeverityBadge severity="Eligible" /></td><td>$50.60</td></tr>
            <tr><td style={{ fontFamily: "monospace", fontWeight: 700 }}>98981</td><td>Provider Management (40+ min)</td><td>35 min logged (needs 40)</td><td><SeverityBadge severity="Not Met" /></td><td>—</td></tr>
          </tbody>
        </table>
      </div>
      <div className="section">
        <h2>Service Documentation</h2>
        <table>
          <thead><tr><th>Date</th><th>Service</th><th>Duration</th><th>Summary</th></tr></thead>
          <tbody>{data.sessions.slice(0, 3).map((s, i) => (<tr key={i}><td style={{ whiteSpace: "nowrap" }}>{new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td><td>{s.type}</td><td>{s.duration}</td><td>{s.summary}</td></tr>))}</tbody>
        </table>
      </div>
      <div className="section">
        <h2>Estimated Billing Total</h2>
        <div style={{ fontSize: "18px", fontWeight: 700, color: "#065f46", marginTop: "4px" }}>$97.87</div>
        <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>Based on 2 eligible codes for this billing period</div>
      </div>
      <ReportFooter data={data} />
    </div>
  );
}

// ─── Report: Discharge Summary ──────────────────────────────────────

function DischargeReport({ data }: { data: PatientReportData }) {
  return (
    <div>
      <ReportHeader data={data} reportTitle="Discharge Summary Report" />
      <div className="section">
        <h2>Enrollment Summary</h2>
        <div className="grid-4">
          <div><span className="label">Enrolled</span><div className="value">{data.enrolledDate}</div></div>
          <div><span className="label">Discharge Date</span><div className="value">{data.reportDate}</div></div>
          <div><span className="label">Total Sessions</span><div className="value">{data.sessions.length}</div></div>
          <div><span className="label">Duration</span><div className="value">7 weeks</div></div>
        </div>
      </div>
      <div className="section">
        <h2>Diagnoses at Discharge</h2>
        <table><thead><tr><th>ICD-10</th><th>Description</th><th>Status</th></tr></thead>
          <tbody>{data.diagnoses.map((d) => (<tr key={d.code}><td style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e40af" }}>{d.code}</td><td>{d.description}</td><td><SeverityBadge severity="Improving" /></td></tr>))}</tbody>
        </table>
      </div>
      <div className="section">
        <h2>Treatment Outcomes</h2>
        <table>
          <thead><tr><th>Assessment</th><th>Intake Score</th><th>Discharge Score</th><th>Change</th><th>Outcome</th></tr></thead>
          <tbody>{data.assessments.map((a, i) => {
            const baseline = a.history[0]?.score ?? 0;
            const change = a.latestScore - baseline;
            return (<tr key={i}><td style={{ fontWeight: 600 }}>{a.name}</td><td>{baseline}/{a.maxScore}</td><td>{a.latestScore}/{a.maxScore}</td><td style={{ fontWeight: 600, color: change <= 0 ? "#065f46" : "#991b1b" }}>{change <= 0 ? `${change}` : `+${change}`}</td><td><SeverityBadge severity={change <= 0 ? "Improved" : "No Improvement"} /></td></tr>);
          })}</tbody>
        </table>
      </div>
      <div className="section">
        <h2>Discharge Recommendations</h2>
        <div className="notes-box">
          <strong>Aftercare Plan:</strong> Continue practicing learned coping strategies (CBT thought records, grounding techniques, behavioral activation). Maintain sleep hygiene routine. If symptoms worsen, re-engage in therapy within 2 weeks. Schedule follow-up screening in 30 days. Consider step-down to monthly wellness check-ins.
        </div>
      </div>
      <div className="section"><h2>Clinical Summary</h2><div className="notes-box">{data.clinicalNotes}</div></div>
      <ReportFooter data={data} />
    </div>
  );
}

// ─── Report Renderer ────────────────────────────────────────────────

function ReportContent({ type, data }: { type: string; data: PatientReportData }) {
  switch (type) {
    case "comprehensive": return <ComprehensiveReport data={data} />;
    case "assessment": return <AssessmentReport data={data} />;
    case "treatment": return <TreatmentReport data={data} />;
    case "session": return <SessionReport data={data} />;
    case "billing": return <BillingReport data={data} />;
    case "discharge": return <DischargeReport data={data} />;
    default: return <ComprehensiveReport data={data} />;
  }
}

// ─── Main Component ─────────────────────────────────────────────────

export function PatientReport({ patientName }: { patientName?: string }) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState("comprehensive");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const report = { ...MOCK_REPORT, name: patientName ?? MOCK_REPORT.name };
  const activeType = REPORT_TYPES.find((t) => t.id === selectedType) ?? REPORT_TYPES[0]!;
  const ActiveIcon = activeType.icon;

  const handleExport = () => {
    if (!reportRef.current) return;
    setGenerating(true);
    setTimeout(() => {
      exportToPdf(reportRef.current!, `${activeType.title} — ${report.name}`);
      setGenerating(false);
    }, 100);
  };

  return (
    <div className="space-y-5 font-dm">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Patient Reports</h3>
          <p className="mt-0.5 text-xs text-gray-400">Select a report type to preview and export as PDF</p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-blue-600 hover:bg-blue-700"
          onClick={handleExport}
          disabled={generating}
        >
          <Download className="h-3.5 w-3.5" />
          {generating ? "Generating..." : "Export PDF"}
        </Button>
      </div>

      {/* Report type selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex w-full items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
        >
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", activeType.bg)}>
            <ActiveIcon className={cn("h-4 w-4", activeType.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{activeType.title}</p>
            <p className="text-xs text-gray-400">{activeType.description}</p>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", dropdownOpen && "rotate-180")} />
        </button>

        {dropdownOpen && (
          <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-xl border bg-white shadow-lg">
            {REPORT_TYPES.map((rt) => {
              const Icon = rt.icon;
              return (
                <button
                  key={rt.id}
                  type="button"
                  onClick={() => { setSelectedType(rt.id); setDropdownOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl",
                    rt.id === selectedType && "bg-blue-50/50",
                  )}
                >
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", rt.bg)}>
                    <Icon className={cn("h-3.5 w-3.5", rt.color)} />
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-sm font-medium", rt.id === selectedType ? "text-blue-700" : "text-gray-700")}>{rt.title}</p>
                    <p className="text-xs text-gray-400">{rt.description}</p>
                  </div>
                  {rt.id === selectedType && (
                    <div className="ml-auto h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Report preview */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50/50">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Report Preview</span>
          <span className="text-[10px] text-gray-400">{report.reportDate}</span>
        </div>
        <div className="max-h-[600px] overflow-y-auto p-6" style={{ fontSize: "11px" }}>
          <div ref={reportRef}>
            <ReportContent type={selectedType} data={report} />
          </div>
        </div>
      </div>
    </div>
  );
}
