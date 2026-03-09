"use server";

import {
  alertActions,
  alerts,
  alertTimelineEntries,
  coachSafetyReports,
  safetyWorkflows,
  wellnessCoachHandoffs,
} from "@feelwell/database";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { serverDrizzle } from "@/lib/database/drizzle";
import type {
  ConcernType,
  DocumentData,
  RiskLevel,
} from "./safety-workflow-types";

type AlertType =
  | "safety"
  | "harm_to_self"
  | "harm_to_others"
  | "abuse_neglect"
  | "other";

const CONCERN_TO_ALERT_TYPE: Record<ConcernType, AlertType> = {
  harm_to_self: "harm_to_self",
  harm_to_others: "harm_to_others",
  abuse_neglect: "abuse_neglect",
  other_safety: "safety",
};

type ActionType =
  | "contacted_988"
  | "notified_staff"
  | "contacted_parents"
  | "emergency_services_contacted"
  | "cps_notified"
  | "assessment_performed";

function deriveActionTypes(doc: DocumentData): ActionType[] {
  const actions: ActionType[] = [];
  if (doc.emergencyServices.completed)
    actions.push("emergency_services_contacted");
  if (doc.schoolNotified.completed) actions.push("notified_staff");
  if (doc.parentGuardian.completed) actions.push("contacted_parents");
  if (doc.cps.completed) actions.push("cps_notified");
  if (doc.assessment.completed) actions.push("assessment_performed");
  return actions;
}

export async function completeSafetyWorkflow(
  workflowId: string,
  documentData: DocumentData,
  concernType: ConcernType | null,
  riskLevel: RiskLevel | null,
  assessmentData: Record<string, unknown> | null,
) {
  const db = await serverDrizzle();
  const coachId = db.userId();

  // Fetch the workflow to get student/handoff info
  const workflow = await db.admin
    .select()
    .from(safetyWorkflows)
    .where(eq(safetyWorkflows.id, workflowId))
    .limit(1)
    .then((r) => r[0]);

  if (!workflow) throw new Error("Workflow not found");

  const alertType = concernType ? CONCERN_TO_ALERT_TYPE[concernType] : "safety";
  const reportCategory = concernType ?? "other_safety";
  const reportRiskLevel =
    riskLevel ?? (workflow.immediateDanger ? "emergency" : "moderate");

  await db.admin.transaction(async (tx) => {
    // 1. Create alert
    const [alert] = await tx
      .insert(alerts)
      .values({
        studentId: workflow.studentId,
        type: alertType,
        source: "coach",
        status: "new",
      })
      .returning({ id: alerts.id });

    if (!alert) throw new Error("Failed to create alert");
    const alertId = alert.id;

    // 2. Create coach safety report
    await tx.insert(coachSafetyReports).values({
      alertId,
      handoffId: workflow.handoffId,
      category: reportCategory,
      riskLevel: reportRiskLevel,
      studentDisclosure: documentData.studentStatement || null,
      situationSummary: documentData.situationSummary || null,
      screeningResponses: assessmentData,
      submittedByCoachId: coachId,
      reportStatus: "submitted",
      submittedAt: new Date(),
    });

    // 3. Create timeline entry for alert generation
    await tx.insert(alertTimelineEntries).values({
      alertId,
      type: "alert_generated",
      description: "Safety report submitted by wellness coach",
    });

    // 4. Create alert actions based on documented actions
    const actionTypes = deriveActionTypes(documentData);
    if (actionTypes.length > 0) {
      const [actionTimeline] = await tx
        .insert(alertTimelineEntries)
        .values({
          alertId,
          type: "emergency_action",
          description: "Actions taken during safety workflow",
        })
        .returning({ id: alertTimelineEntries.id });

      if (!actionTimeline) throw new Error("Failed to create timeline entry");
      await tx.insert(alertActions).values(
        actionTypes.map((type) => ({
          timelineEntryId: actionTimeline.id,
          type,
        })),
      );
    }

    // 5. Complete the safety workflow
    await tx
      .update(safetyWorkflows)
      .set({
        status: "completed",
        completedAt: new Date(),
        alertId,
        documentData,
      })
      .where(eq(safetyWorkflows.id, workflowId));

    // 6. Link alert to the handoff
    await tx
      .update(wellnessCoachHandoffs)
      .set({ alertId })
      .where(eq(wellnessCoachHandoffs.id, workflow.handoffId));
  });

  revalidatePath(`/dashboard/counselor/conversations/${workflow.handoffId}`);
  revalidatePath("/dashboard/counselor/alerts");
  revalidatePath("/dashboard/counselor/caseloads");
}
