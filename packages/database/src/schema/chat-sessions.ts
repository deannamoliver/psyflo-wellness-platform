import { sql } from "drizzle-orm";
import { pgPolicy, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { authUsers, supabaseAuthAdminRole } from "drizzle-orm/supabase";
import { timestamps, uuidv7 } from "./column-utils";

export const chatSessions = pgTable(
  "chat_sessions",
  {
    id: uuidv7().primaryKey(),
    userId: uuid()
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    title: text().notNull().default("New Chat"),
    assignedCoachId: uuid("assigned_coach_id").references(() => authUsers.id, {
      onDelete: "set null",
    }),
    subject: text(),
    studentLastReadAt: timestamp("student_last_read_at", {
      withTimezone: true,
    }),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all chat sessions", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);
