import { sql } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers, supabaseAuthAdminRole } from "drizzle-orm/supabase";
import { alerts } from "./alert";
import { timestamps, uuidv7 } from "./column-utils";

export const resolutionStudentStatusEnum = pgEnum("resolution_student_status", [
  "crisis_resolved",
  "ongoing_support",
  "transferred_external",
  "hospitalized",
  "other",
]);

export const resolutionFollowUpPlanEnum = pgEnum("resolution_follow_up_plan", [
  "no_follow_up",
  "routine_check_ins",
  "scheduled_follow_up",
  "other",
]);

export const alertResolutions = pgTable(
  "alert_resolutions",
  {
    id: uuidv7().primaryKey(),
    alertId: uuid()
      .references(() => alerts.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    counselorId: uuid("counselor_id")
      .references(() => authUsers.id, { onDelete: "cascade" })
      .notNull(),
    actionsTaken: text("actions_taken").array().notNull(),
    resolutionSummary: text("resolution_summary").notNull(),
    studentStatus: resolutionStudentStatusEnum("student_status").notNull(),
    followUpPlan: resolutionFollowUpPlanEnum("follow_up_plan").notNull(),
    verificationCompleted: boolean("verification_completed")
      .notNull()
      .default(false),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all alert resolutions", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);
