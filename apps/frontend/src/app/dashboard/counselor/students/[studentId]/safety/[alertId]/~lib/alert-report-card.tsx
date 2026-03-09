"use client";

import { useState } from "react";
import type { SafetyRiskLevel } from "@/lib/student-alerts/safety-types";
import { AlertReportHeader } from "./alert-report-header";

type AlertData = {
  id: string;
  type: string;
  source: string;
  status: string;
  createdAt: Date;
};

export function AlertReportCard({
  alert,
  coachName,
  riskLevel,
  children,
}: {
  alert: AlertData;
  coachName?: string;
  riskLevel: SafetyRiskLevel;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <>
      <AlertReportHeader
        alert={alert}
        riskLevel={riskLevel}
        expanded={expanded}
        onToggle={() => setExpanded((e) => !e)}
        coachName={coachName}
      />
      {expanded ? children : null}
    </>
  );
}
