import { relations, sql } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers, supabaseAuthAdminRole } from "drizzle-orm/supabase";
import { alerts } from "./alert";
import {
  riskLevelEnum,
  safetyConcernCategoryEnum,
} from "./coach-safety-report";
import { timestamps, uuidv7 } from "./column-utils";
import { schools } from "./school";
import { wellnessCoachHandoffs } from "./wellness-coach";

export const safetyWorkflowStatusEnum = pgEnum("safety_workflow_status", [
  "active",
  "completed",
  "cancelled",
]);

export const safetyWorkflows = pgTable(
  "safety_workflows",
  {
    id: uuidv7().primaryKey(),
    handoffId: uuid("handoff_id")
      .references(() => wellnessCoachHandoffs.id, { onDelete: "cascade" })
      .notNull(),
    studentId: uuid("student_id")
      .references(() => authUsers.id, { onDelete: "cascade" })
      .notNull(),
    initiatedByCoachId: uuid("initiated_by_coach_id").references(
      () => authUsers.id,
      { onDelete: "set null" },
    ),
    schoolId: uuid("school_id").references(() => schools.id, {
      onDelete: "set null",
    }),
    status: safetyWorkflowStatusEnum("status").notNull().default("active"),
    isDuringSchoolHours: boolean("is_during_school_hours")
      .notNull()
      .default(false),
    activatedAt: timestamp("activated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    // Step 1: Danger assessment
    immediateDanger: boolean("immediate_danger"), // null = not answered
    // Step 2: Type of concern (only if immediateDanger = false)
    concernType: safetyConcernCategoryEnum("concern_type"),
    // Steps 3+: Assessment data (varies by concern type)
    assessmentData: jsonb("assessment_data"),
    // Step 4: Risk level
    riskLevel: riskLevelEnum("risk_level"),
    professionalJudgment: text("professional_judgment"),
    // Step 5: Action data (safety plan or emergency actions)
    actData: jsonb("act_data"),
    // Step 6: Documentation data (situation summary, student statement, actions taken)
    documentData: jsonb("document_data"),
    // Link to alert
    alertId: uuid("alert_id").references(() => alerts.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all safety workflows", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const safetyWorkflowsRelations = relations(
  safetyWorkflows,
  ({ one }) => ({
    handoff: one(wellnessCoachHandoffs, {
      fields: [safetyWorkflows.handoffId],
      references: [wellnessCoachHandoffs.id],
    }),
    student: one(authUsers, {
      fields: [safetyWorkflows.studentId],
      references: [authUsers.id],
    }),
    initiatedByCoach: one(authUsers, {
      fields: [safetyWorkflows.initiatedByCoachId],
      references: [authUsers.id],
    }),
    school: one(schools, {
      fields: [safetyWorkflows.schoolId],
      references: [schools.id],
    }),
    alert: one(alerts, {
      fields: [safetyWorkflows.alertId],
      references: [alerts.id],
    }),
  }),
);
