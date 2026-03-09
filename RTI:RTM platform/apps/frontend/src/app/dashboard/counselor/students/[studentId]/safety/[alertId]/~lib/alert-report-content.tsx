import {
  alertActions,
  alertTimelineEntries,
  chatAlerts,
  coachSafetyReports,
} from "@feelwell/database";
import { eq } from "drizzle-orm";
import Image from "next/image";
import { Badge } from "@/lib/core-ui/badge";
import { serverDrizzle } from "@/lib/database/drizzle";
import { titleCase } from "@/lib/string-utils";
import { RiskFactors } from "./risk-factors";

function concernBadgeColor(type: string): string {
  switch (type) {
    case "safety":
      return "bg-red-100 text-red-700";
    case "harm_to_others":
      return "bg-red-100 text-red-700";
    case "depression":
      return "bg-blue-100 text-blue-700";
    case "anxiety":
      return "bg-yellow-100 text-yellow-700";
    case "abuse_neglect":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function concernLabel(type: string): string {
  switch (type) {
    case "safety":
      return "Self-Harm Risk";
    case "harm_to_others":
      return "Harm to Others";
    case "abuse_neglect":
      return "Abuse/Neglect";
    default:
      return titleCase(type, { delimiter: "_" });
  }
}

const ACTION_ICON_MAP: Record<string, string> = {
  contacted_parents: "/action-contacted_parents.png",
  emergency_services_contacted: "/action-emergency_services_contacted.png",
  notified_staff: "/action-notified_staff.png",
  cps_notified: "/action-cps_notified.png",
  assessment_performed: "/action-assessment_performed.png",
};

function actionIconBg(type: string): string {
  switch (type) {
    case "contacted_parents":
      return "bg-green-100";
    case "contacted_988":
    case "emergency_services_contacted":
      return "bg-red-100";
    case "notified_staff":
      return "bg-blue-100";
    case "cps_notified":
      return "bg-purple-100";
    case "assessment_performed":
      return "bg-orange-100";
    default:
      return "bg-gray-100";
  }
}

function actionLabel(type: string): string {
  switch (type) {
    case "contacted_parents":
      return "Parent/Guardian contacted";
    case "contacted_988":
    case "emergency_services_contacted":
      return "Emergency Services contacted";
    case "notified_staff":
      return "Clinic notified";
    case "cps_notified":
      return "CPS notified";
    case "assessment_performed":
      return "Assessment performed";
    case "triggered_gad7":
      return "GAD-7 Assessment triggered";
    case "triggered_phq9":
      return "PHQ-9 Assessment triggered";
    default:
      return titleCase(type, { delimiter: "_" });
  }
}

function parseActionDescription(description: string): {
  details: string;
  notes: string | null;
  statusBadge: { bg: string; text: string; label: string } | null;
} {
  // Split by newline to separate main details from notes
  const lines = description.split("\n");
  const mainPart = lines[0]?.trim() || "";
  const secondLine = lines[1]?.trim() || null;

  // Determine status badge based on second line
  let statusBadge: { bg: string; text: string; label: string } | null = null;
  let notes: string | null = null;

  if (secondLine) {
    const lowerSecond = secondLine.toLowerCase();

    // Check if second line contains status indicators AND additional context
    if (
      lowerSecond.includes("parent will pick up") ||
      lowerSecond === "successful contact"
    ) {
      statusBadge = {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Successful Contact",
      };
      // Show as notes if it has additional information
      if (!lowerSecond.startsWith("successful")) {
        notes = secondLine;
      }
    } else if (
      (lowerSecond.includes("no answer") &&
        lowerSecond.includes("left message")) ||
      lowerSecond === "no answer / left message"
    ) {
      statusBadge = {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        label: "No Answer / Left Message",
      };
      // Don't show as notes if it's just the status description
      notes = null;
    } else {
      // If not a status indicator, treat as notes
      notes = secondLine;
    }
  }

  return {
    details: mainPart,
    notes,
    statusBadge,
  };
}

export async function AlertReportContent({
  alertId,
  alertType,
}: {
  alertId: string;
  alertType: string;
}) {
  const db = await serverDrizzle();

  // Try to get coach safety report first, fallback to chat alert
  const coachReport = await db.admin
    .select()
    .from(coachSafetyReports)
    .where(eq(coachSafetyReports.alertId, alertId))
    .limit(1)
    .then((res) => res[0] ?? null);

  const chatAlert = await db.admin
    .select()
    .from(chatAlerts)
    .where(eq(chatAlerts.alertId, alertId))
    .limit(1)
    .then((res) => res[0] ?? null);

  const timelineEntries = await db.admin
    .select()
    .from(alertTimelineEntries)
    .where(eq(alertTimelineEntries.alertId, alertId));

  const actionEntries = await Promise.all(
    timelineEntries
      .filter((e) => e.type === "emergency_action")
      .map(async (entry) => {
        const actions = await db.admin
          .select()
          .from(alertActions)
          .where(eq(alertActions.timelineEntryId, entry.id));
        return { entry, actions };
      }),
  );

  // Use coach report data if available, otherwise fall back to chat alert
  const studentDisclosure =
    coachReport?.studentDisclosure || chatAlert?.triggeringStatement;

  // Get CSSR state for risk factors
  const cssrState = (coachReport?.screeningResponses ||
    chatAlert?.cssrState) as Record<string, boolean> | null;

  return (
    <div className="grid grid-cols-1 gap-0 border-gray-200 border-t lg:grid-cols-5">
      {/* Left column: Alert Details */}
      <div className="space-y-5 p-6 lg:col-span-2">
        {/* Concern Category */}
        <div>
          <p className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">
            Concern Category
          </p>
          <span
            className={`inline-block rounded-full px-3 py-1 font-medium text-xs ${concernBadgeColor(alertType)}`}
          >
            {concernLabel(alertType)}
          </span>
        </div>

        {/* Student Disclosure */}
        {studentDisclosure && (
          <div>
            <h4 className="mb-2 font-bold text-gray-900 text-sm">
              Student Disclosure
            </h4>
            <div className="rounded-lg bg-gray-50 p-4 text-gray-700 text-sm italic leading-relaxed">
              &quot;{studentDisclosure}&quot;
            </div>
          </div>
        )}

        {/* Situation Summary */}
        {coachReport?.situationSummary && (
          <div>
            <h4 className="mb-2 font-bold text-gray-900 text-sm">
              Situation Summary
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {coachReport.situationSummary}
            </p>
          </div>
        )}

        {/* Actions Taken */}
        {actionEntries.length > 0 && (
          <div>
            <h4 className="mb-3 font-bold text-gray-900 text-sm">
              Actions Taken
            </h4>
            <div className="space-y-4">
              {actionEntries.map(({ entry, actions }) =>
                actions.map((action) => {
                  const iconSrc = ACTION_ICON_MAP[action.type];
                  const iconBg = actionIconBg(action.type);
                  const parsed = entry.description
                    ? parseActionDescription(entry.description)
                    : { details: "", notes: null, statusBadge: null };

                  return (
                    <div
                      key={action.id}
                      className="border-gray-100 border-b pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg}`}
                        >
                          {iconSrc ? (
                            <Image
                              src={iconSrc}
                              alt=""
                              width={16}
                              height={16}
                              className="h-4 w-4"
                            />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 text-sm">
                              {actionLabel(action.type)}
                            </p>
                            {parsed.statusBadge && (
                              <Badge
                                className={`rounded-full px-2 py-0.5 font-medium text-xs ${parsed.statusBadge.bg} ${parsed.statusBadge.text}`}
                              >
                                {parsed.statusBadge.label}
                              </Badge>
                            )}
                          </div>
                          {parsed.details && (
                            <p className="mt-0.5 text-gray-500 text-xs">
                              {parsed.details}
                            </p>
                          )}
                          {parsed.notes !== null && (
                            <div className="mt-1.5 text-gray-600 text-xs">
                              <span className="font-medium">Notes:</span>{" "}
                              {parsed.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }),
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right column: Risk Factors */}
      <div className="lg:col-span-3">
        <RiskFactors cssrState={cssrState} />
      </div>
    </div>
  );
}
