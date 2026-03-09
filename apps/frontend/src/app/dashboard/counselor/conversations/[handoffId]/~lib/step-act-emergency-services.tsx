"use client";

import { CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/lib/core-ui/checkbox";
import { cn } from "@/lib/tailwind-utils";
import type { EmergencyServicesAction } from "./safety-workflow-types";
import { TimeInputWithNow } from "./time-input-now";

type Props = {
  actionNumber: number;
  value: EmergencyServicesAction;
  onChange: (value: EmergencyServicesAction) => void;
};

const INFO_OPTIONS = [
  "Patient name and age",
  "Nature of emergency (Suicide threat, self-harm, etc.)",
  "Clinic location",
  "Any weapons or substances involved",
  "Patient's current condition and behavior",
];

export function ActionEmergencyServices({
  actionNumber,
  value,
  onChange,
}: Props) {
  const canComplete =
    value.status != null &&
    value.timeCalled.trim() !== "" &&
    (value.status !== "called" || value.infoProvided.length > 0);

  function update(patch: Partial<EmergencyServicesAction>) {
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
        <h4 className="flex-1 font-bold text-sm">Call Emergency Services</h4>
        <span className="rounded bg-red-100 px-1.5 py-0.5 font-semibold text-[10px] text-red-700">
          REQUIRED
        </span>
      </div>
      <p className="mt-1 ml-9 text-gray-500 text-xs">
        Contact 911 if immediate medical attention required
      </p>

      {/* Status */}
      <div className="mt-3 ml-9 space-y-1.5">
        <p className="font-semibold text-gray-700 text-xs">Status:</p>
        <label
          className={cn(
            "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2",
            value.status === "called"
              ? "border-blue-300 bg-blue-50"
              : "border-gray-200 hover:bg-gray-50",
          )}
        >
          <input
            type="radio"
            name={`es-status-${actionNumber}`}
            checked={value.status === "called"}
            onChange={() => update({ status: "called" })}
            className="mt-0.5 accent-blue-600"
          />
          <div>
            <p className="font-medium text-gray-900 text-xs">
              Called - Emergency services contacted
            </p>
            <p className="text-[11px] text-gray-500">
              911 was called and help is on the way
            </p>
          </div>
        </label>
        <label
          className={cn(
            "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2",
            value.status === "not_needed"
              ? "border-blue-300 bg-blue-50"
              : "border-gray-200 hover:bg-gray-50",
          )}
        >
          <input
            type="radio"
            name={`es-status-${actionNumber}`}
            checked={value.status === "not_needed"}
            onChange={() => update({ status: "not_needed" })}
            className="mt-0.5 accent-blue-600"
          />
          <div>
            <p className="font-medium text-gray-900 text-xs">
              Not Needed - No immediate medical emergency
            </p>
            <p className="text-[11px] text-gray-500">
              Situation is stable; no immediate danger requiring 911
            </p>
          </div>
        </label>
      </div>

      {/* Time Called */}
      <div className="mt-3 ml-9">
        <p className="mb-1 font-semibold text-gray-700 text-xs">Time Called</p>
        <TimeInputWithNow
          value={value.timeCalled}
          onChange={(v) => update({ timeCalled: v })}
          aria-label="Time called"
        />
      </div>

      {/* Information provided */}
      <div className="mt-3 ml-9">
        <p className="mb-1.5 font-semibold text-gray-700 text-xs">
          Information provided to dispatcher
        </p>
        <div className="space-y-1.5">
          {INFO_OPTIONS.map((item) => (
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

      {/* Additional Notes */}
      <div className="mt-3 ml-9">
        <p className="mb-1 font-semibold text-gray-700 text-xs">
          Additional Notes
        </p>
        <textarea
          value={value.additionalNotes}
          onChange={(e) => update({ additionalNotes: e.target.value })}
          placeholder="Any additional details for emergency services..."
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
