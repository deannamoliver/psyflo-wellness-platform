"use client";

import { Clock, Plus, Trash2, Users } from "lucide-react";
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

const MODALITIES = [
  "Individual Therapy",
  "Group Therapy",
  "Family Therapy",
  "Couples Therapy",
  "Telehealth",
  "In-Person",
];

const APPROACHES = [
  "CBT",
  "DBT",
  "EMDR",
  "Psychodynamic",
  "Mindfulness-Based",
  "Solution-Focused",
  "ACT",
  "Motivational Interviewing",
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

  function addLanguage() {
    const lang = prompt("Enter language:");
    if (lang?.trim()) {
      const current = formData.languagesSpoken || [];
      updateForm({ languagesSpoken: [...current, lang.trim()] });
    }
  }

  function removeLanguage(lang: string) {
    updateForm({
      languagesSpoken: (formData.languagesSpoken || []).filter((l) => l !== lang),
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

          {/* Languages Spoken */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="font-medium text-gray-700 text-sm">
                Languages Spoken
              </label>
              <button
                type="button"
                onClick={addLanguage}
                className="flex items-center gap-1 font-medium text-blue-600 text-xs hover:text-blue-700"
              >
                <Plus className="h-3 w-3" />
                Add Language
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.languagesSpoken || ["English"]).map((lang) => (
                <div
                  key={lang}
                  className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1"
                >
                  <span className="text-sm text-gray-700">{lang}</span>
                  {lang !== "English" && (
                    <button
                      type="button"
                      onClick={() => removeLanguage(lang)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Modalities */}
          <div>
            <label className="mb-2 block font-medium text-gray-700 text-sm">
              Treatment Modalities
            </label>
            <div className="flex flex-wrap gap-2">
              {MODALITIES.map((mod) => {
                const selected = (formData.modalities || []).includes(mod);
                return (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => toggleArrayItem("modalities", mod)}
                    className={cn(
                      "flex h-9 items-center justify-center rounded-md border px-3 font-medium text-sm transition-colors",
                      selected
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
                    )}
                  >
                    {mod}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Therapeutic Approaches */}
          <div>
            <label className="mb-2 block font-medium text-gray-700 text-sm">
              Therapeutic Approaches
            </label>
            <div className="flex flex-wrap gap-2">
              {APPROACHES.map((approach) => {
                const selected = (formData.approaches || []).includes(approach);
                return (
                  <button
                    key={approach}
                    type="button"
                    onClick={() => toggleArrayItem("approaches", approach)}
                    className={cn(
                      "flex h-9 items-center justify-center rounded-md border px-3 font-medium text-sm transition-colors",
                      selected
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
                    )}
                  >
                    {approach}
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
