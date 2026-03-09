"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { type alertStatusEnum, alerts } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { serverDrizzle } from "@/lib/database/drizzle";
import { fmtUserName, titleCase } from "../string-utils";
import { getCurrentUserInfo } from "../user/info";
import { AddNoteSchema } from "./schema";
import {
  createAlertNote,
  createAlertStatusChange,
  createAlertTimelineEntry,
} from "./service/create";

export async function changeAlertStatusAction({
  alertId,
  status,
}: {
  alertId: string;
  status: (typeof alertStatusEnum.enumValues)[number];
}) {
  const db = await serverDrizzle();

  const counselorId = db.userId();
  const alert = await db.admin.query.alerts.findFirst({
    where: eq(alerts.id, alertId),
  });

  if (!alert) {
    notFound();
  }

  // Set resolvedBy to "counselor" when counselor resolves the alert
  const updateData: {
    status: (typeof alertStatusEnum.enumValues)[number];
    resolvedBy?: "counselor";
  } = { status };

  if (status === "resolved") {
    updateData.resolvedBy = "counselor";
  }

  await db.admin.update(alerts).set(updateData).where(eq(alerts.id, alertId));

  const timelineEntryId = await createAlertTimelineEntry({
    alertId,
    type: "status_changed",
    description: `Status changed to ${titleCase(status, {
      delimiter: "_",
    })}`,
  });

  await createAlertStatusChange({
    timelineEntryId,
    fromStatus: alert.status,
    toStatus: status,
    counselorId: counselorId,
  });

  revalidatePath("/dashboard/counselor/alerts");
  revalidatePath(`/dashboard/counselor/alerts/${alertId}`);
  // Also revalidate safety pages
  revalidatePath(`/dashboard/counselor/students/${alert.studentId}/safety`);
  revalidatePath(
    `/dashboard/counselor/students/${alert.studentId}/safety/${alertId}`,
  );
  // Revalidate admin safety monitor
  revalidatePath("/dashboard/admin/safety-monitor");
  revalidatePath(`/dashboard/admin/safety-monitor/${alertId}`);
}

export async function addAlertNoteAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, { schema: AddNoteSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { alertId, note } = submission.value;

  const userInfo = await getCurrentUserInfo();

  const timelineEntryId = await createAlertTimelineEntry({
    alertId,
    type: "note_added",
    description: `${fmtUserName(userInfo)} added a note`,
  });

  await createAlertNote({
    timelineEntryId,
    content: note,
    counselorId: userInfo.id,
  });

  revalidatePath(`/dashboard/counselor/alerts/${alertId}`);

  return submission.reply();
}
