"use client";

import { GraduationCap, Info, Settings, Users } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import { LocationConfigTab } from "./location-config-tab";
import type { LocationDetail } from "./location-detail-data";
import { LocationDetailHeader } from "./location-detail-header";
import { LocationOverviewTab } from "./location-overview-tab";
import { LocationStaffTab } from "./location-staff-tab";
import { LocationStudentsTab } from "./location-students-tab";

type Tab = "overview" | "staff" | "students" | "configuration";

export function LocationDetailClient({
  location,
}: {
  location: LocationDetail;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <div className="flex flex-col gap-6 p-8 font-dm">
      <LocationDetailHeader location={location} />

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
            active={activeTab === "staff"}
            onClick={() => setActiveTab("staff")}
            icon={<Users className="h-4 w-4" />}
            label={`Staff (${location.staff.length})`}
          />
          <TabButton
            active={activeTab === "students"}
            onClick={() => setActiveTab("students")}
            icon={<GraduationCap className="h-4 w-4" />}
            label={`Patients (${location.patients.length})`}
          />
          <TabButton
            active={activeTab === "configuration"}
            onClick={() => setActiveTab("configuration")}
            icon={<Settings className="h-4 w-4" />}
            label="Configuration"
          />
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <LocationOverviewTab location={location} />}
      {activeTab === "staff" && <LocationStaffTab location={location} />}
      {activeTab === "students" && <LocationStudentsTab location={location} />}
      {activeTab === "configuration" && (
        <LocationConfigTab location={location} />
      )}
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
