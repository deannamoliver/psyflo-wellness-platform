"use client";

import { Building2, ChevronDown, ChevronUp, CreditCard, Mail, Pencil, Phone, Plus, Shield, Stethoscope, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import { AddUserModal, ROLE_LABELS } from "./add-user-modal";
import { FormSection } from "./form-section";
import type { LocationFormData, StaffMember } from "./types";

type Props = {
  formData: LocationFormData;
  updateForm: (updates: Partial<LocationFormData>) => void;
};

export function Step2Roles({ formData, updateForm }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const editingMember = editingId
    ? formData.staff.find((s) => s.id === editingId)
    : undefined;

  const providers = formData.staff.filter((s) => s.role === "provider");
  const practiceManagers = formData.staff.filter((s) => s.role === "practice_management");

  function openAdd() {
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(id: string) {
    setEditingId(id);
    setModalOpen(true);
  }

  function closeModal() {
    setEditingId(null);
    setModalOpen(false);
  }

  function handleSave(data: Omit<StaffMember, "id">) {
    if (editingId) {
      updateForm({
        staff: formData.staff.map((s) =>
          s.id === editingId ? { ...data, id: editingId } : s,
        ),
      });
    } else {
      updateForm({
        staff: [...formData.staff, { id: String(Date.now()), ...data }],
      });
    }
  }

  function removeStaff(id: string) {
    updateForm({ staff: formData.staff.filter((s) => s.id !== id) });
  }

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  return (
    <>
      <FormSection
        icon={<Shield className="h-5 w-5" />}
        title="Users & Roles for This Location"
        description="Manage staff access, providers, and patient assignments"
      >
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-sm text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>

        {formData.staff.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 py-12">
            <Users className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No users added yet</p>
            <p className="text-gray-400 text-sm mt-1">Add users to manage this location</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Practice Management Users */}
            {practiceManagers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-teal-600" />
                  <h4 className="font-semibold text-gray-900">Practice Management</h4>
                  <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">
                    {practiceManagers.length}
                  </span>
                </div>
                <div className="grid gap-3">
                  {practiceManagers.map((member) => {
                    const patientCount = member.patients?.length || member.patientEmails?.length || 0;
                    const insuranceCount = member.acceptedInsurance 
                      ? Object.values(member.acceptedInsurance).flat().length 
                      : 0;
                    
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-semibold">
                            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                            <p className="text-gray-500 text-sm">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {/* Stats */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-sm">
                              <Users className="h-4 w-4 text-blue-500" />
                              <span className={patientCount > 0 ? "text-gray-700 font-medium" : "text-gray-400"}>
                                {patientCount} patient{patientCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm">
                              <CreditCard className="h-4 w-4 text-green-500" />
                              <span className={insuranceCount > 0 ? "text-gray-700 font-medium" : "text-gray-400"}>
                                {insuranceCount} plan{insuranceCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(member.id)}
                              className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-gray-600 text-sm hover:bg-gray-50"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeStaff(member.id)}
                              className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-red-500 text-sm hover:bg-red-50 hover:border-red-200"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Providers with Patient Assignments */}
            {providers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Stethoscope className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Providers</h4>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {providers.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {providers.map((member) => {
                    const isExpanded = expandedId === member.id;
                    const patientCount = member.patients?.length || member.patientEmails?.length || 0;
                    const insuranceCount = member.acceptedInsurance 
                      ? Object.values(member.acceptedInsurance).flat().length 
                      : 0;
                    
                    return (
                      <div
                        key={member.id}
                        className="rounded-lg border border-gray-200 bg-white overflow-hidden"
                      >
                        {/* Provider Header */}
                        <div 
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleExpand(member.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold">
                              {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                              <p className="text-gray-500 text-sm">{member.email}</p>
                              {member.roleTitle && (
                                <p className="text-gray-400 text-xs mt-0.5">{member.roleTitle}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {/* Stats */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 text-sm">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span className={patientCount > 0 ? "text-gray-700 font-medium" : "text-gray-400"}>
                                  {patientCount} patient{patientCount !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-sm">
                                <CreditCard className="h-4 w-4 text-green-500" />
                                <span className={insuranceCount > 0 ? "text-gray-700 font-medium" : "text-gray-400"}>
                                  {insuranceCount} plan{insuranceCount !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); openEdit(member.id); }}
                                className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-gray-600 text-sm hover:bg-gray-50"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeStaff(member.id); }}
                                className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-red-500 text-sm hover:bg-red-50 hover:border-red-200"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                            <div className="grid grid-cols-2 gap-6">
                              {/* Assigned Patients */}
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <Users className="h-4 w-4 text-blue-600" />
                                  <h5 className="font-medium text-gray-700 text-sm">Assigned Patients</h5>
                                </div>
                                {patientCount > 0 ? (
                                  <div className="space-y-2">
                                    {(member.patients || member.patientEmails?.map(e => ({ contact: e, type: "email" as const })) || []).map((patient) => (
                                      <div
                                        key={typeof patient === "string" ? patient : patient.contact}
                                        className="flex items-center gap-3 rounded-lg bg-white border border-gray-200 p-2.5"
                                      >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-medium text-sm">
                                          {(typeof patient === "string" ? patient : patient.contact).charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0 flex items-center gap-2">
                                          {typeof patient !== "string" && patient.type === "phone" ? (
                                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                                          ) : (
                                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                                          )}
                                          <p className="text-sm text-gray-900 truncate">
                                            {typeof patient === "string" ? patient : patient.contact}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 text-center">
                                    <Mail className="h-6 w-6 text-gray-300 mx-auto mb-1" />
                                    <p className="text-gray-400 text-sm">No patients assigned</p>
                                  </div>
                                )}
                              </div>

                              {/* Accepted Insurance */}
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <CreditCard className="h-4 w-4 text-green-600" />
                                  <h5 className="font-medium text-gray-700 text-sm">Accepted Insurance</h5>
                                </div>
                                {insuranceCount > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {member.acceptedInsurance && Object.values(member.acceptedInsurance).flat().map((insurance) => (
                                      <span
                                        key={insurance}
                                        className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-3 py-1 text-green-700 text-sm"
                                      >
                                        {insurance}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 text-center">
                                    <CreditCard className="h-6 w-6 text-gray-300 mx-auto mb-1" />
                                    <p className="text-gray-400 text-sm">No insurance plans</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </FormSection>

      {modalOpen && (
        <AddUserModal
          onClose={closeModal}
          onSave={handleSave}
          initialData={editingMember}
        />
      )}
    </>
  );
}
