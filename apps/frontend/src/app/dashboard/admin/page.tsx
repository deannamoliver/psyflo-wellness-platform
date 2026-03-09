"use client";

import { Building2, FileText, Plus, UserPlus, Users, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";

// Mock aggregate data - no patient names or clinical info
const AGGREGATE_METRICS = {
  totalClinics: 4,
  totalProviders: 32,
  totalActivePatients: 487,
  claimsFiledThisMonth: 312,
};

const MOCK_CLINICS = [
  { id: "1", name: "Downtown Mental Health Center" },
  { id: "2", name: "Westside Behavioral Health" },
  { id: "3", name: "North County Wellness Clinic" },
  { id: "4", name: "Harbor View Psychiatry" },
];

const MOCK_PROVIDERS_BY_CLINIC: Record<string, string[]> = {
  "1": ["Dr. Sarah Johnson", "Dr. Michael Chen", "Lisa Martinez, LCSW"],
  "2": ["Dr. Emily Williams", "Dr. Robert Taylor", "Jennifer Adams, LMFT"],
  "3": ["Dr. Amanda Foster", "Dr. James Wilson"],
  "4": ["Dr. Patricia Brown", "Dr. David Lee", "Maria Garcia, LCSW", "Dr. Kevin Park"],
};

export default function DashboardAdminPage() {
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");

  const availableProviders = selectedClinic ? MOCK_PROVIDERS_BY_CLINIC[selectedClinic] ?? [] : [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-semibold text-2xl text-gray-900">PsyFlo Admin Dashboard</h1>
        <p className="mt-1 text-gray-500">
          Internal administration — no patient data accessible
        </p>
      </div>

      {/* Aggregate Metrics */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
            <Building2 className="h-5 w-5 text-teal-600" />
          </div>
          <p className="font-bold text-3xl text-gray-900">{AGGREGATE_METRICS.totalClinics}</p>
          <p className="text-gray-500 text-sm">Total Clinics</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <p className="font-bold text-3xl text-gray-900">{AGGREGATE_METRICS.totalProviders}</p>
          <p className="text-gray-500 text-sm">Total Providers</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
            <UserPlus className="h-5 w-5 text-purple-600" />
          </div>
          <p className="font-bold text-3xl text-gray-900">{AGGREGATE_METRICS.totalActivePatients}</p>
          <p className="text-gray-500 text-sm">Total Active Patients</p>
          <p className="mt-1 text-gray-400 text-xs italic">Count only — no patient data</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
            <FileText className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="font-bold text-3xl text-gray-900">{AGGREGATE_METRICS.claimsFiledThisMonth}</p>
          <p className="text-gray-500 text-sm">Claims Filed This Month</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900 text-lg">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAddPatientModal(true)}
            className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-sm text-white transition-colors hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            Add Patient to Caseload
          </button>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-lg">Add Patient to Caseload</h3>
              <button
                onClick={() => {
                  setShowAddPatientModal(false);
                  setSelectedClinic("");
                  setSelectedProvider("");
                }}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Clinic Selection */}
              <div>
                <label className="mb-1.5 block font-medium text-gray-700 text-sm">
                  Select Clinic
                </label>
                <select
                  value={selectedClinic}
                  onChange={(e) => {
                    setSelectedClinic(e.target.value);
                    setSelectedProvider("");
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">Choose a clinic...</option>
                  {MOCK_CLINICS.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Provider Selection */}
              <div>
                <label className="mb-1.5 block font-medium text-gray-700 text-sm">
                  Select Provider
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  disabled={!selectedClinic}
                  className={cn(
                    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500",
                    !selectedClinic && "cursor-not-allowed bg-gray-50 text-gray-400"
                  )}
                >
                  <option value="">Choose a provider...</option>
                  {availableProviders.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient Email */}
              <div>
                <label className="mb-1.5 block font-medium text-gray-700 text-sm">
                  Patient Email Address
                </label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Patient Phone */}
              <div>
                <label className="mb-1.5 block font-medium text-gray-700 text-sm">
                  Patient Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="(555) 123-4567"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Info Note */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                <p className="text-blue-700 text-sm">
                  Patient will be added to this provider's caseload. You will not see the patient's name or clinical data.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddPatientModal(false);
                    setSelectedClinic("");
                    setSelectedProvider("");
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  disabled={!selectedClinic || !selectedProvider}
                  className={cn(
                    "rounded-lg px-4 py-2 font-medium text-sm text-white transition-colors",
                    selectedClinic && selectedProvider
                      ? "bg-teal-600 hover:bg-teal-700"
                      : "cursor-not-allowed bg-gray-300"
                  )}
                >
                  Add Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
