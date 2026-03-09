"use client";

import { Building2, FileText, Plus, UserPlus, Users, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import { AddUserModal } from "./organizations/add-location/~lib/add-user-modal";

// Mock aggregate data - no patient names or clinical info
const MOCK_ORGANIZATIONS = [
  { id: "1", name: "Downtown Mental Health Center", patients: 142, ratePerPatient: 25 },
  { id: "2", name: "Westside Behavioral Health", patients: 98, ratePerPatient: 30 },
  { id: "3", name: "North County Wellness Clinic", patients: 156, ratePerPatient: 22 },
  { id: "4", name: "Harbor View Psychiatry", patients: 91, ratePerPatient: 28 },
];

const MOCK_LOCATIONS_BY_ORG: Record<string, { id: string; name: string }[]> = {
  "1": [{ id: "1a", name: "Main Office" }, { id: "1b", name: "Satellite Clinic" }],
  "2": [{ id: "2a", name: "Primary Location" }],
  "3": [{ id: "3a", name: "North Campus" }, { id: "3b", name: "South Campus" }],
  "4": [{ id: "4a", name: "Harbor Building A" }, { id: "4b", name: "Harbor Building B" }],
};

const MOCK_PROVIDERS_BY_LOCATION: Record<string, { id: string; name: string }[]> = {
  "1a": [{ id: "p1", name: "Dr. Sarah Johnson" }, { id: "p2", name: "Dr. Michael Chen" }],
  "1b": [{ id: "p3", name: "Lisa Martinez, LCSW" }],
  "2a": [{ id: "p4", name: "Dr. Emily Williams" }, { id: "p5", name: "Dr. Robert Taylor" }, { id: "p6", name: "Jennifer Adams, LMFT" }],
  "3a": [{ id: "p7", name: "Dr. Amanda Foster" }],
  "3b": [{ id: "p8", name: "Dr. James Wilson" }],
  "4a": [{ id: "p9", name: "Dr. Patricia Brown" }, { id: "p10", name: "Dr. David Lee" }],
  "4b": [{ id: "p11", name: "Maria Garcia, LCSW" }, { id: "p12", name: "Dr. Kevin Park" }],
};

const AGGREGATE_METRICS = {
  totalOrganizations: MOCK_ORGANIZATIONS.length,
  totalProviders: 32,
  totalPatients: MOCK_ORGANIZATIONS.reduce((sum, c) => sum + c.patients, 0),
};

// Calculate estimated monthly revenue: sum of (patients × rate) per organization
const estimatedMonthlyRevenue = MOCK_ORGANIZATIONS.reduce(
  (sum, org) => sum + org.patients * org.ratePerPatient,
  0
);


export default function DashboardAdminPage() {
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");

  const availableLocations = selectedOrg ? MOCK_LOCATIONS_BY_ORG[selectedOrg] ?? [] : [];
  const availableProviders = selectedLocation ? MOCK_PROVIDERS_BY_LOCATION[selectedLocation] ?? [] : [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-semibold text-2xl text-gray-900">Psyflo Admin Dashboard</h1>
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
          <p className="font-bold text-3xl text-gray-900">{AGGREGATE_METRICS.totalOrganizations}</p>
          <p className="text-gray-500 text-sm">Total Organizations</p>
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
          <p className="font-bold text-3xl text-gray-900">{AGGREGATE_METRICS.totalPatients}</p>
          <p className="text-gray-500 text-sm">Total Patients</p>
          <p className="mt-1 text-gray-400 text-xs italic">Count only — no patient data</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
            <FileText className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="font-bold text-3xl text-gray-900">${estimatedMonthlyRevenue.toLocaleString()}</p>
          <p className="text-gray-500 text-sm">Est. Monthly Revenue</p>
          <p className="mt-1 text-gray-400 text-xs italic">Per-clinic rates applied</p>
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
          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-sm text-white transition-colors hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4" />
            Add User
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
                  setSelectedOrg("");
                  setSelectedLocation("");
                  setSelectedProvider("");
                }}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Organization Selection */}
              <div>
                <label className="mb-1.5 block font-medium text-gray-700 text-sm">
                  Select Organization
                </label>
                <select
                  value={selectedOrg}
                  onChange={(e) => {
                    setSelectedOrg(e.target.value);
                    setSelectedLocation("");
                    setSelectedProvider("");
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">Choose an organization...</option>
                  {MOCK_ORGANIZATIONS.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Selection */}
              <div>
                <label className="mb-1.5 block font-medium text-gray-700 text-sm">
                  Select Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setSelectedProvider("");
                  }}
                  disabled={!selectedOrg}
                  className={cn(
                    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500",
                    !selectedOrg && "cursor-not-allowed bg-gray-50 text-gray-400"
                  )}
                >
                  <option value="">Choose a location...</option>
                  {availableLocations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
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
                  disabled={!selectedLocation}
                  className={cn(
                    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500",
                    !selectedLocation && "cursor-not-allowed bg-gray-50 text-gray-400"
                  )}
                >
                  <option value="">Choose a provider...</option>
                  {availableProviders.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
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
                    setSelectedOrg("");
                    setSelectedLocation("");
                    setSelectedProvider("");
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  disabled={!selectedOrg || !selectedLocation || !selectedProvider}
                  className={cn(
                    "rounded-lg px-4 py-2 font-medium text-sm text-white transition-colors",
                    selectedOrg && selectedLocation && selectedProvider
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

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onSave={async (data) => {
            console.log("User added:", data);
          }}
        />
      )}
    </div>
  );
}
