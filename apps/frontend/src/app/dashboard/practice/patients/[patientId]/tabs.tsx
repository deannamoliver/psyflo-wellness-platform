"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { cn } from "@/lib/tailwind-utils";

const TABS = [
  { segment: "overview", label: "Overview" },
  { segment: "monitoring", label: "Monitoring" },
  { segment: "treatment-plan", label: "Treatment Plan" },
  { segment: "wellness", label: "Wellness Activity" },
  { segment: "sessions", label: "Communications" },
  { segment: "billing", label: "Billing" },
] as const;

export function PatientTabs({
  patientId,
}: {
  patientId: string;
}) {
  const segment = useSelectedLayoutSegment();

  return (
    <div className="border-gray-200 border-b font-dm">
      <nav className="-mb-px flex gap-6" aria-label="Patient profile tabs">
        {TABS.map((tab) => {
          const isActive = segment === tab.segment;
          return (
            <Link
              key={tab.segment}
              href={`/dashboard/practice/patients/${patientId}/${tab.segment}`}
              className={cn(
                "whitespace-nowrap border-b-2 px-1 py-3 font-medium text-sm transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
