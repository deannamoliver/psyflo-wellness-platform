"use server";

import { referralNotes, therapistReferrals } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { serverDrizzle } from "@/lib/database/drizzle";

type Result = { ok: boolean; error?: string };

export async function updateReferralDetails(
  referralId: string,
  data: {
    status: string;
    reason: string;
    urgency: string;
    additionalContext: string;
  },
): Promise<Result> {
  const db = await serverDrizzle();

  try {
    await db.admin
      .update(therapistReferrals)
      .set({
        status: data.status as typeof therapistReferrals.$inferInsert.status,
        reason: data.reason as typeof therapistReferrals.$inferInsert.reason,
        urgency: data.urgency as typeof therapistReferrals.$inferInsert.urgency,
        additionalContext: data.additionalContext || null,
      })
      .where(eq(therapistReferrals.id, referralId));
  } catch {
    return { ok: false, error: "Failed to update referral details." };
  }

  revalidatePath(`/dashboard/admin/referrals/${referralId}`);
  revalidatePath("/dashboard/admin/referrals");
  return { ok: true };
}

export async function updateReferralInsurance(
  referralId: string,
  data: {
    insuranceStatus: string;
    insuranceProvider: string;
    insuranceMemberId: string;
  },
): Promise<Result> {
  const db = await serverDrizzle();

  try {
    await db.admin
      .update(therapistReferrals)
      .set({
        insuranceStatus:
          data.insuranceStatus as typeof therapistReferrals.$inferInsert.insuranceStatus,
        insuranceProvider: data.insuranceProvider || null,
        insuranceMemberId: data.insuranceMemberId || null,
      })
      .where(eq(therapistReferrals.id, referralId));
  } catch {
    return { ok: false, error: "Failed to update insurance information." };
  }

  revalidatePath(`/dashboard/admin/referrals/${referralId}`);
  revalidatePath("/dashboard/admin/referrals");
  return { ok: true };
}

export async function addReferralNote(
  referralId: string,
  content: string,
): Promise<Result> {
  const db = await serverDrizzle();
  const authorId = db.userId();

  try {
    await db.admin.insert(referralNotes).values({
      referralId,
      authorId,
      authorRole: "admin",
      content,
    });
  } catch {
    return { ok: false, error: "Failed to add note." };
  }

  revalidatePath(`/dashboard/admin/referrals/${referralId}`);
  revalidatePath("/dashboard/admin/referrals");
  return { ok: true };
}
