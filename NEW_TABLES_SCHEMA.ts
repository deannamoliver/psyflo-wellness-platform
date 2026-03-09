/**
 * ============================================================
 * NEW DATABASE TABLES — Drizzle Schema Definitions
 * ============================================================
 *
 * INSTRUCTIONS:
 * 1. Copy this file to: packages/database/src/schema/rtm.ts
 * 2. Add `export * from "./rtm";` to packages/database/src/schema/index.ts
 * 3. Run `npx drizzle-kit generate` to create the migration
 * 4. Run `npx drizzle-kit push` to apply to Supabase
 *
 * These tables support:
 *  - Treatment Plans, Exercises, Diagnoses (replacing localStorage)
 *  - Clinician Time Tracking (automatic on patient chart view)
 *  - Journal Entries (student journal saved to DB)
 *  - Provider/Facility Info (NPI, credentials from login)
 *  - Notifications with due dates (replacing calendar)
 *  - Billing Reports (replacing mock data)
 * ============================================================
 */

import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgPolicy,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers, supabaseAuthAdminRole } from "drizzle-orm/supabase";
import { timestamps, uuidv7 } from "./column-utils";
import { schools } from "./school";

// ─── Treatment Plans ────────────────────────────────────────────────

export const treatmentPlanStatusEnum = pgEnum("treatment_plan_status", [
  "active",
  "completed",
  "archived",
]);

