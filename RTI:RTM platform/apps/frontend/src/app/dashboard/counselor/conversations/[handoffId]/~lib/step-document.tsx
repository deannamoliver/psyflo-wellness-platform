"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronDownIcon,
  ChevronUp,
  FileText,
  GraduationCap,
  Info,
  Landmark,
  Phone,
  School,
  Shield,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { Checkbox } from "@/lib/core-ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/lib/core-ui/dropdown-menu";
import { cn } from "@/lib/tailwind-utils";
import type {
  ConcernType,
  DocAssessmentSection,
  DocCpsSection,
  DocEmergencyServicesSection,
  DocParentGuardianSection,
  DocSchoolNotifiedSection,
  DocumentData,
  RiskLevel,
} from "./safety-workflow-types";
import { CONCERN_TYPE_LABELS } from "./safety-workflow-types";
import { TimeInputWithNow } from "./time-input-now";

type Props = {
  value: DocumentData;
  onChange: (value: DocumentData) => void;
  schoolName: string;
  studentName: string;
  studentGrade: string;
  concernType: ConcernType | null;
  riskLevel: RiskLevel | null;
};

const SERVICE_OPTIONS = [
  "911 - Police/Fire/Ambulance",
  "988 - Suicide & Crisis Lifeline",
  "Crisis Text Line (Text HOME to 741741)",
  "Other Crisis Service",
];

const EMERGENCY_OUTCOME_OPTIONS = [
  "Successful Contact",
  "Contact Refused",
  "No Answer/Left Message",
  "Wrong Number",
];

const SCHOOL_METHOD_OPTIONS = [
  { value: "in_person", label: "In-Person" },
  { value: "phone", label: "Phone Call" },
  { value: "email", label: "Email" },
];

const SCHOOL_OUTCOME_OPTIONS = [
  "Successfully Reached",
  "Left Voicemail",
  "No Answer",
  "Wrong Number",
];

const PARENT_RELATIONSHIP_OPTIONS = [
  "Parent / Step-parent",
  "Guardian/Caregiver",
  "Sibling",
  "Other relative",
  "Parent's partner",
  "Other adult in home",
  "Person outside home",
  "Unknown/student didn't say",
];

const PARENT_METHOD_OPTIONS = [
  { value: "phone", label: "Phone Call" },
  { value: "in_person", label: "In-Person" },
  { value: "email", label: "Email" },
];

const PARENT_RESULT_OPTIONS = [
  "Successfully Reached",
  "Left Voicemail",
  "No Answer",
  "Wrong Number",
];

const CPS_TYPE_OPTIONS = [
  "Physical Abuse",
  "Sexual Abuse",
  "Emotional Abuse",
  "Neglect",
  "Multiple Types",
];

const RISK_LEVEL_STYLES: Record<
  RiskLevel,
  { label: string; bg: string; text: string }
> = {
  emergency: { label: "EMERGENCY", bg: "bg-red-100", text: "text-red-700" },
  high: { label: "HIGH", bg: "bg-orange-100", text: "text-orange-700" },
  moderate: {
    label: "MODERATE",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
  },
  low: { label: "LOW", bg: "bg-blue-100", text: "text-blue-700" },
};

