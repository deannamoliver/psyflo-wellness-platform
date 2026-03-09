"use server";

import {
  emergencyContacts,
  profiles,
  schools,
  userSchools,
} from "@feelwell/database";
import { isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { serverDrizzle } from "@/lib/database/drizzle";
import { supabaseAdmin } from "@/lib/database/supabase-admin";
import type { ImportRow } from "./import-csv-parser";

export type ImportResult = {
  created: number;
  failed: { email: string; error: string }[];
};

export async function fetchAllSchools(): Promise<
  { id: string; name: string }[]
> {
  const db = await serverDrizzle();
  const rows = await db.admin
    .select({ id: schools.id, name: schools.name })
    .from(schools)
    .where(isNull(schools.deletedAt));
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

type ContactTag = "primary" | "backup_1" | "backup_2";

function buildContact(
  contacts: Record<string, string>,
  prefix: string,
  tag: ContactTag,
  studentId: string,
) {
  const name = contacts[`${prefix}_contact_name`];
  const relation = contacts[`${prefix}_contact_relation`];
  if (!name || !relation) return null;
  const str = (key: string) => contacts[key] || null;
  return {
    studentId,
    contactType: "home" as const,
    tag,
    name,
    relation,
    primaryPhone: str(`${prefix}_contact_primary_phone`),
    secondaryPhone: str(`${prefix}_contact_secondary_phone`),
    primaryEmail: str(`${prefix}_contact_primary_email`),
    secondaryEmail: str(`${prefix}_contact_secondary_email`),
  };
}

export async function importStudents(
  rows: ImportRow[],
  schoolId: string,
): Promise<ImportResult> {
  const supabase = supabaseAdmin();
  const db = await serverDrizzle();
  const addedBy = db.userId();

  let created = 0;
  const failed: { email: string; error: string }[] = [];

  for (const row of rows) {
    try {
      const { data: authUser, error: authError } =
        await supabase.auth.admin.createUser({
          email: row.email,
          email_confirm: true,
          user_metadata: {
            first_name: row.first_name,
            last_name: row.last_name,
          },
        });

      if (authError || !authUser.user) {
        failed.push({
          email: row.email,
          error: authError?.message ?? "Failed to create auth user",
        });
        continue;
      }

      const userId = authUser.user.id;

      const profileValues: typeof profiles.$inferInsert = {
        id: userId,
        platformRole: "user",
        accountStatus: (row.account_status ?? "active") as
          | "active"
          | "blocked"
          | "archived",
        studentCode: row.student_code ?? null,
        grade: row.grade ?? null,
        dateOfBirth: row.date_of_birth ?? null,
        gender: row.gender as typeof profiles.$inferInsert.gender,
        pronouns: row.pronouns as typeof profiles.$inferInsert.pronouns,
        language: row.language as typeof profiles.$inferInsert.language,
        ethnicity: row.ethnicity as typeof profiles.$inferInsert.ethnicity,
        phone: row.phone ?? null,
        homeAddress: row.home_address ?? null,
        internalNotes: row.internal_notes ?? null,
        interests: row.interests ?? [],
        learningStyles: row.learning_styles ?? [],
        goals: row.goals ?? [],
        addedBy,
        canManageUsers: false,
        receivesAlertNotifications: false,
      };
      await db.admin.insert(profiles).values(profileValues);

      await db.admin.insert(userSchools).values({
        userId,
        schoolId,
        role: "student",
      });

      const contacts = [
        buildContact(row.contacts, "primary", "primary", userId),
        buildContact(row.contacts, "backup_1", "backup_1", userId),
        buildContact(row.contacts, "backup_2", "backup_2", userId),
      ].filter(Boolean);

      if (contacts.length > 0) {
        await db.admin
          .insert(emergencyContacts)
          .values(contacts as (typeof emergencyContacts.$inferInsert)[]);
      }

      created++;
    } catch (err) {
      failed.push({
        email: row.email,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  revalidatePath("/dashboard/admin/students");
  return { created, failed };
}
