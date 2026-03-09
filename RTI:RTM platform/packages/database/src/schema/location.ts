import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgPolicy,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { supabaseAuthAdminRole } from "drizzle-orm/supabase";
import { timestamps } from "./column-utils";
import { schools } from "./school";

export const locationContacts = pgTable(
  "location_contacts",
  {
    id: uuid().primaryKey().defaultRandom(),
    schoolId: uuid("school_id")
      .references(() => schools.id, { onDelete: "cascade" })
      .notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    contactName: text("contact_name").notNull(),
    jobTitle: text("job_title"),
    email: text(),
    phone: text(),
    officePhone: text("office_phone"),
    mobilePhone: text("mobile_phone"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all location contacts", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const locationBlackoutDays = pgTable(
  "location_blackout_days",
  {
    id: uuid().primaryKey().defaultRandom(),
    schoolId: uuid("school_id")
      .references(() => schools.id, { onDelete: "cascade" })
      .notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    name: text().notNull(),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all location blackout days", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const locationEmergencyServices = pgTable(
  "location_emergency_services",
  {
    id: uuid().primaryKey().defaultRandom(),
    schoolId: uuid("school_id")
      .references(() => schools.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    policePhone: text("police_phone"),
    policeAddress: text("police_address"),
    sroName: text("sro_name"),
    sroPhone: text("sro_phone"),
    noSro: boolean("no_sro").default(false),
    crisisCenterName: text("crisis_center_name"),
    crisisHotline: text("crisis_hotline"),
    crisisHours: text("crisis_hours").default("24/7"),
    mobileCrisisAvailable: boolean("mobile_crisis_available").default(false),
    mobileCrisisNumber: text("mobile_crisis_number"),
    nearestHospital: text("nearest_hospital"),
    erAddress: text("er_address"),
    erPhone: text("er_phone"),
    stateCpsHotline: text("state_cps_hotline"),
    localCpsOffice: text("local_cps_office"),
    cpsReportUrl: text("cps_report_url"),
    notes: text(),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all location emergency services", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const locationPlatformConfig = pgTable(
  "location_platform_config",
  {
    id: uuid().primaryKey().defaultRandom(),
    schoolId: uuid("school_id")
      .references(() => schools.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    chatbotEnabled: boolean("chatbot_enabled").default(true),
    chatbotScheduleType: text("chatbot_schedule_type").default("24_7"),
    chatbotClosuresDisabled: boolean("chatbot_closures_disabled").default(true),
    selScreenerEnabled: boolean("sel_screener_enabled").default(true),
    selScreenerFrequency: text("sel_screener_frequency").default("monthly"),
    selScreenerFirstDate: date("sel_screener_first_date"),
    phq9Enabled: boolean("phq9_enabled").default(true),
    phq9Frequency: text("phq9_frequency").default("quarterly"),
    phq9FirstDate: date("phq9_first_date"),
    gad7Enabled: boolean("gad7_enabled").default(true),
    gad7Frequency: text("gad7_frequency").default("quarterly"),
    gad7FirstDate: date("gad7_first_date"),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all location platform config", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const locationGradeRestrictions = pgTable(
  "location_grade_restrictions",
  {
    id: uuid().primaryKey().defaultRandom(),
    schoolId: uuid("school_id")
      .references(() => schools.id, { onDelete: "cascade" })
      .notNull(),
    gradeLevel: text("grade_level").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("location_grade_restrictions_unique").on(
      table.schoolId,
      table.gradeLevel,
    ),
    pgPolicy("admin can manage all location grade restrictions", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

// Relations
export const locationContactsRelations = relations(
  locationContacts,
  ({ one }) => ({
    school: one(schools, {
      fields: [locationContacts.schoolId],
      references: [schools.id],
    }),
  }),
);

export const locationBlackoutDaysRelations = relations(
  locationBlackoutDays,
  ({ one }) => ({
    school: one(schools, {
      fields: [locationBlackoutDays.schoolId],
      references: [schools.id],
    }),
  }),
);

export const locationEmergencyServicesRelations = relations(
  locationEmergencyServices,
  ({ one }) => ({
    school: one(schools, {
      fields: [locationEmergencyServices.schoolId],
      references: [schools.id],
    }),
  }),
);

export const locationPlatformConfigRelations = relations(
  locationPlatformConfig,
  ({ one }) => ({
    school: one(schools, {
      fields: [locationPlatformConfig.schoolId],
      references: [schools.id],
    }),
  }),
);

export const locationGradeRestrictionsRelations = relations(
  locationGradeRestrictions,
  ({ one }) => ({
    school: one(schools, {
      fields: [locationGradeRestrictions.schoolId],
      references: [schools.id],
    }),
  }),
);