export function StepDocument({
  value,
  onChange,
  schoolName,
  studentName,
  studentGrade,
  concernType,
  riskLevel,
}: Props) {
  const [data, setData] = useState<DocumentData>(value);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  function update(patch: Partial<DocumentData>) {
    const updated = { ...data, ...patch };
    setData(updated);
    onChange(updated);
  }

  function toggleSection(key: string) {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex-1 space-y-4 p-4">
        {/* Header */}
        <div>
          <h3 className="font-bold text-gray-900 text-lg">
            Document the Situation
          </h3>
          <p className="mt-1 text-gray-500 text-sm">
            Provide detailed documentation of what happened and actions taken
          </p>
        </div>

        {/* Summary Box */}
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="size-4 text-blue-600" />
            <span className="font-bold text-blue-800 text-sm">Summary</span>
          </div>
          <div className="grid grid-cols-2 gap-x-1 gap-y-2 text-xs">
            <div className="flex items-center gap-1.5">
              <School className="size-3 text-gray-400" />
              <span className="text-gray-500">School:</span>
              <span className="font-medium text-gray-900">
                {schoolName || "—"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="size-3 text-gray-400" />
              <span className="text-gray-500">Student:</span>
              <span className="font-medium text-gray-900">{studentName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCap className="size-3 text-gray-400" />
              <span className="text-gray-500">Grade:</span>
              <span className="font-medium text-gray-900">{studentGrade}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="size-3 text-gray-400" />
              <span className="text-gray-500">Concern:</span>
              {concernType ? (
                <span className="rounded bg-gray-200 px-1.5 py-0.5 font-semibold text-[10px] text-gray-700">
                  {CONCERN_TYPE_LABELS[concernType]}
                </span>
              ) : (
                <span className="font-medium text-gray-900">—</span>
              )}
            </div>
            {riskLevel && (
              <div className="col-span-2 flex items-center gap-1.5">
                <AlertTriangle className="size-3 text-gray-400" />
                <span className="text-gray-500">Risk Level:</span>
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 font-bold text-[10px]",
                    RISK_LEVEL_STYLES[riskLevel].bg,
                    RISK_LEVEL_STYLES[riskLevel].text,
                  )}
                >
                  {RISK_LEVEL_STYLES[riskLevel].label}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Section 1: Situation Summary */}
        <div className="rounded-lg border-2 border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-xs">
              1
            </span>
            <h4 className="flex-1 font-bold text-sm">Situation Summary</h4>
            <span className="rounded bg-red-100 px-1.5 py-0.5 font-semibold text-[10px] text-red-700">
              REQUIRED
            </span>
          </div>
          <div className="mt-3">
            <p className="mb-3 text-gray-500 text-xs">
              Describe the situation that led to activating the safety protocol.
              Include context, timeline, and how the concern came to light.
            </p>
            <textarea
              value={data.situationSummary}
              onChange={(e) => update({ situationSummary: e.target.value })}
              placeholder="Example: During our regular check-in conversation, Emma disclosed that she has been having thoughts of self-harm for the past two weeks. She mentioned feeling overwhelmed by academic pressure and stated she had been cutting herself."
              className="w-full rounded-md border border-gray-300 p-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={6}
            />
          </div>
        </div>

        {/* Section 2: What did the student say? */}
        <div className="rounded-lg border-2 border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-xs">
              2
            </span>
            <h4 className="flex-1 font-bold text-sm">
              What did the student say?
            </h4>
            <span className="rounded bg-red-100 px-1.5 py-0.5 font-semibold text-[10px] text-red-700">
              REQUIRED
            </span>
          </div>
          <div className="mt-3">
            <p className="mb-1 text-gray-500 text-xs">
              Document the student&apos;s words as much as possible. Use direct
              quotes when you can remember them.
            </p>
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
              <Info className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
              <p className="text-[11px] text-amber-700">
                <strong>Tip:</strong> Use quotation marks for direct quotes to
                be as accurate as possible — this is important documentation for
                any follow-up.
              </p>
            </div>
            <p className="mb-3 text-[11px] text-gray-400">
              Include direct quotes when possible
            </p>
            <textarea
              value={data.studentStatement}
              onChange={(e) => update({ studentStatement: e.target.value })}
              placeholder={
                'Example: "I promise, I\'m not going to do anything, I just feel like... I just feel like the pain will never stop."'
              }
              className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={4}
            />
          </div>
        </div>

        {/* Section 3: Document Any Actions Taken */}
        <div className="rounded-lg border-2 border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-xs">
              3
            </span>
            <h4 className="flex-1 font-bold text-sm">
              Document Any Actions Taken
            </h4>
            <span className="rounded bg-red-100 px-1.5 py-0.5 font-semibold text-[10px] text-red-700">
              REQUIRED
            </span>
          </div>
          <p className="mt-1 text-gray-500 text-xs">
            Document ONLY actions taken during this safety protocol
          </p>

          <div className="mt-4 space-y-4">
            {/* 3a: Emergency Services Contacted */}
            <EmergencyServicesSection
              value={data.emergencyServices}
              onChange={(v) => {
                update({ emergencyServices: v });
                if (v.completed)
                  setExpandedSections((prev) => ({
                    ...prev,
                    emergency: false,
                  }));
              }}
              expanded={expandedSections["emergency"] ?? true}
              onToggle={() => toggleSection("emergency")}
            />

            {/* 3b: Assessment Performed */}
            <AssessmentSection
              value={data.assessment}
              onChange={(v) => update({ assessment: v })}
            />

            {/* 3c: School Notified */}
            <SchoolNotifiedSection
              value={data.schoolNotified}
              onChange={(v) => {
                update({ schoolNotified: v });
                if (v.completed)
                  setExpandedSections((prev) => ({ ...prev, school: false }));
              }}
              expanded={expandedSections["school"] ?? true}
              onToggle={() => toggleSection("school")}
            />

            {/* 3d: Parent/Guardian Contacted */}
            <ParentGuardianSection
              value={data.parentGuardian}
              onChange={(v) => {
                update({ parentGuardian: v });
                if (v.completed)
                  setExpandedSections((prev) => ({ ...prev, parent: false }));
              }}
              expanded={expandedSections["parent"] ?? true}
              onToggle={() => toggleSection("parent")}
            />

            {/* 3e: CPS/Child Protective Services */}
            <CpsSection
              value={data.cps}
              onChange={(v) => {
                update({ cps: v });
                if (v.completed)
                  setExpandedSections((prev) => ({ ...prev, cps: false }));
              }}
              expanded={expandedSections["cps"] ?? true}
              onToggle={() => toggleSection("cps")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
 * Sub-section: Emergency Services Contacted
 * ───────────────────────────────────────────────────── */

function EmergencyServicesSection({
  value,
  onChange,
  expanded,
  onToggle,
}: {
  value: DocEmergencyServicesSection;
  onChange: (v: DocEmergencyServicesSection) => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  function update(patch: Partial<DocEmergencyServicesSection>) {
    onChange({ ...value, ...patch });
  }

  const isContentVisible = expanded;

  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        value.completed ? "border-green-300 bg-green-50/30" : "border-gray-200",
      )}
    >
      <div className="flex items-center gap-2">
        {value.completed ? (
          <CheckCircle2 className="size-4 shrink-0 text-green-600" />
        ) : (
          <Phone className="size-4 shrink-0 text-red-500" />
        )}
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-1.5 text-left"
        >
          <span className="font-semibold text-gray-900 text-sm">
            Emergency Services Contacted
          </span>
          {isContentVisible ? (
            <ChevronUp className="size-3.5 text-gray-400" />
          ) : (
            <ChevronDown className="size-3.5 text-gray-400" />
          )}
        </button>
        <label className="flex shrink-0 items-center gap-1.5">
          <Checkbox
            checked={value.completed}
            onCheckedChange={(checked) =>
              update({ completed: checked === true })
            }
          />
          <span className="text-[11px] text-gray-500">Completed</span>
        </label>
      </div>

      {isContentVisible && (
        <div className="mt-3 space-y-3 border-gray-100 border-t pt-3">
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
            <p className="text-[11px] text-amber-700">
              Only complete this section if you contacted emergency services
            </p>
          </div>

          {/* Service Called */}
          <div>
            <p className="mb-1 font-semibold text-gray-700 text-xs">
              Service Called
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className="h-8 w-full justify-between gap-1.5 rounded border-gray-200 bg-white px-2.5 py-1 font-dm font-normal text-gray-700 text-xs hover:bg-gray-50 hover:text-gray-700"
                >
                  {value.serviceCalled ?? "Select service..."}
                  <ChevronDownIcon className="size-3.5 shrink-0 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-0 bg-white font-dm text-xs [&_[data-slot=dropdown-menu-radio-item]]:w-full [&_[data-slot=dropdown-menu-radio-item]]:py-2.5 [&_[data-slot=dropdown-menu-radio-item]]:pr-4 [&_[data-slot=dropdown-menu-radio-item]]:pl-9 [&_[data-slot=dropdown-menu-radio-item]]:text-xs [&_[data-slot=dropdown-menu-radio-item]]:hover:bg-secondary/80 [&_[data-slot=dropdown-menu-radio-item]]:focus:bg-secondary"
              >
                <DropdownMenuRadioGroup
                  value={value.serviceCalled ?? ""}
                  onValueChange={(v) => update({ serviceCalled: v || null })}
                >
                  <DropdownMenuRadioItem
                    value=""
                    className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                  >
                    Select service...
                  </DropdownMenuRadioItem>
                  {SERVICE_OPTIONS.map((opt) => (
                    <DropdownMenuRadioItem
                      key={opt}
                      value={opt}
                      className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                    >
                      {opt}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Time Called */}
          <div>
            <p className="mb-1 font-semibold text-gray-700 text-xs">
              Time Called
            </p>
            <TimeInputWithNow
              value={value.timeCalled}
              onChange={(v) => update({ timeCalled: v })}
              aria-label="Time called"
            />
          </div>

          {/* Outcome */}
          <div>
            <p className="mb-1 font-semibold text-gray-700 text-xs">Outcome</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className="h-8 w-full justify-between gap-1.5 rounded border-gray-200 bg-white px-2.5 py-1 font-dm font-normal text-gray-700 text-xs hover:bg-gray-50 hover:text-gray-700"
                >
                  {value.outcome ?? "Select outcome..."}
                  <ChevronDownIcon className="size-3.5 shrink-0 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-0 bg-white font-dm text-xs [&_[data-slot=dropdown-menu-radio-item]]:w-full [&_[data-slot=dropdown-menu-radio-item]]:py-2.5 [&_[data-slot=dropdown-menu-radio-item]]:pr-4 [&_[data-slot=dropdown-menu-radio-item]]:pl-9 [&_[data-slot=dropdown-menu-radio-item]]:text-xs [&_[data-slot=dropdown-menu-radio-item]]:hover:bg-secondary/80 [&_[data-slot=dropdown-menu-radio-item]]:focus:bg-secondary"
              >
                <DropdownMenuRadioGroup
                  value={value.outcome ?? ""}
                  onValueChange={(v) => update({ outcome: v || null })}
                >
                  <DropdownMenuRadioItem
                    value=""
                    className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                  >
                    Select outcome...
                  </DropdownMenuRadioItem>
                  {EMERGENCY_OUTCOME_OPTIONS.map((opt) => (
                    <DropdownMenuRadioItem
                      key={opt}
                      value={opt}
                      className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                    >
                      {opt}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Details */}
          <div>
            <p className="mb-1 font-semibold text-gray-700 text-xs">Details</p>
            <textarea
              value={value.details}
              onChange={(e) => update({ details: e.target.value })}
              placeholder="What information was provided to emergency services? What action did they take?"
              className="w-full rounded-md border border-gray-300 p-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
 * Sub-section: Assessment Performed
 * ───────────────────────────────────────────────────── */

function AssessmentSection({
  value,
  onChange,
}: {
  value: DocAssessmentSection;
  onChange: (v: DocAssessmentSection) => void;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        value.completed ? "border-green-300 bg-green-50/30" : "border-gray-200",
      )}
    >
      <div className="flex items-center gap-2">
        {value.completed ? (
          <CheckCircle2 className="size-4 shrink-0 text-green-600" />
        ) : (
          <FileText className="size-4 shrink-0 text-blue-500" />
        )}
        <span className="flex-1 font-semibold text-gray-900 text-sm">
          Assessment Performed
        </span>
        <label className="flex items-center gap-1.5">
          <Checkbox
            checked={value.completed}
            onCheckedChange={(checked) =>
              onChange({ ...value, completed: checked === true })
            }
          />
          <span className="text-[11px] text-gray-500">Completed</span>
        </label>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
 * Sub-section: School Notified
 * ───────────────────────────────────────────────────── */

function SchoolNotifiedSection({
  value,
  onChange,
  expanded,
  onToggle,
}: {
  value: DocSchoolNotifiedSection;
  onChange: (v: DocSchoolNotifiedSection) => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  function update(patch: Partial<DocSchoolNotifiedSection>) {
    onChange({ ...value, ...patch });
  }

  const isContentVisible = expanded;

  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        value.completed ? "border-green-300 bg-green-50/30" : "border-gray-200",
      )}
    >
      <div className="flex items-center gap-2">
        {value.completed ? (
          <CheckCircle2 className="size-4 shrink-0 text-green-600" />
        ) : (
          <School className="size-4 shrink-0 text-amber-500" />
        )}
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-1.5 text-left"
        >
          <span className="font-semibold text-gray-900 text-sm">
            School Notified
          </span>
          {isContentVisible ? (
            <ChevronUp className="size-3.5 text-gray-400" />
          ) : (
            <ChevronDown className="size-3.5 text-gray-400" />
          )}
        </button>
        <label className="flex shrink-0 items-center gap-1.5">
          <Checkbox
            checked={value.completed}
            onCheckedChange={(checked) =>
              update({ completed: checked === true })
            }
          />
          <span className="text-[11px] text-gray-500">Completed</span>
        </label>
      </div>

      {isContentVisible && (
        <div className="mt-3 space-y-3 border-gray-100 border-t pt-3">
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
            <p className="text-[11px] text-amber-700">
              Only complete this section if you notified school prior to
              submitting this safety report.
            </p>
          </div>

          {/* Who was notified? */}
          <div>
            <p className="mb-1 font-semibold text-gray-700 text-xs">
              Who was notified?
            </p>
            <input
              type="text"
              value={value.whoNotified}
              onChange={(e) => update({ whoNotified: e.target.value })}
              placeholder="e.g. Principal Jennifer Johnson"
              className="h-8 w-full rounded border border-gray-300 bg-white px-2.5 py-1 font-dm text-gray-700 text-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Method */}
          <div>
            <p className="mb-1 font-semibold text-gray-700 text-xs">
              Notification Method
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className="h-8 w-full justify-between gap-1.5 rounded border-gray-200 bg-white px-2.5 py-1 font-dm font-normal text-gray-700 text-xs hover:bg-gray-50 hover:text-gray-700"
                >
                  {value.method
                    ? (SCHOOL_METHOD_OPTIONS.find(
                        (o) => o.value === value.method,
                      )?.label ?? value.method)
                    : "Select method..."}
                  <ChevronDownIcon className="size-3.5 shrink-0 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-0 bg-white font-dm text-xs [&_[data-slot=dropdown-menu-radio-item]]:w-full [&_[data-slot=dropdown-menu-radio-item]]:py-2.5 [&_[data-slot=dropdown-menu-radio-item]]:pr-4 [&_[data-slot=dropdown-menu-radio-item]]:pl-9 [&_[data-slot=dropdown-menu-radio-item]]:text-xs [&_[data-slot=dropdown-menu-radio-item]]:hover:bg-secondary/80 [&_[data-slot=dropdown-menu-radio-item]]:focus:bg-secondary"
              >
                <DropdownMenuRadioGroup
                  value={value.method ?? ""}
                  onValueChange={(v) => update({ method: v || null })}
                >
                  <DropdownMenuRadioItem
                    value=""
                    className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                  >
                    Select method...
                  </DropdownMenuRadioItem>
                  {SCHOOL_METHOD_OPTIONS.map((opt) => (
                    <DropdownMenuRadioItem
                      key={opt.value}
                      value={opt.value}
                      className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                    >
                      {opt.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Time Notified */}
          <div>
            <p className="mb-1 font-semibold text-gray-700 text-xs">
              Time Notified
            </p>
            <TimeInputWithNow
              value={value.timeNotified}
              onChange={(v) => update({ timeNotified: v })}
              aria-label="Time notified"
            />
          </div>

          {/* Outcome */}
          <div>
            <p className="mb-1 font-semibold text-gray-700 text-xs">Outcome</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className="h-8 w-full justify-between gap-1.5 rounded border-gray-200 bg-white px-2.5 py-1 font-dm font-normal text-gray-700 text-xs hover:bg-gray-50 hover:text-gray-700"
                >
                  {value.outcome ?? "Select outcome..."}
                  <ChevronDownIcon className="size-3.5 shrink-0 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-0 bg-white font-dm text-xs [&_[data-slot=dropdown-menu-radio-item]]:w-full [&_[data-slot=dropdown-menu-radio-item]]:py-2.5 [&_[data-slot=dropdown-menu-radio-item]]:pr-4 [&_[data-slot=dropdown-menu-radio-item]]:pl-9 [&_[data-slot=dropdown-menu-radio-item]]:text-xs [&_[data-slot=dropdown-menu-radio-item]]:hover:bg-secondary/80 [&_[data-slot=dropdown-menu-radio-item]]:focus:bg-secondary"
              >
                <DropdownMenuRadioGroup
                  value={value.outcome ?? ""}
                  onValueChange={(v) => update({ outcome: v || null })}
                >
                  <DropdownMenuRadioItem
                    value=""
                    className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                  >
                    Select outcome...
                  </DropdownMenuRadioItem>
                  {SCHOOL_OUTCOME_OPTIONS.map((opt) => (
                    <DropdownMenuRadioItem
                      key={opt}
                      value={opt}
                      className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                    >
                      {opt}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Notes */}
          <div>
            <p className="mb-1 font-semibold text-gray-700 text-xs">Notes</p>
            <textarea
              value={value.notes}
              onChange={(e) => update({ notes: e.target.value })}
              placeholder="Notes about the notification..."
              className="w-full rounded-md border border-gray-300 p-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
            />
          </div>

          {/* Additional Details */}
          <div>
            <p className="mb-1 font-semibold text-gray-700 text-xs">
              Additional details about notification
            </p>
            <textarea
              value={value.additionalDetails}
              onChange={(e) => update({ additionalDetails: e.target.value })}
              placeholder="Any additional details..."
              className="w-full rounded-md border border-gray-300 p-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
 * Sub-section: Parent/Guardian Contacted
 * ───────────────────────────────────────────────────── */

function ParentGuardianSection({
  value,
  onChange,
  expanded,
  onToggle,
}: {
  value: DocParentGuardianSection;
  onChange: (v: DocParentGuardianSection) => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  function update(patch: Partial<DocParentGuardianSection>) {
    onChange({ ...value, ...patch });
  }

  const isContentVisible = expanded;

  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        value.completed ? "border-green-300 bg-green-50/30" : "border-gray-200",
      )}
    >
      <div className="flex items-center gap-2">
        {value.completed ? (
          <CheckCircle2 className="size-4 shrink-0 text-green-600" />
        ) : (
          <Users className="size-4 shrink-0 text-green-500" />
        )}
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-1.5 text-left"
        >
          <span className="font-semibold text-gray-900 text-sm">
            Parent/Guardian Contacted
          </span>
          {isContentVisible ? (
            <ChevronUp className="size-3.5 text-gray-400" />
          ) : (
            <ChevronDown className="size-3.5 text-gray-400" />
          )}
        </button>
        <label className="flex shrink-0 items-center gap-1.5">
          <Checkbox
            checked={value.completed}
            onCheckedChange={(checked) =>
              update({ completed: checked === true })
            }
          />
          <span className="text-[11px] text-gray-500">Completed</span>
        </label>
      </div>

      {isContentVisible && (
        <div className="mt-3 space-y-3 border-gray-100 border-t pt-3">
          {/* Guardian Name */}
          <div>
            <p className="mb-1 font-semibold text-gray-700 text-xs">
              Guardian Name
            </p>
            <input
              type="text"
              value={value.nameContact}
              onChange={(e) => update({ nameContact: e.target.value })}
              placeholder="e.g. Maria Rodriguez"
              className="h-8 w-full rounded border border-gray-300 bg-white px-2.5 py-1 font-dm text-gray-700 text-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Relationship */}
          <div>
            <p className="mb-1 font-semibold text-gray-700 text-xs">
              Relationship
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className="h-8 w-full justify-between gap-1.5 rounded border-gray-200 bg-white px-2.5 py-1 font-dm font-normal text-gray-700 text-xs hover:bg-gray-50 hover:text-gray-700"
                >
                  {value.relationship ?? "Select relationship..."}
                  <ChevronDownIcon className="size-3.5 shrink-0 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-0 bg-white font-dm text-xs [&_[data-slot=dropdown-menu-radio-item]]:w-full [&_[data-slot=dropdown-menu-radio-item]]:py-2.5 [&_[data-slot=dropdown-menu-radio-item]]:pr-4 [&_[data-slot=dropdown-menu-radio-item]]:pl-9 [&_[data-slot=dropdown-menu-radio-item]]:text-xs [&_[data-slot=dropdown-menu-radio-item]]:hover:bg-secondary/80 [&_[data-slot=dropdown-menu-radio-item]]:focus:bg-secondary"
              >
                <DropdownMenuRadioGroup
                  value={value.relationship ?? ""}
                  onValueChange={(v) => update({ relationship: v || null })}
                >
                  <DropdownMenuRadioItem
                    value=""
                    className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                  >
                    Select relationship...
                  </DropdownMenuRadioItem>
                  {PARENT_RELATIONSHIP_OPTIONS.map((opt) => (
                    <DropdownMenuRadioItem
                      key={opt}
                      value={opt}
                      className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                    >
                      {opt}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Contact Method */}
          <div>
            <p className="mb-1 font-semibold text-gray-700 text-xs">
              Contact Method
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className="h-8 w-full justify-between gap-1.5 rounded border-gray-200 bg-white px-2.5 py-1 font-dm font-normal text-gray-700 text-xs hover:bg-gray-50 hover:text-gray-700"
                >
                  {value.contactMethod
                    ? (PARENT_METHOD_OPTIONS.find(
                        (o) => o.value === value.contactMethod,
                      )?.label ?? value.contactMethod)
                    : "Select method..."}
                  <ChevronDownIcon className="size-3.5 shrink-0 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-0 bg-white font-dm text-xs [&_[data-slot=dropdown-menu-radio-item]]:w-full [&_[data-slot=dropdown-menu-radio-item]]:py-2.5 [&_[data-slot=dropdown-menu-radio-item]]:pr-4 [&_[data-slot=dropdown-menu-radio-item]]:pl-9 [&_[data-slot=dropdown-menu-radio-item]]:text-xs [&_[data-slot=dropdown-menu-radio-item]]:hover:bg-secondary/80 [&_[data-slot=dropdown-menu-radio-item]]:focus:bg-secondary"
              >
                <DropdownMenuRadioGroup
                  value={value.contactMethod ?? ""}
                  onValueChange={(v) => update({ contactMethod: v || null })}
                >
                  <DropdownMenuRadioItem
                    value=""
                    className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                  >
                    Select method...
                  </DropdownMenuRadioItem>
                  {PARENT_METHOD_OPTIONS.map((opt) => (
                    <DropdownMenuRadioItem
                      key={opt.value}
                      value={opt.value}
                      className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                    >
                      {opt.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Time Contacted */}
          <div>
            <p className="mb-1 font-semibold text-gray-700 text-xs">
              Time Contacted
            </p>
            <TimeInputWithNow
              value={value.timeContacted}
              onChange={(v) => update({ timeContacted: v })}
              aria-label="Time contacted"
            />
          </div>

          {/* Contact Outcome */}
          <div>
            <p className="mb-1 font-semibold text-gray-700 text-xs">
              Contact Outcome
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className="h-8 w-full justify-between gap-1.5 rounded border-gray-200 bg-white px-2.5 py-1 font-dm font-normal text-gray-700 text-xs hover:bg-gray-50 hover:text-gray-700"
                >
                  {value.result ?? "Select result..."}
                  <ChevronDownIcon className="size-3.5 shrink-0 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-0 bg-white font-dm text-xs [&_[data-slot=dropdown-menu-radio-item]]:w-full [&_[data-slot=dropdown-menu-radio-item]]:py-2.5 [&_[data-slot=dropdown-menu-radio-item]]:pr-4 [&_[data-slot=dropdown-menu-radio-item]]:pl-9 [&_[data-slot=dropdown-menu-radio-item]]:text-xs [&_[data-slot=dropdown-menu-radio-item]]:hover:bg-secondary/80 [&_[data-slot=dropdown-menu-radio-item]]:focus:bg-secondary"
              >
                <DropdownMenuRadioGroup
                  value={value.result ?? ""}
                  onValueChange={(v) => update({ result: v || null })}
                >
                  <DropdownMenuRadioItem
                    value=""
                    className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                  >
                    Select result...
                  </DropdownMenuRadioItem>
                  {PARENT_RESULT_OPTIONS.map((opt) => (
                    <DropdownMenuRadioItem
                      key={opt}
                      value={opt}
                      className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                    >
                      {opt}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Notes */}
          <div>
            <p className="mb-1 font-semibold text-gray-700 text-xs">Notes</p>
            <textarea
              value={value.notes}
              onChange={(e) => update({ notes: e.target.value })}
              placeholder="How did the parent/guardian respond? What actions are they taking?"
              className="w-full rounded-md border border-gray-300 p-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
 * Sub-section: CPS / Child Protective Services
 * ───────────────────────────────────────────────────── */

function CpsSection({
  value,
  onChange,
  expanded,
  onToggle,
}: {
  value: DocCpsSection;
  onChange: (v: DocCpsSection) => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  function update(patch: Partial<DocCpsSection>) {
    onChange({ ...value, ...patch });
  }

  const isContentVisible = expanded;

  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        value.completed ? "border-green-300 bg-green-50/30" : "border-gray-200",
      )}
    >
      <div className="flex items-center gap-2">
        {value.completed ? (
          <CheckCircle2 className="size-4 shrink-0 text-green-600" />
        ) : (
          <Landmark className="size-4 shrink-0 text-purple-500" />
        )}
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-1.5 text-left"
        >
          <span className="font-semibold text-gray-900 text-sm">
            CPS/Child Protective Services Notified
          </span>
          {isContentVisible ? (
            <ChevronUp className="size-3.5 text-gray-400" />
          ) : (
            <ChevronDown className="size-3.5 text-gray-400" />
          )}
        </button>
        <label className="flex shrink-0 items-center gap-1.5">
          <Checkbox
            checked={value.completed}
            onCheckedChange={(checked) =>
              update({ completed: checked === true })
            }
          />
          <span className="text-[11px] text-gray-500">Completed</span>
        </label>
      </div>

      {isContentVisible && (
        <div className="mt-3 space-y-3 border-gray-100 border-t pt-3">
          {/* Mandatory Reporter Warning */}
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
            <p className="text-[11px] text-amber-700">
              <strong>Mandatory Reporter:</strong> You are legally required to
              report suspected abuse or neglect
            </p>
          </div>

          {/* Date Reported */}
          <div>
            <p className="mb-1 font-semibold text-gray-700 text-xs">
              Date Reported
            </p>
            <input
              type="date"
              value={value.dateReported}
              onChange={(e) => update({ dateReported: e.target.value })}
              className="h-8 w-full rounded border border-gray-300 bg-white px-2.5 py-1 font-dm text-gray-700 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Time Reported */}
          <div>
            <p className="mb-1 font-semibold text-gray-700 text-xs">
              Time Reported
            </p>
            <TimeInputWithNow
              value={value.timeReported}
              onChange={(v) => update({ timeReported: v })}
              aria-label="Time reported"
            />
          </div>

          {/* Report/Case Number */}
          <div>
            <p className="mb-1 font-semibold text-gray-700 text-xs">
              Report/Case Number
            </p>
            <input
              type="text"
              value={value.reportCaseNumber}
              onChange={(e) => update({ reportCaseNumber: e.target.value })}
              placeholder="Enter report or case number..."
              className="h-8 w-full rounded border border-gray-300 bg-white px-2.5 py-1 font-dm text-gray-700 text-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Type of Abuse Reported */}
          <div>
            <p className="mb-1 font-semibold text-gray-700 text-xs">
              Type of Abuse Reported
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className="h-8 w-full justify-between gap-1.5 rounded border-gray-200 bg-white px-2.5 py-1 font-dm font-normal text-gray-700 text-xs hover:bg-gray-50 hover:text-gray-700"
                >
                  {value.typeOfConcern ?? "Select type..."}
                  <ChevronDownIcon className="size-3.5 shrink-0 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-0 bg-white font-dm text-xs [&_[data-slot=dropdown-menu-radio-item]]:w-full [&_[data-slot=dropdown-menu-radio-item]]:py-2.5 [&_[data-slot=dropdown-menu-radio-item]]:pr-4 [&_[data-slot=dropdown-menu-radio-item]]:pl-9 [&_[data-slot=dropdown-menu-radio-item]]:text-xs [&_[data-slot=dropdown-menu-radio-item]]:hover:bg-secondary/80 [&_[data-slot=dropdown-menu-radio-item]]:focus:bg-secondary"
              >
                <DropdownMenuRadioGroup
                  value={value.typeOfConcern ?? ""}
                  onValueChange={(v) => update({ typeOfConcern: v || null })}
                >
                  <DropdownMenuRadioItem
                    value=""
                    className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                  >
                    Select type...
                  </DropdownMenuRadioItem>
                  {CPS_TYPE_OPTIONS.map((opt) => (
                    <DropdownMenuRadioItem
                      key={opt}
                      value={opt}
                      className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                    >
                      {opt}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* CPS Actions */}
          <div>
            <p className="mb-1 font-semibold text-gray-700 text-xs">
              CPS Actions
            </p>
            <textarea
              value={value.nextSteps}
              onChange={(e) => update({ nextSteps: e.target.value })}
              placeholder="What did CPS say they would do?"
              className="w-full rounded-md border border-gray-300 p-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}
