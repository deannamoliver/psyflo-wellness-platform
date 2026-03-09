"use client";

import { Bot, ClipboardCheck } from "lucide-react";
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

type Props = {
  formData: LocationFormData;
  updateForm: (updates: Partial<LocationFormData>) => void;
};

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors",
        checked ? "bg-blue-600" : "bg-gray-300",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function RadioOption({
  selected,
  onSelect,
  title,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
        selected
          ? "border-blue-600 bg-blue-50/50"
          : "border-gray-200 bg-white hover:bg-gray-50",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-blue-600" : "border-gray-300",
        )}
      >
        {selected && <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
      </div>
      <div>
        <p className="font-medium text-gray-900 text-sm">{title}</p>
        <p className="text-gray-500 text-xs">{description}</p>
      </div>
    </button>
  );
}

export function Step4Platform({ formData, updateForm }: Props) {
  return (
    <>
      {/* AI Chatbot Availability */}
      <FormSection
        icon={<Bot className="h-5 w-5" />}
        title="AI Chatbot Availability"
        description="Configure when students can access the AI-powered support chatbot"
      >
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                Enable AI Chatbot
              </p>
              <p className="text-gray-500 text-xs">
                Activate chatbot and crisis detection
              </p>
            </div>
            <Toggle
              checked={formData.chatbotEnabled}
              onChange={(v) => updateForm({ chatbotEnabled: v })}
            />
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-gray-900 text-sm">
              Availability Schedule
            </h4>
            <div className="flex flex-col gap-3">
              <RadioOption
                selected={formData.chatbotScheduleType === "24_7"}
                onSelect={() => updateForm({ chatbotScheduleType: "24_7" })}
                title="24/7 Access"
                description="Patients can access the chatbot anytime"
              />
              <RadioOption
                selected={formData.chatbotScheduleType === "school_hours_only"}
                onSelect={() =>
                  updateForm({ chatbotScheduleType: "school_hours_only" })
                }
                title="Clinic Hours Only"
                description="Access limited to defined clinic operating hours"
              />
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-gray-900 text-sm">
              Closures
            </h4>
            <div className="flex flex-col gap-3">
              <RadioOption
                selected={formData.chatbotClosuresDisabled}
                onSelect={() => updateForm({ chatbotClosuresDisabled: true })}
                title="Disable chatbot on blackout days, holidays, and closures"
                description=""
              />
              <RadioOption
                selected={!formData.chatbotClosuresDisabled}
                onSelect={() => updateForm({ chatbotClosuresDisabled: false })}
                title="Enable chatbot on blackout days, holidays, and closures"
                description=""
              />
            </div>
          </div>
        </div>
      </FormSection>

      {/* Assessment & Screener Frequency */}
      <FormSection
        icon={<ClipboardCheck className="h-5 w-5" />}
        title="Assessment & Screener Frequency"
        description="Configure how often students are prompted to complete assessments"
      >
        <div className="flex flex-col gap-6">
          <AssessmentRow
            title="SEL Screener"
            description="Social-Emotional Learning assessment"
            enabled={formData.selScreenerEnabled}
            onToggle={(v) => updateForm({ selScreenerEnabled: v })}
            frequency={formData.selScreenerFrequency}
            onFrequencyChange={(v) => updateForm({ selScreenerFrequency: v })}
            firstDate={formData.selScreenerFirstDate}
            onDateChange={(v) => updateForm({ selScreenerFirstDate: v })}
          />
          <AssessmentRow
            title="PHQ-9 (Depression Screening)"
            description="Patient Health Questionnaire - 9 items"
            note="Note: Students who screen positive will retake the screener every two weeks until they no longer screen positive."
            enabled={formData.phq9Enabled}
            onToggle={(v) => updateForm({ phq9Enabled: v })}
            frequency={formData.phq9Frequency}
            onFrequencyChange={(v) => updateForm({ phq9Frequency: v })}
            firstDate={formData.phq9FirstDate}
            onDateChange={(v) => updateForm({ phq9FirstDate: v })}
          />
          <AssessmentRow
            title="GAD-7 (Anxiety Screening)"
            description="Generalized Anxiety Disorder - 7 items"
            note="Note: Students who screen positive will retake the screener every two weeks until they no longer screen positive."
            enabled={formData.gad7Enabled}
            onToggle={(v) => updateForm({ gad7Enabled: v })}
            frequency={formData.gad7Frequency}
            onFrequencyChange={(v) => updateForm({ gad7Frequency: v })}
            firstDate={formData.gad7FirstDate}
            onDateChange={(v) => updateForm({ gad7FirstDate: v })}
          />
        </div>
      </FormSection>
    </>
  );
}

const triggerClass = "h-10 w-full border-gray-200 bg-white font-dm";
const contentClass =
  "bg-white font-dm [&_[data-slot=select-item]]:text-gray-900 [&_[data-slot=select-item]]:hover:bg-secondary/80 [&_[data-slot=select-item]]:focus:bg-secondary";

function AssessmentRow({
  title,
  description,
  note,
  enabled,
  onToggle,
  frequency,
  onFrequencyChange,
  firstDate,
  onDateChange,
}: {
  title: string;
  description: string;
  note?: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  frequency: string;
  onFrequencyChange: (v: string) => void;
  firstDate: string;
  onDateChange: (v: string) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{title}</p>
          <p className="text-gray-500 text-xs">{description}</p>
        </div>
        <Toggle checked={enabled} onChange={onToggle} />
      </div>
      <div className={cn(!enabled && "pointer-events-none opacity-60")}>
        <FormRow>
          <FormField label="Frequency">
            <Select
              value={frequency}
              onValueChange={onFrequencyChange}
              disabled={!enabled}
            >
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent className={contentClass}>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Biweekly">Biweekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
                <SelectItem value="Semester">Semester</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="First Scheduled Date">
            <Input
              value={firstDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="h-10 border-gray-200 font-dm"
              placeholder="MM/DD/YYYY"
              disabled={!enabled}
            />
          </FormField>
        </FormRow>
      </div>
      {note && <p className="mt-3 text-gray-500 text-xs italic">{note}</p>}
    </div>
  );
}
