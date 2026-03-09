"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import type { OrgFormData } from "./add-org-types";
import { STATUS_OPTIONS } from "./add-org-types";

type Props = {
  formData: OrgFormData;
  onChange: (field: keyof OrgFormData, value: string) => void;
};

const triggerClass = "h-10 w-full border-gray-200 bg-white font-dm";
const contentClass =
  "bg-white font-dm [&_[data-slot=select-item]]:text-gray-900 [&_[data-slot=select-item]]:hover:bg-secondary/80 [&_[data-slot=select-item]]:focus:bg-secondary";

export function AddOrgSettings({ formData, onChange }: Props) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-gray-900 text-lg">
        Additional Settings
      </h2>
      <p className="mt-1 text-gray-500 text-sm">
        Configure initial status and settings
      </p>

      <div className="mt-6 flex flex-col gap-5">
        {/* Initial Status */}
        <div>
          <label className="mb-1.5 block font-medium text-gray-900 text-sm">
            Initial Status <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.status}
            onValueChange={(v) => onChange("status", v)}
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className={contentClass}>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-gray-500 text-xs">
            Organizations typically start in Onboarding status
          </p>
        </div>

        {/* Internal Notes */}
        <div>
          <label className="mb-1.5 block font-medium text-gray-900 text-sm">
            Internal Notes
          </label>
          <textarea
            placeholder="Add internal notes, special considerations, or implementation details..."
            value={formData.internalNotes}
            onChange={(e) => onChange("internalNotes", e.target.value)}
            rows={4}
            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 font-dm text-gray-700 text-sm outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <p className="mt-1 text-gray-500 text-xs">
            For internal Psyflo staff only
          </p>
        </div>
      </div>
    </section>
  );
}
