"server-only";

import {
  chatSessions,
  conversationEvents,
  profiles,
  safetyWorkflows,
  schools,
  userSchools,
  users,
  wellnessCoachChatEntries,
  wellnessCoachHandoffs,
} from "@feelwell/database";
import { and, asc, eq, inArray, ne, sql } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { createThreadId } from "@/lib/langgraph/checkpointer";
import { getHistory } from "@/lib/langgraph/memory";
import { getUserFullName, getUserFullNameFromMetaData } from "@/lib/user/utils";
import { fetchLatestEvent } from "./data-latest-event";
import type { SafetyWorkflowData } from "./safety-workflow-types";
import type {
  AiMessage,
  ChatEntry,
  ConversationDetail,
  ConversationStatus,
  TransferEvent,
} from "./types";

function deriveStatus(
  handoffStatus: string,
  lastAuthor: string | null,
  isAssignedCoach: boolean,
): ConversationStatus {
  if (handoffStatus === "completed") return "closed";
  if (!isAssignedCoach && handoffStatus === "in_progress") return "transferred";
  if (handoffStatus === "cancelled") return "transferred";
  if (handoffStatus === "in_progress" && lastAuthor === "coach") {
    return "waiting_on_student";
  }
  return "needs_coach_reply";
}

export async function fetchConversationDetail(
  handoffId: string,
): Promise<ConversationDetail | null> {
  const db = await serverDrizzle();
  const currentCoachId = db.userId();

  const row = await db.admin
    .select({
      handoff: wellnessCoachHandoffs,
      user: users,
      profile: profiles,
      schoolName: schools.name,
      sessionTitle: chatSessions.title,
    })
    .from(wellnessCoachHandoffs)
    .innerJoin(users, eq(wellnessCoachHandoffs.studentId, users.id))
    .innerJoin(profiles, eq(wellnessCoachHandoffs.studentId, profiles.id))
    .innerJoin(schools, eq(wellnessCoachHandoffs.schoolId, schools.id))
    .innerJoin(
      chatSessions,
      eq(wellnessCoachHandoffs.chatSessionId, chatSessions.id),
    )
    .where(eq(wellnessCoachHandoffs.id, handoffId))
    .limit(1)
    .then((res) => res[0]);

  if (!row) return null;

  const entries = await db.admin
    .select({
      id: wellnessCoachChatEntries.id,
      content: wellnessCoachChatEntries.content,
      author: wellnessCoachChatEntries.author,
      createdAt: wellnessCoachChatEntries.createdAt,
      senderUserId: wellnessCoachChatEntries.senderUserId,
    })
    .from(wellnessCoachChatEntries)
    .where(eq(wellnessCoachChatEntries.escalationId, handoffId))
    .orderBy(asc(wellnessCoachChatEntries.createdAt));

  // Batch-resolve sender names for initials
  const senderIds = [
    ...new Set(entries.map((e) => e.senderUserId).filter(Boolean)),
  ] as string[];
  const senderMap = new Map<string, string>();
  if (senderIds.length > 0) {
    const senderRows = await db.admin
      .select({ id: users.id, rawUserMetaData: users.rawUserMetaData })
      .from(users)
      .where(inArray(users.id, senderIds));
    for (const s of senderRows) {
      const name = getUserFullNameFromMetaData(s.rawUserMetaData);
      const initials = name
        .split(" ")
        .map((w) => w[0]?.toUpperCase())
        .slice(0, 2)
        .join("");
      senderMap.set(s.id, initials);
    }
  }

  const messages: ChatEntry[] = entries.map((e) => ({
    id: e.id,
    content: e.content,
    author: e.author ?? "student",
    createdAt: e.createdAt.toISOString(),
    senderInitials: e.senderUserId
      ? (senderMap.get(e.senderUserId) ?? "?")
      : "?",
  }));

  const lastAuthor: string | null =
    messages.length > 0
      ? (messages[messages.length - 1]?.author ?? null)
      : null;

  const studentName = getUserFullName(row.user);
  const initials = studentName
    .split(" ")
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  const isAssignedCoach = row.handoff.acceptedByCoachId === currentCoachId;
  const latestEvent = await fetchLatestEvent(db, handoffId);

  let closedAt: string | null = null;
  let closedByName: string | null = null;
  let transferredAt: string | null = null;
  let transferredToCoachId: string | null = null;
  let transferredToCoachName: string | null = null;
  let transferredToCoachInitials: string | null = null;

  if (latestEvent?.eventType === "closed") {
    closedAt = latestEvent.createdAt.toISOString();
    closedByName = latestEvent.coachName;
  }
  if (latestEvent?.eventType === "transferred") {
    transferredAt = latestEvent.createdAt.toISOString();
    transferredToCoachId = latestEvent.transferToCoachId;
    transferredToCoachName = latestEvent.transferCoachName;
    transferredToCoachInitials = latestEvent.transferCoachInitials;
  }

  const safetyWorkflow = await db.admin
    .select({
      activatedAt: safetyWorkflows.activatedAt,
      initiatedByCoachId: safetyWorkflows.initiatedByCoachId,
    })
    .from(safetyWorkflows)
    .where(
      and(
        eq(safetyWorkflows.handoffId, handoffId),
        ne(safetyWorkflows.status, "cancelled"),
      ),
    )
    .limit(1)
    .then((r) => r[0]);

  let safetyWorkflowInitiatedBy: string | null = null;
  if (safetyWorkflow?.initiatedByCoachId) {
    const initiator = await db.admin
      .select({ rawUserMetaData: users.rawUserMetaData })
      .from(users)
      .where(eq(users.id, safetyWorkflow.initiatedByCoachId))
      .limit(1)
      .then((r) => r[0]);
    if (initiator) {
      safetyWorkflowInitiatedBy = getUserFullNameFromMetaData(
        initiator.rawUserMetaData,
      );
    }
  }

  // Fetch takeover/transfer events
  const eventRows = await db.admin
    .select({
      id: conversationEvents.id,
      eventType: conversationEvents.eventType,
      performedByCoachId: conversationEvents.performedByCoachId,
      transferToCoachId: conversationEvents.transferToCoachId,
      createdAt: conversationEvents.createdAt,
    })
    .from(conversationEvents)
    .where(
      and(
        eq(conversationEvents.handoffId, handoffId),
        inArray(conversationEvents.eventType, ["takeover", "transferred"]),
      ),
    )
    .orderBy(asc(conversationEvents.createdAt));

  const eventUserIds = [
    ...new Set(
      eventRows
        .flatMap((e) => [e.performedByCoachId, e.transferToCoachId])
        .filter(Boolean),
    ),
  ] as string[];
  const eventNameMap = new Map<string, string>();
  if (eventUserIds.length > 0) {
    const nameRows = await db.admin
      .select({ id: users.id, rawUserMetaData: users.rawUserMetaData })
      .from(users)
      .where(inArray(users.id, eventUserIds));
    for (const r of nameRows) {
      eventNameMap.set(r.id, getUserFullNameFromMetaData(r.rawUserMetaData));
    }
  }

  const transferEvents: TransferEvent[] = eventRows.map((e) => ({
    id: e.id,
    eventType: e.eventType as "takeover" | "transferred",
    performedByName: e.performedByCoachId
      ? (eventNameMap.get(e.performedByCoachId) ?? "Unknown")
      : "Unknown",
    transferToName: e.transferToCoachId
      ? (eventNameMap.get(e.transferToCoachId) ?? null)
      : null,
    createdAt: e.createdAt.toISOString(),
  }));

  // Fetch AI chatbot conversation history from LangGraph checkpoints
  const threadId = createThreadId(
    row.handoff.studentId,
    row.handoff.chatSessionId,
  );
  let aiMessages: AiMessage[] = [];
  try {
    const history = await getHistory(threadId);
    aiMessages = history
      .filter((msg) => {
        const type = msg.getType();
        return type === "human" || type === "ai";
      })
      .map((msg, idx) => ({
        id: msg.id ?? `ai-msg-${idx}`,
        role:
          msg.getType() === "human" ? ("user" as const) : ("model" as const),
        content:
          typeof msg.content === "string"
            ? msg.content
            : JSON.stringify(msg.content),
      }))
      .filter((msg) => msg.content.trim().length > 0);
  } catch {
    // If checkpoint data is unavailable, continue without AI messages
  }

  return {
    handoffId,
    chatSessionId: row.handoff.chatSessionId,
    studentId: row.user.id,
    studentName,
    studentInitials: initials,
    studentCode: `ST-${row.user.id.slice(-4).toUpperCase()}`,
    grade: row.profile.grade,
    gradeLabel: row.profile.grade ? `Grade ${row.profile.grade}` : "N/A",
    dateOfBirth: row.profile.dateOfBirth,
    email: row.user.email ?? null,
    homeAddress: row.profile.homeAddress ?? null,
    school: row.schoolName,
    schoolId: row.handoff.schoolId,
    status: deriveStatus(row.handoff.status, lastAuthor, isAssignedCoach),
    topic: row.handoff.topic,
    reason: row.handoff.reason,
    startedAt: row.handoff.requestedAt.toISOString(),
    aiMessages,
    messages,
    closedAt,
    closedByName,
    transferredAt,
    transferredToCoachId,
    transferredToCoachName,
    transferredToCoachInitials,
    isAssignedCoach,
    hasAlert: row.handoff.alertId != null,
    safetyWorkflowActivatedAt:
      safetyWorkflow?.activatedAt?.toISOString() ?? null,
    safetyWorkflowInitiatedBy,
    transferEvents,
  };
}

