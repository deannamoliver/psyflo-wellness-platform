"use server";

import {
  emergencyContacts,
  safetyWorkflows,
  schoolHours,
} from "@feelwell/database";
import { and, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { serverDrizzle } from "@/lib/database/drizzle";
import type {
  ConcernType,
  EmergencyContactInfo,
  RiskLevel,
} from "./safety-workflow-types";

function isDuringSchoolHours(
  hours: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isSchoolDay: boolean;
  }[],
  timezone: string,
): boolean {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const dayName = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = parts.find((p) => p.type === "hour")?.value ?? "0";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "0";

  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const currentDay = dayMap[dayName] ?? 0;
  const currentTime = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;

  const todayHours = hours.find((h) => h.dayOfWeek === currentDay);
  if (!todayHours || !todayHours.isSchoolDay) return false;
  return (
    currentTime >= todayHours.startTime && currentTime <= todayHours.endTime
  );
}

export async function activateSafetyWorkflow(
  handoffId: string,
  studentId: string,
  schoolId: string | null,
) {
  const db = await serverDrizzle();
  const coachId = db.userId();

  let duringSchoolHours = false;
  if (schoolId) {
    const hours = await db.admin
      .select({
        dayOfWeek: schoolHours.dayOfWeek,
        startTime: schoolHours.startTime,
        endTime: schoolHours.endTime,
        isSchoolDay: schoolHours.isSchoolDay,
        timezone: schoolHours.timezone,
      })
      .from(schoolHours)
      .where(eq(schoolHours.schoolId, schoolId));

    if (hours.length > 0) {
      duringSchoolHours = isDuringSchoolHours(hours, hours[0]!.timezone);
    }
  }

  const [workflow] = await db.admin
    .insert(safetyWorkflows)
    .values({
      handoffId,
      studentId,
      initiatedByCoachId: coachId,
      schoolId,
      isDuringSchoolHours: duringSchoolHours,
    })
    .returning({ id: safetyWorkflows.id });

  revalidatePath(`/dashboard/counselor/conversations/${handoffId}`);
  revalidatePath(`/dashboard/admin/conversations/${handoffId}`);
  return workflow!.id;
}

export async function updateWorkflowDanger(
  workflowId: string,
  immediateDanger: boolean,
) {
  const db = await serverDrizzle();

  await db.admin
    .update(safetyWorkflows)
    .set({ immediateDanger })
    .where(eq(safetyWorkflows.id, workflowId));

  const workflow = await db.admin
    .select({ handoffId: safetyWorkflows.handoffId })
    .from(safetyWorkflows)
    .where(eq(safetyWorkflows.id, workflowId))
    .limit(1)
    .then((r) => r[0]);

  if (workflow) {
    revalidatePath(`/dashboard/counselor/conversations/${workflow.handoffId}`);
    revalidatePath(`/dashboard/admin/conversations/${workflow.handoffId}`);
  }
}

export async function updateWorkflowConcernType(
  workflowId: string,
  concernType: ConcernType,
) {
  const db = await serverDrizzle();

  await db.admin
    .update(safetyWorkflows)
    .set({ concernType })
    .where(eq(safetyWorkflows.id, workflowId));

  const workflow = await db.admin
    .select({ handoffId: safetyWorkflows.handoffId })
    .from(safetyWorkflows)
    .where(eq(safetyWorkflows.id, workflowId))
    .limit(1)
    .then((r) => r[0]);

  if (workflow) {
    revalidatePath(`/dashboard/counselor/conversations/${workflow.handoffId}`);
    revalidatePath(`/dashboard/admin/conversations/${workflow.handoffId}`);
  }
}

