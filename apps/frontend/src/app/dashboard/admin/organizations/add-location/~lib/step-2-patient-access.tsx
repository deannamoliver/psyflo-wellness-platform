"use client";

import { Mail, Plus, X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/lib/core-ui/input";
import type { LocationFormData } from "./types";

type Props = {
  formData: LocationFormData;
  updateForm: (updates: Partial<LocationFormData>) => void;
};

export function Step2PatientAccess({ formData, updateForm }: Props) {
  const [newEmail, setNewEmail] = useState("");

  function addEmail() {
    if (newEmail.trim()) {
      updateForm({
        manualStudentEmails: [...formData.manualStudentEmails, newEmail.trim()],
      });
      setNewEmail("");
    }
  }

  function removeEmail(i: number) {
    updateForm({
      manualStudentEmails: formData.manualStudentEmails.filter(
        (_, idx) => idx !== i,
      ),
    });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-1 font-semibold text-gray-900 text-lg">Patient Access</h3>
      <p className="mb-6 text-gray-500 text-sm">
        Add patient email addresses to grant them access to this location
      </p>

      {/* Patient Emails */}
      <div>
        <h4 className="mb-1 font-semibold text-gray-900 text-sm">
          Patient Email Addresses
        </h4>
        <p className="mb-3 text-gray-500 text-xs">
          Add individual patient email addresses. Patients will be assigned to providers in the Users & Roles section.
        </p>
        
        {formData.manualStudentEmails.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {formData.manualStudentEmails.map((email, i) => (
              <div
                key={email}
                className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 border border-blue-200"
              >
                <Mail className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-sm text-gray-700">{email}</span>
                <button
                  type="button"
                  onClick={() => removeEmail(i)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 shrink-0 text-gray-400" />
            <Input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="h-9 flex-1 border-gray-200 font-dm text-sm"
              placeholder="patient@email.com"
              onKeyDown={(e) => e.key === "Enter" && addEmail()}
            />
            <button
              type="button"
              onClick={addEmail}
              className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 font-medium text-sm text-white hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
          <p className="mt-2 text-gray-400 text-xs">
            Enter patient email addresses one at a time
          </p>
        </div>

        {formData.manualStudentEmails.length > 0 && (
          <div className="mt-4 rounded-lg bg-blue-50 p-3 border border-blue-100">
            <p className="text-blue-700 text-sm">
              <span className="font-semibold">{formData.manualStudentEmails.length}</span> patient{formData.manualStudentEmails.length !== 1 ? 's' : ''} added. 
              You can assign patients to specific providers in the Users & Roles section above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
