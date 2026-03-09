/**
 * Alert generator
 *
 * Creates test alerts with timeline entries and chat alert records
 */

import type { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "../../schema";
import type { TestScenario } from "../types";
import { validators } from "../validators";

/**
 * Creates an alert with timeline entries.
 * If the alert source is "chat" and chatAlert data is provided,
 * also creates a chat_session and chat_alerts record.
 * If the alert source is "coach", also creates a coach_safety_reports record.
 */
export async function createTestAlert(
  db: ReturnType<typeof drizzle>,
  studentId: string,
  alertConfig: NonNullable<TestScenario["alerts"][0]["alert"]>,
  counselorId: string,
  wellnessCoachId: string,
  screenerId?: string,
): Promise<string> {
  // Validate timeline order
  const timelineValidation = validators.timelineOrder(alertConfig.timeline);
  if (!timelineValidation.valid) {
    throw new Error(
      `Invalid alert timeline: ${timelineValidation.errors.join(", ")}`,
    );
  }

  const createdAt =
    alertConfig.createdAt ?? new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: 1 day ago

  // Create alert
  const alertId = await db
    .insert(schema.alerts)
    .values({
      studentId,
      type: alertConfig.type,
      source: alertConfig.source,
      status: alertConfig.status,
      createdAt,
      updatedAt: createdAt,
    })
    .returning({ id: schema.alerts.id })
    .then((rows) => rows[0]?.id);

  if (!alertId) {
    throw new Error("Failed to create alert");
  }

  // Link screener to alert if provided
  if (screenerId) {
    await db.insert(schema.screenerAlerts).values({
      screenerId,
      alertId,
    });
  }

  // Create chat_alerts record if this is a chat-sourced alert with chat data
  if (
    (alertConfig.source === "chat" || alertConfig.source === "coach") &&
    alertConfig.chatAlert
  ) {
    const chatData = alertConfig.chatAlert;

    // Create a chat session for the conversation that triggered the alert
    const chatSessionId = await db
      .insert(schema.chatSessions)
      .values({
        userId: studentId,
        title: "Chat Session",
        createdAt: new Date(createdAt.getTime() - 30 * 60 * 1000), // 30 min before alert
        updatedAt: createdAt,
      })
      .returning({ id: schema.chatSessions.id })
      .then((rows) => rows[0]?.id);

    if (!chatSessionId) {
      throw new Error("Failed to create chat session for chat alert");
    }

    await db.insert(schema.chatAlerts).values({
      alertId,
      chatSessionId,
      triggeringStatement: chatData.triggeringStatement,
      conversationContext: chatData.conversationContext,
      isShutdown: chatData.isShutdown ?? false,
      shutdownRiskType: chatData.shutdownRiskType ?? null,
      cssrState: chatData.cssrState ?? null,
      clarificationResponses: chatData.clarificationResponses ?? null,
    });
  }

  // Create coach_safety_reports record if this is a coach-sourced alert
  if (alertConfig.source === "coach" && alertConfig.chatAlert) {
    await db.insert(schema.coachSafetyReports).values({
      alertId,
      category: "harm_to_self", // Map safety type to harm_to_self category
      riskLevel: "emergency",
      studentDisclosure: alertConfig.chatAlert.triggeringStatement,
      situationSummary: alertConfig.chatAlert.conversationContext,
      screeningResponses: alertConfig.chatAlert.cssrState,
      submittedByCoachId: wellnessCoachId,
      reportStatus: "submitted",
      submittedAt: createdAt,
    });
  }

  // Create timeline entries
  let entryTime = createdAt.getTime();
  const timeIncrement = 60 * 60 * 1000; // 1 hour between entries

  for (const timelineEntry of alertConfig.timeline) {
    const entryCreatedAt = timelineEntry.createdAt ?? new Date(entryTime);

    const timelineEntryId = await db
      .insert(schema.alertTimelineEntries)
      .values({
        alertId,
        type: timelineEntry.type,
        description: timelineEntry.description,
        createdAt: entryCreatedAt,
        updatedAt: entryCreatedAt,
      })
      .returning({ id: schema.alertTimelineEntries.id })
      .then((rows) => rows[0]?.id);

    if (!timelineEntryId) {
      throw new Error("Failed to create timeline entry");
    }

    // Create type-specific records
    if (timelineEntry.type === "emergency_action" && timelineEntry.action) {
      await db.insert(schema.alertActions).values({
        timelineEntryId,
        type: timelineEntry.action,
      });
    }

    if (timelineEntry.type === "note_added" && timelineEntry.noteContent) {
      await db.insert(schema.alertNotes).values({
        timelineEntryId,
        content: timelineEntry.noteContent,
        counselorId,
      });
    }

    if (timelineEntry.type === "status_changed" && timelineEntry.statusChange) {
      await db.insert(schema.alertStatusChanges).values({
        timelineEntryId,
        fromStatus: timelineEntry.statusChange.from,
        toStatus: timelineEntry.statusChange.to,
        counselorId,
      });
    }

    entryTime += timeIncrement;
  }

  return alertId;
}
