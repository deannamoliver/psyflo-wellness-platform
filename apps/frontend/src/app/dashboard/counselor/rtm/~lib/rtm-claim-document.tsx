"use client";

import { format } from "date-fns";
import {
  CheckCircle2,
  Circle,
  Download,
  Eye,
  FileText,
  Printer,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { cn } from "@/lib/tailwind-utils";
import {
  type RTMPatient,
  getBillingEligibility,
  getTimeEntries,
  getCommunications,
} from "./mock-data";

// ─── Types ──────────────────────────────────────────────────────────

type ClaimDocument = {
  // Header
  reportTitle: string;
  reportDate: string;
  facilityName: string;
  facilityNPI: string;
  facilityAddress: string;
  providerName: string;
  providerNPI: string;
  providerCredentials: string;

  // Patient
  patientName: string;
  patientDOB: string;
  patientId: string;
  diagnosis: string;
  icdCodes: string[];
  enrollmentDate: string;

  // Billing Period
  billingPeriodStart: string;
  billingPeriodEnd: string;
  pathway: "standard" | "short" | "none";

  // CPT Codes
  cptCodes: {
    code: string;
    description: string;
    eligible: boolean;
    amount: number;
  }[];
  totalAmount: number;

  // Evidence
  dataCollectionDays: number;
  clinicianMinutesLogged: number;
  interactiveCommunications: number;
  deviceSetupComplete: boolean;
  educationComplete: boolean;
  treatmentPlanActive: boolean;
  treatmentPlanTitle: string | null;
  treatmentPlanGoals: string[];

  // Time Log
  timeEntries: {
    date: string;
    minutes: number;
    description: string;
    type: string;
  }[];

  // Communications
  communications: {
    date: string;
    type: string;
    duration: number;
    summary: string;
  }[];

  // Clinical Summary
  clinicalSummary: string;
  moodTrendSummary: string;
  assessmentSummary: string;
  interventionsSummary: string;
};

// ─── Generate Claim Document ────────────────────────────────────────

function generateClaimDocument(patient: RTMPatient): ClaimDocument {
  const elig = getBillingEligibility(patient);
  const timeEntries = getTimeEntries(patient.id, patient.name);
  const communications = getCommunications(patient.id, patient.name);

  const cptCodes: ClaimDocument["cptCodes"] = [];

  if (elig.pathway === "standard") {
    cptCodes.push(
      { code: "98978", description: "RTM Device Supply & Digital Monitoring (16+ days)", eligible: elig.cpt98978.eligible, amount: 47.27 },
      { code: "98980", description: "RTM Treatment Management Services, first 20 min", eligible: elig.cpt98980.eligible, amount: 50.60 },
      { code: "98981", description: "RTM Treatment Management Services, additional 20 min", eligible: elig.cpt98981.eligible, amount: 39.95 },
    );
  } else if (elig.pathway === "short") {
    cptCodes.push(
      { code: "98986", description: "RTM Device Supply & Digital Monitoring (2–15 days)", eligible: elig.cpt98986.eligible, amount: 47.27 },
      { code: "98979", description: "RTM Treatment Management Services (10–19 min)", eligible: elig.cpt98979.eligible, amount: 50.60 },
    );
  }

  const totalAmount = cptCodes.filter((c) => c.eligible).reduce((sum, c) => sum + c.amount, 0);

  // ICD-10 codes based on diagnosis
  const diagnosisToICD: Record<string, string[]> = {
    "Generalized Anxiety Disorder (GAD)": ["F41.1"],
    "Major Depressive Disorder (MDD) - Moderate": ["F33.1"],
    "PTSD - Childhood Trauma": ["F43.10"],
    "Social Anxiety Disorder": ["F40.10"],
    "Adjustment Disorder with Anxiety": ["F43.22"],
    "Bipolar II Disorder": ["F31.81"],
  };

  const icdCodes = diagnosisToICD[patient.diagnosis] ?? ["F99"];

  // Clinical summaries
  const clinicalSummary = generateClinicalSummary(patient);
  const moodTrendSummary = generateMoodTrendSummary(patient);
  const assessmentSummary = generateAssessmentSummary(patient);
  const interventionsSummary = generateInterventionsSummary(patient);

  return {
    reportTitle: elig.pathway === "short"
      ? "Feelwell RTM Report — Short-Period (CPT 98986/98979)"
      : "Feelwell RTM Report — Standard Period (CPT 98978)",
    reportDate: format(new Date(), "MMMM d, yyyy"),
    facilityName: "Feelwell Health Services",
    facilityNPI: "1234567890",
    facilityAddress: "123 Wellness Drive, Suite 200, New York, NY 10001",
    providerName: "Dr. Clinical Provider",
    providerNPI: "0987654321",
    providerCredentials: "PhD, LCSW",

    patientName: patient.name,
    patientDOB: "01/15/2010",
    patientId: patient.id,
    diagnosis: patient.diagnosis,
    icdCodes,
    enrollmentDate: patient.enrolledDate,

    billingPeriodStart: patient.billingPeriodStart,
    billingPeriodEnd: patient.billingPeriodEnd,
    pathway: elig.pathway as "standard" | "short" | "none",

    cptCodes,
    totalAmount,

    dataCollectionDays: patient.dataCollectionDays,
    clinicianMinutesLogged: patient.clinicianMinutesLogged,
    interactiveCommunications: patient.interactiveCommunications,
    deviceSetupComplete: patient.setupComplete,
    educationComplete: patient.educationComplete,
    treatmentPlanActive: patient.treatmentPlan !== null,
    treatmentPlanTitle: patient.treatmentPlan?.title ?? null,
    treatmentPlanGoals: patient.treatmentPlan?.goals ?? [],

    timeEntries: timeEntries.map((e) => ({
      date: e.date,
      minutes: e.minutes,
      description: e.description,
      type: e.type.replace(/_/g, " "),
    })),

    communications: communications.map((c) => ({
      date: c.date,
      type: c.type.replace(/_/g, " "),
      duration: c.duration,
      summary: c.summary,
    })),

    clinicalSummary,
    moodTrendSummary,
    assessmentSummary,
    interventionsSummary,
  };
}

function generateClinicalSummary(patient: RTMPatient): string {
  const summaries: Record<string, string> = {
    "Sarah Mitchell": "Patient demonstrates consistent engagement with RTM platform, completing daily mood check-ins and therapeutic exercises. GAD-7 scores show downward trend from 14 to 10 over the billing period. Patient reports improved sleep quality and reduced frequency of panic episodes. Continues to benefit from CBT-based interventions including cognitive restructuring and progressive muscle relaxation.",
    "David Chen": "Patient engagement has been moderate with some periods of reduced activity. PHQ-9 scores decreased from 16 to 13, indicating gradual improvement in depressive symptoms. Patient has begun re-engaging with social activities and reports improved motivation. Behavioral activation strategies are showing positive results.",
    "Jessica Brown": "Patient is in early stages of trauma-focused treatment with focus on stabilization. Demonstrates good engagement with grounding techniques and distress tolerance skills. One safety workflow was activated during the period but was resolved successfully. Patient reports feeling safer and more in control of flashback episodes.",
    "Tyler Davis": "Patient engagement has been below target this billing period with only 8 data collection days. Social anxiety continues to impact daily functioning. Exposure hierarchy progress has stalled. Recommend increasing check-in frequency and reassessing treatment plan difficulty level.",
    "Alex Patel": "Excellent RTM engagement with consistent daily tracking. Mood data revealed a mild hypomanic episode that was caught early through pattern detection. Medication was adjusted in coordination with psychiatrist. Patient demonstrates strong insight into mood patterns and proactive use of coping strategies.",
  };
  return summaries[patient.name] ?? "Patient is actively enrolled in RTM monitoring. Clinical data is being collected and reviewed regularly. Treatment plan is being followed as prescribed.";
}

function generateMoodTrendSummary(patient: RTMPatient): string {
  const summaries: Record<string, string> = {
    "Sarah Mitchell": "Mood check-ins show a positive trend over the billing period. Anxiety-related moods decreased from 45% to 28% of check-ins. Calm and peaceful moods increased from 15% to 32%. Average mood intensity decreased from 3.8 to 2.9 (scale 1-5).",
    "David Chen": "Mood data shows gradual improvement. Sad/lonely moods decreased from 55% to 40%. Happy/calm moods increased from 12% to 22%. Patient still reports significant low mood periods but overall trajectory is positive.",
    "Jessica Brown": "Mood patterns show high variability consistent with PTSD presentation. Fear/anxiety moods remain elevated at 38% but have decreased from 48%. Calm periods are increasing, particularly on days when grounding exercises are completed.",
    "Tyler Davis": "Limited mood data due to low engagement (8 days). Available data shows predominantly anxious and lonely moods (65%). Recommend strategies to improve daily check-in compliance.",
    "Alex Patel": "Mood data shows characteristic bipolar pattern with identifiable cycles. RTM data was instrumental in early detection of hypomanic episode on Feb 12-14. Post-medication adjustment, mood stability improved significantly.",
  };
  return summaries[patient.name] ?? "Mood check-in data has been collected during the billing period. Trends are being monitored and reviewed.";
}

function generateAssessmentSummary(patient: RTMPatient): string {
  const summaries: Record<string, string> = {
    "Sarah Mitchell": "SCARED Total: 26 (down from 32). Generalized Anxiety subscale remains elevated at 11/18. SDQ Total Difficulties: 12 (Normal range). SEL Overall: 72/100 (Developing). Improvements noted in self-management and social awareness domains.",
    "David Chen": "SCARED Total: 16 (below clinical threshold). SDQ Total Difficulties: 17 (Borderline-Abnormal). Emotional Problems subscale elevated at 7/10. SEL Overall: 57/100 (Emerging). Relationship skills showing improvement.",
    "Jessica Brown": "SCARED Total: 34 (Moderate-Severe). Panic/Somatic subscale elevated at 12/26. SDQ Total Difficulties: 18 (Abnormal). Impact score 6/10 indicating significant functional impairment. SEL Overall: 53/100 (Emerging).",
    "Tyler Davis": "SCARED Total: 44 (Severe Anxiety). Social Anxiety subscale critically elevated at 12/14. SDQ Total Difficulties: 19 (Abnormal). SEL Overall: 51/100 (Emerging). School avoidance subscale concerning at 5/8.",
    "Alex Patel": "SCARED Total: 18 (Below threshold). SDQ Total Difficulties: 12 (Normal). SEL Overall: 79/100 (Developing-Strong). All domains showing positive trajectory. Prosocial behavior score excellent at 9/10.",
  };
  return summaries[patient.name] ?? "Standardized assessments have been administered during the billing period. Results are being tracked for trend analysis.";
}

function generateInterventionsSummary(patient: RTMPatient): string {
  const summaries: Record<string, string> = {
    "Sarah Mitchell": "CBT-based interventions: Cognitive restructuring worksheets (completed 12x), 4-7-8 breathing technique (daily), progressive muscle relaxation (12 sessions), guided breathing exercises (24 sessions). Sleep hygiene checklist maintained daily. Grounding technique practice (15 sessions).",
    "David Chen": "Behavioral activation: Daily mood journaling (18 entries), social connection activities (initiated), sleep hygiene program (20 days). Gratitude list practice introduced. Cognitive restructuring worksheets assigned but not yet started.",
    "Jessica Brown": "Trauma stabilization: Grounding technique practice (5-4-3-2-1 method, 9 sessions), progressive muscle relaxation (7 sessions), guided breathing (14 sessions). Safety plan established and reviewed. Distress tolerance skills introduced.",
    "Tyler Davis": "Exposure therapy: Graduated exposure hierarchy created (10 steps). Limited completion due to engagement barriers. Daily mood journaling (5 entries). Cognitive restructuring worksheet assigned.",
    "Alex Patel": "Mood monitoring: Daily mood tracking (26 days), sleep-wake schedule tracking, guided breathing (30 sessions), physical activity logging. Mood pattern psychoeducation provided. Medication coordination with psychiatrist.",
  };
  return summaries[patient.name] ?? "Therapeutic interventions have been delivered as part of the RTM treatment plan.";
}

// ─── Evidence Check Item ────────────────────────────────────────────

function EvidenceCheck({ label, value, met, requirement }: { label: string; value: string; met: boolean; requirement: string }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      {met ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      ) : (
        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
      )}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">{label}</span>
          <span className={cn("text-xs font-semibold", met ? "text-emerald-600" : "text-red-500")}>{value}</span>
        </div>
        <p className="text-[10px] text-gray-400">{requirement}</p>
      </div>
    </div>
  );
}

