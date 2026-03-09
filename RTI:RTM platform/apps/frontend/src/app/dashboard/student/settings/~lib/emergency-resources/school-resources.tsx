"use client";

import {
  CrisisTextIcon,
  EmergencyServicesIcon,
  NationalCrisisHotlineIcon,
} from "@/lib/emergency-resources/icons";

function PhoneRedIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path
        fill="#EF4444"
        d="M5.153.77A1.246 1.246 0 0 0 3.672.043l-2.75.75C.378.944 0 1.438 0 2.001c0 7.731 6.269 14 14 14 .563 0 1.056-.378 1.206-.922l.75-2.75a1.246 1.246 0 0 0-.725-1.481l-3-1.25a1.246 1.246 0 0 0-1.447.362L9.522 12A10.562 10.562 0 0 1 4.5 6.98l1.54-1.26c.429-.35.576-.937.363-1.446l-1.25-3V.769Z"
      />
    </svg>
  );
}

export function SchoolSpecificResources() {
  const resources = [
    {
      icon: <NationalCrisisHotlineIcon className="h-4 w-4" />,
      label: "Local Emergency Services",
      phone: "816-352-2222",
    },
    {
      icon: <CrisisTextIcon className="h-4 w-4" />,
      label: "School Resource Officer",
      phone: "816-352-2222",
    },
    {
      icon: <EmergencyServicesIcon className="h-4 w-5" />,
      label: "Crisis Support Services",
      phone: "816-352-222",
    },
  ];

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
          <PhoneRedIcon />
        </div>
        <h3 className="font-semibold text-[#EF4444] text-lg">
          School-Specific Resources
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {resources.map((resource) => (
          <div
            key={resource.label}
            className="rounded-xl border border-red-200 bg-white px-4 py-4"
          >
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center">
                {resource.icon}
              </div>
              <span className="font-semibold text-gray-900">
                {resource.label}
              </span>
            </div>
            <p className="font-semibold text-[#EF4444] text-lg">
              {resource.phone}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
