"use server";

import { profiles } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { serverDrizzle } from "@/lib/database/drizzle";

export type BlockStudentInput = {
  studentId: string;
  reason: string;
  explanation: string;
  duration: string;
  notes: string;
};

export async function blockStudent(input: BlockStudentInput) {
  const db = await serverDrizzle();

  const blockedUntil =
    input.duration === "indefinite"
      ? null
      : computeBlockedUntil(input.duration);

  await db.admin
    .update(profiles)
    .set({
      accountStatus: "blocked",
      blockedReason: input.reason,
      blockedExplanation: input.explanation,
      blockedDuration: input.duration,
      blockedNotes: input.notes,
      blockedAt: new Date(),
      blockedUntil,
    })
    .where(eq(profiles.id, input.studentId));

  revalidatePath(`/dashboard/admin/students/${input.studentId}`);
  revalidatePath("/dashboard/admin/students");
}

export type UnblockStudentInput = {
  studentId: string;
  reason: string;
  notes: string;
};

export async function unblockStudent(input: UnblockStudentInput) {
  const db = await serverDrizzle();

  await db.admin
    .update(profiles)
    .set({
      accountStatus: "active",
      blockedReason: null,
      blockedExplanation: null,
      blockedDuration: null,
      blockedNotes: null,
      blockedAt: null,
      blockedUntil: null,
      unblockedReason: input.reason,
      unblockedNotes: input.notes || null,
      unblockedAt: new Date(),
    })
    .where(eq(profiles.id, input.studentId));

  revalidatePath(`/dashboard/admin/students/${input.studentId}`);
  revalidatePath("/dashboard/admin/students");
}

function computeBlockedUntil(duration: string): Date | null {
  const now = new Date();
  switch (duration) {
    case "1_week":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "2_weeks":
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    case "1_month":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}
