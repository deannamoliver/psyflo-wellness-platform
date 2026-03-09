/**
 * Chat Alert Database Tools
 *
 * Functions for managing alert records during the risk protocol:
 * - Create parent alert when risk is detected
 * - Create linked chat_alert with conversation details
 * - Update chat_alert incrementally as protocol progresses
 *
 * These are regular async functions (not LangChain tools) since they're
 * called programmatically by graph nodes, not by the LLM.
 */

import { alerts, chatAlerts } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import type {
  ClarificationResponses,
  CreateAlertResult,
  CreateChatAlertResult,
  CSSRState,
  UpdateChatAlertResult,
} from "../risk-protocol/types";

/**
 * Create a parent alert record for suicide risk detected in chat
 *
 * @returns Alert ID and success status
 */
export async function createRiskAlert(
  alertType: "safety" | "abuse_neglect" | "harm_to_others" = "safety",
): Promise<CreateAlertResult> {
  const db = await serverDrizzle();
  const studentId = db.userId(); // Gets authenticated user ID (throws if not authenticated)

  // Insert alert record
  const [alert] = await db.admin
    .insert(alerts)
    .values({
      studentId,
      type: alertType, // Chatbot-created alerts are always safety-type or abuse_neglect
      source: "chat",
      status: "new",
    })
    .returning({ alertId: alerts.id });

  if (!alert) {
    throw new Error("Failed to create alert record");
  }

  console.log("[DB] Created alert:", {
    alertId: alert.alertId,
    studentId,
    source: "chat",
    type: alertType,
    status: "new",
  });

  return {
    alertId: alert.alertId,
    success: true,
  };
}

/**
 * Create a chat_alerts record linked to parent alert
 *
 * @param alertId - Parent alert ID (from alerts table)
 * @param chatSessionId - Chat session ID from LangGraph thread
 * @param triggeringStatement - The student's message that triggered the alert
 * @param conversationHistory - Array of messages leading up to the alert
 * @param riskType - The type of risk detected (direct, indirect, or ambiguous)
 * @returns Chat alert ID and success status
 */
export async function createChatAlert(
  alertId: string,
  chatSessionId: string,
  triggeringStatement: string,
  conversationHistory: Array<{ role: string; content: string }>,
  riskType:
    | "direct"
    | "indirect"
    | "ambiguous"
    | "abuse_neglect"
    | "harm_to_others",
): Promise<CreateChatAlertResult> {
  const db = await serverDrizzle();

  // Convert conversation history to string for storage
  const conversationContext = JSON.stringify(conversationHistory);

  // Insert chat_alerts record with risk type
  const [chatAlert] = await db.admin
    .insert(chatAlerts)
    .values({
      alertId,
      chatSessionId,
      triggeringStatement,
      conversationContext,
      cssrState: null, // Will be updated incrementally as protocol progresses
      shutdownRiskType: riskType, // Store risk type on creation
    })
    .returning({ chatAlertId: chatAlerts.id });

  if (!chatAlert) {
    throw new Error("Failed to create chat alert record");
  }

  console.log("[DB] Created chat alert:", {
    chatAlertId: chatAlert.chatAlertId,
    alertId,
    chatSessionId,
    conversationHistoryLength: conversationHistory.length,
    triggeringStatement: triggeringStatement,
    riskType,
  });

  return {
    chatAlertId: chatAlert.chatAlertId,
    success: true,
  };
}

/**
 * Update chat_alerts record incrementally
 * Used to persist protocol state (conversationContext, clarificationResponses, cssrState, and shutdown info)
 *
 * @param chatAlertId - Chat alert ID to update
 * @param updates - Fields to update (conversationContext, clarificationResponses, cssrState, and/or shutdown tracking)
 * @returns Success status
 */
export async function updateChatAlert(
  chatAlertId: string,
  updates: {
    conversationContext?: string;
    clarificationResponses?: ClarificationResponses;
    cssrState?: CSSRState | null;
    isShutdown?: boolean;
    shutdownRiskType?:
      | "direct"
      | "indirect"
      | "ambiguous"
      | "abuse_neglect"
      | "harm_to_others"
      | null;
  },
): Promise<UpdateChatAlertResult> {
  const db = await serverDrizzle();

  await db.admin
    .update(chatAlerts)
    .set(updates)
    .where(eq(chatAlerts.id, chatAlertId));

  console.log("[DB] Updated chat alert:", {
    chatAlertId,
    updates: {
      conversationContext: updates.conversationContext,
      clarificationResponses: updates.clarificationResponses,
      cssrState: updates.cssrState,
      isShutdown: updates.isShutdown,
      shutdownRiskType: updates.shutdownRiskType,
    },
  });

  return {
    success: true,
  };
}

/**
 * Update alert status
 * Used to mark alerts as in_progress or resolved
 *
 * @param alertId - Alert ID to update
 * @param status - New status value
 * @param resolvedBy - Who resolved the alert (optional, only relevant when status is 'resolved')
 * @returns Success status
 */
