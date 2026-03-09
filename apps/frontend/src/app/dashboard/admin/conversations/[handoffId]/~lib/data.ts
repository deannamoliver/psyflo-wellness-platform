"server-only";

import {
  chatSessions,
  conversationEvents,
  emergencyContacts,
  profiles,
  safetyWorkflows,
  schools,
  userSchools,
  users,
  wellnessCoachChatEntries,
  wellnessCoachHandoffs,
} from "@feelwell/database";
import { and, asc, eq, inArray, ne, or, sql } from "drizzle-orm";
import type { SafetyWorkflowData } from "@/app/dashboard/counselor/conversations/[handoffId]/~lib/safety-workflow-types";
import { serverDrizzle } from "@/lib/database/drizzle";
import { createThreadId } from "@/lib/langgraph/checkpointer";
import { getHistory } from "@/lib/langgraph/memory";
import { getUserFullName, getUserFullNameFromMetaData } from "@/lib/user/utils";
import type {
  AdminConversationDetail,
  AiMessage,
  ChatEntry,
  EmergencyContact,
  TransferEvent,
} from "./types";

export async function fetchAdminConversationDetail(
  handoffId: string,
): Promise<AdminConversationDetail | null> {
  const db = await serverDrizzle();
  const currentUserId = db.userId();

  const row = await db.admin
    .select({
      handoff: wellnessCoachHandoffs,
      user: users,
      profile: profiles,
      schoolName: schools.name,
      sessionTitle: chatSessions.title,
      coachUser: {
        id: sql<string | null>`coach_user.id`,
        rawUserMetaData: sql<Record<
          string,
          unknown
        > | null>`coach_user.raw_user_meta_data`,
      },
    })
    .from(wellnessCoachHandoffs)
    .innerJoin(users, eq(wellnessCoachHandoffs.studentId, users.id))
    .innerJoin(profiles, eq(wellnessCoachHandoffs.studentId, profiles.id))
    .innerJoin(schools, eq(wellnessCoachHandoffs.schoolId, schools.id))
    .innerJoin(
      chatSessions,
      eq(wellnessCoachHandoffs.chatSessionId, chatSessions.id),
    )
    .leftJoin(
      sql`auth.users as coach_user`,
      sql`coach_user.id = ${wellnessCoachHandoffs.acceptedByCoachId}`,
    )
    .where(eq(wellnessCoachHandoffs.id, handoffId))
    .limit(1)
    .then((res) => res[0]);

  if (!row) return null;

  // Fetch chat entries
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

  // Fetch emergency contacts
  const contactConditions = [eq(emergencyContacts.studentId, row.user.id)];
  if (row.handoff.schoolId) {
    contactConditions.push(
      eq(emergencyContacts.schoolId, row.handoff.schoolId),
    );
  }

  const contactRows = await db.admin
    .select({
      id: emergencyContacts.id,
      name: emergencyContacts.name,
      relation: emergencyContacts.relation,
      contactType: emergencyContacts.contactType,
      tag: emergencyContacts.tag,
      primaryPhone: emergencyContacts.primaryPhone,
      secondaryPhone: emergencyContacts.secondaryPhone,
      primaryEmail: emergencyContacts.primaryEmail,
      secondaryEmail: emergencyContacts.secondaryEmail,
    })
    .from(emergencyContacts)
    .where(or(...contactConditions));

  const contacts: EmergencyContact[] = contactRows;

  const studentName = getUserFullName(row.user);
  const initials = studentName
    .split(" ")
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  let coachName = "Unassigned";
  let coachInitials = "?";
  if (row.coachUser?.rawUserMetaData) {
    coachName = getUserFullName(row.coachUser as typeof users.$inferSelect);
    coachInitials = coachName
      .split(" ")
      .map((w) => w[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  }

  const isTakenOver = row.handoff.acceptedByCoachId === currentUserId;

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
    grade: row.profile.grade,
    gradeLabel: row.profile.grade ? `Grade ${row.profile.grade}` : "N/A",
    dateOfBirth: row.profile.dateOfBirth,
    email: row.user.email ?? null,
    homeAddress: row.profile.homeAddress ?? null,
    school: row.schoolName,
    schoolId: row.handoff.schoolId,
    status: row.handoff.status as AdminConversationDetail["status"],
    topic: row.handoff.topic,
    reason: row.handoff.reason,
    startedAt: row.handoff.requestedAt.toISOString(),
    aiMessages,
    messages,
    coachId: row.handoff.acceptedByCoachId,
    coachName,
    coachInitials,
    emergencyContacts: contacts,
    isTakenOver,
    hasAlert: row.handoff.alertId != null,
    safetyWorkflowActivatedAt:
      safetyWorkflow?.activatedAt?.toISOString() ?? null,
    safetyWorkflowInitiatedBy,
    transferEvents,
  };
}

export async function fetchAdminTransferCandidates(
  schoolId: string | null,
): Promise<
  { id: string; name: string; initials: string; activeConversations: number }[]
> {
  if (!schoolId) return [];

  const db = await serverDrizzle();
  const currentUserId = db.userId();

  const coaches = await db.admin
    .select({
      userId: userSchools.userId,
      rawUserMetaData: users.rawUserMetaData,
      activeCount: sql<number>`(
        SELECT COUNT(*) FROM wellness_coach_handoffs
        WHERE accepted_by_coach_id = ${userSchools.userId}
        AND status IN ('pending', 'accepted', 'in_progress')
      )`,
    })
    .from(userSchools)
    .innerJoin(users, eq(userSchools.userId, users.id))
    .where(
      and(
        eq(userSchools.schoolId, schoolId),
        eq(userSchools.role, "wellness_coach"),
        ne(userSchools.userId, currentUserId),
      ),
    );

  return coaches.map((c) => {
    const name = getUserFullNameFromMetaData(c.rawUserMetaData);
    return {
      id: c.userId,
      name,
      initials: name
        .split(" ")
        .map((w) => w[0]?.toUpperCase())
        .slice(0, 2)
        .join(""),
      activeConversations: Number(c.activeCount),
    };
  });
}

export async function fetchAdminActiveSafetyWorkflow(
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
