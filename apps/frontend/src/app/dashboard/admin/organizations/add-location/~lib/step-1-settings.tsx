"use client";

import { cn } from "@/lib/tailwind-utils";
import { FormField, FormRow } from "./form-section";
import { TimePicker } from "./time-picker";
import type { LocationFormData } from "./types";
import { ALL_SCHOOL_DAYS } from "./types";

type Props = {
  formData: LocationFormData;
  updateForm: (updates: Partial<LocationFormData>) => void;
};

export function Step1Settings({ formData, updateForm }: Props) {
  function toggleDay(day: string) {
    const current = formData.schoolDays;
    updateForm({
      schoolDays: current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day],
    });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-1 font-semibold text-gray-900 text-lg">
        Location Hours
      </h3>
      <p className="mb-6 text-gray-500 text-sm">
        Configure operating hours for this location
      </p>

      {/* Location Hours */}
      <div>
        <h4 className="mb-3 font-semibold text-gray-900 text-sm">
          Operating Hours
        </h4>
        <FormRow>
          <FormField label="Start Time">
            <TimePicker
              value={formData.schoolHoursStart}
              onChange={(v) => updateForm({ schoolHoursStart: v })}
              label="Start time"
            />
          </FormField>
          <FormField label="End Time">
            <TimePicker
              value={formData.schoolHoursEnd}
              onChange={(v) => updateForm({ schoolHoursEnd: v })}
              label="End time"
            />
          </FormField>
        </FormRow>
        <div className="mt-3">
          <label className="mb-2 block font-medium text-gray-700 text-sm">
            Operating Days
          </label>
          <div className="flex gap-2">
            {ALL_SCHOOL_DAYS.map((day) => {
              const selected = formData.schoolDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md border font-medium text-sm transition-colors",
                    selected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
