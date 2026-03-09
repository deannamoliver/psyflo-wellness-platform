"server-only";

import {
  emergencyContacts,
  profiles,
  referralNotes,
  schools,
  therapistReferrals,
  users,
} from "@feelwell/database";
import { eq } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullName } from "@/lib/user/utils";
import type { ReferralDetail, ReferralNote } from "./referral-detail-data";

const STATUS_MAP: Record<string, ReferralDetail["referral"]["status"]> = {
  submitted: "Submitted",
  in_progress: "In Progress",
  matched: "Connected",
  completed: "Closed",
  cancelled: "Closed",
};

const URGENCY_MAP: Record<string, ReferralDetail["referral"]["urgency"]> = {
  routine: "Routine",
  urgent: "Urgent",
};

const URGENCY_DESC: Record<string, string> = {
  routine: "Standard referral timeline",
  urgent: "Expedited review required",
};

const INSURANCE_MAP: Record<string, ReferralDetail["insurance"]["status"]> = {
  has_insurance: "Has Insurance",
  uninsured: "Uninsured",
  unknown: "Unknown",
};

const REASON_DISPLAY: Record<string, string> = {
  anxiety: "Anxiety",
  depression: "Depression",
  trauma: "Trauma",
  behavioral: "Behavioral",
  family_issues: "Family Issues",
  grief_loss: "Grief/Loss",
  self_harm: "Self Harm",
  substance_use: "Substance Use",
  other: "Other",
};

const GENDER_DISPLAY: Record<string, string> = {
  male: "Male",
  female: "Female",
  non_binary: "Non-binary",
  prefer_not_to_answer: "Prefer not to answer",
};

const ETHNICITY_DISPLAY: Record<string, string> = {
  american_indian_or_alaska_native: "American Indian/Alaska Native",
  asian: "Asian",
  black_or_african_american: "Black/African-American",
  hispanic_or_latino: "Hispanic/Latino",
  middle_eastern_or_north_african: "Middle Eastern/North African",
  native_hawaiian_or_pacific_islander: "Native Hawaiian/Pacific Islander",
  white: "White",
  prefer_not_to_answer: "Prefer not to answer",
};

const PRONOUN_DISPLAY: Record<string, string> = {
  "he/him": "He/Him",
  "she/her": "She/Her",
  "they/them": "They/Them",
  prefer_not_to_answer: "Prefer not to answer",
};

const LANGUAGE_DISPLAY: Record<string, string> = {
  english: "English",
  spanish: "Spanish",
  french: "French",
  chinese_simplified: "Chinese (Simplified)",
  arabic: "Arabic",
  haitian_creole: "Haitian Creole",
  bengali: "Bengali",
  russian: "Russian",
  urdu: "Urdu",
  vietnamese: "Vietnamese",
  portuguese: "Portuguese",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export async function fetchReferralDetail(
  referralId: string,
): Promise<ReferralDetail | null> {
  const db = await serverDrizzle();

  const rows = await db.admin
    .select({
      referral: therapistReferrals,
      studentUser: users,
      profile: profiles,
      schoolName: schools.name,
    })
    .from(therapistReferrals)
    .innerJoin(users, eq(therapistReferrals.studentId, users.id))
    .innerJoin(profiles, eq(therapistReferrals.studentId, profiles.id))
    .innerJoin(schools, eq(therapistReferrals.schoolId, schools.id))
    .where(eq(therapistReferrals.id, referralId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const studentName = getUserFullName(row.studentUser);

  const parentRows = await db.admin
    .select()
    .from(emergencyContacts)
    .where(eq(emergencyContacts.studentId, row.referral.studentId))
    .limit(1);

  const parent = parentRows[0];

  const noteRows = await db.admin
    .select({
      note: referralNotes,
      authorUser: users,
    })
    .from(referralNotes)
    .innerJoin(users, eq(referralNotes.authorId, users.id))
    .where(eq(referralNotes.referralId, referralId));

  const notes: ReferralNote[] = noteRows.map((nr) => {
    const authorName = getUserFullName(nr.authorUser);
    return {
      id: nr.note.id,
      authorName,
      authorInitials: getInitials(authorName),
      authorRole: nr.note.authorRole,
      content: nr.note.content,
      createdAt: nr.note.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  });

  const dob = row.profile.dateOfBirth
    ? new Date(row.profile.dateOfBirth).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "-";

  return {
    id: row.referral.id,
    student: {
      id: row.referral.studentId,
      fullName: studentName,
      preferredName: studentName.split(" ")[0] ?? studentName,
      gradeLevel: row.profile.grade ?? 0,
      dateOfBirth: dob,
      gender: GENDER_DISPLAY[row.profile.gender ?? ""] ?? "-",
      ethnicity: ETHNICITY_DISPLAY[row.profile.ethnicity ?? ""] ?? "-",
      pronouns: PRONOUN_DISPLAY[row.profile.pronouns ?? ""] ?? "-",
      homeLanguage: LANGUAGE_DISPLAY[row.profile.language ?? ""] ?? "-",
      email: row.studentUser.email ?? "-",
      homeAddress: row.profile.homeAddress ?? "-",
    },
    parent: {
      guardianName: parent?.name ?? "-",
      relationship: parent?.relation ?? "-",
      phone: parent?.primaryPhone ?? "-",
      email: parent?.primaryEmail ?? "-",
    },
    referral: {
      status: STATUS_MAP[row.referral.status] ?? "Submitted",
      reason: REASON_DISPLAY[row.referral.reason] ?? row.referral.reason,
      urgency: URGENCY_MAP[row.referral.urgency] ?? "Routine",
      urgencyDescription:
        URGENCY_DESC[row.referral.urgency] ?? "Standard referral timeline",
      additionalContext: row.referral.additionalContext ?? "",
    },
    insurance: {
      status:
        INSURANCE_MAP[row.referral.insuranceStatus ?? "unknown"] ?? "Unknown",
      provider: row.referral.insuranceProvider ?? "-",
      memberId: row.referral.insuranceMemberId ?? "-",
    },
    notes,
  };
}
