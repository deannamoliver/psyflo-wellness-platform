"use client";

import { Loader2, Mail, Phone, User, X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/lib/core-ui/input";
import { FormField, FormRow } from "./form-section";
import type { StaffMember } from "./types";
import { RoleCard } from "./user-modal-cards";

type Props = {
  onClose: () => void;
  onSave: (user: Omit<StaffMember, "id">) => void | Promise<void>;
  initialData?: StaffMember;
};

type Role = "super_admin" | "site_staff" | "clinical_supervisor" | "coach";

const ROLES: {
  value: Role;
  label: string;
  color: string;
  description: string;
  idealFor: string;
}[] = [
  {
    value: "super_admin",
    label: "Super Admin",
    color: "text-blue-600 bg-blue-100",
    description:
      "Full platform access. Manages all organizations, users, patients, safety monitoring, conversations, and referrals across all locations.",
    idealFor: "Platform Administrators, System Managers",
  },
  {
    value: "site_staff",
    label: "Provider",
    color: "text-green-600 bg-green-100",
    description:
      "Clinical oversight for all patients at location. Receives and resolves safety alerts. Views population data, patient profiles and assessments. Cannot access conversations.",
    idealFor: "Psychiatrists, Clinical Directors, Practice Managers",
  },
  {
    value: "clinical_supervisor",
    label: "Clinical Supervisor",
    color: "text-purple-600 bg-purple-100",
    description:
      "View-only access to organizations and users. Full patient, safety monitoring, conversation, and referral oversight. Can observe and take over therapist sessions when needed.",
    idealFor: "Clinical Directors, Licensed Supervisors",
  },
  {
    value: "coach",
    label: "Therapist",
    color: "text-amber-600 bg-amber-100",
    description:
      "Direct patient support for assigned caseload. Full conversation access with patients. Submits safety alerts.",
    idealFor: "Therapists, Counselors, Social Workers, Interns",
  },
];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  site_staff: "Provider",
  clinical_supervisor: "Clinical Supervisor",
  coach: "Therapist",
};

export function AddUserModal({ onClose, onSave, initialData }: Props) {
  const isEditing = !!initialData;
  const [firstName, setFirstName] = useState(initialData?.firstName ?? "");
  const [lastName, setLastName] = useState(initialData?.lastName ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phone ?? "");
  const [roleTitle, setRoleTitle] = useState(initialData?.roleTitle ?? "");
  const [role, setRole] = useState<Role>(initialData?.role ?? "site_staff");
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white font-dm shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 rounded-t-xl bg-blue-600 px-6 py-4 text-white">
          <User className="h-5 w-5" />
          <span className="font-semibold text-lg">
            {isEditing ? "Edit User" : "User Information"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto hover:text-white/80"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-6">
          {/* Name */}
          <FormRow>
            <FormField label="First Name" required>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-10 border-gray-200 font-dm"
                placeholder="Enter first name"
              />
            </FormField>
            <FormField label="Last Name" required>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-10 border-gray-200 font-dm"
                placeholder="Enter last name"
              />
            </FormField>
          </FormRow>

          {/* Email */}
          <FormField label="Email Address" required>
            <div className="relative">
              <Mail className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 border-gray-200 pl-10 font-dm"
                placeholder="user@example.com"
              />
            </div>
          </FormField>

          {/* Phone */}
          <FormField label="Phone Number (Required)">
            <div className="relative">
              <Phone className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-10 border-gray-200 pl-10 font-dm"
                placeholder="(555) 123-4567"
              />
            </div>
          </FormField>

          {/* Role/Title */}
          <FormField label="Role/Title">
            <Input
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="h-10 border-gray-200 font-dm"
              placeholder="Title"
            />
          </FormField>

          {/* Role */}
          <div>
            <label className="mb-2 block font-medium text-gray-700 text-sm">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((r) => (
                <RoleCard
                  key={r.value}
                  role={r}
                  selected={role === r.value}
                  onSelect={() => setRole(r.value)}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block font-medium text-gray-700 text-sm">
              Internal Notes <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-200 px-3 py-2 font-dm text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Add any internal notes about this user (not visible to the user)..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-gray-200 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 font-medium text-gray-700 text-sm hover:bg-gray-50"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                if (!firstName.trim() || !email.trim()) return;
                setSaving(true);
                try {
                  await onSave({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(),
                    phone: phoneNumber.trim(),
                    roleTitle: roleTitle.trim(),
                    role,
                    notes: notes.trim(),
                  });
                } finally {
                  setSaving(false);
                }
                onClose();
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-sm text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <User className="h-4 w-4" />
              )}{" "}
              {isEditing ? "Save Changes" : "Add User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
