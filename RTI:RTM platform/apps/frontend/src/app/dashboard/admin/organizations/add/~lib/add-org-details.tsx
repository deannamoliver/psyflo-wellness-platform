"use client";

import { Input } from "@/lib/core-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import type { OrgFormData } from "./add-org-types";
import { COUNTRY_OPTIONS, TIMEZONE_OPTIONS, US_STATES } from "./add-org-types";

type Props = {
  formData: OrgFormData;
  onChange: (field: keyof OrgFormData, value: string) => void;
};

function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block font-medium text-gray-900 text-sm">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function FieldHint({ text }: { text: string }) {
  return <p className="mt-1 text-gray-500 text-xs">{text}</p>;
}

const inputClass = "h-10 border-gray-200 bg-white font-dm";
const triggerClass = "h-10 w-full border-gray-200 bg-white font-dm";
const contentClass =
  "bg-white font-dm [&_[data-slot=select-item]]:text-gray-900 [&_[data-slot=select-item]]:hover:bg-secondary/80 [&_[data-slot=select-item]]:focus:bg-secondary";

export function AddOrgDetails({ formData, onChange }: Props) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-gray-900 text-lg">
        Organization Details
      </h2>
      <p className="mt-1 text-gray-500 text-sm">
        Fill in the basic information about the organization
      </p>

      <div className="mt-6 flex flex-col gap-5">
        {/* Row 1: Name, District Code, Org ID */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <FieldLabel label="Organization Name" required />
            <Input
              placeholder="e.g., Lincoln High School"
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
              className={inputClass}
            />
            <FieldHint text="Official name of the organization" />
          </div>
          <div>
            <FieldLabel label="District Code" />
            <Input
              placeholder="CH-001"
              value={formData.districtCode}
              onChange={(e) => onChange("districtCode", e.target.value)}
              className={inputClass}
            />
            <FieldHint text="Internal identification code (optional)" />
          </div>
          <div>
            <FieldLabel label="Organization ID" />
            <Input
              placeholder="Auto-generated (e.g., SCH-016)"
              disabled
              className="h-10 border-gray-200 bg-gray-50 font-dm text-gray-400"
            />
            <FieldHint text="Automatically assigned after creation" />
          </div>
        </div>

        {/* Address */}
        <div>
          <FieldLabel label="Address" />
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Street Address"
              value={formData.streetAddress}
              onChange={(e) => onChange("streetAddress", e.target.value)}
              className={inputClass}
            />
            <Input
              placeholder="Suite, Building, Floor (optional)"
              value={formData.streetAddress2}
              onChange={(e) => onChange("streetAddress2", e.target.value)}
              className={inputClass}
            />
            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder="Enter city"
                value={formData.city}
                onChange={(e) => onChange("city", e.target.value)}
                className={inputClass}
              />
              <Select
                value={formData.state || undefined}
                onValueChange={(v) => onChange("state", v)}
              >
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder="Select state..." />
                </SelectTrigger>
                <SelectContent className={contentClass}>
                  {US_STATES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                value={formData.country || undefined}
                onValueChange={(v) => onChange("country", v)}
              >
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent className={contentClass}>
                  {COUNTRY_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div>
                <Input
                  placeholder="ZIP / Postal Code"
                  value={formData.zipCode}
                  onChange={(e) => onChange("zipCode", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Time Zone */}
        <div>
          <FieldLabel label="Time Zone" required />
          <Select
            value={formData.timezone || undefined}
            onValueChange={(v) => onChange("timezone", v)}
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder="Select time zone" />
            </SelectTrigger>
            <SelectContent className={contentClass}>
              {TIMEZONE_OPTIONS.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Website */}
        <div>
          <FieldLabel label="Website" />
          <Input
            placeholder="e.g., https://springfieldusd.org"
            value={formData.website}
            onChange={(e) => onChange("website", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Phone Number */}
        <div>
          <FieldLabel label="Phone Number" />
          <Input
            placeholder="e.g., (555) 123-4567"
            value={formData.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Organization Email Domain */}
        <div>
          <FieldLabel label="Organization Email Domain" />
          <Input
            placeholder="e.g., @domain.edu"
            value={formData.emailDomain}
            onChange={(e) => onChange("emailDomain", e.target.value)}
            className={inputClass}
          />
          <FieldHint text="If all schools in this district use the same email domain, enter it here. Individual schools can override this." />
        </div>
      </div>
    </section>
  );
}
