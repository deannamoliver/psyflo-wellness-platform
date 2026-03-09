import type { alertTypeEnum, screenerTypeEnum } from "@feelwell/database";
import type { AlertWithStudent } from "@/lib/alerts/alert-card";
import type {
  AlertSource,
  AlertWithScreener,
  SourceAndTypes,
  StudentAlertsGrouped,
} from "./types";

export function computeStudentStatus(
  alerts: AlertWithStudent[],
): StudentAlertsGrouped["studentStatus"] {
  if (alerts.some((alert) => alert.status === "new")) {
    return "new";
  }
  if (alerts.some((alert) => alert.status === "in_progress")) {
    return "in_progress";
  }
  return "resolved";
}

export function groupSourcesAndTypes(
  alerts: AlertWithStudent[],
): SourceAndTypes[] {
  const sourceMap = new Map<string, Set<string>>();

  for (const alert of alerts) {
    if (!sourceMap.has(alert.source)) {
      sourceMap.set(alert.source, new Set());
    }
    sourceMap.get(alert.source)?.add(alert.type);
  }

  return Array.from(sourceMap.entries()).map(([source, typesSet]) => ({
    source: source as SourceAndTypes["source"],
    alertTypes: Array.from(typesSet) as SourceAndTypes["alertTypes"],
  }));
}

export function getLatestCreatedAt(alerts: AlertWithStudent[]): Date {
  return new Date(
    Math.max(...alerts.map((alert) => alert.createdAt.getTime())),
  );
}

export function transformToStudentGrouped(
  studentId: string,
  alerts: AlertWithScreener[],
): StudentAlertsGrouped {
  if (alerts.length === 0) {
    throw new Error(`No alerts found for student ${studentId}`);
  }

  // All alerts should have the same student info, so we can use the first one
  const student = alerts[0]?.student;

  if (!student) {
    throw new Error(`No student info found for student ${studentId}`);
  }

  return {
    student,
    alerts,
    timelineEntries: [], // Will be populated separately in getStudentWithAllAlerts
    studentStatus: computeStudentStatus(alerts),
    alertCount: alerts.length,
    latestCreatedAt: getLatestCreatedAt(alerts),
    sourcesAndTypes: groupSourcesAndTypes(alerts),
    // Default filtered data to same as all data (for backward compatibility)
    filteredAlerts: alerts,
    filteredAlertCount: alerts.length,
    filteredSourcesAndTypes: groupSourcesAndTypes(alerts),
  };
}

export function transformToStudentGroupedWithFiltered(
  studentId: string,
  allAlerts: AlertWithScreener[],
  filteredAlerts: AlertWithScreener[],
): StudentAlertsGrouped {
  if (allAlerts.length === 0) {
    throw new Error(`No alerts found for student ${studentId}`);
  }

  // All alerts should have the same student info, so we can use the first one
  const student = allAlerts[0]?.student;

  if (!student) {
    throw new Error(`No student info found for student ${studentId}`);
  }

  return {
    student,
    alerts: allAlerts,
    timelineEntries: [], // Not used in this context (list view)
    studentStatus: computeStudentStatus(allAlerts),
    alertCount: allAlerts.length,
    latestCreatedAt: getLatestCreatedAt(allAlerts),
    sourcesAndTypes: groupSourcesAndTypes(allAlerts),
    // Filtered data for display
    filteredAlerts,
    filteredAlertCount: filteredAlerts.length,
    filteredSourcesAndTypes: groupSourcesAndTypes(filteredAlerts),
  };
}

// Define all valid screener combinations based on production alert generation logic
export const VALID_SCREENER_COMBINATIONS: Array<{
  screenerType: "phq_a" | "phq_9" | "gad_child" | "gad_7";
  alertType: "depression" | "anxiety" | "safety";
}> = [
  // GAD screeners generate anxiety alerts
  { screenerType: "gad_7", alertType: "anxiety" },
  { screenerType: "gad_child", alertType: "anxiety" },
  // PHQ screeners generate depression alerts
  { screenerType: "phq_a", alertType: "depression" },
  { screenerType: "phq_9", alertType: "depression" },
  // PHQ screeners can also generate safety alerts (Q9 > 0)
  { screenerType: "phq_a", alertType: "safety" },
  { screenerType: "phq_9", alertType: "safety" },
];

