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
import { timestamps, uuidv7 } from "./column-utils";
import { schools } from "./school";

export const referralReasonEnum = pgEnum("referral_reason", [
  "anxiety",
  "depression",
  "trauma",
  "behavioral",
  "family_issues",
  "grief_loss",
  "self_harm",
  "substance_use",
  "other",
]);

export const referralUrgencyEnum = pgEnum("referral_urgency", [
  "routine",
  "urgent",
]);

export const referralInsuranceStatusEnum = pgEnum("referral_insurance_status", [
  "has_insurance",
  "uninsured",
  "unknown",
]);

export const referralStatusEnum = pgEnum("referral_status", [
  "submitted",
  "in_progress",
  "matched",
  "completed",
  "cancelled",
]);

export const therapistReferrals = pgTable(
  "therapist_referrals",
  {
    id: uuidv7().primaryKey(),
    studentId: uuid("student_id")
      .references(() => authUsers.id, { onDelete: "cascade" })
      .notNull(),
    counselorId: uuid("counselor_id")
      .references(() => authUsers.id, { onDelete: "cascade" })
      .notNull(),
    schoolId: uuid("school_id")
      .references(() => schools.id, { onDelete: "cascade" })
      .notNull(),
    reason: referralReasonEnum("reason").notNull(),
    serviceTypes: text("service_types").array().notNull(),
    additionalContext: text("additional_context"),
    urgency: referralUrgencyEnum("urgency").notNull(),
    insuranceStatus: referralInsuranceStatusEnum("insurance_status"),
    parentNotificationConfirmed: boolean(
      "parent_notification_confirmed",
    ).notNull(),
    insuranceProvider: text("insurance_provider"),
    insuranceMemberId: text("insurance_member_id"),
    status: referralStatusEnum("status").default("submitted").notNull(),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all therapist referrals", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const referralNotes = pgTable(
  "referral_notes",
  {
    id: uuid().primaryKey().defaultRandom(),
    referralId: uuid("referral_id")
      .references(() => therapistReferrals.id, { onDelete: "cascade" })
      .notNull(),
    authorId: uuid("author_id")
      .references(() => authUsers.id, { onDelete: "cascade" })
      .notNull(),
    authorRole: text("author_role").notNull(),
    content: text("content").notNull(),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all referral notes", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);
