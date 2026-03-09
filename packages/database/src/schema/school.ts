import { relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  date,
  integer,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers, supabaseAuthAdminRole } from "drizzle-orm/supabase";
import { timestamps, uuidv7 } from "./column-utils";

export const organizationTypeEnum = pgEnum("organization_type", [
  "k12",
  "college",
  "clinic",
  "cbo",
]);

export const organizationStatusEnum = pgEnum("organization_status", [
  "active",
  "suspended",
  "onboarding",
  "archived",
]);

export const organizationContactRoleEnum = pgEnum("organization_contact_role", [
  "admin",
  "billing",
  "technical",
  "additional",
]);

export const schools = pgTable(
  "schools",
  {
    id: uuidv7().primaryKey(),
    name: text().notNull(),
    address: text(),
    email: text(),
    type: organizationTypeEnum(),
    districtCode: text("district_code"),
    status: organizationStatusEnum().default("active"),
    website: text(),
    emailDomain: text("email_domain"),
    streetAddress: text("street_address"),
    streetAddress2: text("street_address_2"),
    city: text(),
    state: text(),
    country: text(),
    zipCode: text("zip_code"),
    timezone: text(),
    phone: text(),
    internalNotes: text("internal_notes"),
    schoolCode: text("school_code"),
    schoolType: text("school_type"),
    gradeLevels: text("grade_levels").array().default([]),
    estimatedStudentCount: integer("estimated_student_count").default(0),
    inviteLinkActive: boolean("invite_link_active").default(false),
    inviteLinkCode: text("invite_link_code"),
    academicYearStart: date("academic_year_start"),
    academicYearEnd: date("academic_year_end"),
    organizationId: uuid("organization_id").references(
      (): AnyPgColumn => schools.id,
      { onDelete: "set null" },
    ),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all schools", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const userSchoolRoleEnum = pgEnum("user_school_role", [
  "student",
  "counselor",
  "wellness_coach",
]);

export const userSchools = pgTable(
  "user_schools",
  {
    id: uuidv7().primaryKey(),
    userId: uuid("user_id")
      .references(() => authUsers.id, { onDelete: "cascade" })
      .notNull(),
    schoolId: uuid("school_id")
      .references(() => schools.id, { onDelete: "cascade" })
      .notNull(),
    role: userSchoolRoleEnum().default("student").notNull(),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all user schools", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const schoolDomains = pgTable(
  "school_domains",
  {
    id: uuidv7().primaryKey(),
    schoolId: uuid("school_id")
      .references(() => schools.id, { onDelete: "cascade" })
      .notNull(),
    domain: text().notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("domain_unique").on(table.domain),
    pgPolicy("admin can manage all school domains", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const schoolsRelations = relations(schools, ({ many }) => ({
  domains: many(schoolDomains),
  userSchools: many(userSchools),
}));

export const schoolDomainsRelations = relations(schoolDomains, ({ one }) => ({
  school: one(schools, {
    fields: [schoolDomains.schoolId],
    references: [schools.id],
  }),
}));

export const userSchoolsRelations = relations(userSchools, ({ one }) => ({
  school: one(schools, {
    fields: [userSchools.schoolId],
    references: [schools.id],
  }),
}));

export const schoolEmailFilterSettings = pgTable(
  "school_email_filter_settings",
  {
    id: uuidv7().primaryKey(),
    schoolId: uuid("school_id")
      .references(() => schools.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    studentFilteringEnabled: boolean("student_filtering_enabled")
      .default(false)
      .notNull(),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all school email filter settings", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const schoolAllowedEmails = pgTable(
  "school_allowed_emails",
  {
    id: uuidv7().primaryKey(),
    schoolId: uuid("school_id")
      .references(() => schools.id, { onDelete: "cascade" })
      .notNull(),
    email: text().notNull(),
    role: userSchoolRoleEnum().notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("school_email_role_unique").on(
      table.schoolId,
      table.email,
      table.role,
    ),
    pgPolicy("admin can manage all school allowed emails", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const schoolEmailFilterSettingsRelations = relations(
  schoolEmailFilterSettings,
  ({ one }) => ({
    school: one(schools, {
      fields: [schoolEmailFilterSettings.schoolId],
      references: [schools.id],
    }),
  }),
);

export const schoolAllowedEmailsRelations = relations(
  schoolAllowedEmails,
  ({ one }) => ({
    school: one(schools, {
      fields: [schoolAllowedEmails.schoolId],
      references: [schools.id],
    }),
  }),
);

export const schoolsRelationsWithEmailFilter = relations(
  schools,
  ({ many, one }) => ({
    domains: many(schoolDomains),
    userSchools: many(userSchools),
    emailFilterSettings: one(schoolEmailFilterSettings),
    allowedEmails: many(schoolAllowedEmails),
  }),
);

export const schoolContacts = pgTable(
  "school_contacts",
  {
    id: uuid().primaryKey().defaultRandom(),
    schoolId: uuid("school_id")
      .references(() => schools.id, { onDelete: "cascade" })
      .notNull(),
    contactRole: organizationContactRoleEnum("contact_role").notNull(),
    name: text(),
    title: text(),
    email: text(),
    phone: text(),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all school contacts", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);
