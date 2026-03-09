import { relations, sql } from "drizzle-orm";
import {
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
import { timestamps, uuidv7 } from "./column-utils";
import { wellnessCoachHandoffs } from "./wellness-coach";

export const safetyConcernCategoryEnum = pgEnum("safety_concern_category", [
  "harm_to_self",
  "harm_to_others",
  "abuse_neglect",
  "other_safety",
]);

export const riskLevelEnum = pgEnum("risk_level", [
  "emergency",
  "high",
  "moderate",
  "low",
]);

export const coachSafetyReportStatusEnum = pgEnum(
  "coach_safety_report_status",
  ["draft", "submitted"],
);

export const coachSafetyReports = pgTable(
  "coach_safety_reports",
  {
    id: uuidv7().primaryKey(),
    alertId: uuid("alert_id")
      .references(() => alerts.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    handoffId: uuid("handoff_id").references(() => wellnessCoachHandoffs.id, {
      onDelete: "set null",
    }),
    category: safetyConcernCategoryEnum("category").notNull(),
    riskLevel: riskLevelEnum("risk_level").notNull().default("moderate"),
    studentDisclosure: text("student_disclosure"),
    situationSummary: text("situation_summary"),
    screeningResponses: jsonb("screening_responses"), // Structured Q&A, shape varies by category
    submittedByCoachId: uuid("submitted_by_coach_id").references(
      () => authUsers.id,
      { onDelete: "set null" },
    ),
    reportStatus: coachSafetyReportStatusEnum("report_status")
      .notNull()
      .default("draft"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all coach safety reports", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const coachSafetyReportsRelations = relations(
  coachSafetyReports,
  ({ one }) => ({
    alert: one(alerts, {
      fields: [coachSafetyReports.alertId],
      references: [alerts.id],
    }),
    handoff: one(wellnessCoachHandoffs, {
      fields: [coachSafetyReports.handoffId],
      references: [wellnessCoachHandoffs.id],
    }),
    submittedByCoach: one(authUsers, {
      fields: [coachSafetyReports.submittedByCoachId],
      references: [authUsers.id],
    }),
  }),
);
