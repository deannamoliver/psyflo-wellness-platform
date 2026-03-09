"use client";

import { Mail, Phone, Shield, X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/lib/core-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import { FormField, FormRow } from "./form-section";
import type { EmergencyContact } from "./types";

const selectTriggerClass = "h-10 w-full border-gray-200 bg-white font-dm";
const selectContentClass =
  "bg-white font-dm [&_[data-slot=select-item]]:text-gray-900 [&_[data-slot=select-item]]:hover:bg-secondary/80 [&_[data-slot=select-item]]:focus:bg-secondary";

const RELATION_OPTIONS = [
  "Provider",
  "Principal",
  "Vice Principal",
  "Nurse",
  "Social Worker",
  "Psychologist",
  "Teacher",
  "Other",
];

type Props = {
  onClose: () => void;
  onSave: (contact: Omit<EmergencyContact, "id">) => void;
  initialData?: EmergencyContact;
};

export function AddEmergencyContactModal({
  onClose,
  onSave,
  initialData,
}: Props) {
  const isEditing = !!initialData;
  const [name, setName] = useState(initialData?.name ?? "");
  const [relation, setRelation] = useState(initialData?.relation ?? "");
  const [primaryPhone, setPrimaryPhone] = useState(
    initialData?.primaryPhone ?? "",
  );
  const [secondaryPhone, setSecondaryPhone] = useState(
    initialData?.secondaryPhone ?? "",
  );
  const [primaryEmail, setPrimaryEmail] = useState(
    initialData?.primaryEmail ?? "",
  );
  const [secondaryEmail, setSecondaryEmail] = useState(
    initialData?.secondaryEmail ?? "",
  );

  const canSave = name.trim() && relation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white font-dm shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 rounded-t-xl bg-blue-600 px-6 py-4 text-white">
          <Shield className="h-5 w-5" />
          <span className="font-semibold text-lg">
            {isEditing ? "Edit Emergency Contact" : "Add Emergency Contact"}
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
          {/* Name & Relation */}
          <FormRow>
            <FormField label="Full Name" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 border-gray-200 font-dm"
                placeholder="Enter full name"
              />
            </FormField>
            <FormField label="Role / Relation" required>
              <Select value={relation || undefined} onValueChange={setRelation}>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  {RELATION_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>

          {/* Phone Numbers */}
          <FormRow>
            <FormField label="Primary Phone">
              <div className="relative">
                <Phone className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
                <Input
                  value={primaryPhone}
                  onChange={(e) => setPrimaryPhone(e.target.value)}
                  className="h-10 border-gray-200 pl-10 font-dm"
                  placeholder="(555) 123-4567"
                />
              </div>
            </FormField>
            <FormField label="Secondary Phone">
              <div className="relative">
                <Phone className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
                <Input
                  value={secondaryPhone}
                  onChange={(e) => setSecondaryPhone(e.target.value)}
                  className="h-10 border-gray-200 pl-10 font-dm"
                  placeholder="(555) 123-4567"
                />
              </div>
            </FormField>
          </FormRow>

          {/* Email Addresses */}
          <FormRow>
            <FormField label="Primary Email">
              <div className="relative">
                <Mail className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
                <Input
                  value={primaryEmail}
                  onChange={(e) => setPrimaryEmail(e.target.value)}
                  className="h-10 border-gray-200 pl-10 font-dm"
                  placeholder="contact@school.edu"
                />
              </div>
            </FormField>
            <FormField label="Secondary Email">
              <div className="relative">
                <Mail className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
                <Input
                  value={secondaryEmail}
                  onChange={(e) => setSecondaryEmail(e.target.value)}
                  className="h-10 border-gray-200 pl-10 font-dm"
                  placeholder="backup@school.edu"
                />
              </div>
            </FormField>
          </FormRow>

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
              disabled={!canSave}
              onClick={() => {
                if (!canSave) return;
                onSave({
                  name: name.trim(),
                  relation,
                  primaryPhone: primaryPhone.trim(),
                  secondaryPhone: secondaryPhone.trim(),
                  primaryEmail: primaryEmail.trim(),
                  secondaryEmail: secondaryEmail.trim(),
                });
                onClose();
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Shield className="h-4 w-4" />
              {isEditing ? "Save Changes" : "Add Contact"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
