import { alertResolutions, users } from "@feelwell/database";
import { format, isToday, isYesterday } from "date-fns";
import { eq } from "drizzle-orm";
import { CheckCircle2Icon } from "lucide-react";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullNameFromMetaData } from "@/lib/user/utils";

function formatRelativeTime(date: Date): string {
  if (isToday(date)) return `Today • ${format(date, "h:mm a")}`;
  if (isYesterday(date)) return `Yesterday • ${format(date, "h:mm a")}`;
  return `${format(date, "MMMM d, yyyy")} • ${format(date, "h:mm a")}`;
}

/** Maps action value keys stored in DB to human-readable labels. */
const ACTION_LABELS: Record<string, string> = {
  contacted_student: "Contacted student directly",
  safety_assessment: "Conducted safety/risk assessment with student",
  created_safety_plan: "Created safety plan with student",
  connected_counselor: "Connected student with school counselor/social worker",
  contacted_parent: "Contacted parent/guardian",
  updated_safety_plan: "Created/updated safety plan",
  referred_external: "Referred to external provider",
  contacted_911: "Contacted emergency services (911)",
  notified_admin: "Notified school administrator",
  filed_mandatory_report: "Filed mandatory report (CPS, etc.)",
  other_action: "Other action",
};

const STUDENT_STATUS_LABELS: Record<string, string> = {
  crisis_resolved: "Crisis resolved - Student is stable",
  ongoing_support:
    "Ongoing support needed - Counselor will continue monitoring",
  transferred_external: "Transferred to external care",
  hospitalized: "Hospitalized",
  other: "Other",
};

const FOLLOW_UP_LABELS: Record<string, string> = {
  no_follow_up: "No follow-up needed - Case is fully resolved",
  routine_check_ins: "Routine wellness check-ins",
  scheduled_follow_up: "Scheduled follow-up",
  other: "Other",
};

export async function ResolvedAlertSection({ alertId }: { alertId: string }) {
  const db = await serverDrizzle();

  // Fetch the resolution record for this alert
  const resolution = await db.admin
    .select()
    .from(alertResolutions)
    .where(eq(alertResolutions.alertId, alertId))
    .limit(1)
    .then((res) => res[0] ?? null);

  if (!resolution) return null;

  // Get the counselor who resolved it
  let counselorName = "Provider";
  const counselor = await db.admin
    .select({ metaData: users.rawUserMetaData })
    .from(users)
    .where(eq(users.id, resolution.counselorId))
    .limit(1)
    .then((res) => res[0] ?? null);

  if (counselor) {
    counselorName = getUserFullNameFromMetaData(counselor.metaData);
  }

  const resolvedAt = resolution.createdAt;
  const actionsTakenSet = new Set(resolution.actionsTaken);

  // Build actions checklist from all known actions, showing which were selected
  const actionChecklist = Object.entries(ACTION_LABELS).map(
    ([value, label]) => ({
      label,
      done: actionsTakenSet.has(value),
    }),
  );

  // Only show actions that were actually taken
  const completedActions = actionChecklist.filter((a) => a.done);

  const studentStatusLabel =
    STUDENT_STATUS_LABELS[resolution.studentStatus] ?? resolution.studentStatus;
  const followUpLabel =
    FOLLOW_UP_LABELS[resolution.followUpPlan] ?? resolution.followUpPlan;

  return (
    <div className="border-gray-200 border-t bg-gray-100 px-6 py-6 font-dm">
      <div className="rounded-lg bg-white px-6 py-5 shadow-sm">
        <h4 className="font-bold text-base text-gray-900">Resolution Report</h4>
        <p className="mt-1 text-gray-500 text-sm">
          {formatRelativeTime(resolvedAt)} • Submitted by {counselorName},
          School Counselor
        </p>
        <div className="mt-4 border-gray-200 border-b" />

        <div className="mt-4 grid grid-cols-2 gap-10">
          {/* Left column: Resolution Summary */}
          <div>
            <h4 className="mb-2 font-bold text-gray-900 text-sm">
              Resolution Summary
            </h4>
            <div className="rounded-lg bg-gray-50 p-4 text-gray-700 text-sm leading-relaxed">
              {resolution.resolutionSummary}
            </div>
          </div>

          {/* Right column: Actions, Status, Follow-Up */}
          <div className="space-y-4">
            <div>
              <h5 className="mb-2 font-bold text-gray-900 text-sm">
                Actions Taken
              </h5>
              <div className="space-y-2">
                {completedActions.length > 0 ? (
                  completedActions.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 text-sm"
                    >
                      <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                      <span className="text-gray-900">{item.label}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">
                    No actions were recorded.
                  </p>
                )}
              </div>
            </div>

            <div>
              <h5 className="mb-2 font-bold text-gray-900 text-sm">
                Student Status
              </h5>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                <span className="text-gray-900">{studentStatusLabel}</span>
              </div>
            </div>

            <div>
              <h5 className="mb-2 font-bold text-gray-900 text-sm">
                Follow-Up Plan
              </h5>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                <span className="text-gray-900">{followUpLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
