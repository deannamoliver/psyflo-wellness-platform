import { getSafetyAlerts } from "@/lib/student-alerts/safety-queries";
import { SafetyFilters } from "./safety-filters";
import { SafetySummaryCards } from "./safety-summary-cards";
import { SafetyTableClient } from "./safety-table-client";

type SafetyAlertsContentProps = {
  schoolId: string;
};

export async function SafetyAlertsContent({
  schoolId,
}: SafetyAlertsContentProps) {
  // All filtering is handled client-side for instant response
  const { rows, summary } = await getSafetyAlerts({ schoolId });

  return (
    <>
      <SafetySummaryCards summary={summary} />
      <SafetyFilters />
      <SafetyTableClient rows={rows} />
    </>
  );
}
