"use client";

import { Mail, Phone, UserPlus, X } from "lucide-react";
import Link from "next/link";
import type { OrgOption } from "./add-user-queries";
import { OrgLocationSection } from "./org-location-section";
import { RoleSelection } from "./role-selection";

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
  const isSiteStaff = role === "Site Staff" || role === "Provider";

  const inputClass =
    "h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="flex flex-col gap-6">
      {/* User Information */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 bg-blue-600 px-6 py-4">
          <UserPlus className="size-5 text-white" />
          <h3 className="font-semibold text-white">Provider Information</h3>
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

      {/* Organization & Location (Site Staff only) */}
      {isSiteStaff && <OrgLocationSection organizations={organizations} />}

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
          {isPending ? "Creating..." : "Create Provider Account"}
        </button>
      </div>
    </div>
  );
}
