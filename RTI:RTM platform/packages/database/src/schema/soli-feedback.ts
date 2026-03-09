import { sql } from "drizzle-orm";
import { boolean, pgPolicy, pgTable, text, uuid } from "drizzle-orm/pg-core";
import {
  authenticatedRole,
  authUsers,
  supabaseAuthAdminRole,
} from "drizzle-orm/supabase";
import { timestamps, uuidv7 } from "./column-utils";

export const feedback = pgTable(
  "feedback",
  {
    id: uuidv7().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    isHelpful: boolean("is_helpful").notNull(),
    comment: text(),
    ...timestamps,
  },
  () => [
    pgPolicy("authenticated can insert own feedback", {
      for: "insert",
      to: authenticatedRole,
      using: sql`(select auth.uid()) = user_id`,
      withCheck: sql`(select auth.uid()) = user_id`,
    }),
    pgPolicy("authenticated can view own feedback", {
      for: "select",
      to: authenticatedRole,
      using: sql`(select auth.uid()) = user_id`,
    }),
    pgPolicy("admin can manage all feedback", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);
