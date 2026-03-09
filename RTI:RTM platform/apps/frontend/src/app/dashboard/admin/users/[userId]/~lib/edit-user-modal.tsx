"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/lib/core-ui/dialog";
import { Label } from "@/lib/core-ui/label";
import { Textarea } from "@/lib/core-ui/textarea";
import { ROLE_OPTIONS, STATUS_OPTIONS } from "../../~lib/users-data";
import { ToggleRow } from "../../add/~lib/form-fields";
import { updateUser } from "./edit-user-action";
import type { UserDetail } from "./user-detail-queries";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  initialData: UserDetail;
};

export function EditUserModal({
  open,
  onOpenChange,
  userId,
  initialData,
}: Props) {
  const [firstName, setFirstName] = useState(initialData.firstName);
  const [lastName, setLastName] = useState(initialData.lastName);
  const [email, setEmail] = useState(initialData.email);
  const [phone, setPhone] = useState(initialData.phone ?? "");
  const [role, setRole] = useState(initialData.displayRole);
  const [status, setStatus] = useState(initialData.displayStatus);
  const [canManage, setCanManage] = useState(initialData.canManageUsers);
  const [receivesAlerts, setReceivesAlerts] = useState(
    initialData.receivesAlertNotifications,
  );
  const [notes, setNotes] = useState(initialData.internalNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("First name, last name, and email are required.");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await updateUser(userId, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      displayRole: role,
      displayStatus: status,
      canManageUsers: canManage,
      receivesAlertNotifications: receivesAlerts,
      internalNotes: notes.trim(),
    });
    setSaving(false);
    if (result.ok) {
      onOpenChange(false);
    } else {
      setError(result.error ?? "Failed to save.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto bg-white font-dm">
        <DialogHeader>
          <DialogTitle className="font-bold font-dm text-lg">
            Edit User
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 font-medium text-gray-700 text-sm">
                First Name <span className="text-red-500">*</span>
              </Label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-10 w-full rounded-md border border-gray-200 px-3 font-dm text-gray-900 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label className="mb-1.5 font-medium text-gray-700 text-sm">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-10 w-full rounded-md border border-gray-200 px-3 font-dm text-gray-900 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <Label className="mb-1.5 font-medium text-gray-700 text-sm">
              Email <span className="text-red-500">*</span>
            </Label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-md border border-gray-200 px-3 font-dm text-gray-900 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Phone */}
          <div>
            <Label className="mb-1.5 font-medium text-gray-700 text-sm">
              Phone
            </Label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="h-10 w-full rounded-md border border-gray-200 px-3 font-dm text-gray-900 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 font-medium text-gray-700 text-sm">
                Platform Role
              </Label>
              <SelectField
                value={role}
                onChange={setRole}
                options={ROLE_OPTIONS}
              />
            </div>
            <div>
              <Label className="mb-1.5 font-medium text-gray-700 text-sm">
                Account Status
              </Label>
              <SelectField
                value={status}
                onChange={setStatus}
                options={STATUS_OPTIONS}
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4">
            <ToggleRow
              label="Can Manage Users"
              description="Allow this user to create and manage other user accounts"
              checked={canManage}
              onChange={setCanManage}
            />
            <ToggleRow
              label="Receives Alert Notifications"
              description="Send alert notifications when students are flagged"
              checked={receivesAlerts}
              onChange={setReceivesAlerts}
            />
          </div>

          {/* Internal Notes */}
          <div>
            <Label className="mb-1.5 font-medium text-gray-700 text-sm">
              Internal Notes
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes about this user..."
              className="min-h-[80px] resize-none text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-700"
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full appearance-none rounded-md border border-gray-200 bg-white px-3 pr-8 font-dm text-gray-900 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
