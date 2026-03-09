"use client";

import { AlertCircle, Info, Pencil, Phone, Plus, X } from "lucide-react";
import { useState } from "react";
import { AddEmergencyContactModal } from "./add-emergency-contact-modal";
import { FormSection } from "./form-section";
import type { EmergencyContact, LocationFormData } from "./types";

type Props = {
  formData: LocationFormData;
  updateForm: (updates: Partial<LocationFormData>) => void;
};

type ModalState =
  | { open: false }
  | {
      open: true;
      mode: "primary" | "backup";
      editing?: EmergencyContact;
    };

function ContactCard({
  contact,
  onEdit,
  onRemove,
  backupNumber,
}: {
  contact: EmergencyContact;
  onEdit: () => void;
  onRemove: () => void;
  backupNumber?: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="min-w-0 flex-1">
        <span className="font-medium text-gray-900 text-sm">
          {contact.name}
        </span>
        <span className="ml-2 text-gray-500 text-xs">{contact.relation}</span>
        {contact.primaryPhone && (
          <span className="ml-3 text-gray-400 text-xs">
            {contact.primaryPhone}
          </span>
        )}
        {contact.primaryEmail && (
          <span className="ml-3 text-gray-400 text-xs">
            {contact.primaryEmail}
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {backupNumber != null && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600 text-xs">
            Backup #{backupNumber}
          </span>
        )}
        <button
          type="button"
          onClick={onEdit}
          className="text-gray-400 hover:text-blue-600"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-400 hover:text-red-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function Step3SchoolContacts({ formData, updateForm }: Props) {
  const [modal, setModal] = useState<ModalState>({ open: false });

  function handleSave(data: Omit<EmergencyContact, "id">) {
    if (!modal.open) return;

    if (modal.mode === "primary") {
      const contact: EmergencyContact = modal.editing
        ? { ...modal.editing, ...data }
        : { ...data, id: crypto.randomUUID() };
      updateForm({ primaryEmergencyContact: contact });
    } else {
      if (modal.editing) {
        updateForm({
          backupContacts: formData.backupContacts.map((c) =>
            c.id === modal.editing?.id ? { ...c, ...data } : c,
          ),
        });
      } else {
        updateForm({
          backupContacts: [
            ...formData.backupContacts,
            { ...data, id: crypto.randomUUID() },
          ],
        });
      }
    }
  }

  return (
    <>
      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <div>
          <h3 className="font-semibold text-blue-900">
            About Emergency Contact Configuration
          </h3>
          <p className="mt-1 text-blue-700 text-sm">
            Emergency contacts are critical for ensuring student safety. Each
            school must have at least one primary contact and backup contacts
            configured for alert escalation.
          </p>
        </div>
      </div>

      {/* School Emergency Contacts */}
      <FormSection
        icon={<Phone className="h-5 w-5" />}
        title="Clinic Emergency Contacts"
        description="Configure emergency contacts for this location. These appear during safety protocols."
      >
        {/* Primary Emergency Contact */}
        <div className="mb-6 rounded-lg border border-gray-200 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    Primary Emergency Contact
                  </span>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700 text-xs">
                    Required
                  </span>
                </div>
                <p className="text-gray-500 text-xs">
                  First point of contact for all emergency alerts
                </p>
              </div>
            </div>
            {!formData.primaryEmergencyContact && (
              <button
                type="button"
                onClick={() => setModal({ open: true, mode: "primary" })}
                className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 font-medium text-sm text-white hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            )}
          </div>

          {formData.primaryEmergencyContact && (
            <ContactCard
              contact={formData.primaryEmergencyContact}
              onEdit={() => {
                const c = formData.primaryEmergencyContact;
                if (c) setModal({ open: true, mode: "primary", editing: c });
              }}
              onRemove={() => updateForm({ primaryEmergencyContact: null })}
            />
          )}
        </div>

        {/* Backup Contacts */}
        <div className="rounded-lg border border-gray-200 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <Phone className="h-4 w-4 text-blue-500" />
              </div>
              <span className="font-semibold text-gray-900">
                Backup Contacts
              </span>
            </div>
            {formData.backupContacts.length < 2 && (
              <button
                type="button"
                onClick={() => setModal({ open: true, mode: "backup" })}
                className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 font-medium text-sm text-white hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Backup
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {formData.backupContacts.map((contact, i) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                backupNumber={i + 1}
                onEdit={() =>
                  setModal({
                    open: true,
                    mode: "backup",
                    editing: contact,
                  })
                }
                onRemove={() =>
                  updateForm({
                    backupContacts: formData.backupContacts.filter(
                      (c) => c.id !== contact.id,
                    ),
                  })
                }
              />
            ))}
          </div>
        </div>
      </FormSection>

      {/* Modal */}
      {modal.open && (
        <AddEmergencyContactModal
          onClose={() => setModal({ open: false })}
          onSave={handleSave}
          initialData={modal.editing}
        />
      )}
    </>
  );
}
