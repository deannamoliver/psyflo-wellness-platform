"use client";

import { FileText } from "lucide-react";
import type { OrgDetail } from "./org-detail-data";

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-gray-500 text-sm">{label}</span>
      <div className="text-gray-900">{children || "--"}</div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-block rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700 text-xs">
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    Suspended: "bg-red-100 text-red-700",
    Onboarding: "bg-yellow-100 text-yellow-700",
    Archived: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`inline-block rounded-full px-3 py-1 font-semibold text-xs ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

function ContactCard({ title, contact }: { title: string; contact?: { name: string; title: string; email: string; phone: string } }) {
  if (!contact || !contact.name) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h4 className="mb-3 font-semibold text-gray-700 text-sm">{title}</h4>
      <div className="grid grid-cols-2 gap-4">
        <DetailField label="Name">{contact.name}</DetailField>
        <DetailField label="Title">{contact.title}</DetailField>
        <DetailField label="Email">{contact.email}</DetailField>
        <DetailField label="Phone">{contact.phone}</DetailField>
      </div>
    </div>
  );
}

export function OrgOverviewTab({ org }: { org: OrgDetail }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Organization Details */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-bold text-gray-900 text-lg">
          Organization Details
        </h2>

        <div className="grid grid-cols-4 gap-x-8 gap-y-6">
          <DetailField label="Legal Name">{org.legalName || org.name}</DetailField>
          <DetailField label="DBA (Doing Business As)">{org.dba}</DetailField>
          <DetailField label="Organization Type">
            <TypeBadge type={org.type} />
          </DetailField>
          <DetailField label="Specialty">
            {org.specialty ? <TypeBadge type={org.specialty} /> : "--"}
          </DetailField>
          <DetailField label="Tax ID (EIN)">{org.taxId}</DetailField>
          <DetailField label="Organization NPI">{org.npi}</DetailField>
          <DetailField label="Status">
            <StatusBadge status={org.status} />
          </DetailField>
          <DetailField label="Rate Per Patient">
            {org.ratePerPatient ? (
              <span className="font-semibold text-emerald-600">${org.ratePerPatient}/month</span>
            ) : "--"}
          </DetailField>
        </div>
      </div>

      {/* Address & Contact */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-bold text-gray-900 text-lg">
          Address & Contact
        </h2>

        <div className="grid grid-cols-4 gap-x-8 gap-y-6">
          <DetailField label="Address">
            {org.address.length > 0 ? org.address.map((line) => (
              <div key={line}>{line}</div>
            )) : "--"}
          </DetailField>
          <DetailField label="Phone Number">{org.phone}</DetailField>
          <DetailField label="Website">
            {org.website ? (
              <a
                href={`https://${org.website}`}
                className="text-blue-600 hover:text-blue-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                {org.website}
              </a>
            ) : "--"}
          </DetailField>
          <DetailField label="Email Domain">
            {org.domain ? <span className="text-blue-600">{org.domain}</span> : "--"}
          </DetailField>
          <DetailField label="Time Zone">{org.timeZone}</DetailField>
        </div>
      </div>

      {/* Billing Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-bold text-gray-900 text-lg">
          Billing Information
        </h2>

        <div className="grid grid-cols-4 gap-x-8 gap-y-6">
          <DetailField label="Billing Email">{org.billingEmail}</DetailField>
          <DetailField label="Billing Phone">{org.billingPhone}</DetailField>
          <DetailField label="Billing Address">
            {org.billingAddress && org.billingAddress.length > 0 ? org.billingAddress.map((line) => (
              <div key={line}>{line}</div>
            )) : "--"}
          </DetailField>
        </div>
      </div>

      {/* Contact Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-bold text-gray-900 text-lg">
          Contact Information
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <ContactCard title="Admin Contact" contact={org.adminContact} />
          <ContactCard title="Billing Contact" contact={org.billingContact} />
          <ContactCard title="Technical Contact" contact={org.technicalContact} />
        </div>

        {org.contacts.length > 0 && (
          <div className="mt-6">
            <h4 className="mb-3 font-semibold text-gray-700 text-sm">Additional Contacts</h4>
            <div className="flex flex-col gap-4">
              {org.contacts.map((contact, idx) => (
                <div key={`${contact.role}-${idx}`} className="grid grid-cols-4 gap-x-8 rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <DetailField label="Name">{contact.name}</DetailField>
                  <DetailField label="Title">{contact.title}</DetailField>
                  <DetailField label="Email">{contact.email}</DetailField>
                  <DetailField label="Phone">{contact.phone}</DetailField>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-bold text-gray-900 text-lg">
          Documents
        </h2>

        {org.documents && org.documents.length > 0 ? (
          <div className="flex flex-col gap-2">
            {org.documents.map((doc, idx) => (
              <div key={`${doc.name}-${idx}`} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                  <p className="text-gray-500 text-xs">{doc.type} • Uploaded {doc.uploadedAt}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No documents uploaded.</p>
        )}
      </div>

      {/* Internal Notes */}
      {org.internalNotes && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-gray-900 text-lg">
            Internal Notes
          </h2>
          <p className="text-gray-700 text-sm whitespace-pre-wrap">{org.internalNotes}</p>
        </div>
      )}
    </div>
  );
}