// Helper to check if a screener alert is valid
export function isValidScreenerAlert(alert: AlertWithScreener): boolean {
  // Chat alerts are not valid (stub feature, not yet implemented)
  if (alert.source === "chat") return false;

  // SEL alerts are not valid for now (stub feature)
  if (alert.screener?.type === "sel") return false;

  // Check if screener type + alert type is in valid combinations
  return VALID_SCREENER_COMBINATIONS.some(
    (combo) =>
      alert.screener?.type === combo.screenerType &&
      alert.type === combo.alertType,
  );
}

export function groupAlertsBySource(
  alerts: AlertWithScreener[],
): AlertSource[] {
  const sources: AlertSource[] = [];

  // Build all valid screener sources
  for (const combo of VALID_SCREENER_COMBINATIONS) {
    // Find alerts matching this combination
    const matchingAlerts = alerts.filter(
      (alert) =>
        alert.source === "screener" &&
        alert.screener?.type === combo.screenerType &&
        alert.type === combo.alertType,
    );

    // Sort by status priority (new > in_progress > resolved), then by date
    const sortedAlerts = matchingAlerts.sort((a, b) => {
      const statusPriority = { new: 0, in_progress: 1, resolved: 2 };
      const aPriority = statusPriority[a.status];
      const bPriority = statusPriority[b.status];

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    sources.push({
      sourceType: "screener",
      screenerType: combo.screenerType,
      alertType: combo.alertType,
      alerts: sortedAlerts,
      hasAlerts: sortedAlerts.length > 0,
    });
  }

  // Sort alphabetically by alert type, then screener type
  sources.sort((a, b) => {
    if (a.sourceType === "screener" && b.sourceType === "screener") {
      const alertTypeCompare = getAlertTypeLabel(a.alertType).localeCompare(
        getAlertTypeLabel(b.alertType),
      );
      if (alertTypeCompare !== 0) return alertTypeCompare;

      return getScreenerTypeLabel(a.screenerType).localeCompare(
        getScreenerTypeLabel(b.screenerType),
      );
    }
    return 0;
  });

  // Add chat alerts (sorted by status priority, then date)
  const chatAlerts = alerts.filter((alert) => alert.source === "chat");

  // Sort by status priority (new > in_progress > resolved), then by date
  const sortedChatAlerts = chatAlerts.sort((a, b) => {
    const statusPriority = { new: 0, in_progress: 1, resolved: 2 };
    const aPriority = statusPriority[a.status];
    const bPriority = statusPriority[b.status];

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  sources.push({
    sourceType: "chat",
    alertType: "safety", // Chat alerts are always safety type
    alerts: sortedChatAlerts,
    hasAlerts: sortedChatAlerts.length > 0,
  });

  return sources;
}

export function getScreenerTypeLabel(
  type: (typeof screenerTypeEnum.enumValues)[number],
): string {
  switch (type) {
    case "phq_a":
      return "PHQ-A";
    case "phq_9":
      return "PHQ-9";
    case "gad_child":
      return "GAD-Child";
    case "gad_7":
      return "GAD-7";
    case "sel":
      return "SEL";
  }
}

export function getAlertTypeLabel(
  type: (typeof alertTypeEnum.enumValues)[number],
): string {
  switch (type) {
    case "depression":
      return "Depression";
    case "anxiety":
      return "Anxiety";
    case "safety":
      return "Safety Risk";
    case "abuse_neglect":
      return "Abuse & Neglect";
    case "harm_to_others":
      return "Harm to Others";
    case "harm_to_self":
      return "Harm to Self";
    case "other":
      return "Other";
  }
}
