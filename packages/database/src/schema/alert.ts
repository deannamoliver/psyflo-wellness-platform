import { sql } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers, supabaseAuthAdminRole } from "drizzle-orm/supabase";
import { timestamps, uuidv7 } from "./column-utils";

export const alertStatusEnum = pgEnum("alert_status", [
  "new",
  "in_progress",
  "resolved",
]);

export const alertTypeEnum = pgEnum("alert_type", [
  "safety",
  "depression",
  "anxiety",
  "abuse_neglect",
  "harm_to_others",
  "harm_to_self",
  "other",
]);

export const alertSourceEnum = pgEnum("alert_source", [
  "chat",
  "screener",
  "coach",
]);

export const alertResolvedByEnum = pgEnum("alert_resolved_by", [
  "counselor",
  "chatbot",
]);

export const timelineEntryTypeEnum = pgEnum("timeline_entry_type", [
  "alert_generated",
  "emergency_action",
  "note_added",
  "status_changed",
]);

export const actionTypeEnum = pgEnum("action_type", [
  "contacted_988",
  "notified_staff",
  "contacted_parents",
  "triggered_gad7",
  "triggered_phq9",
  "emergency_services_contacted",
  "cps_notified",
  "assessment_performed",
]);

export const alerts = pgTable(
  "alerts",
  {
    id: uuidv7().primaryKey(),
    studentId: uuid()
      .references(() => authUsers.id, { onDelete: "cascade" })
      .notNull(),
    type: alertTypeEnum("type").notNull(),
    source: alertSourceEnum("source").notNull(),
    status: alertStatusEnum("status").notNull(),
    resolvedBy: alertResolvedByEnum("resolved_by"), // Nullable - if null, assume counselor
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all alerts", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const alertTimelineEntries = pgTable(
  "alert_timeline_entries",
  {
    id: uuidv7().primaryKey(),
    alertId: uuid()
      .notNull()
      .references(() => alerts.id, { onDelete: "cascade" }),
    type: timelineEntryTypeEnum("type").notNull(),
    description: text("description").notNull(),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all alert timeline entries", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const alertNotes = pgTable(
  "alert_notes",
  {
    id: uuidv7().primaryKey(),
    timelineEntryId: uuid()
      .notNull()
      .references(() => alertTimelineEntries.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    counselorId: uuid("counselor_id")
      .references(() => authUsers.id, { onDelete: "cascade" })
      .notNull(),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all alert notes", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const alertActions = pgTable(
  "alert_actions",
  {
    id: uuidv7().primaryKey(),
    timelineEntryId: uuid()
      .notNull()
      .references(() => alertTimelineEntries.id, { onDelete: "cascade" }),
    type: actionTypeEnum("type").notNull(),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all alert actions", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const alertStatusChanges = pgTable(
  "alert_status_changes",
  {
    id: uuidv7().primaryKey(),
    timelineEntryId: uuid()
      .notNull()
      .references(() => alertTimelineEntries.id, { onDelete: "cascade" }),
    fromStatus: alertStatusEnum("from_status").notNull(),
    toStatus: alertStatusEnum("to_status").notNull(),
    counselorId: uuid("counselor_id")
      .references(() => authUsers.id, { onDelete: "cascade" })
      .notNull(),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all alert status changes", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const shutdownRiskTypeEnum = pgEnum("shutdown_risk_type", [
  "direct",
  "indirect",
  "ambiguous",
  "harm_to_others",
  "abuse_neglect",
]);

export const chatAlerts = pgTable(
  "chat_alerts",
  {
    id: uuidv7().primaryKey(),
    alertId: uuid()
      .references(() => alerts.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    chatSessionId: uuid().notNull(),
    triggeringStatement: text("triggering_statement").notNull(),
    conversationContext: text("conversation_context").notNull(), // Full message history
    clarificationResponses: jsonb("clarification_responses"), // Ambiguous risk Q&A
    cssrState: jsonb("cssr_state"), // CSSR screening state
    isShutdown: boolean("is_shutdown").default(false).notNull(), // Whether chatbot was shut down
    shutdownRiskType: shutdownRiskTypeEnum("shutdown_risk_type"), // What type of risk caused shutdown
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all chat alerts", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);
