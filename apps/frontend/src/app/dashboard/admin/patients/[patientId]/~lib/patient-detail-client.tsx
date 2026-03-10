"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Building2,
  Calendar,
  CheckCircle,
  Edit2,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/tailwind-utils";
import type { PatientDetail } from "./patient-detail-queries";

type Props = { patient: PatientDetail };

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-gray-400" />
      <div className="flex-1">
        <p className="font-medium text-gray-500 text-xs">{label}</p>
        <p className="text-gray-900 text-sm">
          {value ?? <span className="italic text-gray-400">Not provided</span>}
        </p>
      </div>
    </div>
  );
}

function EditAssignmentModal({
  patient,
  onClose,
}: {
  patient: PatientDetail;
  onClose: () => void;
}) {
  // Get current assignment info
  const currentOrg = patient.organizations[0];
  const currentLocation = patient.locations[0];
  const currentProvider = patient.locations[0]?.assignedProviderId;

  const [selectedOrgId, setSelectedOrgId] = useState(currentOrg?.id ?? "");
  const [selectedLocationId, setSelectedLocationId] = useState(currentLocation?.id ?? "");
  const [selectedProviderId, setSelectedProviderId] = useState(currentProvider ?? "");

  // Mock data for cascading dropdowns - in production this would come from patient prop
  const mockOrganizations = [
    { id: "org1", name: "Downtown Mental Health Center" },
    { id: "org2", name: "Westside Behavioral Health" },
    { id: "org3", name: "North County Wellness Clinic" },
    ...(patient.availableOrganizations || []),
  ];

  const mockLocationsByOrg: Record<string, { id: string; name: string }[]> = {
    org1: [
      { id: "loc1a", name: "Main Office" },
      { id: "loc1b", name: "Satellite Clinic" },
    ],
    org2: [
      { id: "loc2a", name: "Primary Location" },
    ],
    org3: [
      { id: "loc3a", name: "North Campus" },
      { id: "loc3b", name: "South Campus" },
    ],
  };

  const mockProvidersByLocation: Record<string, { id: string; name: string; email: string }[]> = {
    loc1a: [
      { id: "p1", name: "Dr. Sarah Johnson", email: "sarah.j@example.com" },
      { id: "p2", name: "Dr. Michael Chen", email: "m.chen@example.com" },
    ],
    loc1b: [
      { id: "p3", name: "Lisa Martinez, LCSW", email: "l.martinez@example.com" },
    ],
    loc2a: [
      { id: "p4", name: "Dr. Emily Williams", email: "e.williams@example.com" },
      { id: "p5", name: "Dr. Robert Taylor", email: "r.taylor@example.com" },
    ],
    loc3a: [
      { id: "p6", name: "Dr. Amanda Foster", email: "a.foster@example.com" },
    ],
    loc3b: [
      { id: "p7", name: "Dr. James Wilson", email: "j.wilson@example.com" },
    ],
  };

  const availableLocations = mockLocationsByOrg[selectedOrgId] ?? [];
  const availableProviders = mockProvidersByLocation[selectedLocationId] ?? patient.availableProviders ?? [];

  const handleOrgChange = (orgId: string) => {
    setSelectedOrgId(orgId);
    setSelectedLocationId("");
    setSelectedProviderId("");
  };

  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId);
    setSelectedProviderId("");
  };

  const handleSave = () => {
    // TODO: Implement save functionality via server action
    console.log("Saving assignment:", { selectedOrgId, selectedLocationId, selectedProviderId });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-lg">Edit Provider Assignment</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Organization Selection */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 font-medium text-gray-700 text-sm">
              <Building2 className="size-4 text-gray-500" />
              Organization
            </label>
            <select
              value={selectedOrgId}
              onChange={(e) => handleOrgChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select organization...</option>
              {mockOrganizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Selection */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 font-medium text-gray-700 text-sm">
              <MapPin className="size-4 text-gray-500" />
              Location
            </label>
            <select
              value={selectedLocationId}
              onChange={(e) => handleLocationChange(e.target.value)}
              disabled={!selectedOrgId}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">{selectedOrgId ? "Select location..." : "Select organization first"}</option>
              {availableLocations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
            {selectedOrgId && availableLocations.length === 0 && (
              <p className="mt-1 text-amber-600 text-xs">
                No locations available for this organization.
              </p>
            )}
          </div>

          {/* Provider Selection */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 font-medium text-gray-700 text-sm">
              <User className="size-4 text-gray-500" />
              Provider
            </label>
            <select
              value={selectedProviderId}
              onChange={(e) => setSelectedProviderId(e.target.value)}
              disabled={!selectedLocationId}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">{selectedLocationId ? "Select provider..." : "Select location first"}</option>
              {availableProviders.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} ({provider.email})
                </option>
              ))}
            </select>
            {selectedLocationId && availableProviders.length === 0 && (
              <p className="mt-1 text-amber-600 text-xs">
                No providers available at this location.
              </p>
            )}
          </div>

          {/* Summary */}
          {selectedOrgId && selectedLocationId && selectedProviderId && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="font-medium text-blue-800 text-sm">Assignment Summary</p>
              <div className="mt-2 space-y-1 text-blue-700 text-xs">
                <p><span className="font-medium">Organization:</span> {mockOrganizations.find(o => o.id === selectedOrgId)?.name}</p>
                <p><span className="font-medium">Location:</span> {availableLocations.find(l => l.id === selectedLocationId)?.name}</p>
                <p><span className="font-medium">Provider:</span> {availableProviders.find(p => p.id === selectedProviderId)?.name}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedOrgId || !selectedLocationId || !selectedProviderId}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmActionModal({
  title,
  message,
  confirmLabel,
  confirmVariant,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant: "danger" | "warning";
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className={cn(
            "flex size-10 items-center justify-center rounded-full",
            confirmVariant === "danger" ? "bg-red-100" : "bg-amber-100"
          )}>
            <AlertTriangle className={cn(
              "size-5",
              confirmVariant === "danger" ? "text-red-600" : "text-amber-600"
            )} />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
        </div>
        <p className="mb-6 text-gray-600 text-sm">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              "rounded-lg px-4 py-2 font-medium text-sm text-white",
              confirmVariant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-amber-600 hover:bg-amber-700"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PatientDetailClient({ patient }: Props) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [editEmail, setEditEmail] = useState(patient.email ?? "");
  const [editPhone, setEditPhone] = useState(patient.phone ?? "");

  const statusConfig = {
    active: { bg: "bg-green-100", text: "text-green-700" },
    inactive: { bg: "bg-gray-100", text: "text-gray-600" },
    blocked: { bg: "bg-red-100", text: "text-red-700" },
    archived: { bg: "bg-gray-100", text: "text-gray-600" },
  };

  const status = patient.accountStatus.toLowerCase() as keyof typeof statusConfig;
  const config = statusConfig[status] ?? statusConfig.active;
  const isActive = status === "active";
  const isInactive = status === "blocked" || status === "archived" || status === "inactive";

  const handleDeactivate = () => {
    // TODO: Implement deactivate via server action
    console.log("Deactivating patient:", patient.id);
  };

  const handleActivate = () => {
    // TODO: Implement activate via server action
    console.log("Activating patient:", patient.id);
  };

  const handleSaveContact = () => {
    // TODO: Implement save contact via server action
    console.log("Saving contact:", { email: editEmail, phone: editPhone });
    setShowEditContactModal(false);
  };

  return (
    <>
      {showEditModal && (
        <EditAssignmentModal patient={patient} onClose={() => setShowEditModal(false)} />
      )}
      {showDeactivateModal && (
        <ConfirmActionModal
          title="Deactivate Patient"
          message={`Are you sure you want to deactivate ${patient.name}? They will no longer be able to access the platform.`}
          confirmLabel="Deactivate Patient"
          confirmVariant="warning"
          onConfirm={handleDeactivate}
          onClose={() => setShowDeactivateModal(false)}
        />
      )}
      {showActivateModal && (
        <ConfirmActionModal
          title="Activate Patient"
          message={`Are you sure you want to reactivate ${patient.name}? They will regain access to the platform.`}
          confirmLabel="Activate Patient"
          confirmVariant="warning"
          onConfirm={handleActivate}
          onClose={() => setShowActivateModal(false)}
        />
      )}
      {showEditContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-lg">Edit Contact Information</h3>
              <button
                onClick={() => setShowEditContactModal(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block font-medium text-gray-700 text-sm">
                  Email Address
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
                  <Mail className="size-4 text-gray-400" />
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="flex-1 text-sm outline-none"
                    placeholder="patient@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block font-medium text-gray-700 text-sm">
                  Phone Number
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
                  <Phone className="size-4 text-gray-400" />
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="flex-1 text-sm outline-none"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowEditContactModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContact}
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-sm text-white hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-6 p-8 font-dm">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Link
          href="/dashboard/admin/patients"
          className="flex items-center gap-1 hover:text-gray-700"
        >
          <ArrowLeft className="size-4" />
          Patients
        </Link>
        <span>/</span>
        <span className="text-gray-900">{patient.name}</span>
      </div>

      {/* Profile Header */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-100 font-bold text-green-600 text-xl">
            {patient.firstName?.[0]}
            {patient.lastName?.[0]}
          </div>
          <div>
            <h1 className="font-bold text-2xl text-gray-900">{patient.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold text-xs",
                  "bg-green-100 text-green-700",
                )}
              >
                Patient
              </span>
              <span
                className={cn(
                  "inline-block rounded-full px-3 py-1 font-semibold text-xs capitalize",
                  config.bg,
                  config.text,
                )}
              >
                {patient.accountStatus}
              </span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isInactive && (
            <button
              onClick={() => setShowActivateModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-2 font-medium text-green-700 text-sm hover:bg-green-100"
            >
              <CheckCircle className="size-4" />
              Reactivate
            </button>
          )}
          {isActive && (
            <button
              onClick={() => setShowDeactivateModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 font-medium text-amber-700 text-sm hover:bg-amber-100"
            >
              <Ban className="size-4" />
              Deactivate
            </button>
          )}
        </div>
      </div>

      {/* Info Note - Admin cannot view patient data */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <p className="text-blue-700 text-sm">
          <strong>Note:</strong> As an admin, you can only view account information for this patient. 
          Clinical data and patient health information are not accessible from the admin portal.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contact Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-lg">
              Contact Information
            </h2>
            <button
              onClick={() => setShowEditContactModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 text-sm hover:bg-gray-50"
            >
              <Edit2 className="size-4" />
              Edit
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            <InfoRow icon={Mail} label="Email" value={patient.email} />
            <InfoRow icon={Phone} label="Phone" value={patient.phone} />
            <InfoRow
              icon={Building2}
              label="Organization"
              value={
                patient.organizations.length > 0
                  ? patient.organizations.map((o) => o.name).join(", ")
                  : null
              }
            />
            <InfoRow
              icon={MapPin}
              label="Location(s)"
              value={
                patient.locations.length > 0 ? (
                  <span className="flex flex-wrap gap-1.5">
                    {patient.locations.map((l) => (
                      <span
                        key={l.id}
                        className="rounded-md bg-gray-100 px-2 py-0.5 text-gray-700 text-xs"
                      >
                        {l.name}
                      </span>
                    ))}
                  </span>
                ) : null
              }
            />
          </div>
        </div>

        {/* Account Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 font-semibold text-gray-900 text-lg">
            Account Information
          </h2>
          <div className="divide-y divide-gray-100">
            <InfoRow
              icon={Shield}
              label="Account Type"
              value="Patient"
            />
            <InfoRow
              icon={Shield}
              label="Account Status"
              value={
                <span className="capitalize">{patient.accountStatus}</span>
              }
            />
            <InfoRow
              icon={Calendar}
              label="Date Added"
              value={patient.createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
            <InfoRow
              icon={Calendar}
              label="Last Updated"
              value={patient.updatedAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
          </div>
        </div>
      </div>

      {/* Provider Assignments */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-lg">
            Provider Assignments
          </h2>
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 text-sm hover:bg-gray-50"
          >
            <Edit2 className="size-4" />
            Edit
          </button>
        </div>
        
        {patient.locations.length === 0 ? (
          <p className="italic text-gray-500 text-sm">
            This patient is not assigned to any locations.
          </p>
        ) : (
          <div className="space-y-3">
            {patient.locations.map((location) => (
              <div
                key={location.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                    <MapPin className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{location.name}</p>
                    <p className="text-gray-500 text-xs">Location</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
                    <User className="size-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {location.assignedProviderName ?? (
                        <span className="italic text-gray-400">No provider assigned</span>
                      )}
                    </p>
                    <p className="text-gray-500 text-xs">Assigned Provider</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
