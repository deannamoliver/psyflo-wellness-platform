export { authUsers } from "drizzle-orm/supabase";
export * from "./resources/screener-questions";
export * from "./schema";

import { jsonb, pgSchema, text, uuid } from "drizzle-orm/pg-core";

export const auth = pgSchema("auth");

export const users = auth.table("users", {
  id: uuid().primaryKey().notNull(),
  email: text("email"),
  rawUserMetaData: jsonb("raw_user_meta_data").notNull(),
});