export async function updateAlertStatus(
  alertId: string,
  status: "new" | "in_progress" | "resolved",
  resolvedBy?: "counselor" | "chatbot",
): Promise<{ success: boolean }> {
  const db = await serverDrizzle();

  const updateData: {
    status: "new" | "in_progress" | "resolved";
    resolvedBy?: "counselor" | "chatbot";
  } = { status };

  // Only set resolvedBy if provided (chatbot will pass this, counselor won't need to)
  if (resolvedBy !== undefined) {
    updateData.resolvedBy = resolvedBy;
  }

  await db.admin.update(alerts).set(updateData).where(eq(alerts.id, alertId));

  console.log("[DB] Updated alert status:", {
    alertId,
    status,
    resolvedBy: resolvedBy ?? "not specified",
  });

  return {
    success: true,
  };
}

/**
 * Create a situational distress alert (auto-resolved, for counselor awareness only)
 *
 * Used when student expresses situational hopelessness/burden/escape that doesn't
 * meet the threshold for risk protocol but should be tracked for counselor awareness.
 * The alert is created as "resolved by chatbot" so it appears in history but doesn't
 * require counselor action.
 *
 * @param chatSessionId - Chat session ID from LangGraph thread
 * @param situationalContext - Description of the situational distress
 * @param triggeringStatement - The student's message that triggered detection
 * @returns Alert ID and success status
 */
export async function createSituationalAlert(
  chatSessionId: string,
  situationalContext: string,
  triggeringStatement: string,
): Promise<{ alertId: string; chatAlertId: string; success: boolean }> {
  const db = await serverDrizzle();
  const studentId = db.userId();

  // Create parent alert
  const [alert] = await db.admin
    .insert(alerts)
    .values({
      studentId,
      type: "safety",
      source: "chat",
      status: "new",
      resolvedBy: "chatbot",
    })
    .returning({ alertId: alerts.id });

  if (!alert) {
    throw new Error("Failed to create situational alert record");
  }

  // Create chat_alert with situational context
  const [chatAlert] = await db.admin
    .insert(chatAlerts)
    .values({
      alertId: alert.alertId,
      chatSessionId,
      triggeringStatement,
      conversationContext: situationalContext, // Store the situational context description
      isShutdown: false, // No shutdown for situational alerts
      shutdownRiskType: null, // No risk type - this is informational only
    })
    .returning({ chatAlertId: chatAlerts.id });

  if (!chatAlert) {
    throw new Error("Failed to create situational chat alert record");
  }

  console.log("[DB] Created situational distress alert (auto-resolved):", {
    alertId: alert.alertId,
    chatAlertId: chatAlert.chatAlertId,
    studentId,
    situationalContext,
  });

  return {
    alertId: alert.alertId,
    chatAlertId: chatAlert.chatAlertId,
    success: true,
  };
}

/**
 * Create a labile/volatile suicidality alert (requires counselor attention)
 *
 * Used when student indicates fluctuating suicidal thoughts (come and go, on and off).
 * Unlike situational alerts, labile alerts are NOT auto-resolved because fluctuating
 * suicidality is a risk factor that requires counselor follow-up.
 *
 * @param chatSessionId - Chat session ID from LangGraph thread
 * @param labileContext - Description of the volatility pattern detected
 * @param triggeringStatement - The student's message that indicated lability
 * @returns Alert ID and success status
 */
export async function createLabileAlert(
  chatSessionId: string,
  labileContext: string,
  triggeringStatement: string,
): Promise<{ alertId: string; chatAlertId: string; success: boolean }> {
  const db = await serverDrizzle();
  const studentId = db.userId();

  // Create parent alert - NOT auto-resolved, requires counselor attention
  const [alert] = await db.admin
    .insert(alerts)
    .values({
      studentId,
      type: "safety",
      source: "chat",
      status: "new", // Requires counselor review
      // resolvedBy: null - not resolved yet
    })
    .returning({ alertId: alerts.id });

  if (!alert) {
    throw new Error("Failed to create labile alert record");
  }

  // Create chat_alert with labile context
  const [chatAlert] = await db.admin
    .insert(chatAlerts)
    .values({
      alertId: alert.alertId,
      chatSessionId,
      triggeringStatement,
      conversationContext: labileContext,
      isShutdown: false, // No shutdown - conversation continues with support
      shutdownRiskType: "indirect", // Classify as indirect risk for tracking
    })
    .returning({ chatAlertId: chatAlerts.id });

  if (!chatAlert) {
    throw new Error("Failed to create labile chat alert record");
  }

  console.log("[DB] Created labile suicidality alert (requires counselor):", {
    alertId: alert.alertId,
    chatAlertId: chatAlert.chatAlertId,
    studentId,
    labileContext,
  });

  return {
    alertId: alert.alertId,
    chatAlertId: chatAlert.chatAlertId,
    success: true,
  };
}
