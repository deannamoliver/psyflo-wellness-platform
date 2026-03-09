"use client";

import { Building2, MapPin } from "lucide-react";
import { Input } from "@/lib/core-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import { FormField, FormRow, FormSection } from "./form-section";
import type { LocationFormData } from "./types";
import { US_STATES } from "./types";

type Props = {
  formData: LocationFormData;
  updateForm: (updates: Partial<LocationFormData>) => void;
  organizations: { id: string; name: string }[];
};

const triggerClass = "h-10 w-full border-gray-200 bg-white font-dm";
const contentClass =
  "bg-white font-dm [&_[data-slot=select-item]]:text-gray-900 [&_[data-slot=select-item]]:hover:bg-secondary/80 [&_[data-slot=select-item]]:focus:bg-secondary";

export function Step1Profile({ formData, updateForm, organizations }: Props) {
  return (
    <>
      {/* Location Information */}
      <FormSection
        icon={<Building2 className="h-5 w-5" />}
        title="Location Information"
        description="Fill in details for this new location"
      >
        <div className="flex flex-col gap-4">
          <FormField label="Parent Organization" required>
            <Select
              value={formData.parentOrganizationId || undefined}
              onValueChange={(v) => updateForm({ parentOrganizationId: v })}
            >
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder="Select organization..." />
              </SelectTrigger>
              <SelectContent className={contentClass}>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Location/Site Name" required>
              <Input
                value={formData.locationName}
                onChange={(e) => updateForm({ locationName: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder=""
              />
              <p className="mt-1 text-gray-400 text-xs">
                Official name of the clinic
              </p>
            </FormField>
            <FormField label="Location NPI">
              <Input
                value={formData.locationNpi ?? ""}
                onChange={(e) => updateForm({ locationNpi: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder="10-digit NPI"
              />
              <p className="mt-1 text-gray-400 text-xs">
                National Provider Identifier for this location
              </p>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Location Code">
              <Input
                value={formData.schoolCode}
                onChange={(e) => updateForm({ schoolCode: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder="LOC-001"
              />
              <p className="mt-1 text-gray-400 text-xs">
                Internal identification code (optional)
              </p>
            </FormField>
            <FormField label="Phone Number" required>
              <Input
                value={formData.phone}
                onChange={(e) => updateForm({ phone: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder=""
              />
            </FormField>
          </div>
        </div>
      </FormSection>

      {/* Location & Address */}
      <FormSection
        icon={<MapPin className="h-5 w-5" />}
        title="Location & Address"
        description="Physical address and location details"
      >
        <div className="flex flex-col gap-4">
          <FormField label="Street Address" required>
            <Input
              value={formData.streetAddress}
              onChange={(e) => updateForm({ streetAddress: e.target.value })}
              className="h-10 border-gray-200 font-dm"
              placeholder="123 Main Street"
            />
          </FormField>
          <FormField label="Address Line 2">
            <Input
              value={formData.addressLine2}
              onChange={(e) => updateForm({ addressLine2: e.target.value })}
              className="h-10 border-gray-200 font-dm"
              placeholder="Suite, Building, Floor (Optional)"
            />
          </FormField>
          <FormRow>
            <FormField label="City" required>
              <Input
                value={formData.city}
                onChange={(e) => updateForm({ city: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder="Enter city"
              />
            </FormField>
            <FormField label="State / Province" required>
              <Select
                value={formData.state || undefined}
                onValueChange={(v) => updateForm({ state: v })}
              >
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder="Select state..." />
                </SelectTrigger>
                <SelectContent className={contentClass}>
                  {US_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="ZIP / Postal Code" required>
              <Input
                value={formData.zipCode}
                onChange={(e) => updateForm({ zipCode: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder="12345"
              />
            </FormField>
            <FormField label="Country" required>
              <Select
                value={formData.country || undefined}
                onValueChange={(v) => updateForm({ country: v })}
              >
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className={contentClass}>
                  <SelectItem value="United States">United States</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>
        </div>
      </FormSection>
    </>
  );
}
