"use client";

import { AlertTriangle, Globe, Lock, Mail, Plus, X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/lib/core-ui/input";
import type { LocationFormData } from "./types";
import { GRADE_LABELS } from "./types";

/** K–6 down left column, 7–12 down right column */
const GRADE_ORDER = [
  "K",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

type Props = {
  formData: LocationFormData;
  updateForm: (updates: Partial<LocationFormData>) => void;
};

export function Step2StudentAccess({ formData, updateForm }: Props) {
  const [newDomain, setNewDomain] = useState("");
  const [newEmail, setNewEmail] = useState("");

  function addDomain() {
    if (newDomain.trim()) {
      updateForm({
        studentDomains: [...formData.studentDomains, newDomain.trim()],
      });
      setNewDomain("");
    }
  }

  function removeDomain(i: number) {
    updateForm({
      studentDomains: formData.studentDomains.filter((_, idx) => idx !== i),
    });
  }

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

  function toggleGradeRestriction(grade: string) {
    const current = formData.restrictedGrades;
    updateForm({
      restrictedGrades: current.includes(grade)
        ? current.filter((g) => g !== grade)
        : [...current, grade],
    });
  }

  const gradeEntries = GRADE_ORDER.map(
    (key) => [key, GRADE_LABELS[key]!] as const,
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-1 font-semibold text-gray-900 text-lg">Students</h3>

      {/* Domain-Based Access */}
      <div className="mb-6">
        <h4 className="mb-1 font-semibold text-gray-900 text-sm">
          Domain-Based Access
        </h4>
        <p className="mb-3 text-gray-500 text-xs">
          Students with emails from these domains can automatically join. Do not
          include the @ symbol.
        </p>
        {formData.studentDomains.map((domain, i) => (
          <div
            key={domain}
            className="mb-2 flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5"
          >
            <Globe className="h-4 w-4 text-blue-500" />
            <span className="flex-1 text-gray-900 text-sm">{domain}</span>
            <button
              type="button"
              onClick={() => removeDomain(i)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 shrink-0 text-gray-400" />
          <Input
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            className="h-9 flex-1 border-gray-200 font-dm text-sm"
            placeholder="student.schooldistrict.org"
            onKeyDown={(e) => e.key === "Enter" && addDomain()}
          />
          <button
            type="button"
            onClick={addDomain}
            className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 font-medium text-sm text-white hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>

      {/* Manual Student Emails */}
      <div className="mb-6">
        <h4 className="mb-1 font-semibold text-gray-900 text-sm">
          Manual Student Email Access
        </h4>
        <p className="mb-3 text-gray-500 text-xs">
          Add individual student email addresses for students who don&apos;t
          follow the domain pattern or for testing purposes.
        </p>
        {formData.manualStudentEmails.map((email, i) => (
          <div
            key={email}
            className="mb-2 flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5"
          >
            <Mail className="h-4 w-4 text-blue-500" />
            <span className="flex-1 text-gray-900 text-sm">{email}</span>
            <button
              type="button"
              onClick={() => removeEmail(i)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 shrink-0 text-gray-400" />
            <Input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="h-9 flex-1 border-gray-200 font-dm text-sm"
              placeholder="student@email.com"
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
            Use this for exceptions or students with non-standard email
            addresses
          </p>
        </div>
      </div>

      {/* Grade Level Restrictions */}
      <div>
        <h4 className="mb-1 font-semibold text-gray-900 text-sm">
          Access Restrictions
        </h4>
        <p className="mb-3 text-gray-500 text-xs">
          Limit platform access for specific grade levels
        </p>
        <div className="mb-4 rounded-lg bg-amber-50 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="font-semibold text-amber-800 text-sm">
              Grade Level Restrictions
            </span>
          </div>
          <p className="mt-1 text-amber-700 text-xs">
            Students in restricted grade levels will not be able to access the
            platform, even if they have active accounts.
          </p>
        </div>
        <h5 className="mb-3 font-medium text-gray-700 text-sm">
          Restrict Access for Grade Levels
        </h5>
        <div className="grid grid-flow-col grid-cols-2 grid-rows-7 gap-3">
          {gradeEntries.map(([key, val]) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={formData.restrictedGrades.includes(key)}
                onChange={() => toggleGradeRestriction(key)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900 text-sm">
                  {val.label}
                </span>
                <span className="ml-2 text-gray-500 text-xs">{val.sub}</span>
              </div>
              <Lock className="h-4 w-4 text-gray-300" />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
