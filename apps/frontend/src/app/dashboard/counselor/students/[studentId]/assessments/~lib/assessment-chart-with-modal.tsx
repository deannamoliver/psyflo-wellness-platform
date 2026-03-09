"use client";

import type { screenerTypeEnum } from "@feelwell/database";
import { useState } from "react";
import { AssessmentChart } from "./assessment-chart";
import { AssessmentDetailsModal } from "./assessment-details-modal";

type AssessmentDataPoint = {
  id: string;
  score: number;
  maxScore: number;
  completedAt: Date;
};

type AssessmentChartWithModalProps = {
  dataPoints: AssessmentDataPoint[];
  screenerType: (typeof screenerTypeEnum.enumValues)[number];
  title: string;
};

export function AssessmentChartWithModal({
  dataPoints,
  screenerType,
  title,
}: AssessmentChartWithModalProps) {
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<
    string | null
  >(null);

  return (
    <>
      <AssessmentChart
        dataPoints={dataPoints}
        screenerType={screenerType}
        title={title}
        onPointClick={setSelectedAssessmentId}
      />
      <AssessmentDetailsModal
        assessmentId={selectedAssessmentId}
        onClose={() => setSelectedAssessmentId(null)}
      />
    </>
  );
}
