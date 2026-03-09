"use client";

import { Input } from "@/lib/core-ui/input";
import type { ContactInfo, OrgFormData } from "./add-org-types";

type Props = {
  formData: OrgFormData;
  onContactChange: (
    contactType: "adminContact" | "billingContact" | "technicalContact",
    field: keyof ContactInfo,
    value: string,
  ) => void;
  onBillingSameAsAdmin: (checked: boolean) => void;
};

const inputClass = "h-10 border-gray-200 bg-white font-dm";

function ContactFields({
  label,
  required,
  contact,
  disabled,
  contactType,
  onChange,
  trailing,
}: {
  label: string;
  required?: boolean;
  contact: ContactInfo;
  disabled?: boolean;
  contactType: "adminContact" | "billingContact" | "technicalContact";
  onChange: (
    contactType: "adminContact" | "billingContact" | "technicalContact",
    field: keyof ContactInfo,
    value: string,
  ) => void;
  trailing?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </h3>
        {trailing}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-gray-600 text-sm">Name</label>
          <Input
            placeholder="e.g., Dr. Jane Smith"
            value={contact.name}
            onChange={(e) => onChange(contactType, "name", e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-gray-600 text-sm">Title</label>
          <Input
            placeholder="e.g., Superintendent"
            value={contact.title}
            onChange={(e) => onChange(contactType, "title", e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-gray-600 text-sm">Email</label>
          <Input
            placeholder="e.g., jsmith@springfieldusd.org"
            value={contact.email}
            onChange={(e) => onChange(contactType, "email", e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-gray-600 text-sm">Phone</label>
          <Input
            placeholder="e.g., (217) 555-1234"
            value={contact.phone}
            onChange={(e) => onChange(contactType, "phone", e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}

export function AddOrgContacts({
  formData,
  onContactChange,
  onBillingSameAsAdmin,
}: Props) {
  const billingContact = formData.billingSameAsAdmin
    ? formData.adminContact
    : formData.billingContact;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-gray-900 text-lg">
        Primary Contact Information
      </h2>
      <p className="mt-1 text-gray-500 text-sm">
        Main point of contact for this organization
      </p>

      <div className="mt-6 flex flex-col gap-8">
        <ContactFields
          label="Organization Admin Contact"
          required
          contact={formData.adminContact}
          contactType="adminContact"
          onChange={onContactChange}
        />

        <ContactFields
          label="Organization Billing Contact"
          contact={billingContact}
          disabled={formData.billingSameAsAdmin}
          contactType="billingContact"
          onChange={onContactChange}
          trailing={
            <label className="flex items-center gap-2 text-gray-600 text-sm">
              <input
                type="checkbox"
                checked={formData.billingSameAsAdmin}
                onChange={(e) => onBillingSameAsAdmin(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Same as admin
            </label>
          }
        />

        <ContactFields
          label="Organization Technical Contact"
          contact={formData.technicalContact}
          contactType="technicalContact"
          onChange={onContactChange}
        />
      </div>
    </section>
  );
}
