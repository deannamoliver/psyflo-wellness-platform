"use client";

import type { SoliStateData } from "@/lib/check-in/soli-state";
import MobileWellnessDashboard from "./mobile-wellness-dashboard";
import WellnessDashboard from "./wellness-dashboard";

type DashboardClientProps = {
  firstName: string;
  fullName: string;
  userEmail: string;
  initialSessions: { id: string; title: string; hasUnread?: boolean }[];
  soliStateData: SoliStateData;
};

export default function DashboardClient({
  firstName,
  soliStateData,
}: DashboardClientProps) {
  return (
    <>
      {/* Mobile View */}
      <div className="flex h-full w-full lg:hidden">
        <MobileWellnessDashboard
          firstName={firstName}
          soliStateData={soliStateData}
        />
      </div>

      {/* Desktop View - Wellness Dashboard */}
      <div className="hidden h-full w-full lg:flex">
        <WellnessDashboard
          firstName={firstName}
          soliStateData={soliStateData}
        />
      </div>
    </>
  );
}
