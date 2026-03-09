"use client";

import { CheckCircle2, ChevronDownIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/lib/core-ui/avatar";
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
  EmergencyContactInfo,
  NotifySchoolAction,
} from "./safety-workflow-types";
import { TimeInputWithNow } from "./time-input-now";

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getTagLabel(tag: string | null): string | null {
  if (!tag) return null;
  switch (tag) {
    case "primary":
      return "Primary";
    case "backup_1":
      return "Back Up #1";
    case "backup_2":
      return "Back Up #2";
    default:
      return tag;
  }
}

type Props = {
  actionNumber: number;
  isDuringSchoolHours: boolean;
  contacts: EmergencyContactInfo[];
  value: NotifySchoolAction;
  onChange: (value: NotifySchoolAction) => void;
};

const DURING_INFO = [
  "Patient name",
  "Nature of emergency (Suicide threat, self-harm, etc.)",
  "Situation overview (Including any weapons or substances involved)",
  "Action taken so far (Emergency Services contacted)",
];

const AFTER_INFO = [
  "Nature of emergency (Suicide threat, self-harm, etc.)",
  "Situation overview (Including any weapons or substances involved)",
  "Action taken so far (Emergency Services and parent contacted)",
  "Immediate need: awareness + immediate follow-up",
];

export function ActionNotifySchool({
  actionNumber,
  isDuringSchoolHours,
  contacts,
  value,
  onChange,
}: Props) {
  const schoolContacts = contacts.filter((c) => c.contactType === "school");
  const infoOptions = isDuringSchoolHours ? DURING_INFO : AFTER_INFO;
  const canComplete =
    value.selectedContact.trim() !== "" &&
    value.notificationMethod != null &&
    value.timeNotified.trim() !== "" &&
    (isDuringSchoolHours
      ? value.parentNotificationProtocol != null
      : value.contactResult != null) &&
    value.infoProvided.length > 0;

  function update(patch: Partial<NotifySchoolAction>) {
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
        <h4 className="flex-1 font-bold text-sm">Notify School</h4>
        <span className="rounded bg-red-100 px-1.5 py-0.5 font-semibold text-[10px] text-red-700">
          REQUIRED
        </span>
      </div>
      <p className="mt-1 ml-9 text-gray-500 text-xs">
        Alert designated school emergency contact immediately
      </p>

      {/* Select Contact */}
      <div className="mt-3 ml-9">
        <p className="mb-1 font-semibold text-gray-700 text-xs">
          Select Contact
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              type="button"
              className="h-8 w-full justify-between gap-1.5 rounded border-gray-200 bg-white px-2.5 py-1 font-dm font-normal text-gray-700 text-xs hover:bg-gray-50 hover:text-gray-700"
            >
              {value.selectedContact
                ? (schoolContacts.find((c) => c.id === value.selectedContact)
                    ?.name ?? "Select")
                : "Select"}
              <ChevronDownIcon className="size-3.5 shrink-0 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-0 bg-white font-dm [&_[data-slot=dropdown-menu-radio-item]]:w-full [&_[data-slot=dropdown-menu-radio-item]]:py-2.5 [&_[data-slot=dropdown-menu-radio-item]]:pr-4 [&_[data-slot=dropdown-menu-radio-item]]:pl-9 [&_[data-slot=dropdown-menu-radio-item]]:hover:bg-secondary/80 [&_[data-slot=dropdown-menu-radio-item]]:focus:bg-secondary"
          >
            <DropdownMenuRadioGroup
              value={value.selectedContact}
              onValueChange={(id) => update({ selectedContact: id })}
            >
              {schoolContacts.map((c) => (
                <DropdownMenuRadioItem
                  key={c.id}
                  value={c.id}
                  className="w-full text-gray-900 hover:text-gray-900 focus:text-gray-900"
                >
                  <div className="flex w-full flex-1 items-start gap-3">
                    <Avatar className="size-8 shrink-0">
                      <AvatarFallback className="bg-blue-100 font-semibold text-blue-700 text-xs">
                        {getInitials(c.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 text-xs">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {c.relation}
                      </div>
                      {getTagLabel(c.tag) && (
                        <span
                          className={cn(
                            "mt-0.5 inline-block rounded-full px-1.5 py-0.5 font-medium text-[10px]",
                            c.tag === "primary"
                              ? "bg-green-100 text-green-700"
                              : "bg-primary/10 text-primary",
                          )}
                        >
                          {getTagLabel(c.tag)}
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
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
                name={`school-method-${actionNumber}`}
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

      {/* Time Notified */}
      <div className="mt-3 ml-9">
        <p className="mb-1 font-semibold text-gray-700 text-xs">
          Time Notified
        </p>
        <TimeInputWithNow
          value={value.timeNotified}
          onChange={(v) => update({ timeNotified: v })}
          aria-label="Time notified"
        />
      </div>

      {/* Contact Result — after hours only */}
      {!isDuringSchoolHours && (
        <div className="mt-3 ml-9 space-y-1.5">
          <p className="font-semibold text-gray-700 text-xs">Contact Result</p>
          {[
            {
              val: "reached" as const,
              label: "Reached - Clinic notified and aware",
              desc: "Clinic contact answered and understands the situation",
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
          ].map((opt) => (
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
                name={`school-result-${actionNumber}`}
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
      )}

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

      {/* Parent Notification Protocol — during hours only: above Brief Summary, below Information provided */}
      {isDuringSchoolHours && (
        <div className="mt-3 ml-9 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="mb-2 font-semibold text-gray-700 text-xs">
            Confirm School Protocol for Parent Notification:
          </p>
          <p className="mb-2 text-[11px] text-gray-600">
            School policy may require they contact parents first in mental
            health crises.
          </p>
          <div className="space-y-1.5">
            {[
              {
                val: "school_will_notify" as const,
                label: "Clinic will notify parent",
              },
              { val: "i_will_notify" as const, label: "I will notify parent" },
            ].map((opt) => (
              <label
                key={opt.val}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2",
                  value.parentNotificationProtocol === opt.val
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50",
                )}
              >
                <input
                  type="radio"
                  name={`school-parent-protocol-${actionNumber}`}
                  checked={value.parentNotificationProtocol === opt.val}
                  onChange={() =>
                    update({ parentNotificationProtocol: opt.val })
                  }
                  className="mt-0.5 accent-blue-600"
                />
                <span className="font-medium text-gray-900 text-xs">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Brief Summary */}
      <div className="mt-3 ml-9">
        <p className="mb-1 font-semibold text-gray-700 text-xs">
          Brief Summary
        </p>
        <textarea
          value={value.briefSummary}
          onChange={(e) => update({ briefSummary: e.target.value })}
          placeholder="Provide a brief summary of the situation for the administrator..."
          className="w-full rounded-md border border-gray-300 p-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={2}
        />
      </div>

      {/* Administrator Response */}
      <div className="mt-3 ml-9">
        <p className="mb-1 font-semibold text-gray-700 text-xs">
          Administrator Response
        </p>
        <textarea
          value={value.adminResponse}
          onChange={(e) => update({ adminResponse: e.target.value })}
          placeholder="Note any immediate instructions or guidance from administrator..."
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
