import "server-only";

import {
  chatSessions,
  users,
  wellnessCoachChatEntries,
  wellnessCoachHandoffs,
} from "@feelwell/database";
import { HumanMessage } from "@langchain/core/messages";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { createThreadId } from "@/lib/langgraph/checkpointer";
import { getMainGraph } from "@/lib/langgraph/main-graph";
import { getHistory } from "@/lib/langgraph/memory";
import { buildExecutionTrace } from "@/lib/langgraph/trace-history";
import type { ExecutionTrace, Message, WellnessCoachMessage } from "./types";

type SessionWithMessages = {
  id: string;
  title: string;
  subject?: string | null;
  messages: Message[];
  assignedCoachFirstName?: string | null;
  wellnessHandoffId?: string | null;
  wellnessCoachMessages?: WellnessCoachMessage[];
};

type SessionWithTitle = {
  id: string;
  title: string;
  hasUnread?: boolean;
};

/**
 * Create a new chat session for a user
 */
export async function createChatSession(): Promise<SessionWithTitle> {
  const db = await serverDrizzle();
  const userId = db.userId();

  const [session] = await db.admin
    .insert(chatSessions)
    .values({
      userId,
      title: "New Chat",
    })
    .returning();

  if (!session) {
    throw new Error("Failed to create chat session");
  }

  return {
    id: session.id,
    title: session.title,
  };
}

/**
 * Get all chat sessions for a user, with unread indicator
 */
export async function getChatSessions(): Promise<SessionWithTitle[]> {
  const db = await serverDrizzle();
  const userId = db.userId();

  const hasUnreadCoachMessage = sql<boolean>`EXISTS (
    SELECT 1
    FROM wellness_coach_handoffs h
    JOIN wellness_coach_chat_entries e ON e.escalation_id = h.id
    WHERE h.chat_session_id = "chat_sessions"."id"
      AND e.author = 'coach'
      AND ("chat_sessions"."student_last_read_at" IS NULL OR e.created_at > "chat_sessions"."student_last_read_at")
  )`;

  const sessions = await db.admin
    .select({
      id: chatSessions.id,
      title: chatSessions.title,
      hasUnread: hasUnreadCoachMessage,
    })
    .from(chatSessions)
    .where(eq(chatSessions.userId, userId))
    .orderBy(desc(chatSessions.createdAt));

  return sessions.map((session) => ({
    id: session.id,
    title: session.title,
    hasUnread: session.hasUnread,
  }));
}

/**
 * Mark a session as read by updating student_last_read_at
 */
