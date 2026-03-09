import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers, supabaseAuthAdminRole } from "drizzle-orm/supabase";
import { timestamps, uuidv7 } from "./column-utils";
import { schools } from "./school";

// Emergency contact type enum
export const emergencyContactTypeEnum = pgEnum("emergency_contact_type", [
  "home",
  "school",
]);

// Emergency contact tag enum (priority level)
export const emergencyContactTagEnum = pgEnum("emergency_contact_tag", [
  "primary",
  "backup_1",
  "backup_2",
]);

export const emergencyContacts = pgTable(
  "emergency_contacts",
  {
    id: uuidv7().primaryKey(),
    // Either studentId OR schoolId must be set, but not both
    // studentId is for home contacts (specific to one student)
    studentId: uuid("student_id").references(() => authUsers.id, {
      onDelete: "cascade",
    }),
    // schoolId is for school contacts (applies to all students at that school)
    schoolId: uuid("school_id").references(() => schools.id, {
      onDelete: "cascade",
    }),
    // Contact type (home or school)
    contactType: emergencyContactTypeEnum("contact_type").notNull(),
    // Contact information
    name: text().notNull(),
    relation: text().notNull(), // e.g., 'mother', 'father', 'sibling', 'counselor'
    tag: emergencyContactTagEnum(), // e.g., 'primary', 'backup_1', 'backup_2'
    // Phone numbers
    primaryPhone: text("primary_phone"),
    secondaryPhone: text("secondary_phone"),
    // Email addresses
    primaryEmail: text("primary_email"),
    secondaryEmail: text("secondary_email"),
    ...timestamps,
  },
  (table) => [
    // Ensure exactly one of student_id or school_id is set
    check(
      "contact_reference_check",
      sql`(${table.studentId} IS NOT NULL AND ${table.schoolId} IS NULL AND ${table.contactType} = 'home') OR (${table.studentId} IS NULL AND ${table.schoolId} IS NOT NULL AND ${table.contactType} = 'school')`,
    ),
    // Indexes for efficient querying
    index("idx_emergency_contacts_student_id").on(table.studentId),
    index("idx_emergency_contacts_school_id").on(table.schoolId),
    index("idx_emergency_contacts_contact_type").on(table.contactType),
    // RLS policies
    pgPolicy("admin can manage all emergency contacts", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

// Relations
export const emergencyContactsRelations = relations(
  emergencyContacts,
  ({ one }) => ({
    student: one(authUsers, {
      fields: [emergencyContacts.studentId],
      references: [authUsers.id],
    }),
    school: one(schools, {
      fields: [emergencyContacts.schoolId],
      references: [schools.id],
    }),
  }),
);
