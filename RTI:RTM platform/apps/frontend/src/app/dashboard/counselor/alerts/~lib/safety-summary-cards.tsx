import Image from "next/image";
import {
  SUMMARY_CARDS_GRID_CLASS,
  SummaryCard,
} from "@/lib/core-ui/summary-card";
import type { SafetyRiskSummary } from "@/lib/student-alerts/safety-types";

export function SafetySummaryCards({
  summary,
}: {
  summary: SafetyRiskSummary;
}) {
  return (
    <div className={SUMMARY_CARDS_GRID_CLASS}>
      <SummaryCard
        label="EMERGENCY"
        value={summary.emergency}
        sublabel="Patients"
        labelClassName="font-[700] tracking-wide text-red-600"
        iconBgColor="bg-red-50"
        valueColor="text-red-600"
        icon={
          <Image
            src="/emergency-icon.svg"
            alt="Emergency"
            width={20}
            height={20}
            className="size-5 object-contain"
          />
        }
      />
      <SummaryCard
        label="HIGH RISK"
        value={summary.high}
        sublabel="Patients"
        labelClassName="font-[700] tracking-wide text-orange-500"
        iconBgColor="bg-orange-50"
        valueColor="text-orange-500"
        icon={
          <Image
            src="/high-risk-icon.svg"
            alt="High risk"
            width={20}
            height={20}
            className="size-5 object-contain"
          />
        }
      />
      <SummaryCard
        label="MODERATE"
        value={summary.moderate}
        sublabel="Patients"
        labelClassName="font-[700] tracking-wide text-yellow-600"
        iconBgColor="bg-yellow-50"
        valueColor="text-yellow-600"
        icon={
          <Image
            src="/moderate-risk-icon.png"
            alt="Moderate"
            width={20}
            height={20}
            className="size-5 object-contain"
          />
        }
      />
      <SummaryCard
        label="LOW RISK"
        value={summary.low}
        sublabel="Patients"
        labelClassName="font-[700] tracking-wide text-blue-600"
        iconBgColor="bg-blue-50"
        valueColor="text-blue-600"
        icon={
          <Image
            src="/low-risk-icon.png"
            alt="Low risk"
            width={20}
            height={20}
            className="size-5 object-contain"
          />
        }
      />
    </div>
  );
}
