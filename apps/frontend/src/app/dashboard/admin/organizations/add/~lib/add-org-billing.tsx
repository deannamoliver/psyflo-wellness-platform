"use client";

import { CreditCard, FileText, Trash2, Upload } from "lucide-react";
import { Input } from "@/lib/core-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import type { OrgFormData } from "./add-org-types";
import { US_STATES } from "./add-org-types";

type Props = {
  formData: OrgFormData;
  onChange: (field: keyof OrgFormData, value: string) => void;
  onDocumentUpload: (doc: { name: string; type: string; uploadedAt: string }) => void;
  onDocumentRemove: (index: number) => void;
};

function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block font-medium text-gray-900 text-sm">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function FieldHint({ text }: { text: string }) {
  return <p className="mt-1 text-gray-500 text-xs">{text}</p>;
}

const inputClass = "h-10 border-gray-200 bg-white font-dm";
const triggerClass = "h-10 w-full border-gray-200 bg-white font-dm";
const contentClass =
  "bg-white font-dm [&_[data-slot=select-item]]:text-gray-900 [&_[data-slot=select-item]]:hover:bg-secondary/80 [&_[data-slot=select-item]]:focus:bg-secondary";

export function AddOrgBilling({ formData, onChange, onDocumentUpload, onDocumentRemove }: Props) {
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onDocumentUpload({
        name: file.name,
        type: "Contract",
        uploadedAt: new Date().toISOString(),
      });
    }
    e.target.value = "";
  }

  return (
    <div className="space-y-6">
      {/* Billing Information */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="h-5 w-5 text-emerald-600" />
          <h2 className="font-semibold text-gray-900 text-lg">
            Billing Information
          </h2>
        </div>
        <p className="mt-1 text-gray-500 text-sm">
          Where Psyflo should send invoices and billing communications
        </p>

        <div className="mt-6 flex flex-col gap-5">
          {/* Billing Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel label="Billing Email" required />
              <Input
                type="email"
                placeholder="billing@organization.com"
                value={formData.billingEmail}
                onChange={(e) => onChange("billingEmail", e.target.value)}
                className={inputClass}
              />
              <FieldHint text="Primary email for invoices and billing notices" />
            </div>
            <div>
              <FieldLabel label="Billing Phone" />
              <Input
                placeholder="(555) 123-4567"
                value={formData.billingPhone}
                onChange={(e) => onChange("billingPhone", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <FieldLabel label="Billing Address" />
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Street Address"
                value={formData.billingAddress}
                onChange={(e) => onChange("billingAddress", e.target.value)}
                className={inputClass}
              />
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="City"
                  value={formData.billingCity}
                  onChange={(e) => onChange("billingCity", e.target.value)}
                  className={inputClass}
                />
                <Select
                  value={formData.billingState || undefined}
                  onValueChange={(v) => onChange("billingState", v)}
                >
                  <SelectTrigger className={triggerClass}>
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent className={contentClass}>
                    {US_STATES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="ZIP Code"
                  value={formData.billingZipCode}
                  onChange={(e) => onChange("billingZipCode", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900 text-lg">
            Documents
          </h2>
        </div>
        <p className="mt-1 text-gray-500 text-sm">
          Upload MOUs, contracts, BAAs, and other important documents
        </p>

        <div className="mt-6">
          {/* Upload Area */}
          <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
            <Upload className="h-10 w-10 text-gray-400 mb-3" />
            <p className="font-medium text-gray-700 text-sm">Click to upload documents</p>
            <p className="text-gray-500 text-xs mt-1">PDF, DOC, DOCX up to 10MB</p>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
            />
          </label>

          {/* Uploaded Documents */}
          {formData.documents && formData.documents.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="font-medium text-gray-700 text-sm mb-2">Uploaded Documents</p>
              {formData.documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                      <p className="text-gray-500 text-xs">{doc.type} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDocumentRemove(index)}
                    className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-red-500 text-sm hover:bg-red-50 hover:border-red-200"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
