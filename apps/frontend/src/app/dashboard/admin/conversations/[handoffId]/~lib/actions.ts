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

export async function takeOverConversation(
  handoffId: string,
  takeoverReason: string,
) {
  const db = await serverDrizzle();
  const adminId = db.userId();

  // Update the handoff to assign the admin as the coach
  await db.admin
    .update(wellnessCoachHandoffs)
    .set({
      acceptedByCoachId: adminId,
      status: "in_progress",
    })
    .where(eq(wellnessCoachHandoffs.id, handoffId));

  // Keep chat session assignment in sync with the handoff assignment.
  const handoff = await db.admin
    .select({ chatSessionId: wellnessCoachHandoffs.chatSessionId })
    .from(wellnessCoachHandoffs)
    .where(eq(wellnessCoachHandoffs.id, handoffId))
    .limit(1)
    .then((res) => res[0]);

  if (handoff?.chatSessionId) {
    await db.admin
      .update(chatSessions)
      .set({ assignedCoachId: adminId })
      .where(eq(chatSessions.id, handoff.chatSessionId));
  }

  // Record the takeover event
  await db.admin.insert(conversationEvents).values({
    handoffId,
    eventType: "takeover",
    performedByCoachId: adminId,
    transferReason: takeoverReason,
  });

  await publishHandoffEvent(handoffId, {
    type: "handoff.taken_over",
    handoffId,
    byAdminId: adminId,
    createdAt: new Date().toISOString(),
  });

  revalidatePath(`/dashboard/admin/conversations/${handoffId}`);
  revalidatePath("/dashboard/admin/conversations");
}

export async function sendAdminMessage(handoffId: string, content: string) {
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
  const adminId = db.userId();

  await Promise.all([
    db.admin.insert(wellnessCoachChatEntries).values({
      escalationId: handoffId,
      content: trimmed,
      author: "coach",
      senderUserId: adminId,
    }),
    db.admin
      .update(wellnessCoachHandoffs)
      .set({ status: "in_progress" })
      .where(eq(wellnessCoachHandoffs.id, handoffId)),
  ]);

  revalidatePath(`/dashboard/admin/conversations/${handoffId}`);
  revalidatePath("/dashboard/admin/conversations");
}

export type AdminCloseConversationInput = {
  handoffId: string;
  closureReason: string;
  closingSummary: string;
  studentNotified: boolean;
};

export async function adminCloseConversation(
  input: AdminCloseConversationInput,
) {
  const db = await serverDrizzle();
  const adminId = db.userId();

  await db.admin
    .update(wellnessCoachHandoffs)
    .set({ status: "completed" })
    .where(eq(wellnessCoachHandoffs.id, input.handoffId));

  await db.admin.insert(conversationEvents).values({
    handoffId: input.handoffId,
    eventType: "closed",
    performedByCoachId: adminId,
    closureReason: input.closureReason,
    closingSummary: input.closingSummary,
    studentNotified: input.studentNotified,
  });

  await publishHandoffEvent(input.handoffId, {
    type: "handoff.closed",
    handoffId: input.handoffId,
    createdAt: new Date().toISOString(),
  });

  revalidatePath(`/dashboard/admin/conversations/${input.handoffId}`);
  revalidatePath("/dashboard/admin/conversations");
}

export type AdminTransferConversationInput = {
  handoffId: string;
  transferToCoachId: string;
  transferReason: string;
  transferNotes: string;
};

export async function adminTransferConversation(
  input: AdminTransferConversationInput,
) {
  const db = await serverDrizzle();
  const adminId = db.userId();

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
    performedByCoachId: adminId,
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

  revalidatePath(`/dashboard/admin/conversations/${input.handoffId}`);
  revalidatePath("/dashboard/admin/conversations");
}
