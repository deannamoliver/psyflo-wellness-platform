import { relations, sql } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers, supabaseAuthAdminRole } from "drizzle-orm/supabase";
import { timestamps, uuidv7 } from "./column-utils";
import { wellnessCoachHandoffs } from "./wellness-coach";

export const conversationEventTypeEnum = pgEnum("conversation_event_type", [
  "closed",
  "transferred",
  "reopened",
  "takeover",
]);

export const conversationEvents = pgTable(
  "conversation_events",
  {
    id: uuidv7().primaryKey(),
    handoffId: uuid("handoff_id")
      .notNull()
      .references(() => wellnessCoachHandoffs.id, { onDelete: "cascade" }),
    eventType: conversationEventTypeEnum("event_type").notNull(),
    performedByCoachId: uuid("performed_by_coach_id").references(
      () => authUsers.id,
      { onDelete: "set null" },
    ),

    // Close-specific
    closureReason: text("closure_reason"),
    closingSummary: text("closing_summary"),
    studentNotified: boolean("student_notified").default(false),

    // Transfer-specific
    transferToCoachId: uuid("transfer_to_coach_id").references(
      () => authUsers.id,
      { onDelete: "set null" },
    ),
    transferReason: text("transfer_reason"),
    transferNotes: text("transfer_notes"),

    // Reopen-specific
    reopenReason: text("reopen_reason"),
    reopenContext: text("reopen_context"),

    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all conversation events", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const conversationEventsRelations = relations(
  conversationEvents,
  ({ one }) => ({
    handoff: one(wellnessCoachHandoffs, {
      fields: [conversationEvents.handoffId],
      references: [wellnessCoachHandoffs.id],
    }),
    performedByCoach: one(authUsers, {
      fields: [conversationEvents.performedByCoachId],
      references: [authUsers.id],
    }),
    transferToCoach: one(authUsers, {
      fields: [conversationEvents.transferToCoachId],
      references: [authUsers.id],
    }),
  }),
);
