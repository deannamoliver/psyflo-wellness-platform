"use client";

import { Clock, Users } from "lucide-react";
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
import { TIMEZONES } from "./types";

type Props = {
  formData: LocationFormData;
  updateForm: (updates: Partial<LocationFormData>) => void;
};

const triggerClass = "h-10 w-full border-gray-200 bg-white font-dm";
const contentClass =
  "bg-white font-dm [&_[data-slot=select-item]]:text-gray-900 [&_[data-slot=select-item]]:hover:bg-secondary/80 [&_[data-slot=select-item]]:focus:bg-secondary";

const AGE_RANGES = [
  "Children (0-12)",
  "Adolescents (13-17)",
  "Young Adults (18-25)",
  "Adults (26-64)",
  "Seniors (65+)",
  "All Ages",
];

const MENTAL_HEALTH_NEEDS = [
  "Anxiety",
  "Depression",
  "PTSD/Trauma",
  "ADHD",
  "Bipolar Disorder",
  "OCD",
  "Eating Disorders",
  "Substance Use",
  "Grief/Loss",
  "Relationship Issues",
];

export function Step1Academic({ formData, updateForm }: Props) {
  function toggleArrayItem(field: keyof LocationFormData, item: string) {
    const current = (formData[field] as string[]) || [];
    updateForm({
      [field]: current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item],
    });
  }

  return (
    <>
      {/* Patient Population Characteristics */}
      <FormSection
        icon={<Users className="h-5 w-5" />}
        title="Patient Population Characteristics"
        description="Define the patient demographics and needs this location serves"
      >
        <div className="flex flex-col gap-5">
          {/* Ages Served */}
          <div>
            <label className="mb-2 block font-medium text-gray-700 text-sm">
              Ages Served
            </label>
            <div className="flex flex-wrap gap-2">
              {AGE_RANGES.map((age) => {
                const selected = (formData.agesServed || []).includes(age);
                return (
                  <button
                    key={age}
                    type="button"
                    onClick={() => toggleArrayItem("agesServed", age)}
                    className={cn(
                      "flex h-9 items-center justify-center rounded-md border px-3 font-medium text-sm transition-colors",
                      selected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
                    )}
                  >
                    {age}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mental Health Needs */}
          <div>
            <label className="mb-2 block font-medium text-gray-700 text-sm">
              Mental Health Needs Addressed
            </label>
            <div className="flex flex-wrap gap-2">
              {MENTAL_HEALTH_NEEDS.map((need) => {
                const selected = (formData.mentalHealthNeeds || []).includes(need);
                return (
                  <button
                    key={need}
                    type="button"
                    onClick={() => toggleArrayItem("mentalHealthNeeds", need)}
                    className={cn(
                      "flex h-9 items-center justify-center rounded-md border px-3 font-medium text-sm transition-colors",
                      selected
                        ? "border-purple-600 bg-purple-600 text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
                    )}
                  >
                    {need}
                  </button>
                );
              })}
            </div>
          </div>

          
          <FormRow>
            <FormField
              label="Estimated Patient Count"
              hint="Approximate active patient caseload"
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
        title="Time Zone"
        description="Configure time zone for this location"
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
