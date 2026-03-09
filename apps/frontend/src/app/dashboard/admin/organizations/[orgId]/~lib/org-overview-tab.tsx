"use client";

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
      <div className="text-gray-900">{children}</div>
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

export function OrgOverviewTab({ org }: { org: OrgDetail }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Organization Details */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-bold text-gray-900 text-lg">
          Organization Details
        </h2>

        <div className="grid grid-cols-4 gap-x-8 gap-y-6">
          <DetailField label="Organization Name">{org.name}</DetailField>
          <DetailField label="Organization Type">
            <TypeBadge type={org.type} />
          </DetailField>
          <DetailField label="District Code">{org.districtCode}</DetailField>
          <DetailField label="Time Zone">{org.timeZone}</DetailField>

          <DetailField label="Phone Number">{org.phone}</DetailField>
          <DetailField label="Website">
            <a
              href={`https://${org.website}`}
              className="text-blue-600 hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              {org.website}
            </a>
          </DetailField>
          <DetailField label="Domain">
            <span className="text-blue-600">{org.domain}</span>
          </DetailField>
          <DetailField label="Address">
            {org.address.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </DetailField>
        </div>
      </div>

      {/* Contact Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-bold text-gray-900 text-lg">
          Contact Information
        </h2>

        <div className="flex flex-col gap-6">
          {org.contacts.map((contact) => (
            <div key={contact.role} className="grid grid-cols-4 gap-x-8">
              <DetailField label={contact.role}>{contact.name}</DetailField>
              <DetailField label="Title">{contact.title}</DetailField>
              <DetailField label="Contact Email">
                <span className="text-gray-900">{contact.email}</span>
              </DetailField>
              <DetailField label="Contact Phone">
                <span className="text-gray-900">{contact.phone}</span>
              </DetailField>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
