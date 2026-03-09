"use client";

import { Clock, GraduationCap } from "lucide-react";
import { Input } from "@/lib/core-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import { cn } from "@/lib/tailwind-utils";
import { FormField, FormRow, FormSection } from "./form-section";
import type { LocationFormData } from "./types";
import { GRADE_LEVELS, TIMEZONES } from "./types";

type Props = {
  formData: LocationFormData;
  updateForm: (updates: Partial<LocationFormData>) => void;
};

const triggerClass = "h-10 w-full border-gray-200 bg-white font-dm";
const contentClass =
  "bg-white font-dm [&_[data-slot=select-item]]:text-gray-900 [&_[data-slot=select-item]]:hover:bg-secondary/80 [&_[data-slot=select-item]]:focus:bg-secondary";

export function Step1Academic({ formData, updateForm }: Props) {
  const allSelected = GRADE_LEVELS.every((g) =>
    formData.gradeLevels.includes(g),
  );

  function toggleGrade(grade: string) {
    const current = formData.gradeLevels;
    updateForm({
      gradeLevels: current.includes(grade)
        ? current.filter((g) => g !== grade)
        : [...current, grade],
    });
  }

  return (
    <>
      {/* Academic Information */}
      <FormSection
        icon={<GraduationCap className="h-5 w-5" />}
        title="Academic Information"
        description="Grade levels and academic configuration"
      >
        <div className="flex flex-col gap-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="font-medium text-gray-700 text-sm">
                Grade Levels / Age Range
                <span className="text-red-500"> *</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  updateForm({
                    gradeLevels: allSelected ? [] : [...GRADE_LEVELS],
                  })
                }
                className="font-medium text-blue-600 text-xs hover:text-blue-700"
              >
                {allSelected ? "Clear All" : "Select All"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {GRADE_LEVELS.map((grade) => {
                const selected = formData.gradeLevels.includes(grade);
                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => toggleGrade(grade)}
                    className={cn(
                      "flex h-9 min-w-[40px] items-center justify-center rounded-md border px-3 font-medium text-sm transition-colors",
                      selected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
                    )}
                  >
                    {grade}
                  </button>
                );
              })}
            </div>
          </div>

          <FormRow>
            <FormField
              label="Estimated Student Count"
              hint="Approximate total enrollment"
            >
              <Input
                type="number"
                value={formData.estimatedStudentCount}
                onChange={(e) =>
                  updateForm({ estimatedStudentCount: e.target.value })
                }
                className="h-10 border-gray-200 font-dm"
                placeholder="0"
              />
            </FormField>
          </FormRow>
        </div>
      </FormSection>

      {/* Time Zone */}
      <FormSection
        icon={<Clock className="h-5 w-5" />}
        title="Time Zone & Schedule"
        description="Configure time zone and operational hours"
      >
        <FormField
          label="Time Zone"
          required
          hint="Used for scheduling and alerts"
        >
          <Select
            value={formData.timezone}
            onValueChange={(v) => updateForm({ timezone: v })}
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder="Select time zone" />
            </SelectTrigger>
            <SelectContent className={contentClass}>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </FormSection>
    </>
  );
}
