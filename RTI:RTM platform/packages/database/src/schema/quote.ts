import { integer, pgPolicy, pgTable, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm/sql";
import { authenticatedRole, supabaseAuthAdminRole } from "drizzle-orm/supabase";
import { timestamps, uuidv7 } from "./column-utils";

export const quotes = pgTable(
  "quotes",
  {
    id: uuidv7().primaryKey(),
    quote: text().notNull(),
    author: text().notNull(),
    year: integer().notNull(),
    source: text().notNull(),
    themes: text().array().default([]).notNull(),
    ...timestamps,
  },
  () => [
    pgPolicy("authenticated can view quotes", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
    pgPolicy("admin can manage all quotes", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export type Quote = typeof quotes.$inferSelect;
