"use client";

import { Info, Users } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import type { LocationDetail } from "./location-detail-data";
import { LocationDetailHeader } from "./location-detail-header";
import { LocationOverviewTab } from "./location-overview-tab";
import { LocationUsersTab } from "./location-users-tab";

type Tab = "overview" | "users";

export function LocationDetailClient({
  location,
}: {
  location: LocationDetail;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const totalUsers = location.staff.length + location.patients.length;

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
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
            icon={<Users className="h-4 w-4" />}
            label={`Users & Permissions (${totalUsers})`}
          />
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <LocationOverviewTab location={location} />}
      {activeTab === "users" && <LocationUsersTab location={location} />}
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
