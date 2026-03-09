"use client";

import { Mail, Phone, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import type { OrgOption } from "./add-user-queries";
import { OrgLocationSection } from "./org-location-section";
import { RoleSelection } from "./role-selection";

const LICENSE_TYPES = [
  "MD", "DO", "PhD", "PsyD", "LCSW", "LMFT", "LPC", "LPCC", "NP", "PA", "RN", "Other",
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL",
  "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
  "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH",
  "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

const INSURANCE_CATEGORIES = [
  { id: "private", label: "Private/Commercial", placeholder: "e.g., Aetna, Blue Cross, Cigna..." },
  { id: "public", label: "Public (Medicaid/Medicare/VA)", placeholder: "e.g., Medicare Part B, Medicaid, VA..." },
  { id: "other", label: "Other", placeholder: "e.g., Workers comp, EAP..." },
];

type Props = {
  organizations: OrgOption[];
  role: string;
  platform: "internal" | "client" | "";
  onRoleChange: (role: string) => void;
  onPlatformChange: (platform: "internal" | "client") => void;
  isPending: boolean;
};

export function AddUserForm({
  organizations,
  role,
  platform,
  onRoleChange,
  onPlatformChange,
  isPending,
}: Props) {
  const isOrgUser = role === "Provider" || role === "Practice Management";
  const isProvider = role === "Provider";
  
  const [licenseTypes, setLicenseTypes] = useState<string[]>([]);
  const [licensedStates, setLicensedStates] = useState<string[]>([]);
  const [acceptsInsurance, setAcceptsInsurance] = useState(true);

  const inputClass =
    "h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="flex flex-col gap-6">
      {/* User Information */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 bg-blue-600 px-6 py-4">
          <UserPlus className="size-5 text-white" />
          <h3 className="font-semibold text-white">User Information</h3>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block font-medium text-gray-700 text-sm">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                name="firstName"
                required
                className={inputClass}
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-medium text-gray-700 text-sm">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                name="lastName"
                required
                className={inputClass}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-medium text-gray-700 text-sm">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-gray-400" />
              <input
                name="email"
                type="email"
                required
                className={`${inputClass} pl-10`}
                placeholder="user@example.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-medium text-gray-700 text-sm">
              Phone Number <span className="text-gray-400">(Optional)</span>
            </label>
            <div className="relative">
              <Phone className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-gray-400" />
              <input
                name="phone"
                type="tel"
                className={`${inputClass} pl-10`}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-medium text-gray-700 text-sm">
              Role/Title <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              name="roleTitle"
              className={inputClass}
              placeholder="e.g. Therapist, Clinical Supervisor"
            />
          </div>
        </div>
      </section>

      {/* Platform Access & Role Selection */}
      <input type="hidden" name="role" value={role} />
      <RoleSelection
        platform={platform}
        role={role}
        onPlatformChange={onPlatformChange}
        onRoleChange={onRoleChange}
      />

      {/* Organization & Location (Organization users only) */}
      {isOrgUser && <OrgLocationSection organizations={organizations} />}

      {/* Provider-specific fields */}
      {isProvider && (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 bg-teal-600 px-6 py-4">
            <UserPlus className="size-5 text-white" />
            <h3 className="font-semibold text-white">Provider Information</h3>
          </div>
          <div className="flex flex-col gap-5 p-6">
            {/* NPI */}
            <div>
              <label className="mb-1.5 block font-medium text-gray-700 text-sm">
                Individual Provider NPI
              </label>
              <input
                name="npi"
                maxLength={10}
                className={inputClass}
                placeholder="10-digit NPI number"
              />
              <p className="mt-1 text-gray-400 text-xs">Required for billing purposes</p>
            </div>

            {/* License Types (Multiple Selection) */}
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
              <label className="mb-2 block font-medium text-gray-700 text-sm">
                License Type(s) <span className="text-red-500">*</span>
              </label>
              <p className="mb-3 text-gray-500 text-xs">
                Select all credentials/license types that apply
              </p>
              <input type="hidden" name="licenseTypes" value={licenseTypes.join(",")} />
              <div className="flex flex-wrap gap-1.5">
                {LICENSE_TYPES.map((type) => {
                  const isSelected = licenseTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setLicenseTypes((prev) =>
                          isSelected
                            ? prev.filter((t) => t !== type)
                            : [...prev, type]
                        );
                      }}
                      className={cn(
                        "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all",
                        isSelected
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      )}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
              {licenseTypes.length > 0 && (
                <p className="mt-2 text-gray-600 text-xs">
                  Selected: {licenseTypes.join(", ")}
                </p>
              )}
            </div>

            {/* Licensed States */}
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
              <label className="mb-2 block font-medium text-gray-700 text-sm">
                Licensed States <span className="text-red-500">*</span>
              </label>
              <p className="mb-3 text-gray-500 text-xs">
                Select all states where this provider is licensed to practice
              </p>
              <input type="hidden" name="licensedStates" value={licensedStates.join(",")} />
              <div className="flex flex-wrap gap-1.5">
                {US_STATES.map((state) => {
                  const isSelected = licensedStates.includes(state);
                  return (
                    <button
                      key={state}
                      type="button"
                      onClick={() => {
                        setLicensedStates((prev) =>
                          isSelected
                            ? prev.filter((s) => s !== state)
                            : [...prev, state]
                        );
                      }}
                      className={cn(
                        "rounded-md border px-2 py-1 text-xs font-medium transition-all",
                        isSelected
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      )}
                    >
                      {state}
                    </button>
                  );
                })}
              </div>
              {licensedStates.length > 0 && (
                <p className="mt-2 text-gray-600 text-xs">
                  Selected: {licensedStates.join(", ")}
                </p>
              )}
            </div>

            {/* Accepts Insurance */}
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="acceptsInsurance"
                  name="acceptsInsurance"
                  checked={acceptsInsurance}
                  onChange={(e) => setAcceptsInsurance(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="acceptsInsurance" className="font-medium text-gray-700 text-sm">
                  Accepts Insurance
                </label>
              </div>

              {acceptsInsurance && (
                <div className="space-y-3">
                  <p className="text-gray-500 text-xs">Add insurance plans by category</p>
                  {INSURANCE_CATEGORIES.map((category) => (
                    <div key={category.id} className="rounded-lg border border-gray-200 bg-white p-3">
                      <label className="mb-1.5 block font-medium text-gray-600 text-xs">
                        {category.label}
                      </label>
                      <input
                        name={`insurance_${category.id}`}
                        placeholder={category.placeholder}
                        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Internal Notes */}
      <section>
        <label className="mb-1.5 block font-medium text-gray-700 text-sm">
          Internal Notes <span className="text-gray-400">(Optional)</span>
        </label>
        <textarea
          name="internalNotes"
          rows={4}
          placeholder="Add any internal notes about this user (not visible to the user)..."
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between border-gray-200 border-t pt-6">
        <Link
          href="/dashboard/admin/users"
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50"
        >
          <X className="size-4" />
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-sm text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          <UserPlus className="size-4" />
          {isPending ? "Creating..." : "Create User Account"}
        </button>
      </div>
    </div>
  );
}
