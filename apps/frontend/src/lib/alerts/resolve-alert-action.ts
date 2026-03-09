"use server";

import { alertResolutions, alerts } from "@feelwell/database";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { serverDrizzle } from "@/lib/database/drizzle";
import { titleCase } from "../string-utils";
import {
  createAlertStatusChange,
  createAlertTimelineEntry,
} from "./service/create";

type ResolveAlertInput = {
  alertIds: string[];
  actionsTaken: string[];
  resolutionSummary: string;
  studentStatus: string;
  followUpPlan: string;
};

export async function resolveAlertAction(
  data: ResolveAlertInput,
): Promise<{ ok: boolean; error?: string }> {
  const db = await serverDrizzle();
  const counselorId = db.userId();

  const alertRecords = await db.admin.query.alerts.findMany({
    where: inArray(alerts.id, data.alertIds),
  });

  if (alertRecords.length === 0) {
    return { ok: false, error: "No alerts found." };
  }

  try {
    for (const alert of alertRecords) {
      // Insert resolution record
      await db.admin.insert(alertResolutions).values({
        alertId: alert.id,
        counselorId,
        actionsTaken: data.actionsTaken,
        resolutionSummary: data.resolutionSummary,
        studentStatus:
          data.studentStatus as typeof alertResolutions.$inferInsert.studentStatus,
        followUpPlan:
          data.followUpPlan as typeof alertResolutions.$inferInsert.followUpPlan,
        verificationCompleted: true,
      });

      // Update alert status to resolved
      await db.admin
        .update(alerts)
        .set({ status: "resolved", resolvedBy: "counselor" })
        .where(eq(alerts.id, alert.id));

      // Create timeline entry
      const timelineEntryId = await createAlertTimelineEntry({
        alertId: alert.id,
        type: "status_changed",
        description: `Status changed to ${titleCase("resolved", { delimiter: "_" })}`,
      });

      await createAlertStatusChange({
        timelineEntryId,
        fromStatus: alert.status,
        toStatus: "resolved",
        counselorId,
      });
    }
  } catch {
    return { ok: false, error: "Failed to resolve alert. Please try again." };
  }

  // Revalidate all relevant pages
  const studentIds = [...new Set(alertRecords.map((a) => a.studentId))];
  revalidatePath("/dashboard/counselor/alerts");
  for (const alertRecord of alertRecords) {
    revalidatePath(`/dashboard/counselor/alerts/${alertRecord.id}`);
  }
  for (const sid of studentIds) {
    revalidatePath(`/dashboard/counselor/students/${sid}/safety`);
    revalidatePath(`/dashboard/counselor/alerts/student/${sid}`);
  }
  // Revalidate admin safety monitor
  revalidatePath("/dashboard/admin/safety-monitor");
  for (const alertRecord of alertRecords) {
    revalidatePath(`/dashboard/admin/safety-monitor/${alertRecord.id}`);
  }

  return { ok: true };
}