export async function cancelSafetyWorkflow(workflowId: string) {
  const db = await serverDrizzle();

  const workflow = await db.admin
    .select({ handoffId: safetyWorkflows.handoffId })
    .from(safetyWorkflows)
    .where(eq(safetyWorkflows.id, workflowId))
    .limit(1)
    .then((r) => r[0]);

  await db.admin
    .update(safetyWorkflows)
    .set({ status: "cancelled", completedAt: new Date() })
    .where(eq(safetyWorkflows.id, workflowId));

  if (workflow) {
    revalidatePath(`/dashboard/counselor/conversations/${workflow.handoffId}`);
    revalidatePath(`/dashboard/admin/conversations/${workflow.handoffId}`);
  }
}

export async function updateWorkflowAssessment(
  workflowId: string,
  assessmentData: Record<string, unknown>,
) {
  const db = await serverDrizzle();

  await db.admin
    .update(safetyWorkflows)
    .set({ assessmentData })
    .where(eq(safetyWorkflows.id, workflowId));

  const workflow = await db.admin
    .select({ handoffId: safetyWorkflows.handoffId })
    .from(safetyWorkflows)
    .where(eq(safetyWorkflows.id, workflowId))
    .limit(1)
    .then((r) => r[0]);

  if (workflow) {
    revalidatePath(`/dashboard/counselor/conversations/${workflow.handoffId}`);
    revalidatePath(`/dashboard/admin/conversations/${workflow.handoffId}`);
  }
}

export async function updateWorkflowRiskLevel(
  workflowId: string,
  riskLevel: RiskLevel,
  professionalJudgment?: string,
) {
  const db = await serverDrizzle();

  await db.admin
    .update(safetyWorkflows)
    .set({ riskLevel, professionalJudgment: professionalJudgment ?? null })
    .where(eq(safetyWorkflows.id, workflowId));

  const workflow = await db.admin
    .select({ handoffId: safetyWorkflows.handoffId })
    .from(safetyWorkflows)
    .where(eq(safetyWorkflows.id, workflowId))
    .limit(1)
    .then((r) => r[0]);

  if (workflow) {
    revalidatePath(`/dashboard/counselor/conversations/${workflow.handoffId}`);
    revalidatePath(`/dashboard/admin/conversations/${workflow.handoffId}`);
  }
}

export async function updateWorkflowActData(
  workflowId: string,
  actData: Record<string, unknown>,
) {
  const db = await serverDrizzle();

  await db.admin
    .update(safetyWorkflows)
    .set({ actData })
    .where(eq(safetyWorkflows.id, workflowId));

  const workflow = await db.admin
    .select({ handoffId: safetyWorkflows.handoffId })
    .from(safetyWorkflows)
    .where(eq(safetyWorkflows.id, workflowId))
    .limit(1)
    .then((r) => r[0]);

  if (workflow) {
    revalidatePath(`/dashboard/counselor/conversations/${workflow.handoffId}`);
    revalidatePath(`/dashboard/admin/conversations/${workflow.handoffId}`);
  }
}

export async function fetchEmergencyContacts(
  studentId: string,
  schoolId: string | null,
): Promise<EmergencyContactInfo[]> {
  const db = await serverDrizzle();

  const conditions = [eq(emergencyContacts.studentId, studentId)];
  if (schoolId) {
    conditions.push(eq(emergencyContacts.schoolId, schoolId));
  }

  const rows = await db.admin
    .select({
      id: emergencyContacts.id,
      name: emergencyContacts.name,
      relation: emergencyContacts.relation,
      contactType: emergencyContacts.contactType,
      tag: emergencyContacts.tag,
      primaryPhone: emergencyContacts.primaryPhone,
      secondaryPhone: emergencyContacts.secondaryPhone,
      primaryEmail: emergencyContacts.primaryEmail,
      secondaryEmail: emergencyContacts.secondaryEmail,
    })
    .from(emergencyContacts)
    .where(or(...conditions));

  return rows;
}

export async function fetchActiveWorkflow(handoffId: string) {
  const db = await serverDrizzle();

  return db.admin
    .select()
    .from(safetyWorkflows)
    .where(
      and(
        eq(safetyWorkflows.handoffId, handoffId),
        eq(safetyWorkflows.status, "active"),
      ),
    )
    .limit(1)
    .then((r) => r[0] ?? null);
}
