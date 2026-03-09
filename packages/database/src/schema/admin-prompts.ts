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

export const promptTypeEnum = pgEnum("prompt_type", [
  "system",
  "user_guidance",
  "safety_response",
]);

export const adminPrompts = pgTable(
  "admin_prompts",
  {
    id: uuidv7().primaryKey(),
    name: text().notNull(), // Human-readable name for the prompt
    type: promptTypeEnum("type").default("system").notNull(),
    content: text().notNull(), // The actual prompt content
    description: text(), // Optional description of what this prompt does
    isActive: boolean("is_active").default(false).notNull(), // Only one can be active at a time
    createdBy: uuid("created_by").references(() => authUsers.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all prompts", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export type AdminPrompt = typeof adminPrompts.$inferSelect;
export type NewAdminPrompt = typeof adminPrompts.$inferInsert;