export async function markSessionAsRead(sessionId: string): Promise<void> {
  const db = await serverDrizzle();
  const userId = db.userId();

  const session = await db.admin.query.chatSessions.findFirst({
    where: eq(chatSessions.id, sessionId),
  });

  if (!session) {
    throw new Error("Session not found");
  }

  if (session.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await db.admin
    .update(chatSessions)
    .set({ studentLastReadAt: sql`now()` })
    .where(eq(chatSessions.id, sessionId));
}

/**
 * Update session title (called on first message)
 */
export async function updateSessionTitle(
  sessionId: string,
  title: string,
  subject?: string,
): Promise<void> {
  const db = await serverDrizzle();
  const userId = db.userId();

  // Verify session exists and user owns it
  const session = await db.admin.query.chatSessions.findFirst({
    where: eq(chatSessions.id, sessionId),
  });

  if (!session) {
    throw new Error("Session not found");
  }

  if (session.userId !== userId) {
    throw new Error("Unauthorized");
  }

  // Update title and optionally subject
  const updates: { title: string; subject?: string } = { title };
  if (subject) {
    updates.subject = subject;
  }
  await db.admin
    .update(chatSessions)
    .set(updates)
    .where(eq(chatSessions.id, sessionId));
}

/**
 * Check if user has started any explore topic chat today (session with non-null subject created today)
 */
export async function hasExploredToday(): Promise<boolean> {
  const db = await serverDrizzle();
  const userId = db.userId();

  const todayStart = sql`date_trunc('day', now() AT TIME ZONE 'UTC')`;

  const [result] = await db.admin
    .select({ count: sql<number>`count(*)` })
    .from(chatSessions)
    .where(
      and(
        eq(chatSessions.userId, userId),
        sql`${chatSessions.subject} IS NOT NULL`,
        sql`${chatSessions.createdAt} >= ${todayStart}`,
      ),
    );

  return (result?.count ?? 0) > 0;
}

/**
 * Get a specific chat session with its messages from LangGraph checkpoints
 */
export async function getChatSession(
  sessionId: string,
): Promise<SessionWithMessages> {
  const db = await serverDrizzle();
  const userId = db.userId();

  // Verify session exists and user owns it
  const session = await db.admin.query.chatSessions.findFirst({
    where: eq(chatSessions.id, sessionId),
  });

  if (!session) {
    throw new Error("Session not found");
  }

  // Verify ownership
  if (session.userId !== userId) {
    throw new Error("Unauthorized");
  }

  // Get messages from LangGraph checkpoints
  const threadId = createThreadId(userId, sessionId);
  const messages = await getHistory(threadId);

  const result: SessionWithMessages = {
    id: session.id,
    title: session.title,
    subject: session.subject,
    messages: messages.map((msg, idx) => ({
      id: msg.id ?? `msg-${idx}`,
      role: msg.getType() === "human" ? "user" : "model",
      content:
        typeof msg.content === "string"
          ? msg.content
          : JSON.stringify(msg.content),
    })),
  };

  // If session has assigned coach, fetch coach first name and wellness coach messages
  if (session.assignedCoachId) {
    const [coachUser] = await db.admin
      .select({
        firstName: sql<string | null>`${users.rawUserMetaData}->>'first_name'`,
      })
      .from(users)
      .where(eq(users.id, session.assignedCoachId))
      .limit(1);

    result.assignedCoachFirstName = coachUser?.firstName ?? null;

    const [acceptedHandoff] = await db.admin
      .select({ id: wellnessCoachHandoffs.id })
      .from(wellnessCoachHandoffs)
      .where(
        and(
          eq(wellnessCoachHandoffs.chatSessionId, sessionId),
          inArray(wellnessCoachHandoffs.status, [
            "accepted",
            "in_progress",
            "completed",
          ]),
        ),
      )
      .orderBy(desc(wellnessCoachHandoffs.acceptedAt))
      .limit(1);

    if (acceptedHandoff) {
      result.wellnessHandoffId = acceptedHandoff.id;
      const coachEntries = await db.admin
        .select({
          id: wellnessCoachChatEntries.id,
          content: wellnessCoachChatEntries.content,
          author: wellnessCoachChatEntries.author,
        })
        .from(wellnessCoachChatEntries)
        .where(eq(wellnessCoachChatEntries.escalationId, acceptedHandoff.id))
        .orderBy(asc(wellnessCoachChatEntries.createdAt));

      result.wellnessCoachMessages = coachEntries
        .filter((e) => e.author === "student" || e.author === "coach")
        .map((e) => ({
          id: e.id,
          content: e.content,
          author: e.author as "student" | "coach",
        }));
    }
  }

  return result;
}

/**
 * Send a message and get full response (non-streaming version)
 * Used by the current non-streaming implementation
 */
export async function sendMessage(
  sessionId: string,
  message: string,
): Promise<Message> {
  const db = await serverDrizzle();
  const userId = db.userId();

  // Verify session
  const session = await db.admin.query.chatSessions.findFirst({
    where: eq(chatSessions.id, sessionId),
  });

  if (!session) {
    throw new Error("Session not found");
  }

  // Verify ownership
  if (session.userId !== userId) {
    throw new Error("Unauthorized");
  }

  const agent = await getMainGraph();
  const threadId = createThreadId(userId, sessionId);

  // Invoke agent (non-streaming)
  const result = await agent.invoke(
    { messages: [new HumanMessage(message)] },
    {
      configurable: { thread_id: threadId },
    },
  );

  const lastMessage = result.messages[result.messages.length - 1];

  if (!lastMessage) {
    throw new Error("No response message from agent");
  }

  return {
    id: lastMessage.id ?? `msg-${result.messages.length - 1}`,
    role: "model",
    content:
      typeof lastMessage.content === "string"
        ? lastMessage.content
        : JSON.stringify(lastMessage.content),
  };
}

/**
 * Get execution trace for a chat session
 * Returns detailed node execution history for visualizing LangGraph agent flow
 */
export async function getExecutionTrace(
  sessionId: string,
): Promise<ExecutionTrace> {
  const db = await serverDrizzle();
  const userId = db.userId();

  // Verify session exists and user owns it
  const session = await db.admin.query.chatSessions.findFirst({
    where: eq(chatSessions.id, sessionId),
  });

  if (!session) {
    throw new Error("Session not found");
  }

  // Verify ownership
  if (session.userId !== userId) {
    throw new Error("Unauthorized");
  }

  // Build thread ID and fetch execution trace
  const threadId = createThreadId(userId, sessionId);
  const trace = await buildExecutionTrace(threadId, sessionId);

  return trace;
}
