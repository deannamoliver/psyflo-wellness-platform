"use client";

import {
  AlertTriangle,
  Calendar,
  Info,
  Shield,
} from "lucide-react";
import { AccessRestrictionsSection } from "./location-config-restrictions";
import type { AssessmentConfig, LocationDetail } from "./location-detail-data";

export function LocationConfigTab({ location }: { location: LocationDetail }) {
  return (
    <div className="flex flex-col gap-8">
      <AccessRestrictionsSection />
      <AssessmentSection assessments={location.assessments} />
    </div>
  );
}

const ASSESSMENT_ICONS: Record<string, React.ReactNode> = {
  sel: (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100">
      <Shield className="h-4 w-4 text-pink-600" />
    </div>
  ),
  phq9: (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
      <Info className="h-4 w-4 text-blue-600" />
    </div>
  ),
  gad7: (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
      <AlertTriangle className="h-4 w-4 text-purple-600" />
    </div>
  ),
};

function AssessmentSection({
  assessments,
}: {
  assessments: AssessmentConfig[];
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
          <Calendar className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-lg">
            Assessment & Screener Frequency
          </h2>
          <p className="text-gray-500 text-sm">
            Configure how often students are prompted to complete assessments
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {assessments.map((a) => (
          <div key={a.name} className="rounded-lg border border-gray-200 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {ASSESSMENT_ICONS[a.icon]}
                <div>
                  <div className="font-semibold text-gray-900">{a.name}</div>
                  <div className="text-gray-500 text-sm">{a.description}</div>
                </div>
              </div>
              <span
                className={`flex items-center gap-1.5 font-medium text-sm ${a.active ? "text-green-600" : "text-gray-400"}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${a.active ? "bg-green-500" : "bg-gray-300"}`}
                />
                {a.active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 px-4 py-3">
                <div className="text-gray-500 text-xs">Frequency</div>
                <div className="font-medium text-gray-900">{a.frequency}</div>
              </div>
              <div className="rounded-lg border border-gray-200 px-4 py-3">
                <div className="text-gray-500 text-xs">Next Scheduled Date</div>
                <div className="flex items-center gap-1.5 font-medium text-gray-900">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  {a.nextScheduledDate}
                </div>
              </div>
            </div>
            {a.note && (
              <div className="mt-3 flex items-start gap-2 text-gray-500 text-sm">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <span>
                  <span className="font-medium">Note:</span> {a.note}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
