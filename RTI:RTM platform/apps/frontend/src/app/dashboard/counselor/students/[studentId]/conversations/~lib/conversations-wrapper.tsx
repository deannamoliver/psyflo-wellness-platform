import {
  alertNotes,
  alertTimelineEntries,
  chatAlerts,
  chatSessions,
  wellnessCoachHandoffs,
} from "@feelwell/database";
import { count, desc, eq, inArray } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { ConversationsContent } from "./conversations-content";
import type { ConversationItem, ConversationStatus } from "./types";

function getConversationStatus(
  handoffStatus: string | undefined,
): ConversationStatus {
  if (handoffStatus === "completed" || handoffStatus === "cancelled") {
    return "closed";
  }
  return "active";
}

async function fetchHandoffs(
  db: Awaited<ReturnType<typeof serverDrizzle>>,
  sessionIds: string[],
) {
  if (sessionIds.length === 0)
    return new Map<
      string,
      { handoffId: string; status: string; updatedAt: Date }
    >();

  const handoffs = await db.admin
    .select({
      id: wellnessCoachHandoffs.id,
      chatSessionId: wellnessCoachHandoffs.chatSessionId,
      status: wellnessCoachHandoffs.status,
      updatedAt: wellnessCoachHandoffs.updatedAt,
    })
    .from(wellnessCoachHandoffs)
    .where(inArray(wellnessCoachHandoffs.chatSessionId, sessionIds));

  const map = new Map<
    string,
    { handoffId: string; status: string; updatedAt: Date }
  >();
  for (const h of handoffs) {
    const existing = map.get(h.chatSessionId);
    if (!existing || h.updatedAt > existing.updatedAt) {
      map.set(h.chatSessionId, {
        handoffId: h.id,
        status: h.status,
        updatedAt: h.updatedAt,
      });
    }
  }
  return map;
}

async function fetchAlertData(
  db: Awaited<ReturnType<typeof serverDrizzle>>,
  sessionIds: string[],
) {
  if (sessionIds.length === 0) {
    return {
      alertMap: new Map<string, string[]>(),
      notesCountMap: new Map<string, number>(),
    };
  }

  const chatAlertRows = await db.admin
    .select({
      chatSessionId: chatAlerts.chatSessionId,
      alertId: chatAlerts.alertId,
    })
    .from(chatAlerts)
    .where(inArray(chatAlerts.chatSessionId, sessionIds));

  const alertMap = new Map<string, string[]>();
  for (const a of chatAlertRows) {
    const existing = alertMap.get(a.chatSessionId) ?? [];
    existing.push(a.alertId);
    alertMap.set(a.chatSessionId, existing);
  }

  const allAlertIds = chatAlertRows.map((a) => a.alertId);
  const notesCountMap = new Map<string, number>();

  if (allAlertIds.length > 0) {
    const notesCounts = await db.admin
      .select({
        alertId: alertTimelineEntries.alertId,
        count: count(),
      })
      .from(alertNotes)
      .innerJoin(
        alertTimelineEntries,
        eq(alertNotes.timelineEntryId, alertTimelineEntries.id),
      )
      .where(inArray(alertTimelineEntries.alertId, allAlertIds))
      .groupBy(alertTimelineEntries.alertId);

    for (const n of notesCounts) {
      notesCountMap.set(n.alertId, n.count);
    }
  }

  return { alertMap, notesCountMap };
}

export async function ConversationsWrapper({
  studentId,
}: {
  studentId: string;
}) {
  const db = await serverDrizzle();

  const sessions = await db.admin
    .select({
      id: chatSessions.id,
      title: chatSessions.title,
      createdAt: chatSessions.createdAt,
      updatedAt: chatSessions.updatedAt,
    })
    .from(chatSessions)
    .where(eq(chatSessions.userId, studentId))
    .orderBy(desc(chatSessions.updatedAt));

  const sessionIds = sessions.map((s) => s.id);

  const [handoffMap, { alertMap, notesCountMap }] = await Promise.all([
    fetchHandoffs(db, sessionIds),
    fetchAlertData(db, sessionIds),
  ]);

  const conversations: ConversationItem[] = sessions.map((session) => {
    const handoff = handoffMap.get(session.id);
    const status = getConversationStatus(handoff?.status);
    const sessionAlertIds = alertMap.get(session.id) ?? [];
    const notesCount = sessionAlertIds.reduce(
      (sum, alertId) => sum + (notesCountMap.get(alertId) ?? 0),
      0,
    );

    return {
      id: session.id,
      handoffId: handoff?.handoffId ?? null,
      title: session.title,
      status,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      closedAt:
        status === "closed" && handoff ? handoff.updatedAt.toISOString() : null,
      hasSafetyAlert: sessionAlertIds.length > 0,
      notesCount,
    };
  });

  return <ConversationsContent conversations={conversations} />;
}
