"use client";

import type { LocationDetail } from "./location-detail-data";

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

function ContactRow({
  contact,
}: {
  contact: {
    role: string;
    name: string;
    title: string;
    email: string;
    phones: string[];
  };
}) {
  return (
    <div className="grid grid-cols-4 gap-x-8">
      <DetailField label={contact.role}>{contact.name}</DetailField>
      <DetailField label="Title">{contact.title}</DetailField>
      <DetailField label="Contact Email">
        <span className="text-gray-900">{contact.email}</span>
      </DetailField>
      <DetailField label="Contact Phone">
        {contact.phones.map((p) => (
          <div key={p}>{p}</div>
        ))}
      </DetailField>
    </div>
  );
}

export function LocationOverviewTab({
  location,
}: {
  location: LocationDetail;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Location Details */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-bold text-gray-900 text-lg">
          Location Details
        </h2>
        <div className="grid grid-cols-4 gap-x-8 gap-y-6">
          <DetailField label="Legal Name">
            {location.legalName}
          </DetailField>
          {location.dba && (
            <DetailField label="DBA (Doing Business As)">
              {location.dba}
            </DetailField>
          )}
          {location.taxId && (
            <DetailField label="Tax ID (EIN)">{location.taxId}</DetailField>
          )}
          <DetailField label="Location NPI">{location.locationNpi || "--"}</DetailField>
          <DetailField label="Location Code">{location.locationCode}</DetailField>
          <DetailField label="Location Type">{location.locationType}</DetailField>

          <DetailField label="Address">
            {location.address.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </DetailField>
          <DetailField label="Phone Number">{location.phone}</DetailField>
          <DetailField label="Time Zone">{location.timeZone}</DetailField>
          <DetailField label="Est. Patient Count">
            {location.estPatientCount}
          </DetailField>
        </div>
      </div>

      {/* Patient Population Characteristics */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-bold text-gray-900 text-lg">
          Patient Population Characteristics
        </h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <DetailField label="Ages Served">
            {location.agesServed || "--"}
          </DetailField>
          <DetailField label="Mental Health Needs Addressed">
            {location.mentalHealthNeeds?.length > 0
              ? location.mentalHealthNeeds.join(", ")
              : "--"}
          </DetailField>
          <DetailField label="Languages Spoken">
            {location.languagesSpoken?.length > 0
              ? location.languagesSpoken.join(", ")
              : "--"}
          </DetailField>
          <DetailField label="Modalities">
            {location.modalities?.length > 0
              ? location.modalities.join(", ")
              : "--"}
          </DetailField>
          <DetailField label="Therapeutic Approaches">
            {location.approaches?.length > 0
              ? location.approaches.join(", ")
              : "--"}
          </DetailField>
        </div>
      </div>

      {/* Location Hours */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-bold text-gray-900 text-lg">
          Location Hours
        </h2>
        <div className="grid grid-cols-3 gap-x-8 gap-y-6">
          <DetailField label="Operating Days">{location.operatingDays}</DetailField>
          <DetailField label="Start Time">{location.startTime}</DetailField>
          <DetailField label="End Time">{location.endTime}</DetailField>
        </div>
      </div>

      {/* Primary Contact Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-bold text-gray-900 text-lg">
          Contact Information
        </h2>
        {location.generalContacts.length > 0 ? (
          <div className="flex flex-col gap-6">
            {location.generalContacts.map((contact) => (
              <ContactRow
                key={`general-${contact.role}-${contact.email}`}
                contact={contact}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No contacts added.</p>
        )}
      </div>
    </div>
  );
}
