"use client";

import { Phone } from "lucide-react";
import { Input } from "@/lib/core-ui/input";
import { FormField, FormRow, FormSection } from "./form-section";
import type { LocationFormData } from "./types";

type Props = {
  formData: LocationFormData;
  updateForm: (updates: Partial<LocationFormData>) => void;
};

export function Step3EmergencyServices({ formData, updateForm }: Props) {
  return (
    <FormSection
      icon={<Phone className="h-5 w-5" />}
      title="Non-School Emergency Contacts"
      description="Configure emergency contacts for this location. These appear during safety protocols."
    >
      <div className="flex flex-col gap-6">
        {/* Police */}
        <div>
          <h4 className="mb-3 font-semibold text-gray-900 text-sm">
            Local Emergency Services
          </h4>
          <FormRow>
            <FormField label="Police (non-emergency)" required>
              <Input
                value={formData.policePhone}
                onChange={(e) => updateForm({ policePhone: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder="(555) 123-4567"
              />
            </FormField>
            <FormField label="Police Address">
              <Input
                value={formData.policeAddress}
                onChange={(e) => updateForm({ policeAddress: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder="123 Police Plaza"
              />
            </FormField>
          </FormRow>
        </div>

        {/* SRO */}
        <div>
          <h4 className="mb-3 font-semibold text-gray-900 text-sm">
            School Resource Officer
          </h4>
          <FormRow>
            <FormField label="Name">
              <Input
                value={formData.sroName}
                onChange={(e) => updateForm({ sroName: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder="Officer name"
              />
            </FormField>
            <FormField label="Phone">
              <Input
                value={formData.sroPhone}
                onChange={(e) => updateForm({ sroPhone: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder="(555) 123-4567"
              />
            </FormField>
          </FormRow>
          <label className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.noSro}
              onChange={(e) => updateForm({ noSro: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <span className="text-gray-600 text-sm">
              This location does not have an SRO
            </span>
          </label>
        </div>

        {/* Crisis Services */}
        <div>
          <h4 className="mb-3 font-semibold text-gray-900 text-sm">
            Crisis Services
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Local Crisis Center" required>
              <Input
                value={formData.crisisCenterName}
                onChange={(e) =>
                  updateForm({ crisisCenterName: e.target.value })
                }
                className="h-10 border-gray-200 font-dm"
                placeholder="Crisis center name"
              />
            </FormField>
            <FormField label="Crisis Hotline" required>
              <Input
                value={formData.crisisHotline}
                onChange={(e) => updateForm({ crisisHotline: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder="(555) 123-4567"
              />
            </FormField>
            <FormField label="Hours">
              <Input
                value={formData.crisisHours}
                onChange={(e) => updateForm({ crisisHours: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder="24/7"
              />
            </FormField>
          </div>
          <label className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.mobileCrisisAvailable}
              onChange={(e) =>
                updateForm({ mobileCrisisAvailable: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <span className="text-gray-600 text-sm">
              Mobile Crisis Team available
            </span>
          </label>
          {formData.mobileCrisisAvailable && (
            <div className="mt-2">
              <FormField label="Mobile Crisis Number">
                <Input
                  value={formData.mobileCrisisNumber}
                  onChange={(e) =>
                    updateForm({ mobileCrisisNumber: e.target.value })
                  }
                  className="h-10 border-gray-200 font-dm"
                  placeholder="(555) 123-4567"
                />
              </FormField>
            </div>
          )}
        </div>

        {/* Medical */}
        <div>
          <h4 className="mb-3 font-semibold text-gray-900 text-sm">Medical</h4>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Nearest Hospital" required>
              <Input
                value={formData.nearestHospital}
                onChange={(e) =>
                  updateForm({ nearestHospital: e.target.value })
                }
                className="h-10 border-gray-200 font-dm"
                placeholder="Hospital name"
              />
            </FormField>
            <FormField label="ER Address" required>
              <Input
                value={formData.erAddress}
                onChange={(e) => updateForm({ erAddress: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder="ER address"
              />
            </FormField>
            <FormField label="ER Phone">
              <Input
                value={formData.erPhone}
                onChange={(e) => updateForm({ erPhone: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder="(555) 123-4567"
              />
            </FormField>
          </div>
        </div>

        {/* CPS */}
        <div>
          <h4 className="mb-3 font-semibold text-gray-900 text-sm">
            Child Protective Services
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="State CPS Hotline" required>
              <Input
                value={formData.stateCpsHotline}
                onChange={(e) =>
                  updateForm({ stateCpsHotline: e.target.value })
                }
                className="h-10 border-gray-200 font-dm"
                placeholder="(555) 123-4567"
              />
            </FormField>
            <FormField label="Local CPS Office">
              <Input
                value={formData.localCpsOffice}
                onChange={(e) => updateForm({ localCpsOffice: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder="(555) 123-4567"
              />
            </FormField>
            <FormField label="Online Report URL">
              <Input
                value={formData.cpsReportUrl}
                onChange={(e) => updateForm({ cpsReportUrl: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder="https://www.cps-report.gov"
              />
            </FormField>
          </div>
        </div>

        {/* Notes */}
        <div>
          <h4 className="mb-3 font-semibold text-gray-900 text-sm">Notes</h4>
          <textarea
            value={formData.emergencyNotes}
            onChange={(e) => updateForm({ emergencyNotes: e.target.value })}
            rows={4}
            className="w-full rounded-md border border-gray-200 px-3 py-2 font-dm text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Additional emergency contact information or procedures..."
          />
        </div>
      </div>
    </FormSection>
  );
}
