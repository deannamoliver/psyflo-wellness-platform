"use client";

import { ArrowLeft, ArrowRight, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  createLocationAction,
  updateLocationAction,
} from "./add-location-actions";
import { Step1Academic } from "./step-1-academic";
import { Step1Contacts } from "./step-1-contacts";
import { Step1Profile } from "./step-1-profile";
import { Step1Settings } from "./step-1-settings";
import { Step2Roles } from "./step-2-roles";
import { INITIAL_FORM_DATA, type LocationFormData } from "./types";
import { WizardNav } from "./wizard-nav";

const STORAGE_KEY = "add-location-draft";

function loadDraft(): { step: number; formData: LocationFormData } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveDraft(step: number, formData: LocationFormData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, formData }));
}

function clearDraft() {
  localStorage.removeItem(STORAGE_KEY);
}

type Props = {
  organizations: { id: string; name: string }[];
  defaultOrgId?: string;
  editLocationId?: string;
  existingData?: LocationFormData | null;
  defaultDomainsFromOrg?: string[];
};

export function AddLocationClient({
  organizations,
  defaultOrgId,
  editLocationId,
  existingData,
  defaultDomainsFromOrg,
}: Props) {
  const isEditMode = Boolean(editLocationId && existingData);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const draft = isEditMode ? null : loadDraft();
  const [currentStep, setCurrentStep] = useState(draft?.step ?? 1);
  const [formData, setFormData] = useState<LocationFormData>(() => {
    if (isEditMode && existingData) return existingData;
    if (draft?.formData) return { ...INITIAL_FORM_DATA, ...draft.formData };
    if (defaultOrgId)
      return {
        ...INITIAL_FORM_DATA,
        parentOrganizationId: defaultOrgId,
        studentDomains: defaultDomainsFromOrg?.length
          ? defaultDomainsFromOrg
          : INITIAL_FORM_DATA.studentDomains,
      };
    return INITIAL_FORM_DATA;
  });

  useEffect(() => {
    if (!isEditMode) saveDraft(currentStep, formData);
  }, [currentStep, formData, isEditMode]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  function updateForm(updates: Partial<LocationFormData>) {
    setFormData((prev) => ({ ...prev, ...updates }));
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        if (isEditMode && editLocationId) {
          await updateLocationAction(editLocationId, formData);
          router.push(
            `/dashboard/admin/organizations/${formData.parentOrganizationId}/locations/${editLocationId}`,
          );
        } else {
          await createLocationAction(formData);
          clearDraft();
          router.push("/dashboard/admin/organizations");
        }
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : isEditMode
              ? "Failed to update location"
              : "Failed to create location",
        );
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 p-8 font-dm">
      {/* Header */}
      <div>
        <div className="mb-1 flex items-center gap-2 text-gray-500 text-sm">
          <Link
            href="/dashboard/admin/organizations"
            className="hover:text-blue-600"
          >
            Organizations
          </Link>
          <span>&gt;</span>
          <span className="text-gray-900">
            {isEditMode ? "Edit Location" : "Add Location"}
          </span>
        </div>
        <h1 className="font-bold text-3xl text-gray-900">
          {isEditMode ? "Edit Location" : "Add Location"}
        </h1>
        <p className="mt-1 text-gray-500">
          {isEditMode
            ? "Update location details and configuration"
            : "Create a new location within an organization"}
        </p>
      </div>

      {/* Step Navigation */}
      <WizardNav currentStep={currentStep} onStepClick={setCurrentStep} />

      {/* Step Content */}
      <div className="flex flex-col gap-6">
        {currentStep === 1 && (
          <>
            <Step1Profile
              formData={formData}
              updateForm={updateForm}
              organizations={organizations}
            />
            <Step1Academic formData={formData} updateForm={updateForm} />
            <Step1Contacts formData={formData} updateForm={updateForm} />
            <Step1Settings formData={formData} updateForm={updateForm} />
          </>
        )}
        {currentStep === 2 && (
          <Step2Roles formData={formData} updateForm={updateForm} />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between border-gray-200 border-t pt-6">
        {currentStep === 1 ? (
          <Link
            href="/dashboard/admin/organizations"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 font-medium text-gray-700 text-sm hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentStep((s) => s - 1)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 font-medium text-gray-700 text-sm hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}
        {currentStep < 2 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((s) => s + 1)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-sm text-white hover:bg-blue-700"
          >
            Next: Users & Permissions
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {isPending
              ? isEditMode
                ? "Saving..."
                : "Creating..."
              : isEditMode
                ? "Save Changes"
                : "Create Location"}
          </button>
        )}
      </div>
    </div>
  );
}
