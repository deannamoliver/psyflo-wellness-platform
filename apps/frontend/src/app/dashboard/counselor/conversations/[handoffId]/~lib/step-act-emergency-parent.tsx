"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/lib/core-ui/checkbox";
import { cn } from "@/lib/tailwind-utils";
import type { NotifyParentAction } from "./safety-workflow-types";
import { TimeInputWithNow } from "./time-input-now";

type Props = {
  actionNumber: number;
  isDuringSchoolHours: boolean;
  value: NotifyParentAction;
  onChange: (value: NotifyParentAction) => void;
};

const CONTACT_RESULTS = [
  {
    val: "reached" as const,
    label: "Reached - Parent notified and aware",
    desc: "Parent answered and understands the situation",
  },
  {
    val: "left_message" as const,
    label: "Left message - Voicemail or text sent",
    desc: "Unable to speak directly; left detailed message",
  },
  {
    val: "no_answer" as const,
    label: "No answer - Unable to reach",
    desc: "No response via phone, text, or email",
  },
  {
    val: "na_school_handles" as const,
    label: "N/A - The clinic will handle parent notification",
    desc: "Clinic administration confirmed they will handle parent notification",
  },
];

const DURING_INFO = [
  "Patient name",
  "Your name and role",
  "Situation overview (Including any weapons or substances involved)",
  "Action taken so far (Emergency Services and clinic contacted)",
  "Patient's current location and status",
];

const AFTER_INFO = [
  "Patient name",
  "Your name and role",
  "Situation overview (Including any weapons or substances involved)",
  "Action taken so far (Emergency Services contacted)",
  "Patient's current location and status",
];

export function ActionNotifyParent({
  actionNumber,
  isDuringSchoolHours,
  value,
  onChange,
}: Props) {
  const infoOptions = isDuringSchoolHours ? DURING_INFO : AFTER_INFO;
  const canComplete =
    value.notificationMethod != null &&
    value.timeOfContact.trim() !== "" &&
    value.contactResult != null &&
    value.infoProvided.length > 0;

  function update(patch: Partial<NotifyParentAction>) {
    onChange({ ...value, ...patch });
  }

  function toggleInfo(item: string) {
    const arr = value.infoProvided.includes(item)
      ? value.infoProvided.filter((i) => i !== item)
      : [...value.infoProvided, item];
    update({ infoProvided: arr });
  }

  return (
    <div
      className={cn(
        "rounded-lg border-2 p-4",
        value.complete ? "border-green-400 bg-green-50/30" : "border-gray-200",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-red-600 font-bold text-white text-xs">
          {actionNumber}
        </span>
        <h4 className="flex-1 font-bold text-sm">Notify Parent/Guardian</h4>
        <span className="rounded bg-red-100 px-1.5 py-0.5 font-semibold text-[10px] text-red-700">
          REQUIRED
        </span>
      </div>
      <p className="mt-1 ml-9 text-gray-500 text-xs">
        Contact emergency contacts to inform of situation
      </p>

      {/* Important Exception */}
      <div className="mt-3 ml-9 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold text-amber-800 text-xs">
            Important Exception
          </p>
          <p className="text-[11px] text-amber-700">
            If a parent/guardian is suspected, consult administrator before
            contacting. Do not notify suspected parents.
          </p>
        </div>
      </div>

      {/* Notification Method */}
      <div className="mt-3 ml-9">
        <p className="mb-1.5 font-semibold text-gray-700 text-xs">
          Notification Method
        </p>
        <div className="flex gap-3">
          {(["phone", "email", "in_person"] as const).map((m) => (
            <label key={m} className="flex cursor-pointer items-center gap-1.5">
              <input
                type="radio"
                name={`parent-method-${actionNumber}`}
                checked={value.notificationMethod === m}
                onChange={() => update({ notificationMethod: m })}
                className="accent-blue-600"
              />
              <span className="text-gray-700 text-xs">
                {m === "phone"
                  ? "Phone"
                  : m === "email"
                    ? "Email"
                    : "In-Person"}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Time of Contact */}
      <div className="mt-3 ml-9">
        <p className="mb-1 font-semibold text-gray-700 text-xs">
          Time of Contact
        </p>
        <TimeInputWithNow
          value={value.timeOfContact}
          onChange={(v) => update({ timeOfContact: v })}
          aria-label="Time of contact"
        />
      </div>

      {/* Contact Result */}
      <div className="mt-3 ml-9 space-y-1.5">
        <p className="font-semibold text-gray-700 text-xs">Contact Result</p>
        {CONTACT_RESULTS.map((opt) => (
          <label
            key={opt.val}
            className={cn(
              "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2",
              value.contactResult === opt.val
                ? "border-blue-300 bg-blue-50"
                : "border-gray-200 hover:bg-gray-50",
            )}
          >
            <input
              type="radio"
              name={`parent-result-${actionNumber}`}
              checked={value.contactResult === opt.val}
              onChange={() => update({ contactResult: opt.val })}
              className="mt-0.5 accent-blue-600"
            />
            <div>
              <p className="font-medium text-gray-900 text-xs">{opt.label}</p>
              <p className="text-[11px] text-gray-500">{opt.desc}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Information provided */}
      <div className="mt-3 ml-9">
        <p className="mb-1.5 font-semibold text-gray-700 text-xs">
          Information provided to contact
        </p>
        <div className="space-y-1.5">
          {infoOptions.map((item) => (
            <label key={item} className="flex cursor-pointer items-start gap-2">
              <Checkbox
                checked={value.infoProvided.includes(item)}
                onCheckedChange={() => toggleInfo(item)}
                className="mt-0.5"
              />
              <span className="text-gray-700 text-xs">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Conversation Notes */}
      <div className="mt-3 ml-9">
        <p className="mb-1 font-semibold text-gray-700 text-xs">
          Conversation Notes
        </p>
        <textarea
          value={value.conversationNotes}
          onChange={(e) => update({ conversationNotes: e.target.value })}
          placeholder="Document parent's response, questions, and any commitments made..."
          className="w-full rounded-md border border-gray-300 p-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={2}
        />
      </div>

      {/* Mark Complete */}
      <div className="mt-3 ml-9">
        <button
          type="button"
          onClick={() => canComplete && update({ complete: !value.complete })}
          disabled={!value.complete && !canComplete}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-sm text-white transition-colors",
            value.complete
              ? "bg-green-500 hover:bg-green-600"
              : canComplete
                ? "bg-blue-600 hover:bg-blue-700"
                : "cursor-not-allowed bg-gray-300 text-gray-500",
          )}
        >
          {value.complete && <CheckCircle2 className="size-4" />}
          {value.complete
            ? `Action ${actionNumber} Completed`
            : `Mark Action ${actionNumber} Complete`}
        </button>
      </div>
    </div>
  );
}
