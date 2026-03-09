"use client";

import { Plus, Shield } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/core-ui/table";
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

  const editingMember = editingId
    ? formData.staff.find((s) => s.id === editingId)
    : undefined;

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

  return (
    <>
      <FormSection
        icon={<Shield className="h-5 w-5" />}
        title="Users & Roles for This Location"
        description="Manage clinic staff access and alert permissions"
      >
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-sm text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add User for This Location
          </button>
        </div>

        {/* Staff Section */}
        <h4 className="mb-3 font-semibold text-gray-900">Staff</h4>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 border-b bg-gray-50/50">
                <TableHead className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Name
                </TableHead>
                <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Email
                </TableHead>
                <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Role
                </TableHead>
                <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.staff.map((member) => (
                <TableRow
                  key={member.id}
                  className="border-gray-100 border-b transition-colors hover:bg-gray-50"
                >
                  <TableCell className="px-6 py-4 font-medium text-gray-900">
                    {member.firstName} {member.lastName}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-gray-600">
                    {member.email}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <span className="inline-block rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700 text-xs">
                      {ROLE_LABELS[member.role]}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(member.id)}
                        className="font-medium text-blue-600 text-sm hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStaff(member.id)}
                        className="font-medium text-red-500 text-sm hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
