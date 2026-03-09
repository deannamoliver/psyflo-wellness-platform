"use client";

import { format } from "date-fns";
import {
  CheckCircle2,
  Clock,
  Heart,
  HelpCircle,
  Info,
  MessageCircle,
} from "lucide-react";

type Props = {
  studentName: string;
  schoolName: string;
  submittedAt: string;
};

const TIMELINE_STEPS = [
  {
    label: "Report Submitted",
    description: "has been notified",
    useSchool: true,
    sublabel: "Completed – just now",
    completed: true,
  },
  {
    label: "Clinical Review",
    description:
      "The clinical team will review your report and assess priority level.",
    completed: false,
  },
  {
    label: "Provider Notification",
    description: "You'll receive an update when provider acknowledges report",
    completed: false,
  },
  {
    label: "Intervention Planning",
    description: "Provider will coordinate appropriate support services",
    completed: false,
  },
  {
    label: "Case Resolution",
    description: "You'll be notified when the case is resolved or closed",
    sublabel: "Timeline varies",
    completed: false,
  },
];

const SUGGESTED_TOPICS = [
  "Check in on how the student is feeling right now",
  "Review the safety plan you created together",
  "Remind them of available resources and who they can talk to",
  "Confirm understanding of the follow-up plan",
  "Ask if there's anything else they want to share",
];

const REMEMBER_ITEMS = [
  "Stay calm and maintain a supportive presence",
  "You've done the right thing by reporting this concern",
  "Don't promise complete confidentiality about what was shared",
  "It's okay to sit in silence if the student needs time",
  "The counselor will reach out to coordinate next steps",
];

export function StepReturn({ studentName, schoolName, submittedAt }: Props) {
  const formattedDate = (() => {
    try {
      return format(new Date(submittedAt), "MMM d, yyyy - h:mm a");
    } catch {
      return submittedAt;
    }
  })();

  return (
    <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
      {/* Heading */}
      <h2 className="font-bold text-gray-900 text-lg">Report Submitted</h2>

      {/* Success card */}
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-green-600" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">
              Safety Report Submitted Successfully
            </p>
            <p className="mt-0.5 text-gray-600 text-sm">
              Your report has been sent and the appropriate staff will be
              notified.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-1.5 rounded-lg bg-white px-4 py-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Report sent to:</span>
            <span className="font-medium text-gray-900">{schoolName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Submitted at:</span>
            <span className="font-medium text-gray-900">{formattedDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Status:</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 font-semibold text-green-700 text-xs">
              <CheckCircle2 className="size-3" />
              SUBMITTED
            </span>
          </div>
        </div>
      </div>

      {/* What Happens Next */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-1 flex items-center gap-2">
          <Clock className="size-5 text-blue-600" />
          <h3 className="font-bold text-gray-900">What Happens Next?</h3>
        </div>
        <p className="mb-4 ml-7 text-gray-500 text-xs">
          Timeline and next steps for this safety report
        </p>

        {/* Timeline */}
        <div className="space-y-0">
          {TIMELINE_STEPS.map((step, i) => (
            <div key={step.label} className="flex gap-3">
              {/* Icon + line */}
              <div className="flex flex-col items-center">
                {step.completed ? (
                  <CheckCircle2 className="size-5 shrink-0 text-green-600" />
                ) : (
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 text-xs">
                    {i + 1}
                  </div>
                )}
                {i < TIMELINE_STEPS.length - 1 && (
                  <div className="my-1 w-px flex-1 bg-gray-200" />
                )}
              </div>
              {/* Content */}
              <div className="pb-4">
                <p className="font-semibold text-gray-900 text-sm">
                  {step.label}
                </p>
                <p className="text-gray-500 text-xs">
                  {step.useSchool
                    ? `${schoolName} ${step.description}`
                    : step.description}
                </p>
                {step.sublabel && (
                  <p
                    className={`mt-0.5 text-xs ${step.completed ? "text-green-600" : "text-gray-400"}`}
                  >
                    {step.sublabel}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="mt-2 flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2">
          <Info className="mt-0.5 size-3.5 shrink-0 text-blue-600" />
          <p className="text-blue-800 text-xs">
            <span className="font-medium">Note:</span> You can view report
            status and updates anytime in the Safety Reports section of your
            dashboard
          </p>
        </div>
      </div>

      {/* Return to Conversation */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-1 flex items-center gap-2">
          <MessageCircle className="size-5 text-blue-600" />
          <h3 className="font-bold text-gray-900">
            Return to Conversation with {studentName}
          </h3>
        </div>
        <p className="mb-4 ml-7 text-gray-500 text-xs">
          Continue supporting the student while the counselor reviews your
          report
        </p>

        {/* Suggested Topics */}
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-1.5">
            <HelpCircle className="size-4 text-blue-600" />
            <span className="font-semibold text-gray-900 text-sm">
              Suggested Topics to Discuss:
            </span>
          </div>
          <ul className="ml-4 space-y-1">
            {SUGGESTED_TOPICS.map((topic) => (
              <li
                key={topic}
                className="flex items-start gap-2 text-gray-600 text-xs"
              >
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-gray-400" />
                {topic}
              </li>
            ))}
          </ul>
        </div>

        {/* Remember */}
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <Heart className="size-3.5 fill-blue-600 text-blue-600" />
            <span className="font-semibold text-gray-900 text-sm">
              Remember:
            </span>
          </div>
          <ul className="ml-4 space-y-1">
            {REMEMBER_ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-gray-600 text-xs"
              >
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-gray-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
