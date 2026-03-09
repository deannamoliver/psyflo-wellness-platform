import { relations, sql } from "drizzle-orm";
import {
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers, supabaseAuthAdminRole } from "drizzle-orm/supabase";
import { alerts } from "./alert";
import { chatSessions } from "./chat-sessions";
import { timestamps, uuidv7 } from "./column-utils";
import { schools } from "./school";

export const wellnessCoachHandoffStatusEnum = pgEnum(
  "wellness_coach_escalation_status",
  ["pending", "accepted", "in_progress", "completed", "cancelled"],
);

// Distinguishes user-initiated ("Switch to Wellness Coach" button) from
// automatic risk-protocol handoffs (handover_to_coach node).
export const wellnessCoachHandoffOriginEnum = pgEnum(
  "wellness_coach_handoff_origin",
  ["user", "risk_protocol"],
);

export const wellnessCoachChatEntryAuthorEnum = pgEnum(
  "wellness_coach_chat_entry_author",
  ["student", "coach"],
);

export const wellnessCoachHandoffs = pgTable(
  "wellness_coach_handoffs",
  {
    id: uuidv7().primaryKey(),
    chatSessionId: uuid("chat_session_id")
      .notNull()
      .references(() => chatSessions.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    schoolId: uuid("school_id").references(() => schools.id, {
      onDelete: "set null",
    }),
    reason: text().notNull(),
    topic: text().notNull(),
    otherDetail: text("other_detail"),
    status: wellnessCoachHandoffStatusEnum("status")
      .notNull()
      .default("pending"),
    requestedAt: timestamp("requested_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    acceptedByCoachId: uuid("accepted_by_coach_id").references(
      () => authUsers.id,
      { onDelete: "set null" },
    ),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    alertId: uuid("alert_id").references(() => alerts.id, {
      onDelete: "set null",
    }),
    origin: wellnessCoachHandoffOriginEnum("origin")
      .notNull()
      .default("user"),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all wellness coach handoffs", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const wellnessCoachChatEntries = pgTable(
  "wellness_coach_chat_entries",
  {
    id: uuidv7().primaryKey(),
    escalationId: uuid("escalation_id")
      .notNull()
      .references(() => wellnessCoachHandoffs.id, { onDelete: "cascade" }),
    content: text().notNull(),
    author: wellnessCoachChatEntryAuthorEnum("author"),
    senderUserId: uuid("sender_user_id").references(() => authUsers.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all wellness coach chat entries", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const wellnessCoachHandoffsRelations = relations(
  wellnessCoachHandoffs,
  ({ one, many }) => ({
    chatSession: one(chatSessions),
    student: one(authUsers, {
      fields: [wellnessCoachHandoffs.studentId],
      references: [authUsers.id],
    }),
    school: one(schools),
    acceptedByCoach: one(authUsers, {
      fields: [wellnessCoachHandoffs.acceptedByCoachId],
      references: [authUsers.id],
    }),
    alert: one(alerts, {
      fields: [wellnessCoachHandoffs.alertId],
      references: [alerts.id],
    }),
    chatEntries: many(wellnessCoachChatEntries),
  }),
);

export const wellnessCoachChatEntriesRelations = relations(
  wellnessCoachChatEntries,
  ({ one }) => ({
    handoff: one(wellnessCoachHandoffs),
    senderUser: one(authUsers, {
      fields: [wellnessCoachChatEntries.senderUserId],
      references: [authUsers.id],
    }),
  }),
);
