"server-only";

import {
  type actionTypeEnum,
  alertActions,
  alertNotes,
  type alertSourceEnum,
  alertStatusChanges,
  type alertStatusEnum,
  alerts,
  alertTimelineEntries,
  type alertTypeEnum,
  screenerAlerts,
  type timelineEntryTypeEnum,
} from "@feelwell/database";
import { serverDrizzle } from "@/lib/database/drizzle";
import { internalServerError } from "@/lib/errors";

export async function createAlert(props: {
  studentId: string;
  type: (typeof alertTypeEnum.enumValues)[number];
  source: (typeof alertSourceEnum.enumValues)[number];
}): Promise<string> {
  const db = await serverDrizzle();

  const id = await db.admin
    .insert(alerts)
    .values({
      studentId: props.studentId,
      type: props.type,
      source: props.source,
      status: "new",
    })
    .returning({ id: alerts.id })
    .then((alert) => alert[0]?.id);

  if (!id) {
    internalServerError("Failed to create alert");
  }

  return id;
}

export async function createAlertTimelineEntry(props: {
  alertId: string;
  type: (typeof timelineEntryTypeEnum.enumValues)[number];
  description: string;
}): Promise<string> {
  const db = await serverDrizzle();

  const id = await db.admin
    .insert(alertTimelineEntries)
    .values(props)
    .returning({ id: alertTimelineEntries.id })
    .then((timelineEntry) => timelineEntry[0]?.id);

  if (!id) {
    internalServerError("Failed to create alert timeline entry");
  }

  return id;
}

export async function createAlertNote(props: {
  timelineEntryId: string;
  content: string;
  counselorId: string;
}): Promise<string> {
  const db = await serverDrizzle();
  const id = await db.admin
    .insert(alertNotes)
    .values(props)
    .returning({ id: alertNotes.id })
    .then((note) => note[0]?.id);

  if (!id) {
    internalServerError("Failed to create alert note");
  }

  return id;
}

export async function createAlertAction(props: {
  timelineEntryId: string;
  type: (typeof actionTypeEnum.enumValues)[number];
}): Promise<string> {
  const db = await serverDrizzle();

  const id = await db.admin
    .insert(alertActions)
    .values(props)
    .returning({ id: alertActions.id })
    .then((action) => action[0]?.id);

  if (!id) {
    internalServerError("Failed to create alert action");
  }

  return id;
}

export async function createAlertStatusChange(props: {
  timelineEntryId: string;
  fromStatus: (typeof alertStatusEnum.enumValues)[number];
  toStatus: (typeof alertStatusEnum.enumValues)[number];
  counselorId: string;
}): Promise<string> {
  const db = await serverDrizzle();

  const id = await db.admin
    .insert(alertStatusChanges)
    .values(props)
    .returning({ id: alertStatusChanges.id })
    .then((statusChange) => statusChange[0]?.id);

  if (!id) {
    internalServerError("Failed to create alert status change");
  }

  return id;
}

export async function createScreenerAlert(props: {
  screenerId: string;
  alertId: string;
}): Promise<string> {
  const db = await serverDrizzle();

  const id = await db.admin
    .insert(screenerAlerts)
    .values(props)
    .returning({ id: screenerAlerts.id })
    .then((alert) => alert[0]?.id);

  if (!id) {
    internalServerError("Failed to create screener alert link");
  }

  return id;
}