export async function fetchInboxConversations() {
  const db = await serverDrizzle();
  const coachId = db.userId();

  const coachSchool = await db.admin
    .select({ schoolId: userSchools.schoolId })
    .from(userSchools)
    .where(eq(userSchools.userId, coachId))
    .limit(1)
    .then((res) => res[0]?.schoolId);

  if (!coachSchool) return [];

  const handoffs = await db.admin
    .select({
      id: wellnessCoachHandoffs.id,
      status: wellnessCoachHandoffs.status,
      acceptedByCoachId: wellnessCoachHandoffs.acceptedByCoachId,
      updatedAt: wellnessCoachHandoffs.updatedAt,
      userName: users.rawUserMetaData,
      lastEntryAuthor: sql<string | null>`(
        SELECT author FROM wellness_coach_chat_entries
        WHERE escalation_id = ${wellnessCoachHandoffs.id}
        ORDER BY created_at DESC LIMIT 1
      )`,
      lastEntryAt: sql<string | null>`(
        SELECT created_at FROM wellness_coach_chat_entries
        WHERE escalation_id = ${wellnessCoachHandoffs.id}
        ORDER BY created_at DESC LIMIT 1
      )`,
    })
    .from(wellnessCoachHandoffs)
    .innerJoin(users, eq(wellnessCoachHandoffs.studentId, users.id))
    .where(
      and(
        eq(wellnessCoachHandoffs.schoolId, coachSchool),
        eq(wellnessCoachHandoffs.acceptedByCoachId, coachId),
      ),
    )
    .orderBy(sql`${wellnessCoachHandoffs.updatedAt} DESC`);

  return handoffs.map((h) => {
    const meta = h.userName as Record<string, string> | null;
    const first = meta?.["first_name"] ?? "";
    const last = meta?.["last_name"] ?? "";
    const name = [first, last].filter(Boolean).join(" ");
    const isAssigned = h.acceptedByCoachId === coachId;
    return {
      id: h.id,
      studentName: name,
      status: deriveStatus(h.status, h.lastEntryAuthor, isAssigned),
      lastMessageAt: h.lastEntryAt
        ? new Date(h.lastEntryAt).toISOString()
        : h.updatedAt.toISOString(),
    };
  });
}

export async function fetchActiveSafetyWorkflow(
  handoffId: string,
  studentName: string,
  gradeLabel: string,
): Promise<SafetyWorkflowData | null> {
  const db = await serverDrizzle();

  const row = await db.admin
    .select()
    .from(safetyWorkflows)
    .where(
      and(
        eq(safetyWorkflows.handoffId, handoffId),
        eq(safetyWorkflows.status, "active"),
      ),
    )
    .limit(1)
    .then((r) => r[0]);

  if (!row) return null;

  return {
    id: row.id,
    handoffId: row.handoffId,
    studentId: row.studentId,
    studentName,
    studentGrade: gradeLabel,
    schoolId: row.schoolId,
    status: row.status,
    isDuringSchoolHours: row.isDuringSchoolHours,
    activatedAt: row.activatedAt.toISOString(),
    immediateDanger: row.immediateDanger,
    concernType: row.concernType as SafetyWorkflowData["concernType"],
    assessmentData: row.assessmentData as Record<string, unknown> | null,
    riskLevel: row.riskLevel as SafetyWorkflowData["riskLevel"],
    professionalJudgment: row.professionalJudgment,
    actData: row.actData as Record<string, unknown> | null,
  };
}
