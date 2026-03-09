"use client";

import { ArrowLeft, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  createOrganizationAction,
  updateOrganizationAction,
} from "./add-org-actions";
import { AddOrgAdditionalContacts } from "./add-org-additional-contacts";
import { AddOrgContacts } from "./add-org-contacts";
import { AddOrgDetails } from "./add-org-details";
import { AddOrgSettings } from "./add-org-settings";
import { AddOrgTypeSelector } from "./add-org-type-selector";
import {
  type ContactInfo,
  createContact,
  INITIAL_FORM_DATA,
  type OrgFormData,
  type OrgType,
} from "./add-org-types";

type Props = {
  orgId?: string;
  initialData?: OrgFormData | null;
};

export function AddOrgClient({ orgId, initialData }: Props) {
  const router = useRouter();
  const isEditMode = !!orgId;
  const [formData, setFormData] = useState<OrgFormData>(
    initialData || INITIAL_FORM_DATA,
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Update form data when initialData changes (e.g., after loading)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  function updateField(field: keyof OrgFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function updateType(type: OrgType) {
    setFormData((prev) => ({ ...prev, type }));
  }

  function updateContact(
    contactType: "adminContact" | "billingContact" | "technicalContact",
    field: keyof ContactInfo,
    value: string,
  ) {
    setFormData((prev) => ({
      ...prev,
      [contactType]: { ...prev[contactType], [field]: value },
    }));
  }

  function updateBillingSameAsAdmin(checked: boolean) {
    setFormData((prev) => ({ ...prev, billingSameAsAdmin: checked }));
  }

  function updateAdditionalContact(
    index: number,
    field: keyof ContactInfo,
    value: string,
  ) {
    setFormData((prev) => {
      const contacts = [...prev.additionalContacts];
      contacts[index] = { ...contacts[index], [field]: value } as ContactInfo;
      return { ...prev, additionalContacts: contacts };
    });
  }

  function addAdditionalContact() {
    setFormData((prev) => ({
      ...prev,
      additionalContacts: [...prev.additionalContacts, createContact()],
    }));
  }

  function removeAdditionalContact(index: number) {
    setFormData((prev) => ({
      ...prev,
      additionalContacts: prev.additionalContacts.filter((_, i) => i !== index),
    }));
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        if (isEditMode && orgId) {
          await updateOrganizationAction(orgId, formData);
          router.push(`/dashboard/admin/organizations/${orgId}`);
        } else {
          await createOrganizationAction(formData);
          router.push("/dashboard/admin/organizations");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `Failed to ${isEditMode ? "update" : "create"} organization`,
        );
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 p-8 font-dm">
      {/* Header */}
      <div>
        <nav className="mb-2 flex items-center gap-2 text-sm">
          <Link
            href="/dashboard/admin/organizations"
            className="text-gray-500 transition-colors hover:text-blue-600"
          >
            Organizations
          </Link>
          <span className="text-gray-400">&gt;</span>
          {isEditMode && orgId && (
            <>
              <Link
                href={`/dashboard/admin/organizations/${orgId}`}
                className="text-gray-500 transition-colors hover:text-blue-600"
              >
                {formData.name || "Organization"}
              </Link>
              <span className="text-gray-400">&gt;</span>
            </>
          )}
          <span className="font-medium text-gray-700">
            {isEditMode ? "Edit Organization" : "Add Organization"}
          </span>
        </nav>
        <h1 className="font-bold text-3xl text-gray-900">
          {isEditMode ? "Edit Organization" : "Add Organization"}
        </h1>
        <p className="mt-1 text-gray-500">
          {isEditMode
            ? "Update organization information below."
            : "Create a new organization in just a few steps."}
        </p>
      </div>

      {/* Form Sections */}
      <AddOrgTypeSelector selected={formData.type} onSelect={updateType} />

      <AddOrgDetails formData={formData} onChange={updateField} />

      <AddOrgContacts
        formData={formData}
        onContactChange={updateContact}
        onBillingSameAsAdmin={updateBillingSameAsAdmin}
      />

      <AddOrgSettings formData={formData} onChange={updateField} />

      <AddOrgAdditionalContacts
        contacts={formData.additionalContacts}
        onUpdate={updateAdditionalContact}
        onAdd={addAdditionalContact}
        onRemove={removeAdditionalContact}
      />

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center justify-between border-gray-200 border-t pt-6">
        <Link
          href={
            isEditMode && orgId
              ? `/dashboard/admin/organizations/${orgId}`
              : "/dashboard/admin/organizations"
          }
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50"
        >
          <ArrowLeft className="size-4" />
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-sm text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
