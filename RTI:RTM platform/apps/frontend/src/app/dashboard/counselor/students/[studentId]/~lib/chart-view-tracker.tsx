"use client";

import { useEffect, useRef } from "react";
import { recordChartView, endChartView } from "./clinician-time-actions";

/**
 * Invisible component that automatically tracks clinician time
 * when they view a patient's chart. Records the start time on mount,
 * and the end time on unmount (when they navigate away).
 */
export function ChartViewTracker({
  studentId,
  pageViewed,
}: {
  studentId: string;
  pageViewed: string;
}) {
  const startedAt = useRef<string>(new Date().toISOString());

  useEffect(() => {
    // Record that the counselor started viewing this chart
    recordChartView(studentId, pageViewed);

    return () => {
      // Record end time when navigating away
      endChartView(studentId, startedAt.current);
    };
  }, [studentId, pageViewed]);

  return null;
}
