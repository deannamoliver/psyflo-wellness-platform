import {
  boolean,
  date,
  integer,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm/sql";
import {
  authenticatedRole,
  authUsers,
  supabaseAuthAdminRole,
} from "drizzle-orm/supabase";
import { timestamps } from "./column-utils";

export const genderEnum = pgEnum("gender", [
  "male",
  "female",
  "non_binary",
  "prefer_not_to_answer",
]);

export const pronounEnum = pgEnum("pronoun", [
  "he/him",
  "she/her",
  "they/them",
  "prefer_not_to_answer",
]);

export const languageEnum = pgEnum("language", [
  "english",
  "spanish",
  "french",
  "chinese_simplified",
  "arabic",
  "haitian_creole",
  "bengali",
  "russian",
  "urdu",
  "vietnamese",
  "portuguese",
]);

export const ethnicityEnum = pgEnum("ethnicity", [
  "american_indian_or_alaska_native",
  "asian",
  "black_or_african_american",
  "hispanic_or_latino",
  "middle_eastern_or_north_african",
  "native_hawaiian_or_pacific_islander",
  "white",
  "prefer_not_to_answer",
]);

export const platformRoleEnum = pgEnum("platform_role", [
  "user",
  "admin",
  "clinical_supervisor",
]);

export const accountStatusEnum = pgEnum("account_status", [
  "active",
  "blocked",
  "archived",
]);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid()
      .references(() => authUsers.id, { onDelete: "cascade" })
      .primaryKey(),
    dateOfBirth: date(),
    grade: integer(),
    gender: genderEnum(),
    pronouns: pronounEnum(),
    language: languageEnum(),
    ethnicity: ethnicityEnum(),
    homeAddress: text("home_address"),
    interests: text("interests").array().default([]).notNull(),
    learningStyles: text("learning_styles").array().default([]).notNull(),
    goals: text("goals").array().default([]).notNull(),
    platformRole: platformRoleEnum("platform_role").default("user").notNull(),
    accountStatus: accountStatusEnum("account_status")
      .default("active")
      .notNull(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
    studentCode: text("student_code"),
    phone: text(),
    internalNotes: text("internal_notes"),
    addedBy: uuid("added_by").references(() => authUsers.id, {
      onDelete: "set null",
    }),
    canManageUsers: boolean("can_manage_users").default(false).notNull(),
    receivesAlertNotifications: boolean("receives_alert_notifications")
      .default(true)
      .notNull(),
    blockedReason: text("blocked_reason"),
    blockedExplanation: text("blocked_explanation"),
    blockedDuration: text("blocked_duration"),
    blockedNotes: text("blocked_notes"),
    blockedAt: timestamp("blocked_at", { withTimezone: true }),
    blockedUntil: timestamp("blocked_until", { withTimezone: true }),
    unblockedReason: text("unblocked_reason"),
    unblockedNotes: text("unblocked_notes"),
    unblockedAt: timestamp("unblocked_at", { withTimezone: true }),
    onboardingCompletedAt: timestamp("onboarding_completed_at", {
      withTimezone: true,
    }),
    ...timestamps,
  },
  () => [
    pgPolicy("authenticated can manage own profile", {
      for: "all",
      to: authenticatedRole,
      using: sql`(select auth.uid()) = id`,
    }),
    pgPolicy("admin can manage all profiles", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);
