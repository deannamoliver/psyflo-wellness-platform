"use client";

import { format, isToday, isYesterday } from "date-fns";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  MailIcon,
  MessageSquare,
  PhoneIcon,
  UserIcon,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/lib/core-ui/badge";
import { Card, CardContent, CardHeader } from "@/lib/core-ui/card";
import { cn } from "@/lib/tailwind-utils";
import { AlertTimelineActions } from "./alert-timeline-actions";
import type { AdminAlertDetail, ConversationData } from "./queries";
import { ViewConversationModal } from "./view-conversation-modal";

function formatRelativeTime(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

function riskBadgeConfig(status: string) {
  switch (status) {
    case "new":
      return { label: "EMERGENCY", bg: "bg-red-500", text: "text-white" };
    case "in_progress":
      return { label: "IN REVIEW", bg: "bg-amber-500", text: "text-white" };
    case "resolved":
      return { label: "RESOLVED", bg: "bg-green-500", text: "text-white" };
    default:
      return {
        label: status.toUpperCase(),
        bg: "bg-gray-500",
        text: "text-white",
      };
  }
}

function riskLevelBadge(level: string) {
  switch (level) {
    case "emergency":
      return { label: "EMERGENCY", bg: "bg-red-500", text: "text-white" };
    case "high":
      return { label: "HIGH RISK", bg: "bg-orange-500", text: "text-white" };
    case "moderate":
      return {
        label: "MODERATE",
        bg: "bg-yellow-400",
        text: "text-yellow-900",
      };
    case "low":
      return { label: "LOW", bg: "bg-blue-500", text: "text-white" };
    default:
      return {
        label: level.toUpperCase(),
        bg: "bg-gray-500",
        text: "text-white",
      };
  }
}

function statusPillConfig(status: string) {
  const config: Record<
    string,
    { label: string; bg: string; text: string; dot: string }
  > = {
    new: {
      label: "NEW",
      bg: "bg-red-100",
      text: "text-red-700",
      dot: "bg-red-600",
    },
    in_progress: {
      label: "IN REVIEW",
      bg: "bg-amber-100",
      text: "text-amber-700",
      dot: "bg-amber-600",
    },
    resolved: {
      label: "RESOLVED",
      bg: "bg-green-100",
      text: "text-green-700",
      dot: "bg-green-600",
    },
  };
  return (
    config[status] ?? {
      label: status.toUpperCase(),
      bg: "bg-gray-100",
      text: "text-gray-700",
      dot: "bg-gray-500",
    }
  );
}

function concernBadgeColor(type: string): string {
  switch (type) {
    case "harm_to_self":
    case "safety":
      return "bg-red-100 text-red-700";
    case "harm_to_others":
      return "bg-red-100 text-red-700";
    case "abuse_neglect":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function concernLabel(type: string): string {
  switch (type) {
    case "harm_to_self":
    case "safety":
      return "Self-Harm Risk";
    case "harm_to_others":
      return "Harm to Others";
    case "abuse_neglect":
      return "Abuse/Neglect";
    case "other_safety":
      return "Other Safety Concern";
    default:
      return type
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
  }
}

function alertTitle(source: string): string {
  if (source === "chat" || source === "coach") return "Therapist Escalation Report";
  return "Screener Alert";
}

// --- Risk Factors component (inline) ---
const cssrQuestions = [
  {
    question: "1. Wish to be Dead",
    description:
      "Have you wished you were dead or wished you could go to sleep and not wake up?",
  },
  {
    question: "2. Suicidal Thoughts",
    description: "Have you actually had any thoughts of killing yourself?",
  },
  {
    question: "3. Thoughts of Method",
    description: "Have you been thinking about how you might do this?",
  },
  {
    question: "4. Suicidal Intent",
    description:
      "Have you had these thoughts and had some intention of acting on them?",
  },
  {
    question: "5. Plan and Intent",
    description:
      "Have you started to work out or worked out the details of how to kill yourself? Do you intend to carry out this plan?",
  },
  {
    question: "6. Attempt",
    description:
      "Have you ever done anything, started to do anything, or prepared to do anything to end your life?",
  },
];

function RiskFactors({
  cssrState,
}: {
  cssrState: Record<string, boolean> | null;
}) {
  const items = cssrQuestions.map((q, idx) => ({
    ...q,
    answer: cssrState ? (cssrState[`q${idx + 1}`] ?? false) : false,
  }));

  return (
    <div className="border-gray-200 border-l bg-red-50/20 p-6">
      <div className="mb-4 pb-3">
        <h3 className="font-bold text-gray-900 text-sm">Risk Factors</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <div
            key={item.question}
            className="flex items-start justify-between gap-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 text-sm">
                {item.question}:
              </p>
              <p className="mt-0.5 text-gray-500 text-xs leading-relaxed">
                &quot;{item.description}&quot;
              </p>
            </div>
            <Badge
              className={cn(
                "shrink-0 rounded px-2 py-0.5 font-semibold text-xs",
                item.answer
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700",
              )}
            >
              {item.answer ? "Yes" : "No"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Resolution Report ---
const ACTION_LABELS: Record<string, string> = {
  contacted_student: "Contacted student directly",
  safety_assessment: "Conducted safety/risk assessment with student",
  created_safety_plan: "Created safety plan with student",
  connected_counselor: "Connected student with school counselor/social worker",
  contacted_parent: "Contacted parent/guardian",
  updated_safety_plan: "Created/updated safety plan",
  referred_external: "Referred to external provider",
  contacted_911: "Contacted emergency services (911)",
  notified_admin: "Notified school administrator",
  filed_mandatory_report: "Filed mandatory report (CPS, etc.)",
  other_action: "Other action",
};

const STUDENT_STATUS_LABELS: Record<string, string> = {
  crisis_resolved: "Crisis resolved - Student is stable",
  ongoing_support:
    "Ongoing support needed - Counselor will continue monitoring",
  transferred_external: "Transferred to external care",
  hospitalized: "Hospitalized",
  other: "Other",
};

const FOLLOW_UP_LABELS: Record<string, string> = {
  no_follow_up: "No follow-up needed - Case is fully resolved",
  routine_check_ins: "Routine wellness check-ins",
  scheduled_follow_up: "Scheduled follow-up",
  other: "Other",
};

function ResolutionReport({
  resolution,
}: {
  resolution: NonNullable<AdminAlertDetail["resolution"]>;
}) {
  const resolvedAt = resolution.createdAt;
  const completedActions = resolution.actionsTaken
    .map((a) => ACTION_LABELS[a] ?? a)
    .filter(Boolean);

  const studentStatusLabel =
    STUDENT_STATUS_LABELS[resolution.studentStatus] ?? resolution.studentStatus;
  const followUpLabel =
    FOLLOW_UP_LABELS[resolution.followUpPlan] ?? resolution.followUpPlan;

  return (
    <div className="border-gray-200 border-t bg-gray-100 px-6 py-6 font-dm">
      <div className="rounded-lg bg-white px-6 py-5 shadow-sm">
        <h4 className="font-bold text-base text-gray-900">Resolution Report</h4>
        <p className="mt-1 text-gray-500 text-sm">
          {formatRelativeTime(resolvedAt)} &bull; {format(resolvedAt, "h:mm a")}{" "}
          &bull; Submitted by {resolution.counselorName}, School Counselor
        </p>
        <div className="mt-4 border-gray-200 border-b" />

        <div className="mt-4 grid grid-cols-2 gap-10">
          <div>
            <h4 className="mb-2 font-bold text-gray-900 text-sm">
              Resolution Summary
            </h4>
            <div className="rounded-lg bg-gray-50 p-4 text-gray-700 text-sm leading-relaxed">
              {resolution.resolutionSummary}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h5 className="mb-2 font-bold text-gray-900 text-sm">
                Actions Taken
              </h5>
              <div className="space-y-2">
                {completedActions.length > 0 ? (
                  completedActions.map((label) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 text-sm"
                    >
                      <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                      <span className="text-gray-900">{label}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">
                    No actions were recorded.
                  </p>
                )}
              </div>
            </div>
            <div>
              <h5 className="mb-2 font-bold text-gray-900 text-sm">
                Student Status
              </h5>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                <span className="text-gray-900">{studentStatusLabel}</span>
              </div>
            </div>
            <div>
              <h5 className="mb-2 font-bold text-gray-900 text-sm">
                Follow-Up Plan
              </h5>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                <span className="text-gray-900">{followUpLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
type AlertDetailClientProps = {
  alert: AdminAlertDetail;
  conversation: ConversationData | null;
};

function StudentHeader({ alert }: { alert: AdminAlertDetail }) {
  const badge = riskBadgeConfig(alert.status);
  const age = alert.dateOfBirth
    ? Math.floor(
        (Date.now() - new Date(alert.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000),
      )
    : null;
  const dob = alert.dateOfBirth
    ? format(new Date(alert.dateOfBirth), "MMMM d, yyyy")
    : null;

  return (
    <Card className="bg-white">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-2xl text-gray-900">
              {alert.studentName}
            </h1>
            <Badge className="rounded-md bg-gray-100 px-3 py-1 font-medium text-gray-700 text-xs">
              Grade {alert.grade ?? "-"}
            </Badge>
            <Badge
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1 font-bold text-xs",
                badge.bg,
                badge.text,
              )}
            >
              {alert.status === "new" && <span>&#9650;</span>}
              {badge.label}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-gray-500 text-xs">DOB/Age</p>
            <p className="mt-0.5 font-medium text-gray-900 text-sm">
              {dob ? `${dob} (${age} years old)` : "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Email</p>
            <p className="mt-0.5 font-medium text-gray-900 text-sm">
              {alert.email ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Grade</p>
            <p className="mt-0.5 font-medium text-gray-900 text-sm">
              {alert.grade ? `${alert.grade}th Grade` : "-"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-4">
            <p className="text-gray-500 text-xs">HOME ADDRESS</p>
            <p className="mt-0.5 font-medium text-gray-900 text-sm">
              {alert.homeAddress ?? "-"}
            </p>
          </div>
        </div>
      </CardHeader>

      {alert.emergencyContacts.length > 0 && (
        <CardContent className="border-gray-200 border-t pt-4">
          <p className="mb-3 font-semibold text-gray-900 text-sm">
            Home Emergency Contacts
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-gutter:stable]">
            {alert.emergencyContacts.map((contact, idx) => {
              const tagColor =
                contact.tag === "Primary Emergency Contact"
                  ? "bg-green-100 text-green-700"
                  : "bg-primary/10 text-primary";
              return (
                <div
                  key={`${contact.name}-${contact.relation}-${idx}`}
                  className="shrink-0"
                >
                  <div className="flex flex-col rounded-lg border border-gray-200 p-4 font-dm [&>*+*]:mt-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">
                        {contact.name}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge className="rounded-full bg-orange-100 font-dm font-medium text-orange-700 text-xs">
                        Home
                      </Badge>
                      {contact.tag && (
                        <Badge
                          className={cn(
                            "rounded-full font-dm font-medium text-xs",
                            tagColor,
                          )}
                        >
                          {contact.tag}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {contact.relation}
                    </p>
                    <div className="flex flex-col gap-1 text-gray-600 text-xs">
                      {contact.phone && (
                        <span className="flex items-center gap-1.5">
                          <PhoneIcon className="h-3 w-3" /> {contact.phone}
                        </span>
                      )}
                      {contact.email && (
                        <span className="flex items-center gap-1.5">
                          <MailIcon className="h-3 w-3" /> {contact.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function AlertTimeline({
  alert,
  conversation,
}: {
  alert: AdminAlertDetail;
  conversation: ConversationData | null;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showConversation, setShowConversation] = useState(false);

  const title = alertTitle(alert.source);
  const rlBadge = riskLevelBadge(alert.riskLevel);
  const statusPill = statusPillConfig(alert.status);
  const relativeTime = formatRelativeTime(alert.createdAt);
  const formattedTime = format(alert.createdAt, "h:mm a");
  const ChevronIcon = expanded ? ChevronUpIcon : ChevronDownIcon;

  const isCoachSource = alert.source === "chat" || alert.source === "coach";
  const AlertIcon = isCoachSource ? UserIcon : AlertTriangleIcon;
  const iconBg = isCoachSource ? "bg-red-100" : "bg-orange-100";
  const iconColor = isCoachSource ? "text-red-600" : "text-orange-600";

  const category = alert.coachReport?.category ?? alert.type;

  return (
    <div className="space-y-6">
      <h2 className="font-bold text-gray-900 text-xl">Alert Timeline</h2>
      <div className="flex gap-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            iconBg,
          )}
        >
          <AlertIcon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {/* Header */}
          <div className="px-6 py-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-gray-900">{title}</h3>
                  <Badge
                    className={cn(
                      "rounded-sm px-2 py-0.5 font-bold text-xs uppercase",
                      rlBadge.bg,
                      rlBadge.text,
                    )}
                  >
                    {rlBadge.label}
                  </Badge>
                </div>
                <p className="mt-1 text-gray-500 text-sm">
                  {relativeTime} &bull; {formattedTime}
                  {alert.coachName && ` \u2022 Submitted by ${alert.coachName}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold text-xs",
                    statusPill.bg,
                    statusPill.text,
                  )}
                >
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      statusPill.dot,
                    )}
                  />
                  {statusPill.label}
                </span>
                <button
                  type="button"
                  onClick={() => setExpanded((e) => !e)}
                  className="rounded p-0.5 text-gray-500 hover:bg-gray-100"
                >
                  <ChevronIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Expandable content */}
          {expanded && (
            <>
              {/* Coach report details */}
              {alert.coachReport && (
                <div className="grid grid-cols-1 gap-0 border-gray-200 border-t lg:grid-cols-5">
                  <div className="space-y-5 p-6 lg:col-span-2">
                    {/* Concern Category */}
                    <div>
                      <p className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                        Concern Category
                      </p>
                      <span
                        className={cn(
                          "inline-block rounded-full px-3 py-1 font-medium text-xs",
                          concernBadgeColor(category),
                        )}
                      >
                        {concernLabel(category)}
                      </span>
                    </div>

                    {/* Student Disclosure */}
                    {alert.coachReport.studentDisclosure && (
                      <div>
                        <h4 className="mb-2 font-bold text-gray-900 text-sm">
                          Student Disclosure
                        </h4>
                        <div className="rounded-lg bg-gray-50 p-4 text-gray-700 text-sm italic leading-relaxed">
                          &quot;{alert.coachReport.studentDisclosure}&quot;
                        </div>
                      </div>
                    )}

                    {/* Situation Summary */}
                    {alert.coachReport.situationSummary && (
                      <div>
                        <h4 className="mb-2 font-bold text-gray-900 text-sm">
                          Situation Summary
                        </h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {alert.coachReport.situationSummary}
                        </p>
                      </div>
                    )}

                    {/* View Conversation button */}
                    {conversation && (
                      <button
                        type="button"
                        onClick={() => setShowConversation(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 font-medium text-blue-700 text-sm transition-colors hover:bg-blue-100"
                      >
                        <MessageSquare className="size-4" />
                        View Conversation
                      </button>
                    )}
                  </div>

                  {/* Right column: Risk Factors */}
                  <div className="lg:col-span-3">
                    <RiskFactors
                      cssrState={alert.coachReport.screeningResponses}
                    />
                  </div>
                </div>
              )}

              {/* Resolution report */}
              {alert.resolution && (
                <ResolutionReport resolution={alert.resolution} />
              )}
            </>
          )}

          {/* Action footer */}
          <AlertTimelineActions
            alertId={alert.alertId}
            status={alert.status}
            student={{ name: alert.studentName, grade: alert.grade }}
            hasConversation={!!conversation}
            onViewConversation={() => setShowConversation(true)}
          />
        </div>
      </div>

      {/* Conversation modal */}
      {conversation && (
        <ViewConversationModal
          open={showConversation}
          onClose={() => setShowConversation(false)}
          conversation={conversation}
        />
      )}
    </div>
  );
}

export function AlertDetailClient({
  alert,
  conversation,
}: AlertDetailClientProps) {
  return (
    <div className="space-y-6">
      <StudentHeader alert={alert} />
      <AlertTimeline alert={alert} conversation={conversation} />
    </div>
  );
}
