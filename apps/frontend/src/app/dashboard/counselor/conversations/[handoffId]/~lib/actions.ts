"use server";

import {
  chatSessions,
  conversationEvents,
  wellnessCoachChatEntries,
  wellnessCoachHandoffs,
} from "@feelwell/database";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { serverDrizzle } from "@/lib/database/drizzle";
import { publishHandoffEvent } from "@/lib/realtime/publish-handoff-event";

export async function sendCoachMessage(handoffId: string, content: string) {
  if (!content.trim()) return;

  const trimmed = content.trim();

  // Publish via WebSocket first for instant delivery
  await publishHandoffEvent(handoffId, {
    type: "message.created",
    handoffId,
    author: "coach",
    content: trimmed,
    createdAt: new Date().toISOString(),
  });

  // Persist to DB and update status in parallel
  const db = await serverDrizzle();
  const coachId = db.userId();

  await Promise.all([
    db.admin.insert(wellnessCoachChatEntries).values({
      escalationId: handoffId,
      content: trimmed,
      author: "coach",
      senderUserId: coachId,
    }),
    db.admin
      .update(wellnessCoachHandoffs)
      .set({ status: "in_progress" })
      .where(eq(wellnessCoachHandoffs.id, handoffId)),
  ]);

  revalidatePath(`/dashboard/counselor/conversations/${handoffId}`);
  revalidatePath("/dashboard/counselor/conversations");
}

export type CloseConversationInput = {
  handoffId: string;
  closureReason: string;
  closingSummary: string;
  studentNotified: boolean;
};

export async function closeConversation(input: CloseConversationInput) {
  const db = await serverDrizzle();
  const coachId = db.userId();

  await db.admin
    .update(wellnessCoachHandoffs)
    .set({ status: "completed" })
    .where(eq(wellnessCoachHandoffs.id, input.handoffId));

  await db.admin.insert(conversationEvents).values({
    handoffId: input.handoffId,
    eventType: "closed",
    performedByCoachId: coachId,
    closureReason: input.closureReason,
    closingSummary: input.closingSummary,
    studentNotified: input.studentNotified,
  });

  await publishHandoffEvent(input.handoffId, {
    type: "handoff.closed",
    handoffId: input.handoffId,
    createdAt: new Date().toISOString(),
  });

  revalidatePath(`/dashboard/counselor/conversations/${input.handoffId}`);
  revalidatePath("/dashboard/counselor/conversations");
}

export type TransferConversationInput = {
  handoffId: string;
  transferToCoachId: string;
  transferReason: string;
  transferNotes: string;
};

export async function transferConversation(input: TransferConversationInput) {
  const db = await serverDrizzle();
  const coachId = db.userId();

  // Update handoff to assign the new coach
  await db.admin
    .update(wellnessCoachHandoffs)
    .set({
      acceptedByCoachId: input.transferToCoachId,
      status: "in_progress",
    })
    .where(eq(wellnessCoachHandoffs.id, input.handoffId));

  // Keep chat session assignment in sync with the handoff assignment.
  const handoff = await db.admin
    .select({ chatSessionId: wellnessCoachHandoffs.chatSessionId })
    .from(wellnessCoachHandoffs)
    .where(eq(wellnessCoachHandoffs.id, input.handoffId))
    .limit(1)
    .then((res) => res[0]);

  if (handoff?.chatSessionId) {
    await db.admin
      .update(chatSessions)
      .set({ assignedCoachId: input.transferToCoachId })
      .where(eq(chatSessions.id, handoff.chatSessionId));
  }

  await db.admin.insert(conversationEvents).values({
    handoffId: input.handoffId,
    eventType: "transferred",
    performedByCoachId: coachId,
    transferToCoachId: input.transferToCoachId,
    transferReason: input.transferReason,
    transferNotes: input.transferNotes,
  });

  await publishHandoffEvent(input.handoffId, {
    type: "handoff.transferred",
    handoffId: input.handoffId,
    toCoachId: input.transferToCoachId,
    createdAt: new Date().toISOString(),
  });

  revalidatePath(`/dashboard/counselor/conversations/${input.handoffId}`);
  revalidatePath("/dashboard/counselor/conversations");
}

export type ReopenConversationInput = {
  handoffId: string;
  reopenReason: string;
  reopenContext: string;
};

export async function reopenConversation(input: ReopenConversationInput) {
  const db = await serverDrizzle();
  const coachId = db.userId();

  await db.admin
    .update(wellnessCoachHandoffs)
    .set({ status: "in_progress" })
    .where(eq(wellnessCoachHandoffs.id, input.handoffId));

  await db.admin.insert(conversationEvents).values({
    handoffId: input.handoffId,
    eventType: "reopened",
    performedByCoachId: coachId,
    reopenReason: input.reopenReason,
    reopenContext: input.reopenContext,
  });

  await publishHandoffEvent(input.handoffId, {
    type: "handoff.reopened",
    handoffId: input.handoffId,
    createdAt: new Date().toISOString(),
  });

  revalidatePath(`/dashboard/counselor/conversations/${input.handoffId}`);
  revalidatePath("/dashboard/counselor/conversations");
}
