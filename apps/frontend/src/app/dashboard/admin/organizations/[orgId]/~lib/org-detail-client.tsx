"use client";

import { Info, MapPin } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import type { OrgDetail } from "./org-detail-data";
import { OrgDetailHeader } from "./org-detail-header";
import { OrgLocationsTab } from "./org-locations-tab";
import { OrgOverviewTab } from "./org-overview-tab";

type Tab = "overview" | "locations";

export function OrgDetailClient({ org }: { org: OrgDetail }) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <div className="flex flex-col gap-6 p-8 font-dm">
      <OrgDetailHeader org={org} />

      {/* Tabs */}
      <div className="border-gray-200 border-b">
        <div className="flex gap-6">
          <TabButton
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            icon={<Info className="h-4 w-4" />}
            label="Overview"
          />
          <TabButton
            active={activeTab === "locations"}
            onClick={() => setActiveTab("locations")}
            icon={<MapPin className="h-4 w-4" />}
            label={`Locations (${org.locations.length})`}
          />
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OrgOverviewTab org={org} />}
      {activeTab === "locations" && <OrgLocationsTab org={org} />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 border-b-2 px-1 pb-3 font-medium text-sm transition-colors",
        active
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-700",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
