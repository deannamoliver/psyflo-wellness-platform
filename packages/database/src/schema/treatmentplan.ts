import { pgTable, uuid, text, jsonb, timestamp, index, pgEnum } from "drizzle-orm/pg-core";

export const treatmentPlanStatusEnum = pgEnum("treatment_plan_status", [
  "active",
  "completed",
  "discontinued",
]);

export const treatmentPlans = pgTable(
  "treatment_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id").notNull(),
    diagnosisCode: text("diagnosis_code").notNull(),
    diagnosisLabel: text("diagnosis_label").notNull(),
    templateName: text("template_name").notNull(),
    planData: jsonb("plan_data").notNull(), // Full generated goals/objectives/interventions
    status: treatmentPlanStatusEnum("status").default("active").notNull(),
    frequency: text("frequency"),
    estimatedDuration: text("estimated_duration"),
    clinicalNotes: text("clinical_notes"),
    createdBy: uuid("created_by").notNull(), // Clinician ID
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("treatment_plans_student_id_idx").on(table.studentId),
    index("treatment_plans_diagnosis_code_idx").on(table.diagnosisCode),
  ]
);