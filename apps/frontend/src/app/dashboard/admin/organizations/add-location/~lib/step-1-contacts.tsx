"use client";

import { Plus, Trash2, User, Users } from "lucide-react";
import { Input } from "@/lib/core-ui/input";
import { FormField, FormRow, FormSection } from "./form-section";
import type { AdditionalContact, LocationFormData } from "./types";

type Props = {
  formData: LocationFormData;
  updateForm: (updates: Partial<LocationFormData>) => void;
};

export function Step1Contacts({ formData, updateForm }: Props) {
  const { primaryContact } = formData;

  function updatePrimary(updates: Partial<LocationFormData["primaryContact"]>) {
    updateForm({ primaryContact: { ...primaryContact, ...updates } });
  }

  function updateAdditional(
    index: number,
    updates: Partial<AdditionalContact>,
  ) {
    const next = [...formData.additionalContacts];
    next[index] = { ...next[index], ...updates } as AdditionalContact;
    updateForm({ additionalContacts: next });
  }

  function addContact() {
    updateForm({
      additionalContacts: [
        ...formData.additionalContacts,
        { name: "", title: "", email: "", phone: "" },
      ],
    });
  }

  function removeContact(index: number) {
    updateForm({
      additionalContacts: formData.additionalContacts.filter(
        (_, i) => i !== index,
      ),
    });
  }

  return (
    <>
      {/* Primary Contact */}
      <FormSection
        icon={<User className="h-5 w-5" />}
        title="Primary Contact Person"
        description="Main administrative contact for this location"
      >
        <div className="flex flex-col gap-4">
          <FormRow>
            <FormField label="Contact Name" required>
              <Input
                value={primaryContact.name}
                onChange={(e) => updatePrimary({ name: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder="Full name"
              />
            </FormField>
            <FormField label="Job Title / Role" required>
              <Input
                value={primaryContact.jobTitle}
                onChange={(e) => updatePrimary({ jobTitle: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder="Principal"
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField
              label="Email Address"
              required
              hint="Primary email for school communications"
            >
              <Input
                type="email"
                value={primaryContact.email}
                onChange={(e) => updatePrimary({ email: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder="contact@school.edu"
              />
            </FormField>
            <FormField
              label="Phone Number"
              required
              hint="Direct contact number"
            >
              <Input
                value={primaryContact.phone}
                onChange={(e) => updatePrimary({ phone: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder="(555) 123-4567"
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Office Phone">
              <Input
                value={primaryContact.officePhone}
                onChange={(e) => updatePrimary({ officePhone: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder="(555) 123-4567 ext. 100"
              />
            </FormField>
            <FormField label="Mobile Phone">
              <Input
                value={primaryContact.mobilePhone}
                onChange={(e) => updatePrimary({ mobilePhone: e.target.value })}
                className="h-10 border-gray-200 font-dm"
                placeholder="(555) 987-6543"
              />
            </FormField>
          </FormRow>
        </div>
      </FormSection>

      {/* Additional Contacts */}
      <FormSection
        icon={<Users className="h-5 w-5" />}
        title="Additional Contacts"
        description="Secondary administrative contacts and department heads"
      >
        <div className="flex flex-col gap-4">
          {formData.additionalContacts.map((contact, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: form items keyed by index
              key={`contact-${i}`}
              className="rounded-lg border border-gray-100 bg-gray-50/50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-700 text-sm">
                    Contact #{i + 1}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeContact(i)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <Input
                  value={contact.name}
                  onChange={(e) =>
                    updateAdditional(i, { name: e.target.value })
                  }
                  className="h-10 border-gray-200 font-dm"
                  placeholder="Full name"
                />
                <Input
                  value={contact.title}
                  onChange={(e) =>
                    updateAdditional(i, { title: e.target.value })
                  }
                  className="h-10 border-gray-200 font-dm"
                  placeholder="Title"
                />
                <Input
                  value={contact.email}
                  onChange={(e) =>
                    updateAdditional(i, { email: e.target.value })
                  }
                  className="h-10 border-gray-200 font-dm"
                  placeholder="Email address"
                />
                <Input
                  value={contact.phone}
                  onChange={(e) =>
                    updateAdditional(i, { phone: e.target.value })
                  }
                  className="h-10 border-gray-200 font-dm"
                  placeholder="Phone number"
                />
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addContact}
              className="flex items-center gap-2 font-medium text-blue-600 text-sm hover:text-blue-800"
            >
              <Plus className="h-4 w-4" />
              Add Contact
            </button>
          </div>
        </div>
      </FormSection>
    </>
  );
}
