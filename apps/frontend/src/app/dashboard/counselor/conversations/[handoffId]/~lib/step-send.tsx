"use client";

import { differenceInYears, format } from "date-fns";
import {
  AlertTriangle,
  FileText,
  Landmark,
  Pencil,
  Phone,
  School,
  Users,
} from "lucide-react";
import { cn } from "@/lib/tailwind-utils";
import type {
  ConcernType,
  DocumentData,
  RiskLevel,
  SafetyWorkflowData,
} from "./safety-workflow-types";
import { CONCERN_TYPE_LABELS } from "./safety-workflow-types";

type Props = {
  workflow: SafetyWorkflowData;
  schoolName: string;
  studentDateOfBirth: string | null;
  documentData: DocumentData;
  concernType: ConcernType | null;
  riskLevel: RiskLevel | null;
  coachName: string;
  onEditDocument: () => void;
};

const RISK_LEVEL_STYLES: Record<
  RiskLevel,
  { label: string; bg: string; text: string; showIcon?: boolean }
> = {
  emergency: {
    label: "EMERGENCY",
    bg: "bg-red-100",
    text: "text-red-700",
    showIcon: true,
  },
  high: {
    label: "HIGH RISK",
    bg: "bg-orange-100",
    text: "text-orange-700",
    showIcon: true,
  },
  moderate: {
    label: "MODERATE",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
  },
  low: { label: "LOW", bg: "bg-blue-100", text: "text-blue-700" },
};

const CONCERN_TYPE_BADGE_STYLES: Record<
  ConcernType,
  { bg: string; text: string }
> = {
  harm_to_self: { bg: "bg-red-100", text: "text-red-700" },
  harm_to_others: { bg: "bg-orange-100", text: "text-orange-700" },
  abuse_neglect: { bg: "bg-amber-100", text: "text-amber-700" },
  other_safety: { bg: "bg-blue-100", text: "text-blue-700" },
};

const CONTACT_RESULT_STYLES: Record<string, { bg: string; text: string }> = {
  "Successfully Reached": { bg: "bg-green-100", text: "text-green-700" },
  "Successful Contact": { bg: "bg-green-100", text: "text-green-700" },
  "Left Voicemail": { bg: "bg-orange-100", text: "text-orange-700" },
  "No Answer": { bg: "bg-red-100", text: "text-red-700" },
  "Wrong Number": { bg: "bg-red-100", text: "text-red-700" },
  "Contact Refused": { bg: "bg-red-100", text: "text-red-700" },
};

function ResultBadge({ result }: { result: string | null }) {
  if (!result) return null;
  const style = CONTACT_RESULT_STYLES[result] ?? {
    bg: "bg-gray-100",
    text: "text-gray-700",
  };
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 font-semibold text-[10px]",
        style.bg,
        style.text,
      )}
    >
      {result}
    </span>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 font-medium text-blue-600 text-xs hover:text-blue-700"
    >
      <Pencil className="size-3" />
      Edit
    </button>
  );
}

function methodLabel(method: string | null) {
  if (!method) return null;
  const labels: Record<string, string> = {
    phone: "Phone call",
    email: "Email",
    in_person: "In-Person",
  };
  return labels[method] ?? method;
}

