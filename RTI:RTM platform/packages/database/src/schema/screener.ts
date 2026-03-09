import { sql } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgEnum,
  pgPolicy,
  pgTable,
  real,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { authUsers, supabaseAuthAdminRole } from "drizzle-orm/supabase";
import { alerts } from "./alert";
import { timestamps, uuidv7 } from "./column-utils";

export const screenerFrequencyEnum = pgEnum("screener_frequency", [
  "monthly",
  "quarterly",
  "annually",
]);

export const screenerTypeEnum = pgEnum("screener_type", [
  "sel", // WCSD-SECA for all ages
  "phq_a", // PHQ-A for ages 11-17
  "phq_9", // PHQ-9 for ages 18+
  "gad_child", // GAD-Child for ages 11-17
  "gad_7", // GAD-7 for ages 18+
]);

export const screenerSubtypeEnum = pgEnum("screener_subtype", [
  "sel_self_awareness_self_concept",
  "sel_self_awareness_emotion_knowledge",
  "sel_social_awareness",
  "sel_self_management_emotion_regulation",
  "sel_self_management_goal_management",
  "sel_self_management_school_work",
  "sel_relationship_skills",
  "sel_responsible_decision_making",
  "phq_a",
  "phq_9",
  "gad_child",
  "gad_7",
]);

export const screeners = pgTable(
  "screeners",
  {
    id: uuidv7().primaryKey(),
    userId: uuid()
      .references(() => authUsers.id, { onDelete: "cascade" })
      .notNull(),
    age: integer().notNull(),
    type: screenerTypeEnum().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    score: real().notNull().default(0),
    maxScore: real().notNull().default(0),
    domainScores: jsonb("domain_scores").notNull().default("{}"), // for SEL domain means
    lastScore: real(),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all screeners", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const screenerSessions = pgTable(
  "screener_sessions",
  {
    id: uuidv7().primaryKey(),
    screenerId: uuid()
      .references(() => screeners.id, { onDelete: "cascade" })
      .notNull(),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    part: integer().notNull(),
    subtype: screenerSubtypeEnum().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    score: real().notNull().default(0),
    maxScore: real().notNull().default(0),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all screener sessions", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const screenerSessionResponses = pgTable(
  "screener_session_responses",
  {
    id: uuidv7().primaryKey(),
    sessionId: uuid()
      .references(() => screenerSessions.id, { onDelete: "cascade" })
      .notNull(),
    ordinal: integer().notNull(),
    questionCode: varchar({ length: 50 }).notNull(),
    answerCode: varchar({ length: 50 }),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all screener session responses", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const screenerAlerts = pgTable(
  "screener_alerts",
  {
    id: uuidv7().primaryKey(),
    screenerId: uuid()
      .references(() => screeners.id, { onDelete: "cascade" })
      .notNull(),
    alertId: uuid()
      .references(() => alerts.id, { onDelete: "cascade" })
      .notNull(),
  },
  () => [
    pgPolicy("admin can manage all screener alerts", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const screenerFrequencySettings = pgTable(
  "screener_frequency_settings",
  {
    id: uuidv7().primaryKey(),
    screenerType: screenerTypeEnum("screener_type").notNull().unique(),
    frequency: screenerFrequencyEnum().notNull().default("quarterly"),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all screener frequency settings", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);
