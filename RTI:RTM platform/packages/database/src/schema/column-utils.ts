import { timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

export const timestamps = {
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
};

export function uuidv7() {
  return uuid().$defaultFn(() => v7());
}
