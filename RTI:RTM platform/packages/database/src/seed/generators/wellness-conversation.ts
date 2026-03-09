/**
 * Wellness conversation generator
 *
 * Creates active wellness coach conversations: chat session, handoff,
 * and chat entries so they appear in the counselor dashboard.
 */

import type { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "../../schema";

export type ActiveWellnessConversationConfig = {
  topic: string;
  reason: string;
  status: "accepted" | "in_progress";
  /** If "student", last message is from student → shows "Needs Coach Reply". If "coach", shows "Waiting on Student". */
  lastMessageFrom: "student" | "coach";
  /** Optional: custom coach greeting. Defaults to a generic greeting. */
  coachGreeting?: string;
  /** Optional: custom student reply. Defaults to a generic reply. */
  studentReply?: string;
};

/**
 * Creates an active wellness coach conversation for a student.
 * Inserts: chat_sessions, wellness_coach_handoffs, wellness_coach_chat_entries.
 */
export async function createActiveWellnessConversation(
  db: ReturnType<typeof drizzle>,
  studentId: string,
  schoolId: string,
  coachId: string,
  studentFirstName: string,
  config: ActiveWellnessConversationConfig,
): Promise<void> {
  const chatSessionId = crypto.randomUUID();
  const handoffId = crypto.randomUUID();
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

  await db.insert(schema.chatSessions).values({
    id: chatSessionId,
    userId: studentId,
    title: "Wellness Check-in",
    assignedCoachId: coachId,
    createdAt: twoDaysAgo,
    updatedAt: now,
  });

  await db.insert(schema.wellnessCoachHandoffs).values({
    id: handoffId,
    chatSessionId,
    studentId,
    schoolId,
    reason: config.reason,
    topic: config.topic,
    status: config.status,
    requestedAt: twoDaysAgo,
    acceptedByCoachId: coachId,
    acceptedAt: oneDayAgo,
    createdAt: twoDaysAgo,
    updatedAt: now,
  });

  const coachGreeting =
    config.coachGreeting ??
    `Hi ${studentFirstName}! I'm your wellness coach. I'm here to listen and help. What's on your mind today?`;
  const studentReply =
    config.studentReply ??
    "I've been feeling stressed lately and wanted to talk to someone.";

  await db.insert(schema.wellnessCoachChatEntries).values({
    escalationId: handoffId,
    content: coachGreeting,
    author: "coach",
    senderUserId: coachId,
    createdAt: twoDaysAgo,
    updatedAt: now,
  });

  await db.insert(schema.wellnessCoachChatEntries).values({
    escalationId: handoffId,
    content: studentReply,
    author: "student",
    senderUserId: studentId,
    createdAt: oneDayAgo,
    updatedAt: now,
  });

  if (config.lastMessageFrom === "coach") {
    await db.insert(schema.wellnessCoachChatEntries).values({
      escalationId: handoffId,
      content:
        "I understand how overwhelming that can feel. Let's work through this together. Can you tell me more about what's going on?",
      author: "coach",
      senderUserId: coachId,
      createdAt: twelveHoursAgo,
      updatedAt: now,
    });
  }
}
