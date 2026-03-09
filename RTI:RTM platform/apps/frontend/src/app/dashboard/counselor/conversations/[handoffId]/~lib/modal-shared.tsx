"use client";

import { AlertTriangle, Info } from "lucide-react";
import { Checkbox } from "@/lib/core-ui/checkbox";
import { cn } from "@/lib/tailwind-utils";
import type { ConversationDetail, TransferCoach } from "./types";

export function ReasonCheckbox({
  label,
  desc,
  checked,
  onChange,
  color = "blue",
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
  color?: "blue" | "green";
}) {
  const active =
    color === "green"
      ? "border-green-300 bg-green-50"
      : "border-blue-300 bg-blue-50";
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5",
        checked ? active : "border-gray-200 hover:bg-gray-50",
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        className="mt-0.5"
      />
      <div>
        <div className="font-medium text-gray-900 text-xs">{label}</div>
        <div className="text-gray-500 text-xs">{desc}</div>
      </div>
    </label>
  );
}

export function ReasonRadio({
  label,
  desc,
  selected,
  onSelect,
  color = "blue",
}: {
  label: string;
  desc: string;
  selected: boolean;
  onSelect: () => void;
  color?: "blue" | "green";
}) {
  const active =
    color === "green"
      ? "border-green-300 bg-green-50"
      : "border-blue-300 bg-blue-50";
  const dot =
    color === "green"
      ? "border-green-600 bg-green-600"
      : "border-blue-600 bg-blue-600";
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left",
        selected ? active : "border-gray-200 hover:bg-gray-50",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2",
          selected ? dot : "border-gray-300",
        )}
      >
        {selected && <div className="size-1.5 rounded-full bg-white" />}
      </div>
      <div>
        <div className="font-medium text-gray-900 text-xs">{label}</div>
        <div className="text-gray-500 text-xs">{desc}</div>
      </div>
    </button>
  );
}

export function StudentCardActive({
  conversation,
}: {
  conversation: ConversationDetail;
}) {
  const subtext = getStudentSubtext(conversation);
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 text-xs">
          {conversation.studentInitials}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm">
              {conversation.studentName}
            </span>
            {conversation.hasAlert && (
              <AlertTriangle className="size-4 text-red-500" />
            )}
          </div>
          {subtext && <p className="text-[11px] text-gray-500">{subtext}</p>}
        </div>
      </div>
      <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700 text-xs">
        {conversation.status === "waiting_on_student"
          ? "Waiting on Patient"
          : "Active"}
      </span>
    </div>
  );
}

export function InfoBox({
  title,
  items,
  variant = "blue",
  checkmarks = false,
}: {
  title: string;
  items: string[];
  variant?: "blue" | "green";
  checkmarks?: boolean;
}) {
  const border = variant === "green" ? "border-green-200" : "border-blue-200";
  const bg = variant === "green" ? "bg-green-50" : "bg-blue-50";
  const heading = variant === "green" ? "text-green-800" : "text-blue-800";
  const text = variant === "green" ? "text-green-700" : "text-blue-700";

  return (
    <div className={cn("rounded-lg border p-4", border, bg)}>
      <div
        className={cn(
          "mb-2 flex items-center gap-2 font-semibold text-[14px]",
          heading,
        )}
      >
        <Info className="size-4" /> {title}
      </div>
      <ul className={cn("space-y-0 text-[12px]", text)}>
        {items.map((p) => (
          <li key={p} className="flex items-start gap-2.5">
            {checkmarks ? (
              <svg
                className="mt-0.5 size-3 shrink-0"
                viewBox="0 0 11 8"
                fill="none"
              >
                <path
                  d="M10.2814 0.219727C10.5744 0.512695 10.5744 0.988477 10.2814 1.28145L4.28145 7.28145C3.98848 7.57441 3.5127 7.57441 3.21973 7.28145L0.219727 4.28145C-0.0732422 3.98848 -0.0732422 3.5127 0.219727 3.21973C0.512695 2.92676 0.988477 2.92676 1.28145 3.21973L3.75176 5.6877L9.22207 0.219727C9.51504 -0.0732422 9.99082 -0.0732422 10.2838 0.219727H10.2814"
                  fill="#2563EB"
                />
              </svg>
            ) : (
              <span className="shrink-0">-</span>
            )}
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WarningBox({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="mb-2 flex items-center gap-2 font-semibold text-amber-800 text-sm">
        <AlertTriangle className="size-4" /> {title}
      </div>
      <ul className="space-y-1 text-amber-700 text-sm">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

export function getStudentSubtext(c: ConversationDetail): string {
  const age = c.dateOfBirth
    ? Math.floor((Date.now() - new Date(c.dateOfBirth).getTime()) / MS_PER_YEAR)
    : null;
  return [
    age != null ? `Age ${age}` : null,
    c.gradeLabel !== "N/A" ? c.gradeLabel : null,
    c.school,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function CoachList({
  coaches,
  selected,
  onSelect,
}: {
  coaches: TransferCoach[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  if (coaches.length === 0) {
    return (
      <p className="rounded-lg border border-gray-200 px-4 py-6 text-center text-gray-500 text-sm">
        No other coaches available in your school.
      </p>
    );
  }
  return (
    <div className="max-h-[180px] space-y-1 overflow-y-auto rounded-lg border border-gray-200">
      {coaches.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelect(c.id)}
          className={cn(
            "flex w-full items-center gap-3 px-4 py-3 text-left",
            selected === c.id ? "bg-blue-50" : "hover:bg-gray-50",
          )}
        >
          <div
            className={cn(
              "flex size-4 items-center justify-center rounded-full border-2",
              selected === c.id
                ? "border-blue-600 bg-blue-600"
                : "border-gray-300",
            )}
          >
            {selected === c.id && (
              <div className="size-1.5 rounded-full bg-white" />
            )}
          </div>
          <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 text-xs">
            {c.initials}
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900 text-sm">{c.name}</div>
            <div className="text-gray-500 text-xs">
              {c.activeConversations} active conversations
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
