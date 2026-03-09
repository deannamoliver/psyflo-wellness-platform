/**
 * Therapist referral generator
 *
 * Creates test therapist referral rows identical to what the
 * "Refer to Therapist" modal writes via submitTherapistReferral().
 */

import type { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "../../schema";

export type TherapistReferralConfig = {
  reason:
    | "anxiety"
    | "depression"
    | "trauma"
    | "behavioral"
    | "family_issues"
    | "grief_loss"
    | "self_harm"
    | "substance_use"
    | "other";
  serviceTypes: (
    | "individual_therapy"
    | "family_therapy"
    | "psychiatric_services"
  )[];
  additionalContext?: string;
  urgency: "routine" | "urgent";
  insuranceStatus?: "has_insurance" | "uninsured" | "unknown";
  status?: "submitted" | "in_progress" | "matched" | "completed" | "cancelled";
  createdAt?: Date;
};

export async function createTherapistReferral(
  db: ReturnType<typeof drizzle>,
  studentId: string,
  counselorId: string,
  schoolId: string,
  config: TherapistReferralConfig,
): Promise<string> {
  const createdAt = config.createdAt ?? new Date(Date.now() - 3 * 86400000);

  const [row] = await db
    .insert(schema.therapistReferrals)
    .values({
      studentId,
      counselorId,
      schoolId,
      reason: config.reason,
      serviceTypes: config.serviceTypes,
      additionalContext: config.additionalContext ?? null,
      urgency: config.urgency,
      insuranceStatus: config.insuranceStatus ?? null,
      parentNotificationConfirmed: true,
      status: config.status ?? "submitted",
      createdAt,
      updatedAt: createdAt,
    })
    .returning({ id: schema.therapistReferrals.id });

  if (!row) throw new Error("Failed to insert therapist referral");
  return row.id;
}
