"use server";

import { type alertStatusEnum, alerts } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  createAlertStatusChange,
  createAlertTimelineEntry,
} from "@/lib/alerts/service/create";
import { serverDrizzle } from "@/lib/database/drizzle";
import { fmtUserName, titleCase } from "@/lib/string-utils";
import { getCurrentUserInfo } from "@/lib/user/info";

export async function changeStudentAlertsStatusAction({
  studentId,
  status,
}: {
  studentId: string;
  status: (typeof alertStatusEnum.enumValues)[number];
}) {
  const db = await serverDrizzle();
  const userInfo = await getCurrentUserInfo();
  const counselorId = db.userId();

  // Get all alerts for this student that need status updates
  const studentAlerts = await db.admin.query.alerts.findMany({
    where: eq(alerts.studentId, studentId),
  });

  // Determine which alerts to update based on business logic
  const alertsToUpdate = studentAlerts.filter((alert) => {
    if (status === "in_progress") {
      // Only update "new" alerts to "in_progress"
      return alert.status === "new";
    }
    if (status === "resolved") {
      // Update both "new" and "in_progress" alerts to "resolved"
      return alert.status === "new" || alert.status === "in_progress";
    }
    return false;
  });

  // Update each alert and create timeline entries
  for (const alert of alertsToUpdate) {
    const fromStatus = alert.status;

    // Update alert status
    await db.admin
      .update(alerts)
      .set({ status })
      .where(eq(alerts.id, alert.id));

    // Create timeline entry
    const timelineEntryId = await createAlertTimelineEntry({
      alertId: alert.id,
      type: "status_changed",
      description: `${fmtUserName(userInfo)} changed status to ${titleCase(
        status,
        {
          delimiter: "_",
        },
      )}`,
    });

    // Create status change record
    await createAlertStatusChange({
      timelineEntryId,
      fromStatus,
      toStatus: status,
      counselorId,
    });
  }

  // Revalidate relevant pages
  revalidatePath("/dashboard/counselor/alerts");
  revalidatePath(`/dashboard/counselor/alerts/student/${studentId}`);
}
