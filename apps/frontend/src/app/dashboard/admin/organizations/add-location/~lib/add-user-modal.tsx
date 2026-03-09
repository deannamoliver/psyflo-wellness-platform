"use client";

import { Building2, Check, CreditCard, Loader2, Mail, Phone, Plus, Stethoscope, Trash2, Upload, User, UserCircle, Users, X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/lib/core-ui/input";
import { cn } from "@/lib/tailwind-utils";
import { FormField, FormRow } from "./form-section";
import type { StaffMember } from "./types";

type Props = {
  onClose: () => void;
  onSave: (user: Omit<StaffMember, "id">) => void | Promise<void>;
  initialData?: StaffMember;
};

type Role = "practice_management" | "provider";

type AccessType = {
  value: Role;
  label: string;
  description: string;
  icon: typeof Building2;
  iconBg: string;
  iconColor: string;
};

const ACCESS_TYPES: AccessType[] = [
  {
    value: "practice_management",
    label: "Practice Management",
    description: "Full access to practice management dashboard. Can manage organization settings, view reports, and oversee all providers and patients.",
    icon: Building2,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
  {
    value: "provider",
    label: "Provider Dashboard",
    description: "Access to provider dashboard for direct patient care. Can view assigned patients, manage appointments, and conduct sessions.",
    icon: Stethoscope,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
];


const LICENSE_TYPES = [
  "MD",
  "DO",
  "PhD",
  "PsyD",
  "LCSW",
  "LMFT",
  "LPC",
  "LPCC",
  "NP",
  "PA",
  "RN",
  "Other",
];

const INSURANCE_CATEGORIES = [
  { id: "private", label: "Private/Commercial", placeholder: "e.g., Aetna, Blue Cross, Cigna..." },
  { id: "public", label: "Public (Medicaid/Medicare/VA)", placeholder: "e.g., Medicare Part B, Medicaid, VA..." },
  { id: "other", label: "Other", placeholder: "e.g., Workers comp, EAP..." },
];

const INSURANCE_SUGGESTIONS: Record<string, string[]> = {
  private: ["Aetna", "Anthem Blue Cross", "Blue Cross Blue Shield", "Cigna", "Humana", "Kaiser Permanente", "Oscar Health", "UnitedHealthcare", "Optum", "Centene", "Molina"],
  public: ["Medicare Part A", "Medicare Part B", "Medicare Advantage", "Medicaid", "VA Health Benefits", "TRICARE", "CHIP"],
  other: ["Workers Compensation", "EAP", "Auto Insurance (PIP)", "Legal Settlement"],
};

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL",
  "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
  "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH",
  "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

export const ROLE_LABELS: Record<Role, string> = {
  practice_management: "Practice Management",
  provider: "Provider",
};

export function AddUserModal({ onClose, onSave, initialData }: Props) {
  const isEditing = !!initialData;
  const [firstName, setFirstName] = useState(initialData?.firstName ?? "");
  const [lastName, setLastName] = useState(initialData?.lastName ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phone ?? "");
  const [roleTitle, setRoleTitle] = useState(initialData?.roleTitle ?? "");
  const [role, setRole] = useState<Role>(initialData?.role === "practice_management" ? "practice_management" : "provider");
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [patients, setPatients] = useState<Array<{ contact: string; type: "email" | "phone" }>>(
    initialData?.patients ?? 
    (initialData?.patientEmails?.map(e => ({ contact: e, type: "email" as const })) ?? [])
  );
  const [newPatientContact, setNewPatientContact] = useState("");
  const [newPatientType, setNewPatientType] = useState<"email" | "phone">("email");
  const [acceptsInsurance, setAcceptsInsurance] = useState(initialData?.acceptsInsurance ?? true);
  const [acceptedInsurance, setAcceptedInsurance] = useState<Record<string, string[]>>(initialData?.acceptedInsurance ?? { private: [], public: [], other: [] });
  const [insuranceInputs, setInsuranceInputs] = useState<Record<string, string>>({ private: "", public: "", other: "" });
  const [npi, setNpi] = useState(initialData?.npi ?? "");
  const [licenseTypes, setLicenseTypes] = useState<string[]>(initialData?.licenseTypes ?? (initialData?.licenseType ? [initialData.licenseType] : []));
  const [licensedStates, setLicensedStates] = useState<string[]>(initialData?.licensedStates ?? []);
  const [saving, setSaving] = useState(false);
  const [patientUploadMode, setPatientUploadMode] = useState<"single" | "bulk">("single");
  const [bulkPatientText, setBulkPatientText] = useState("");

  function parseBulkPatients(text: string): Array<{ contact: string; type: "email" | "phone" }> {
    const lines = text.trim().split("\n").filter(l => l.trim());
    const parsed: Array<{ contact: string; type: "email" | "phone" }> = [];
    
    for (const line of lines) {
      const values = line.split(",").map(v => v.trim()).filter(v => v);
      for (const value of values) {
        if (patients.some(p => p.contact === value)) continue;
        const isEmail = value.includes("@");
        parsed.push({ contact: value, type: isEmail ? "email" : "phone" });
      }
    }
    return parsed;
  }

  function addBulkPatients() {
    const newPatients = parseBulkPatients(bulkPatientText);
    if (newPatients.length > 0) {
      setPatients([...patients, ...newPatients]);
      setBulkPatientText("");
      setPatientUploadMode("single");
    }
  }

  function addPatient() {
    if (newPatientContact.trim() && !patients.some(p => p.contact === newPatientContact.trim())) {
      setPatients([...patients, { contact: newPatientContact.trim(), type: newPatientType }]);
      setNewPatientContact("");
    }
  }

  function removePatient(contactToRemove: string) {
    setPatients(patients.filter((p) => p.contact !== contactToRemove));
  }

  function addInsuranceToCategory(categoryId: string, value: string) {
    if (!value.trim()) return;
    setAcceptedInsurance((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId]?.includes(value.trim()) ? prev[categoryId] : [...(prev[categoryId] || []), value.trim()]
    }));
    setInsuranceInputs((prev) => ({ ...prev, [categoryId]: "" }));
  }

  function removeInsuranceFromCategory(categoryId: string, value: string) {
    setAcceptedInsurance((prev) => ({
      ...prev,
      [categoryId]: (prev[categoryId] || []).filter((i) => i !== value)
    }));
  }

  function getFilteredSuggestions(categoryId: string, input: string): string[] {
    const suggestions = INSURANCE_SUGGESTIONS[categoryId] || [];
    const existing = acceptedInsurance[categoryId] || [];
    return suggestions
      .filter((s) => s.toLowerCase().includes(input.toLowerCase()) && !existing.includes(s))
      .slice(0, 5);
  }

  function toggleLicensedState(state: string) {
    setLicensedStates((prev) =>
      prev.includes(state)
        ? prev.filter((s) => s !== state)
        : [...prev, state]
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white font-dm shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 rounded-t-xl bg-blue-600 px-6 py-4 text-white">
          <User className="h-5 w-5" />
          <span className="font-semibold text-lg">
            {isEditing ? "Edit User" : "Add User to Location"}
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
          <FormField label="Phone Number">
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
          <FormField label="Job Title">
            <Input
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="h-10 border-gray-200 font-dm"
              placeholder="e.g., Psychiatrist, Practice Manager"
            />
          </FormField>

          {/* Provider NPI */}
          <FormField label="Individual Provider NPI" required>
            <Input
              value={npi}
              onChange={(e) => setNpi(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="h-10 border-gray-200 font-dm"
              placeholder="10-digit NPI number"
              maxLength={10}
            />
            <p className="mt-1 text-gray-400 text-xs">Required for billing purposes</p>
          </FormField>

          {/* License Types (Multiple Selection) */}
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <label className="mb-2 block font-medium text-gray-700 text-sm">
              License Type(s) <span className="text-red-500">*</span>
            </label>
            <p className="mb-3 text-gray-500 text-xs">
              Select all credentials/license types that apply
            </p>
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
            <div className="flex flex-wrap gap-1.5">
              {US_STATES.map((state) => {
                const isSelected = licensedStates.includes(state);
                return (
                  <button
                    key={state}
                    type="button"
                    onClick={() => toggleLicensedState(state)}
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
              <p className="mt-2 text-teal-600 text-xs font-medium">
                {licensedStates.length} state{licensedStates.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Access Type */}
          <div>
            <label className="mb-2 block font-medium text-gray-700 text-sm">
              Dashboard Access <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ACCESS_TYPES.map((accessType) => {
                const Icon = accessType.icon;
                const isSelected = role === accessType.value;
                return (
                  <button
                    key={accessType.value}
                    type="button"
                    onClick={() => setRole(accessType.value)}
                    className={cn(
                      "relative flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-all",
                      isSelected
                        ? "border-blue-600 bg-blue-50/50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", accessType.iconBg)}>
                        <Icon className={cn("h-5 w-5", accessType.iconColor)} />
                      </div>
                      <span className="font-semibold text-gray-900">{accessType.label}</span>
                    </div>
                    <p className="text-gray-500 text-xs">{accessType.description}</p>
                    {isSelected && (
                      <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accepted Insurance */}
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-600" />
                <label className="font-medium text-gray-700 text-sm">
                  Accepted Insurance
                </label>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptsInsurance}
                  onChange={(e) => setAcceptsInsurance(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Accepts Insurance</span>
              </label>
            </div>
            {acceptsInsurance && (
              <>
                <p className="mb-3 text-gray-500 text-xs">
                  Add insurance plans by category. Type to search or add custom entries.
                </p>
                <div className="space-y-4">
                  {INSURANCE_CATEGORIES.map((category) => {
                const categoryInsurances = acceptedInsurance[category.id] || [];
                const inputValue = insuranceInputs[category.id] || "";
                const suggestions = inputValue.length > 0 ? getFilteredSuggestions(category.id, inputValue) : [];
                
                return (
                  <div key={category.id} className="rounded-lg border border-gray-200 bg-white p-3">
                    <label className="mb-2 block font-medium text-gray-700 text-xs">
                      {category.label}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInsuranceInputs((prev) => ({ ...prev, [category.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addInsuranceToCategory(category.id, inputValue);
                          }
                        }}
                        placeholder={category.placeholder}
                        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {suggestions.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                          {suggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => addInsuranceToCategory(category.id, suggestion)}
                              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {categoryInsurances.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {categoryInsurances.map((ins) => (
                          <span
                            key={ins}
                            className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                          >
                            {ins}
                            <button
                              type="button"
                              onClick={() => removeInsuranceFromCategory(category.id, ins)}
                              className="ml-0.5 text-green-600 hover:text-green-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
                </div>
              </>
            )}
          </div>

          {/* Patient Assignment */}
          <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <label className="font-medium text-gray-700 text-sm">
                  Assigned Patients
                </label>
                {patients.length > 0 && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                    {patients.length}
                  </span>
                )}
              </div>
            </div>
            <p className="mb-4 text-gray-500 text-xs">
              Add patients by email or phone number to assign them to this user's caseload
            </p>

            {/* Mode Toggle for Patient Input */}
            <div className="flex rounded-lg border border-blue-200 p-1 bg-blue-50/50 mb-4">
              <button
                type="button"
                onClick={() => setPatientUploadMode("single")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  patientUploadMode === "single"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-blue-600 hover:text-blue-700"
                )}
              >
                <UserCircle className="h-3.5 w-3.5" />
                Add One
              </button>
              <button
                type="button"
                onClick={() => setPatientUploadMode("bulk")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  patientUploadMode === "bulk"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-blue-600 hover:text-blue-700"
                )}
              >
                <Upload className="h-3.5 w-3.5" />
                Bulk Import
              </button>
            </div>
            
            {/* Add Patient Input */}
            {patientUploadMode === "single" ? (
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border border-blue-200 bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setNewPatientType("email")}
                      className={cn(
                        "px-3 py-1.5 text-sm font-medium transition-colors",
                        newPatientType === "email"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPatientType("phone")}
                      className={cn(
                        "px-3 py-1.5 text-sm font-medium transition-colors",
                        newPatientType === "phone"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 flex items-center gap-2 rounded-lg border border-blue-200 bg-white p-2">
                    <UserCircle className="h-5 w-5 shrink-0 text-blue-400" />
                    <Input
                      value={newPatientContact}
                      onChange={(e) => setNewPatientContact(e.target.value)}
                      className="h-8 flex-1 border-0 bg-transparent font-dm text-sm focus-visible:ring-0"
                      placeholder={newPatientType === "email" ? "patient@email.com" : "(555) 123-4567"}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPatient())}
                    />
                    <button
                      type="button"
                      onClick={addPatient}
                      disabled={!newPatientContact.trim()}
                      className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 font-medium text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4 space-y-3">
                <p className="text-gray-500 text-xs">
                  Paste patient emails or phone numbers (one per line, or comma-separated)
                </p>
                <textarea
                  value={bulkPatientText}
                  onChange={(e) => setBulkPatientText(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-blue-200 px-3 py-2 font-mono text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="patient1@email.com
patient2@email.com
555-123-4567
555-987-6543"
                />
                <div className="flex items-center justify-between">
                  <p className="text-gray-400 text-xs">
                    {parseBulkPatients(bulkPatientText).length} patient{parseBulkPatients(bulkPatientText).length !== 1 ? 's' : ''} detected
                  </p>
                  <button
                    type="button"
                    onClick={addBulkPatients}
                    disabled={parseBulkPatients(bulkPatientText).length === 0}
                    className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 font-medium text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add {parseBulkPatients(bulkPatientText).length} Patient{parseBulkPatients(bulkPatientText).length !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            )}

            {/* Patient List */}
            {patients.length > 0 ? (
              <div className="space-y-2">
                {patients.map((patient, index) => (
                  <div
                    key={patient.contact}
                    className="flex items-center gap-3 rounded-lg border border-blue-100 bg-white p-3 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold text-sm">
                      {patient.contact.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {patient.type === "email" ? (
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                        ) : (
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                        )}
                        <p className="font-medium text-gray-900 text-sm truncate">{patient.contact}</p>
                      </div>
                      <p className="text-gray-400 text-xs">Patient #{index + 1}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePatient(patient.contact)}
                      className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-gray-500 text-xs hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-200 bg-white/50 py-6">
                <Users className="h-8 w-8 text-blue-300 mb-2" />
                <p className="text-gray-500 text-sm">No patients assigned yet</p>
                <p className="text-gray-400 text-xs">Add patient email or phone above to build this user's caseload</p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block font-medium text-gray-700 text-sm">
              Internal Notes <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-200 px-3 py-2 font-dm text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Add any internal notes about this user..."
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
                    patients,
                    acceptsInsurance,
                    acceptedInsurance: acceptsInsurance ? acceptedInsurance : undefined,
                    npi: npi.trim(),
                    licenseTypes,
                    licensedStates,
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
