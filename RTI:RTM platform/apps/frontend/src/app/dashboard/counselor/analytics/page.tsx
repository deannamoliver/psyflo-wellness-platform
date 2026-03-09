import { BarChart2 } from "lucide-react";
import { InsightsDashboard } from "./~lib/insights-dashboard";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6 p-8 font-dm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-teal-50">
          <BarChart2 className="size-5 text-teal-600" />
        </div>
        <div>
          <h1 className="font-bold text-3xl text-gray-900">
            Insights &amp; Analytics
          </h1>
          <p className="text-gray-500">
            Population-level analytics for RTM data capture, patient outcomes, and billing performance
          </p>
        </div>
      </div>
      <InsightsDashboard />
    </div>
  );
}
