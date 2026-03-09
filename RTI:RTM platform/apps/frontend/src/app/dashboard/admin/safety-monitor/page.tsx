import { Shield } from "lucide-react";
import { Suspense } from "react";
import { SafetyMonitorContent } from "./~lib/safety-monitor-content";

export default function SafetyMonitorPage() {
  return (
    <div className="flex flex-col gap-6 p-8 font-dm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-red-50">
          <Shield className="size-5 text-red-600" />
        </div>
        <div>
          <h1 className="font-bold text-3xl text-gray-900">Safety Monitor</h1>
          <p className="text-gray-500">
            Real-time oversight of all safety alerts across all organizations
          </p>
        </div>
      </div>
      <Suspense fallback={<SafetyMonitorSkeleton />}>
        <SafetyMonitorContent />
      </Suspense>
    </div>
  );
}

const SKELETON_IDS = ["s1", "s2", "s3", "s4", "s5"];

function SafetyMonitorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {SKELETON_IDS.map((id) => (
          <div
            key={id}
            className="h-32 animate-pulse rounded-xl border bg-gray-100"
          />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-lg border bg-gray-100" />
      <div className="h-64 animate-pulse rounded-lg border bg-gray-100" />
    </div>
  );
}
