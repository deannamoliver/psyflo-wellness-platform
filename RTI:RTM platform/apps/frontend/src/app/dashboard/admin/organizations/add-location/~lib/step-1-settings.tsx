"use client";

import { Calendar, Plus, Trash2 } from "lucide-react";
import { Input } from "@/lib/core-ui/input";
import { cn } from "@/lib/tailwind-utils";
import { FormField, FormRow } from "./form-section";
import { TimePicker } from "./time-picker";
import type { BlackoutDay, LocationFormData } from "./types";
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

  function addBlackout() {
    updateForm({
      blackoutDays: [
        ...formData.blackoutDays,
        { startDate: "", endDate: "", name: "" },
      ],
    });
  }

  function updateBlackout(index: number, updates: Partial<BlackoutDay>) {
    const next = [...formData.blackoutDays];
    next[index] = { ...next[index], ...updates } as BlackoutDay;
    updateForm({ blackoutDays: next });
  }

  function removeBlackout(index: number) {
    updateForm({
      blackoutDays: formData.blackoutDays.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-1 font-semibold text-gray-900 text-lg">
        Location-Specific Settings
      </h3>
      <p className="mb-6 text-gray-500 text-sm">
        These settings are always configured per location
      </p>

      {/* School Hours */}
      <div className="mb-6">
        <h4 className="mb-3 font-semibold text-gray-900 text-sm">
          School Hours
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
            School Days
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

      {/* Academic Calendar */}
      <div className="mb-6">
        <h4 className="mb-3 font-semibold text-gray-900 text-sm">
          Academic Calendar
        </h4>
        <FormRow>
          <FormField label="Academic Year Start Date">
            <Input
              type="date"
              value={formData.academicYearStart}
              onChange={(e) =>
                updateForm({ academicYearStart: e.target.value })
              }
              className="h-10 border-gray-200 font-dm"
            />
          </FormField>
          <FormField label="Academic Year End Date">
            <Input
              type="date"
              value={formData.academicYearEnd}
              onChange={(e) => updateForm({ academicYearEnd: e.target.value })}
              className="h-10 border-gray-200 font-dm"
            />
          </FormField>
        </FormRow>
      </div>

      {/* Blackout Days */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">
              Blackout Days (Holidays & Closures)
            </h4>
            <p className="text-gray-500 text-xs">
              Platform chat features will be unavailable on these dates
            </p>
          </div>
          <button
            type="button"
            onClick={addBlackout}
            className="flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 font-medium text-blue-600 text-sm hover:bg-blue-100"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Day
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {formData.blackoutDays.map((bd, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: form items keyed by index
              key={`blackout-${i}`}
              className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3"
            >
              <Calendar className="h-4 w-4 shrink-0 text-red-400" />
              <div className="grid flex-1 grid-cols-3 gap-3">
                <div>
                  <p className="mb-1 text-gray-500 text-xs">Start Date</p>
                  <Input
                    type="date"
                    value={bd.startDate}
                    onChange={(e) =>
                      updateBlackout(i, { startDate: e.target.value })
                    }
                    className="h-9 border-gray-200 font-dm text-sm"
                  />
                </div>
                <div>
                  <p className="mb-1 text-gray-500 text-xs">End Date</p>
                  <Input
                    type="date"
                    value={bd.endDate}
                    onChange={(e) =>
                      updateBlackout(i, { endDate: e.target.value })
                    }
                    className="h-9 border-gray-200 font-dm text-sm"
                  />
                </div>
                <Input
                  value={bd.name}
                  onChange={(e) => updateBlackout(i, { name: e.target.value })}
                  className="mt-auto h-9 border-gray-200 font-dm text-sm"
                  placeholder="Holiday name"
                />
              </div>
              <button
                type="button"
                onClick={() => removeBlackout(i)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