// ─── Printable Document ─────────────────────────────────────────────

function PrintableDocument({ doc }: { doc: ClaimDocument }) {
  return (
    <div className="space-y-6 bg-white p-8 text-gray-900" style={{ fontFamily: "Georgia, serif" }}>
      {/* Letterhead */}
      <div className="border-b-2 border-blue-600 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-blue-800">FEELWELL HEALTH SERVICES</h1>
            <p className="text-xs text-gray-500">{doc.facilityAddress}</p>
            <p className="text-xs text-gray-500">NPI: {doc.facilityNPI}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Report Generated</p>
            <p className="text-sm font-semibold">{doc.reportDate}</p>
          </div>
        </div>
      </div>

      {/* Report Title */}
      <div className="rounded-lg bg-blue-50 px-4 py-3 text-center">
        <h2 className="text-base font-bold text-blue-800">{doc.reportTitle}</h2>
        <p className="text-xs text-blue-600">
          Remote Therapeutic Monitoring — Billing Period: {format(new Date(doc.billingPeriodStart), "MMM d, yyyy")} – {format(new Date(doc.billingPeriodEnd), "MMM d, yyyy")}
        </p>
      </div>

      {/* Patient & Provider Info */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Patient Information</h3>
          <table className="w-full text-xs">
            <tbody>
              <tr><td className="py-0.5 pr-3 text-gray-500">Name:</td><td className="py-0.5 font-medium">{doc.patientName}</td></tr>
              <tr><td className="py-0.5 pr-3 text-gray-500">DOB:</td><td className="py-0.5 font-medium">{doc.patientDOB}</td></tr>
              <tr><td className="py-0.5 pr-3 text-gray-500">Patient ID:</td><td className="py-0.5 font-medium">{doc.patientId}</td></tr>
              <tr><td className="py-0.5 pr-3 text-gray-500">Diagnosis:</td><td className="py-0.5 font-medium">{doc.diagnosis}</td></tr>
              <tr><td className="py-0.5 pr-3 text-gray-500">ICD-10:</td><td className="py-0.5 font-medium">{doc.icdCodes.join(", ")}</td></tr>
              <tr><td className="py-0.5 pr-3 text-gray-500">Enrolled:</td><td className="py-0.5 font-medium">{doc.enrollmentDate}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Rendering Provider</h3>
          <table className="w-full text-xs">
            <tbody>
              <tr><td className="py-0.5 pr-3 text-gray-500">Name:</td><td className="py-0.5 font-medium">{doc.providerName}</td></tr>
              <tr><td className="py-0.5 pr-3 text-gray-500">Credentials:</td><td className="py-0.5 font-medium">{doc.providerCredentials}</td></tr>
              <tr><td className="py-0.5 pr-3 text-gray-500">NPI:</td><td className="py-0.5 font-medium">{doc.providerNPI}</td></tr>
              <tr><td className="py-0.5 pr-3 text-gray-500">Facility:</td><td className="py-0.5 font-medium">{doc.facilityName}</td></tr>
              <tr><td className="py-0.5 pr-3 text-gray-500">Facility NPI:</td><td className="py-0.5 font-medium">{doc.facilityNPI}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CPT Codes & Billing */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">CPT Codes & Billing Summary</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b">
              <th className="pb-1.5 text-left text-gray-500">CPT Code</th>
              <th className="pb-1.5 text-left text-gray-500">Description</th>
              <th className="pb-1.5 text-center text-gray-500">Eligible</th>
              <th className="pb-1.5 text-right text-gray-500">Amount</th>
            </tr>
          </thead>
          <tbody>
            {doc.cptCodes.map((cpt) => (
              <tr key={cpt.code} className="border-b border-gray-100">
                <td className="py-2 font-mono font-semibold">{cpt.code}</td>
                <td className="py-2 text-gray-600">{cpt.description}</td>
                <td className="py-2 text-center">
                  {cpt.eligible ? (
                    <span className="text-emerald-600 font-semibold">✓ Yes</span>
                  ) : (
                    <span className="text-red-500">✗ No</span>
                  )}
                </td>
                <td className="py-2 text-right font-medium">
                  {cpt.eligible ? `$${cpt.amount.toFixed(2)}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2">
              <td colSpan={3} className="pt-2 text-right font-bold">Total Estimated Reimbursement:</td>
              <td className="pt-2 text-right font-bold text-emerald-700">${doc.totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Evidence of Medical Necessity */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Evidence of Medical Necessity & Compliance</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          <EvidenceCheck
            label="Data Collection Days"
            value={`${doc.dataCollectionDays} days`}
            met={doc.pathway === "standard" ? doc.dataCollectionDays >= 16 : doc.dataCollectionDays >= 2}
            requirement={doc.pathway === "standard" ? "Requires ≥16 days for standard pathway" : "Requires ≥2 days for short-period pathway"}
          />
          <EvidenceCheck
            label="Clinician Time Logged"
            value={`${doc.clinicianMinutesLogged} min`}
            met={doc.pathway === "standard" ? doc.clinicianMinutesLogged >= 20 : doc.clinicianMinutesLogged >= 10}
            requirement={doc.pathway === "standard" ? "Requires ≥20 min for 98980" : "Requires ≥10 min for 98979"}
          />
          <EvidenceCheck
            label="Interactive Communications"
            value={`${doc.interactiveCommunications}`}
            met={doc.interactiveCommunications >= 1}
            requirement="Requires ≥1 interactive communication per billing period"
          />
          <EvidenceCheck
            label="Device Setup & Supply"
            value={doc.deviceSetupComplete ? "Complete" : "Incomplete"}
            met={doc.deviceSetupComplete}
            requirement="RTM device/app must be set up and operational"
          />
          <EvidenceCheck
            label="Patient Education"
            value={doc.educationComplete ? "Complete" : "Incomplete"}
            met={doc.educationComplete}
            requirement="Patient must receive education on RTM device/app usage"
          />
          <EvidenceCheck
            label="Treatment Plan"
            value={doc.treatmentPlanActive ? "Active" : "None"}
            met={doc.treatmentPlanActive}
            requirement="Active treatment plan required for RTM billing"
          />
        </div>
      </div>

      {/* Treatment Plan Summary */}
      {doc.treatmentPlanActive && (
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Treatment Plan</h3>
          <p className="text-xs font-semibold text-gray-800">{doc.treatmentPlanTitle}</p>
          {doc.treatmentPlanGoals.length > 0 && (
            <ul className="mt-2 space-y-1">
              {doc.treatmentPlanGoals.map((goal, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="mt-0.5 text-blue-500">•</span>
                  {goal}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Clinical Summary */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Clinical Summary</h3>
        <p className="text-xs text-gray-700 leading-relaxed">{doc.clinicalSummary}</p>
      </div>

      {/* Mood Trend Summary */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Mood & Symptom Monitoring Summary</h3>
        <p className="text-xs text-gray-700 leading-relaxed">{doc.moodTrendSummary}</p>
      </div>

      {/* Assessment Summary */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Standardized Assessment Results</h3>
        <p className="text-xs text-gray-700 leading-relaxed">{doc.assessmentSummary}</p>
      </div>

      {/* Interventions */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Interventions & Activities Delivered</h3>
        <p className="text-xs text-gray-700 leading-relaxed">{doc.interventionsSummary}</p>
      </div>

      {/* Time Log */}
      {doc.timeEntries.length > 0 && (
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Clinician Time Log</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="pb-1.5 text-left text-gray-500">Date</th>
                <th className="pb-1.5 text-left text-gray-500">Type</th>
                <th className="pb-1.5 text-center text-gray-500">Minutes</th>
                <th className="pb-1.5 text-left text-gray-500">Description</th>
              </tr>
            </thead>
            <tbody>
              {doc.timeEntries.map((entry, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1.5 font-medium">{entry.date}</td>
                  <td className="py-1.5 capitalize text-gray-600">{entry.type}</td>
                  <td className="py-1.5 text-center font-medium">{entry.minutes}</td>
                  <td className="py-1.5 text-gray-600">{entry.description}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t">
                <td colSpan={2} className="pt-1.5 font-bold">Total</td>
                <td className="pt-1.5 text-center font-bold">{doc.timeEntries.reduce((s, e) => s + e.minutes, 0)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Communications Log */}
      {doc.communications.length > 0 && (
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Interactive Communications Log</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="pb-1.5 text-left text-gray-500">Date</th>
                <th className="pb-1.5 text-left text-gray-500">Type</th>
                <th className="pb-1.5 text-center text-gray-500">Duration</th>
                <th className="pb-1.5 text-left text-gray-500">Summary</th>
              </tr>
            </thead>
            <tbody>
              {doc.communications.map((comm, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1.5 font-medium">{comm.date}</td>
                  <td className="py-1.5 capitalize text-gray-600">{comm.type}</td>
                  <td className="py-1.5 text-center font-medium">{comm.duration} min</td>
                  <td className="py-1.5 text-gray-600">{comm.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Attestation */}
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50/50 p-4">
        <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-blue-700">Provider Attestation</h3>
        <p className="text-xs text-blue-800 leading-relaxed">
          I hereby attest that the services described in this report were medically necessary and were provided
          in accordance with the patient&apos;s individualized treatment plan. All data collection, clinical review,
          and interactive communications documented herein are accurate and complete. The remote therapeutic
          monitoring services were delivered using an FDA-cleared medical device/software platform (Feelwell)
          that collects and transmits patient-generated health data for clinical review.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-8">
          <div>
            <div className="border-b border-gray-400 pb-6" />
            <p className="mt-1 text-[10px] text-gray-500">Provider Signature</p>
          </div>
          <div>
            <div className="border-b border-gray-400 pb-6" />
            <p className="mt-1 text-[10px] text-gray-500">Date</p>
          </div>
        </div>
        <div className="mt-3 text-[10px] text-gray-500">
          <p>{doc.providerName}, {doc.providerCredentials} · NPI: {doc.providerNPI}</p>
          <p>{doc.facilityName} · NPI: {doc.facilityNPI}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t pt-3 text-center text-[9px] text-gray-400">
        <p>This document was auto-generated by the Feelwell RTM Platform on {doc.reportDate}.</p>
        <p>Confidential — Protected Health Information (PHI) — HIPAA compliant.</p>
      </div>
    </div>
  );
}

// ─── Document Preview Modal ─────────────────────────────────────────

function DocumentPreviewModal({
  doc,
  open,
  onClose,
}: {
  doc: ClaimDocument;
  open: boolean;
  onClose: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${doc.reportTitle} - ${doc.patientName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Georgia, serif; font-size: 11px; color: #111; padding: 0.5in; }
            @media print { body { padding: 0; } }
          </style>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body>${printRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative mx-4 flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <h2 className="text-base font-semibold text-gray-900">RTM Claim Document</h2>
              <p className="text-xs text-gray-500">{doc.patientName} · {format(new Date(doc.billingPeriodStart), "MMM d")} – {format(new Date(doc.billingPeriodEnd), "MMM d, yyyy")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5" />
              Print / Save PDF
            </Button>
            <button onClick={onClose} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div ref={printRef} className="mx-auto max-w-3xl rounded-lg shadow-lg">
            <PrintableDocument doc={doc} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────

export function RTMClaimDocumentGenerator({ patient }: { patient: RTMPatient }) {
  const [showPreview, setShowPreview] = useState(false);
  const doc = generateClaimDocument(patient);
  const elig = getBillingEligibility(patient);
  const isBillable = (elig.cpt98978.eligible && elig.cpt98980.eligible) ||
                     (elig.cpt98986.eligible && elig.cpt98979.eligible);

  return (
    <>
      <div className="rounded-xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">RTM Claim Document</h3>
              <p className="text-xs text-gray-500">
                {isBillable
                  ? "Auto-generated claim document ready for review"
                  : "Document will be generated when billing requirements are met"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isBillable && (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Ready
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="h-3.5 w-3.5" />
              Preview Document
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowPreview(true)}
            >
              <Download className="h-3.5 w-3.5" />
              Generate & Download
            </Button>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="mt-4 grid grid-cols-4 gap-3">
          <div className="rounded-lg border p-3 text-center">
            <p className="text-lg font-bold text-gray-900">{doc.cptCodes.filter((c) => c.eligible).length}</p>
            <p className="text-[10px] text-gray-500">Eligible CPT Codes</p>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-center">
            <p className="text-lg font-bold text-emerald-700">${doc.totalAmount.toFixed(2)}</p>
            <p className="text-[10px] text-emerald-600">Est. Reimbursement</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-lg font-bold text-gray-900">{doc.dataCollectionDays}</p>
            <p className="text-[10px] text-gray-500">Data Days</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-lg font-bold text-gray-900">{doc.clinicianMinutesLogged} min</p>
            <p className="text-[10px] text-gray-500">Time Logged</p>
          </div>
        </div>

        {/* CPT Code Status */}
        <div className="mt-3 flex flex-wrap gap-2">
          {doc.cptCodes.map((cpt) => (
            <span
              key={cpt.code}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                cpt.eligible
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-gray-50 text-gray-400",
              )}
            >
              {cpt.eligible ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
              {cpt.code}
              {cpt.eligible && <span className="text-[10px]">${cpt.amount.toFixed(2)}</span>}
            </span>
          ))}
        </div>
      </div>

      <DocumentPreviewModal
        doc={doc}
        open={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
}
