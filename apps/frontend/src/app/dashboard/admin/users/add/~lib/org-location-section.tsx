"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import type { OrgOption } from "./add-user-queries";

const triggerClass = "h-10 w-full border-gray-200 bg-white font-dm";
const contentClass =
  "bg-white font-dm [&_[data-slot=select-item]]:text-gray-900 [&_[data-slot=select-item]]:hover:bg-secondary/80 [&_[data-slot=select-item]]:focus:bg-secondary";

type Props = {
  organizations: OrgOption[];
};

export function OrgLocationSection({ organizations }: Props) {
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const selectedOrgData = organizations.find((o) => o.id === selectedOrg);

  function handleOrgChange(orgId: string) {
    setSelectedOrg(orgId);
    setSelectedLocations([]);
  }

  function toggleLocation(locId: string) {
    setSelectedLocations((prev) =>
      prev.includes(locId) ? prev.filter((l) => l !== locId) : [...prev, locId],
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block font-medium text-gray-700 text-sm">
          Organization <span className="text-red-500">*</span>
        </label>
        <input type="hidden" name="organizationId" value={selectedOrg} />
        <Select
          value={selectedOrg || undefined}
          onValueChange={handleOrgChange}
        >
          <SelectTrigger className={triggerClass}>
            <SelectValue placeholder="Select organization..." />
          </SelectTrigger>
          <SelectContent className={contentClass}>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedOrgData && selectedOrgData.locations.length > 0 && (
        <div>
          <label className="mb-1.5 block font-medium text-gray-700 text-sm">
            Location(s) <span className="text-red-500">*</span>
          </label>
          {selectedLocations.map((id) => (
            <input key={id} type="hidden" name="locationIds" value={id} />
          ))}
          <div className="flex flex-col gap-2">
            {selectedOrgData.locations.map((loc) => (
              <label
                key={loc.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedLocations.includes(loc.id)}
                  onChange={() => toggleLocation(loc.id)}
                  className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <p className="font-medium text-gray-900 text-sm">{loc.name}</p>
              </label>
            ))}
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-gray-500 text-xs">
            <span className="inline-flex size-4 items-center justify-center rounded-full bg-blue-100 text-[10px] text-blue-600">
              i
            </span>
            Users can be assigned to multiple locations
          </p>
        </div>
      )}
    </section>
  );
}