export function StepSend({
  workflow,
  schoolName: _schoolName,
  studentDateOfBirth,
  documentData,
  concernType,
  riskLevel,
  coachName,
  onEditDocument,
}: Props) {
  const activatedDate = (() => {
    const date = new Date(workflow.activatedAt);
    return format(date, "MMMM d, yyyy 'at' h:mm a");
  })();

  const hasNoActions =
    !documentData.parentGuardian.completed &&
    !documentData.emergencyServices.completed &&
    !documentData.schoolNotified.completed &&
    !documentData.cps.completed &&
    !documentData.assessment.completed;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex-1 space-y-4 p-4">
        {/* Header */}
        <div>
          <h3 className="font-bold text-gray-900 text-lg">
            Review & Send Report
          </h3>
          <p className="mt-1 text-gray-500 text-sm">
            Review all information before submitting
          </p>
        </div>

        {/* Report Card */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {/* Patient Information */}
          <div className="border-gray-100 border-b p-4">
            <h4 className="mb-3 font-bold text-gray-900 text-sm">
              Patient Information
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <span className="text-gray-500">Name:</span>{" "}
                <span className="font-medium text-gray-900">
                  {workflow.studentName}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Age:</span>{" "}
                <span className="font-medium text-gray-900">
                  {studentDateOfBirth
                    ? differenceInYears(
                        new Date(),
                        new Date(studentDateOfBirth),
                      )
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Concern Details */}
          <div className="border-gray-100 border-b p-4">
            <h4 className="mb-3 font-bold text-gray-900 text-sm">
              Concern Details
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Concern Type:</span>
                {concernType && (
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 font-semibold text-[10px]",
                      CONCERN_TYPE_BADGE_STYLES[concernType].bg,
                      CONCERN_TYPE_BADGE_STYLES[concernType].text,
                    )}
                  >
                    {CONCERN_TYPE_LABELS[concernType]}
                  </span>
                )}
              </div>
              {riskLevel && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Risk Level:</span>
                  <span
                    className={cn(
                      "flex items-center gap-1 rounded px-2 py-0.5 font-bold text-[10px]",
                      RISK_LEVEL_STYLES[riskLevel].bg,
                      RISK_LEVEL_STYLES[riskLevel].text,
                    )}
                  >
                    {RISK_LEVEL_STYLES[riskLevel].showIcon && (
                      <AlertTriangle className="size-3" />
                    )}
                    {RISK_LEVEL_STYLES[riskLevel].label}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-500">Date & Time:</span>{" "}
                <span className="font-medium text-gray-900">
                  {activatedDate}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Submitted by:</span>{" "}
                <span className="font-medium text-gray-900">{coachName}</span>
              </div>
            </div>
          </div>

          {/* Situation Summary */}
          <div className="border-gray-100 border-b p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-bold text-gray-900 text-sm">
                Situation Summary
              </h4>
              <EditButton onClick={onEditDocument} />
            </div>
            {documentData.situationSummary ? (
              <p className="text-gray-700 text-xs leading-relaxed">
                {documentData.situationSummary}
              </p>
            ) : (
              <p className="text-gray-400 text-xs italic">
                No summary provided
              </p>
            )}
          </div>

          {/* Patient Disclosure */}
          <div className="border-gray-100 border-b p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-bold text-gray-900 text-sm">
                Patient Disclosure
              </h4>
              <EditButton onClick={onEditDocument} />
            </div>
            {documentData.studentStatement ? (
              <div className="rounded-lg border-gray-300 border-l-4 bg-gray-50 px-3 py-2.5 text-gray-700 text-xs leading-relaxed">
                {documentData.studentStatement}
              </div>
            ) : (
              <p className="text-gray-400 text-xs italic">
                No statement recorded
              </p>
            )}
          </div>

          {/* Actions Taken */}
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-bold text-gray-900 text-sm">Actions Taken</h4>
              <EditButton onClick={onEditDocument} />
            </div>
            <div className="space-y-3">
              {/* Parent/Guardian */}
              {documentData.parentGuardian.completed && (
                <ActionItem
                  icon={<Users className="size-3.5" />}
                  iconBg="bg-green-100"
                  iconColor="text-green-600"
                  title="Parent/Guardian contacted"
                  badge={
                    <ResultBadge result={documentData.parentGuardian.result} />
                  }
                  details={[
                    methodLabel(documentData.parentGuardian.contactMethod),
                    documentData.parentGuardian.relationship,
                    documentData.parentGuardian.nameContact,
                    documentData.parentGuardian.timeContacted,
                  ]
                    .filter(Boolean)
                    .join(" \u2022 ")}
                  notes={documentData.parentGuardian.notes}
                />
              )}

              {/* Emergency Services */}
              {documentData.emergencyServices.completed && (
                <ActionItem
                  icon={<Phone className="size-3.5" />}
                  iconBg="bg-red-100"
                  iconColor="text-red-600"
                  title="Emergency Services contacted"
                  badge={
                    <ResultBadge
                      result={documentData.emergencyServices.outcome}
                    />
                  }
                  details={[
                    documentData.emergencyServices.timeCalled,
                    documentData.emergencyServices.details,
                  ]
                    .filter(Boolean)
                    .join(" \u2022 ")}
                  notes={null}
                />
              )}

              {/* School Notified */}
              {documentData.schoolNotified.completed && (
                <ActionItem
                  icon={<School className="size-3.5" />}
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                  title="Clinic notified"
                  badge={
                    <ResultBadge result={documentData.schoolNotified.outcome} />
                  }
                  details={[
                    methodLabel(documentData.schoolNotified.method),
                    documentData.schoolNotified.whoNotified,
                    documentData.schoolNotified.timeNotified,
                  ]
                    .filter(Boolean)
                    .join(" \u2022 ")}
                  notes={documentData.schoolNotified.notes}
                />
              )}

              {/* CPS */}
              {documentData.cps.completed && (
                <ActionItem
                  icon={<Landmark className="size-3.5" />}
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                  title="CPS notified"
                  badge={null}
                  details={[
                    documentData.cps.timeReported,
                    documentData.cps.reportCaseNumber
                      ? `Report #${documentData.cps.reportCaseNumber}`
                      : null,
                    documentData.cps.typeOfConcern,
                  ]
                    .filter(Boolean)
                    .join(" \u2022 ")}
                  notes={documentData.cps.nextSteps}
                />
              )}

              {/* Assessment */}
              {documentData.assessment.completed && (
                <ActionItem
                  icon={<FileText className="size-3.5" />}
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                  title="Assessment performed"
                  badge={null}
                  details={null}
                  notes={null}
                />
              )}

              {/* If no actions were taken */}
              {hasNoActions && (
                <p className="text-gray-400 text-xs italic">
                  No actions documented
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Important Reminder */}
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold text-gray-900 text-xs">
              Important Reminder
            </p>
            <p className="mt-0.5 text-[11px] text-amber-700">
              Once submitted, this report cannot be edited. Please review all
              information carefully before submitting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
 * Action item row
 * ───────────────────────────────────────────────────── */

function ActionItem({
  icon,
  iconBg,
  iconColor,
  title,
  badge,
  details,
  notes,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  badge: React.ReactNode;
  details: string | null;
  notes: string | null;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full",
          iconBg,
          iconColor,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-gray-900 text-xs">{title}</span>
          {badge}
        </div>
        {details && (
          <p className="mt-0.5 text-[11px] text-gray-500">{details}</p>
        )}
        {notes !== null && (
          <p className="mt-0.5 text-[11px] text-gray-400">
            Notes: {notes || "N/A"}
          </p>
        )}
      </div>
    </div>
  );
}
