import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgPolicy,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { supabaseAuthAdminRole } from "drizzle-orm/supabase";
import { timestamps, uuidv7 } from "./column-utils";
import { schools } from "./school";

export const schoolHours = pgTable(
  "school_hours",
  {
    id: uuidv7().primaryKey(),
    schoolId: uuid("school_id")
      .references(() => schools.id, { onDelete: "cascade" })
      .notNull(),
    timezone: text().notNull().default("America/New_York"),
    dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday, 6=Saturday
    startTime: text("start_time").notNull(), // "08:00" HH:mm format
    endTime: text("end_time").notNull(), // "15:00" HH:mm format
    isSchoolDay: boolean("is_school_day").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("school_hours_school_day_unique").on(
      table.schoolId,
      table.dayOfWeek,
    ),
    pgPolicy("admin can manage all school hours", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const schoolHoursRelations = relations(schoolHours, ({ one }) => ({
  school: one(schools, {
    fields: [schoolHours.schoolId],
    references: [schools.id],
  }),
}));