export const treatmentPlans = pgTable(
  "treatment_plans",
  {
    id: uuidv7().primaryKey(),
    studentId: uuid("student_id")
      .references(() => authUsers.id, { onDelete: "cascade" })
      .notNull(),
    counselorId: uuid("counselor_id")
      .references(() => authUsers.id, { onDelete: "set null" }),
    title: text().notNull(),
    goals: text().array().default([]).notNull(),
    notes: text().default(""),
    status: treatmentPlanStatusEnum().default("active").notNull(),
    startDate: date("start_date"),
    reviewDate: date("review_date"),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all treatment plans", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

// ─── Assigned Exercises ─────────────────────────────────────────────

export const exerciseStatusEnum = pgEnum("exercise_status", [
  "active",
  "completed",
  "deactivated",
]);

export const assignedExercises = pgTable(
  "assigned_exercises",
  {
    id: uuidv7().primaryKey(),
    planId: uuid("plan_id")
      .references(() => treatmentPlans.id, { onDelete: "cascade" })
      .notNull(),
    studentId: uuid("student_id")
      .references(() => authUsers.id, { onDelete: "cascade" })
      .notNull(),
    topicId: text("topic_id").notNull(),
    topicName: text("topic_name").notNull(),
    categoryName: text("category_name").notNull(),
    frequency: text().notNull(),
    status: exerciseStatusEnum().default("active").notNull(),
    assignedDate: date("assigned_date"),
    deadline: date(),
    completedDate: date("completed_date"),
    lastActivity: timestamp("last_activity", { withTimezone: true }),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all assigned exercises", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

// ─── Patient Diagnoses ──────────────────────────────────────────────

export const patientDiagnoses = pgTable(
  "patient_diagnoses",
  {
    id: uuidv7().primaryKey(),
    studentId: uuid("student_id")
      .references(() => authUsers.id, { onDelete: "cascade" })
      .notNull(),
    counselorId: uuid("counselor_id")
      .references(() => authUsers.id, { onDelete: "set null" }),
    code: text().notNull(), // ICD-10 code
    description: text().notNull(),
    isPrimary: boolean("is_primary").default(false),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all patient diagnoses", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

// ─── Clinician Time Tracking ────────────────────────────────────────

export const clinicianTimeLogs = pgTable(
  "clinician_time_logs",
  {
    id: uuidv7().primaryKey(),
    counselorId: uuid("counselor_id")
      .references(() => authUsers.id, { onDelete: "cascade" })
      .notNull(),
    studentId: uuid("student_id")
      .references(() => authUsers.id, { onDelete: "cascade" })
      .notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    durationSeconds: integer("duration_seconds"),
    pageViewed: text("page_viewed"), // e.g. "overview", "assessments", "conversations"
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all clinician time logs", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

// ─── Journal Entries ────────────────────────────────────────────────

export const journalEntries = pgTable(
  "journal_entries",
  {
    id: uuidv7().primaryKey(),
    studentId: uuid("student_id")
      .references(() => authUsers.id, { onDelete: "cascade" })
      .notNull(),
    text: text().notNull(),
    promptText: text("prompt_text"),
    promptCategory: text("prompt_category"),
    sentimentLabel: text("sentiment_label"), // positive, negative, neutral, mixed
    sentimentScore: real("sentiment_score"),
    emotions: jsonb().default("[]"), // detected emotions array
    wordCount: integer("word_count").default(0),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all journal entries", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

// ─── Provider / Facility Info ───────────────────────────────────────

export const providerProfiles = pgTable(
  "provider_profiles",
  {
    id: uuid()
      .references(() => authUsers.id, { onDelete: "cascade" })
      .primaryKey(),
    npi: text(), // National Provider Identifier
    credentials: text(), // e.g. "LCSW", "LPC", "PhD"
    licenseNumber: text("license_number"),
    licenseState: text("license_state"),
    specialties: text().array().default([]),
    facilityName: text("facility_name"),
    facilityNpi: text("facility_npi"),
    facilityAddress: text("facility_address"),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all provider profiles", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

// ─── Notifications ──────────────────────────────────────────────────

export const notificationTypeEnum = pgEnum("notification_type", [
  "check_in",
  "billing",
  "review",
  "submission",
  "reminder",
  "alert",
]);

export const notifications = pgTable(
  "notifications",
  {
    id: uuidv7().primaryKey(),
    userId: uuid("user_id")
      .references(() => authUsers.id, { onDelete: "cascade" })
      .notNull(),
    type: notificationTypeEnum().notNull(),
    title: text().notNull(),
    description: text(),
    dueDate: timestamp("due_date", { withTimezone: true }),
    actionUrl: text("action_url"),
    read: boolean().default(false).notNull(),
    dismissed: boolean().default(false).notNull(),
    relatedStudentId: uuid("related_student_id")
      .references(() => authUsers.id, { onDelete: "set null" }),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all notifications", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

// ─── Billing Reports ────────────────────────────────────────────────

export const billingReportStatusEnum = pgEnum("billing_report_status", [
  "ready_for_review",
  "reviewed",
  "signed",
  "submitted",
]);

export const billingReports = pgTable(
  "billing_reports",
  {
    id: uuidv7().primaryKey(),
    studentId: uuid("student_id")
      .references(() => authUsers.id, { onDelete: "cascade" })
      .notNull(),
    counselorId: uuid("counselor_id")
      .references(() => authUsers.id, { onDelete: "set null" }),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    cptCodes: text("cpt_codes").array().default([]),
    status: billingReportStatusEnum().default("ready_for_review").notNull(),
    estimatedAmount: real("estimated_amount").default(0),
    signedAt: timestamp("signed_at", { withTimezone: true }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    evidence: jsonb().default("{}"), // dataDaysCollected, clinicianMinutesLogged, etc.
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all billing reports", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

// ─── Patient Assignments (Access Control) ───────────────────────────

export const patientAssignmentCaseRoleEnum = pgEnum("patient_assignment_case_role", [
  "primary",
  "co_treating",
  "supervisor",
  "consulting",
]);

export const patientAssignmentStatusEnum = pgEnum("patient_assignment_status", [
  "active",
  "inactive",
]);

export const patientAssignments = pgTable(
  "patient_assignments",
  {
    id: uuidv7().primaryKey(),
    patientId: uuid("patient_id")
      .references(() => authUsers.id, { onDelete: "cascade" })
      .notNull(),
    providerId: uuid("provider_id")
      .references(() => authUsers.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => schools.id, { onDelete: "cascade" })
      .notNull(),
    caseRole: patientAssignmentCaseRoleEnum("case_role").notNull().default("primary"),
    assignedBy: uuid("assigned_by").references(() => authUsers.id, {
      onDelete: "set null",
    }),
    status: patientAssignmentStatusEnum().notNull().default("active"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("patient_provider_org_unique").on(
      table.patientId,
      table.providerId,
      table.organizationId,
    ),
    pgPolicy("admin can manage all patient assignments", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

// ─── Relations ──────────────────────────────────────────────────────

export const treatmentPlansRelations = relations(treatmentPlans, ({ many }) => ({
  exercises: many(assignedExercises),
}));

export const assignedExercisesRelations = relations(assignedExercises, ({ one }) => ({
  plan: one(treatmentPlans, {
    fields: [assignedExercises.planId],
    references: [treatmentPlans.id],
  }),
}));

export const patientAssignmentsRelations = relations(
  patientAssignments,
  ({ one }) => ({
    patient: one(authUsers, {
      fields: [patientAssignments.patientId],
      references: [authUsers.id],
    }),
    provider: one(authUsers, {
      fields: [patientAssignments.providerId],
      references: [authUsers.id],
    }),
    organization: one(schools, {
      fields: [patientAssignments.organizationId],
      references: [schools.id],
    }),
    assignedByUser: one(authUsers, {
      fields: [patientAssignments.assignedBy],
      references: [authUsers.id],
    }),
  }),
);
