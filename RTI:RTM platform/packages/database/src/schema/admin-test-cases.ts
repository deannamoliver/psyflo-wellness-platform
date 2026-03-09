import { relations, sql } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers, supabaseAuthAdminRole } from "drizzle-orm/supabase";
import { timestamps, uuidv7 } from "./column-utils";

export const messageRoleEnum = pgEnum("message_role", ["user", "assistant"]);

export const adminTestCases = pgTable(
  "admin_test_cases",
  {
    id: uuidv7().primaryKey(),
    name: text().notNull(),
    description: text(),
    category: text(), // e.g., "crisis scenarios", "academic help", etc.
    createdBy: uuid("created_by").references(() => authUsers.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all test cases", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const adminTestMessages = pgTable(
  "admin_test_messages",
  {
    id: uuidv7().primaryKey(),
    testCaseId: uuid("test_case_id")
      .references(() => adminTestCases.id, { onDelete: "cascade" })
      .notNull(),
    role: messageRoleEnum("role").notNull(),
    content: text().notNull(),
    sequenceOrder: integer("sequence_order").notNull(), // 0, 1, 2, etc.
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all test messages", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

// Relations
export const adminTestCasesRelations = relations(
  adminTestCases,
  ({ many }) => ({
    messages: many(adminTestMessages),
  }),
);

export const adminTestMessagesRelations = relations(
  adminTestMessages,
  ({ one }) => ({
    testCase: one(adminTestCases, {
      fields: [adminTestMessages.testCaseId],
      references: [adminTestCases.id],
    }),
  }),
);

export type AdminTestCase = typeof adminTestCases.$inferSelect;
export type NewAdminTestCase = typeof adminTestCases.$inferInsert;
export type AdminTestMessage = typeof adminTestMessages.$inferSelect;
export type NewAdminTestMessage = typeof adminTestMessages.$inferInsert;
