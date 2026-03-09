import { sql } from "drizzle-orm";
import { pgEnum, pgPolicy, pgTable, text, uuid } from "drizzle-orm/pg-core";
import {
  authenticatedRole,
  authUsers,
  supabaseAuthAdminRole,
} from "drizzle-orm/supabase";
import { timestamps } from "./column-utils";

export const soliColorEnum = pgEnum("soli_color", [
  "blue",
  "teal",
  "purple",
  "pink",
  "orange",
  "green",
  "yellow",
  "royal",
]);

export const soliShapeEnum = pgEnum("soli_shape", [
  "round",
  "tall",
  "wide",
  "chunky",
]);

export const userSettings = pgTable(
  "user_settings",
  {
    id: uuid()
      .references(() => authUsers.id, { onDelete: "cascade" })
      .primaryKey(),
    timezone: text("timezone").default("UTC").notNull(),
    soliColor: soliColorEnum().default("blue"),
    soliShape: soliShapeEnum().default("round"),
    ...timestamps,
  },
  () => [
    pgPolicy("authenticated can manage own settings", {
      for: "all",
      to: authenticatedRole,
      using: sql`(select auth.uid()) = id`,
    }),
    pgPolicy("admin can manage all user settings", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);
