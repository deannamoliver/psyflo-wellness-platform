import { sql } from "drizzle-orm";
import { pgPolicy, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { authUsers, supabaseAuthAdminRole } from "drizzle-orm/supabase";
import { timestamps, uuidv7 } from "./column-utils";

export const adminEvals = pgTable(
  "admin_evals",
  {
    id: uuidv7().primaryKey(),
    name: text().notNull(), // e.g., "Concise", "Helpful", "Safe"
    description: text().notNull(), // Detailed explanation of the evaluation criteria
    createdBy: uuid("created_by").references(() => authUsers.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all evals", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export type AdminEval = typeof adminEvals.$inferSelect;
export type NewAdminEval = typeof adminEvals.$inferInsert;
