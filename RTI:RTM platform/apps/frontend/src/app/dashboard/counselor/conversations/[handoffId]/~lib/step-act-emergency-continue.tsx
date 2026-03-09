"use client";

import { CheckCircle2, ThumbsUp, X as XIcon } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";
import type { ContinueConversationAction } from "./safety-workflow-types";

type Props = {
  actionNumber: number;
  value: ContinueConversationAction;
  onChange: (value: ContinueConversationAction) => void;
};

const DO_ITEMS = [
  "Stay calm and supportive - your demeanor influences the student",
  "Listen actively without judgment - validate their feelings",
  "Acknowledge their courage in speaking up about their struggles",
  "Use open-ended questions to understand their state of mind",
  "Maintain appropriate physical distance but stay present",
];

const DONT_ITEMS = [
  "Leave student alone - even for a moment",
  "Promise complete confidentiality - you must share safety concerns",
  "Minimize or dismiss their concerns - take all threats seriously",
  "Share details with unauthorized people - maintain privacy",
  "Argue or debate their feelings - accept their reality",
  "Act shocked or alarmed - maintain professional composure",
];

const STARTERS = [
  "\"I'm here with you and I'm not going anywhere.\"",
  '"Thank you for trusting me with this. That took courage."',
  '"Can you tell me more about what\'s been going on?"',
  '"How are you feeling right now in this moment?"',
  "\"It's okay if you need to sit quietly. I'm here.\"",
];

export function ActionContinueConversation({
  actionNumber,
  value,
  onChange,
}: Props) {
  const canComplete = value.conversationNotes.trim() !== "";

  function update(patch: Partial<ContinueConversationAction>) {
    onChange({ ...value, ...patch });
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
        <h4 className="flex-1 font-bold text-sm">
          Continue Conversation with Student
        </h4>
        <span className="rounded bg-red-100 px-1.5 py-0.5 font-semibold text-[10px] text-red-700">
          REQUIRED
        </span>
      </div>
      <p className="mt-1 ml-9 text-gray-500 text-xs">
        Maintain supportive presence and monitor student
      </p>

      {/* DO - Best Practices */}
      <div className="mt-3 ml-9 rounded-lg border border-green-200 bg-green-50 p-3">
        <div className="mb-2 flex items-center gap-2">
          <ThumbsUp className="size-4 text-green-600" />
          <p className="font-bold text-green-800 text-xs">
            DO - Best Practices
          </p>
        </div>
        <ul className="space-y-1">
          {DO_ITEMS.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-[11px] text-green-700"
            >
              <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-green-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* DON'T - Avoid */}
      <div className="mt-3 ml-9 rounded-lg border border-red-200 bg-red-50 p-3">
        <div className="mb-2 flex items-center gap-2">
          <XIcon className="size-4 text-red-600" />
          <p className="font-bold text-red-800 text-xs">
            DON'T - Avoid These Actions
          </p>
        </div>
        <ul className="space-y-1">
          {DONT_ITEMS.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-[11px] text-red-700"
            >
              <XIcon className="mt-0.5 size-3 shrink-0 text-red-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Helpful Conversation Starters */}
      <div className="mt-3 ml-9 rounded-lg border border-blue-200 bg-blue-50 p-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-blue-600 text-sm">&#128172;</span>
          <p className="font-bold text-blue-800 text-xs">
            Helpful Conversation Starters
          </p>
        </div>
        <ul className="space-y-1">
          {STARTERS.map((item) => (
            <li key={item} className="text-[11px] text-blue-700 italic">
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Conversation Notes */}
      <div className="mt-3 ml-9">
        <p className="mb-1 font-semibold text-gray-700 text-xs">
          Conversation Notes
        </p>
        <textarea
          value={value.conversationNotes}
          onChange={(e) => update({ conversationNotes: e.target.value })}
          placeholder="Document key points from your conversation with the student..."
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
