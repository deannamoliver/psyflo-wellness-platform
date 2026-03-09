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
          <DetailField label="Location Name">
            {location.locationName}
          </DetailField>
          <DetailField label="Clinic Code">{location.schoolCode}</DetailField>
          <DetailField label="Time Zone">{location.timeZone}</DetailField>
          <DetailField label="Clinic Type">{location.schoolType}</DetailField>

          <DetailField label="Address">
            {location.address.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </DetailField>
          <DetailField label="Phone Number">{location.phone}</DetailField>
          <DetailField label="Grade Levels">{location.gradeLevels}</DetailField>
          <DetailField label="Est. Student Count">
            {location.estStudentCount}
          </DetailField>

          <DetailField label="Operating Days">{location.schoolDays}</DetailField>
          <DetailField label="Start Time">{location.startTime}</DetailField>
          <DetailField label="End Time">{location.endTime}</DetailField>
          <DetailField label="Academic Year">
            {location.academicYear}
          </DetailField>

          <DetailField label="Blackout Days">
            {location.blackoutDays.length > 0
              ? location.blackoutDays.map((d) => (
                  <div key={d.date}>
                    {d.date} – {d.label}
                  </div>
                ))
              : "--"}
          </DetailField>
        </div>
      </div>

      {/* General Contact Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-bold text-gray-900 text-lg">
          General Contact Information
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

      {/* School Emergency Contact Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-bold text-gray-900 text-lg">
          School Emergency Contact Information
        </h2>
        {location.emergencyContacts.length > 0 ? (
          <div className="flex flex-col gap-6">
            {location.emergencyContacts.map((contact) => (
              <ContactRow
                key={`emergency-${contact.role}-${contact.email}`}
                contact={contact}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No emergency contacts added.</p>
        )}
      </div>

      {/* Non-School Emergency Contacts */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-bold text-gray-900 text-lg">
          Non-School Emergency Contacts
        </h2>
        {location.nonSchoolContacts.length > 0 ? (
          <div className="grid grid-cols-5 gap-x-6">
            {location.nonSchoolContacts.map((contact) => (
              <div key={contact.label} className="flex flex-col gap-1">
                <span className="text-gray-500 text-sm">{contact.label}</span>
                <div className="text-gray-900">
                  <div>{contact.name}</div>
                  <div>{contact.phone}</div>
                  {contact.address.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            No non-school emergency contacts added.
          </p>
        )}
      </div>
    </div>
  );
}
