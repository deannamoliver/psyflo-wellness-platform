"server-only";

import {
  alertResolutions,
  alerts,
  coachSafetyReports,
  conversationEvents,
  emergencyContacts,
  profiles,
  safetyWorkflows,
  schools,
  userSchools,
  users,
  wellnessCoachChatEntries,
  wellnessCoachHandoffs,
} from "@feelwell/database";
import { and, asc, desc, eq, inArray, isNull, ne, or } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullName, getUserFullNameFromMetaData } from "@/lib/user/utils";

export type AdminAlertDetail = {
  alertId: string;
  studentId: string;
  studentName: string;
  grade: number | null;
  studentCode: string | null;
  dateOfBirth: string | null;
  email: string | null;
  homeAddress: string | null;
  schoolName: string;
  schoolId: string | null;
  status: string;
  source: string;
  type: string;
  riskLevel: string;
  createdAt: Date;
  coachName: string | null;
  handoffId: string | null;
  emergencyContacts: {
    name: string;
    relation: string;
    phone: string | null;
    email: string | null;
    tag: string | null;
  }[];
  coachReport: {
    category: string;
    riskLevel: string;
    studentDisclosure: string | null;
    situationSummary: string | null;
    screeningResponses: Record<string, boolean> | null;
    submittedAt: Date | null;
  } | null;
  resolution: {
    counselorName: string;
    resolutionSummary: string | null;
    actionsTaken: string[];
    studentStatus: string;
    followUpPlan: string;
    createdAt: Date;
  } | null;
};

export type ConversationData = {
  handoffId: string;
  studentName: string;
  studentInitials: string;
  coachName: string;
  coachInitials: string;
  topic: string;
  reason: string;
  status: "active" | "closed" | "transferred";
  startedAt: string;
  closedAt: string | null;
  closedByName: string | null;
  transferredAt: string | null;
  transferredToCoachName: string | null;
  messages: {
    id: string;
    content: string;
    author: "student" | "coach";
    createdAt: string;
    senderInitials: string;
  }[];
  safetyWorkflowActivatedAt: string | null;
  safetyWorkflowInitiatedBy: string | null;
  transferEvents: {
    id: string;
    eventType: "takeover" | "transferred";
    performedByName: string;
    transferToName: string | null;
    createdAt: string;
  }[];
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

export async function getAdminAlertDetail(
  alertId: string,
): Promise<AdminAlertDetail | null> {
  const db = await serverDrizzle();

  const row = await db.admin
    .select({
      alert: alerts,
      user: users,
      profile: profiles,
      schoolName: schools.name,
      schoolId: schools.id,
    })
    .from(alerts)
    .innerJoin(users, eq(alerts.studentId, users.id))
    .innerJoin(profiles, eq(alerts.studentId, profiles.id))
    .leftJoin(
      userSchools,
      and(
        eq(alerts.studentId, userSchools.userId),
        eq(userSchools.role, "student"),
      ),
    )
    .leftJoin(schools, eq(userSchools.schoolId, schools.id))
    .where(eq(alerts.id, alertId))
    .limit(1)
    .then((res) => res[0]);

  if (!row) return null;

  const studentName = getUserFullName(row.user);

  // Fetch coach safety report
  const coachReport = await db.admin
    .select()
    .from(coachSafetyReports)
    .where(eq(coachSafetyReports.alertId, alertId))
    .limit(1)
    .then((res) => res[0] ?? null);

  // Get coach name
  let coachName: string | null = null;
  if (coachReport?.submittedByCoachId) {
    const coach = await db.admin
      .select({ rawUserMetaData: users.rawUserMetaData })
      .from(users)
      .where(eq(users.id, coachReport.submittedByCoachId))
      .limit(1)
      .then((res) => res[0]);
    if (coach) coachName = getUserFullNameFromMetaData(coach.rawUserMetaData);
  }

  // Fetch emergency contacts
  const contactRecords = await db.admin
    .select()
    .from(emergencyContacts)
    .where(
      and(
        isNull(emergencyContacts.deletedAt),
        eq(emergencyContacts.contactType, "home"),
        or(
          eq(emergencyContacts.studentId, row.user.id),
          ...(row.schoolId
            ? [eq(emergencyContacts.schoolId, row.schoolId)]
            : []),
        ),
      ),
    )
    .orderBy(asc(emergencyContacts.tag));

  const contacts = contactRecords.map((c) => ({
    name: c.name,
    relation: c.relation,
    phone: c.primaryPhone,
    email: c.primaryEmail,
    tag:
      c.tag === "primary"
        ? "Primary Emergency Contact"
        : c.tag === "backup_1"
          ? "Back Up #1"
          : c.tag === "backup_2"
            ? "Back Up #2"
            : null,
  }));

  // Fetch resolution
  let resolution: AdminAlertDetail["resolution"] = null;
  const resolutionRow = await db.admin
    .select()
    .from(alertResolutions)
    .where(eq(alertResolutions.alertId, alertId))
    .limit(1)
    .then((res) => res[0] ?? null);

  if (resolutionRow) {
    let counselorName = "Provider";
    const counselor = await db.admin
      .select({ rawUserMetaData: users.rawUserMetaData })
      .from(users)
      .where(eq(users.id, resolutionRow.counselorId))
      .limit(1)
      .then((res) => res[0] ?? null);
    if (counselor) {
      counselorName = getUserFullNameFromMetaData(counselor.rawUserMetaData);
    }
    resolution = {
      counselorName,
      resolutionSummary: resolutionRow.resolutionSummary,
      actionsTaken: resolutionRow.actionsTaken,
      studentStatus: resolutionRow.studentStatus,
      followUpPlan: resolutionRow.followUpPlan,
      createdAt: resolutionRow.createdAt,
    };
  }

  // Determine risk level
  let riskLevel = "moderate";
  if (coachReport?.riskLevel) {
    riskLevel = coachReport.riskLevel;
  }

  return {
    alertId,
    studentId: row.user.id,
    studentName,
    grade: row.profile.grade,
    studentCode: row.profile.studentCode ?? null,
    dateOfBirth: row.profile.dateOfBirth,
    email: row.user.email ?? null,
    homeAddress: row.profile.homeAddress ?? null,
    schoolName: row.schoolName ?? "Unknown School",
    schoolId: row.schoolId ?? null,
    status: row.alert.status,
    source: row.alert.source,
    type: row.alert.type,
    riskLevel,
    createdAt: row.alert.createdAt,
    coachName,
    handoffId: coachReport?.handoffId ?? null,
    emergencyContacts: contacts,
    coachReport: coachReport
      ? {
          category: coachReport.category,
          riskLevel: coachReport.riskLevel,
          studentDisclosure: coachReport.studentDisclosure,
          situationSummary: coachReport.situationSummary,
          screeningResponses: coachReport.screeningResponses as Record<
            string,
            boolean
          > | null,
          submittedAt: coachReport.submittedAt,
        }
      : null,
    resolution,
  };
}

export async function getConversationForHandoff(
  handoffId: string,
): Promise<ConversationData | null> {
  const db = await serverDrizzle();

  const row = await db.admin
    .select({
      handoff: wellnessCoachHandoffs,
      user: users,
    })
    .from(wellnessCoachHandoffs)
    .innerJoin(users, eq(wellnessCoachHandoffs.studentId, users.id))
    .where(eq(wellnessCoachHandoffs.id, handoffId))
    .limit(1)
    .then((res) => res[0]);

  if (!row) return null;

  const studentName = getUserFullName(row.user);
  const studentInitials = getInitials(studentName);

  // Get coach name
  let coachName = "Therapist";
  let coachInitials = "C";
  if (row.handoff.acceptedByCoachId) {
    const coach = await db.admin
      .select({ rawUserMetaData: users.rawUserMetaData })
      .from(users)
      .where(eq(users.id, row.handoff.acceptedByCoachId))
      .limit(1)
      .then((res) => res[0]);
    if (coach) {
      coachName = getUserFullNameFromMetaData(coach.rawUserMetaData);
      coachInitials = getInitials(coachName);
    }
  }

  // Get messages
  const entries = await db.admin
    .select({
      id: wellnessCoachChatEntries.id,
      content: wellnessCoachChatEntries.content,
      author: wellnessCoachChatEntries.author,
      createdAt: wellnessCoachChatEntries.createdAt,
      senderUserId: wellnessCoachChatEntries.senderUserId,
    })
    .from(wellnessCoachChatEntries)
    .where(eq(wellnessCoachChatEntries.escalationId, handoffId))
    .orderBy(asc(wellnessCoachChatEntries.createdAt));

  // Batch-resolve sender names for initials
  const senderIds = [
    ...new Set(entries.map((e) => e.senderUserId).filter(Boolean)),
  ] as string[];
  const senderMap = new Map<string, string>();
  if (senderIds.length > 0) {
    const senderRows = await db.admin
      .select({ id: users.id, rawUserMetaData: users.rawUserMetaData })
      .from(users)
      .where(inArray(users.id, senderIds));
    for (const s of senderRows) {
      const name = getUserFullNameFromMetaData(s.rawUserMetaData);
      const initials = name
        .split(" ")
        .map((w) => w[0]?.toUpperCase())
        .slice(0, 2)
        .join("");
      senderMap.set(s.id, initials);
    }
  }

  const messages = entries.map((e) => ({
    id: e.id,
    content: e.content,
    author: (e.author ?? "student") as "student" | "coach",
    createdAt: e.createdAt.toISOString(),
    senderInitials: e.senderUserId
      ? (senderMap.get(e.senderUserId) ?? "?")
      : "?",
  }));

  // Get latest event to determine status
  const latestEvent = await db.admin
    .select({
      eventType: conversationEvents.eventType,
      createdAt: conversationEvents.createdAt,
      performedByCoachId: conversationEvents.performedByCoachId,
      transferToCoachId: conversationEvents.transferToCoachId,
    })
    .from(conversationEvents)
    .where(eq(conversationEvents.handoffId, handoffId))
    .orderBy(desc(conversationEvents.createdAt))
    .limit(1)
    .then((res) => res[0] ?? null);

  let status: "active" | "closed" | "transferred" = "active";
  let closedAt: string | null = null;
  let closedByName: string | null = null;
  let transferredAt: string | null = null;
  let transferredToCoachName: string | null = null;

  if (
    row.handoff.status === "completed" ||
    latestEvent?.eventType === "closed"
  ) {
    status = "closed";
    if (latestEvent?.eventType === "closed") {
      closedAt = latestEvent.createdAt.toISOString();
      if (latestEvent.performedByCoachId) {
        const closer = await db.admin
          .select({ rawUserMetaData: users.rawUserMetaData })
          .from(users)
          .where(eq(users.id, latestEvent.performedByCoachId))
          .limit(1)
          .then((res) => res[0]);
        if (closer)
          closedByName = getUserFullNameFromMetaData(closer.rawUserMetaData);
      }
    }
  } else if (
    row.handoff.status === "cancelled" ||
    latestEvent?.eventType === "transferred"
  ) {
    status = "transferred";
    if (latestEvent?.eventType === "transferred") {
      transferredAt = latestEvent.createdAt.toISOString();
      if (latestEvent.transferToCoachId) {
        const tCoach = await db.admin
          .select({ rawUserMetaData: users.rawUserMetaData })
          .from(users)
          .where(eq(users.id, latestEvent.transferToCoachId))
          .limit(1)
          .then((res) => res[0]);
        if (tCoach)
          transferredToCoachName = getUserFullNameFromMetaData(
            tCoach.rawUserMetaData,
          );
      }
    }
  }

  const safetyWorkflow = await db.admin
    .select({
      activatedAt: safetyWorkflows.activatedAt,
      initiatedByCoachId: safetyWorkflows.initiatedByCoachId,
    })
    .from(safetyWorkflows)
    .where(
      and(
        eq(safetyWorkflows.handoffId, handoffId),
        ne(safetyWorkflows.status, "cancelled"),
      ),
    )
    .limit(1)
    .then((r) => r[0]);

  let safetyWorkflowInitiatedBy: string | null = null;
  if (safetyWorkflow?.initiatedByCoachId) {
    const initiator = await db.admin
      .select({ rawUserMetaData: users.rawUserMetaData })
      .from(users)
      .where(eq(users.id, safetyWorkflow.initiatedByCoachId))
      .limit(1)
      .then((r) => r[0]);
    if (initiator) {
      safetyWorkflowInitiatedBy = getUserFullNameFromMetaData(
        initiator.rawUserMetaData,
      );
    }
  }

  // Fetch takeover/transfer events
  const eventRows = await db.admin
    .select({
      id: conversationEvents.id,
      eventType: conversationEvents.eventType,
      performedByCoachId: conversationEvents.performedByCoachId,
      transferToCoachId: conversationEvents.transferToCoachId,
      createdAt: conversationEvents.createdAt,
    })
    .from(conversationEvents)
    .where(
      and(
        eq(conversationEvents.handoffId, handoffId),
        inArray(conversationEvents.eventType, ["takeover", "transferred"]),
      ),
    )
    .orderBy(asc(conversationEvents.createdAt));

  const eventUserIds = [
    ...new Set(
      eventRows
        .flatMap((e) => [e.performedByCoachId, e.transferToCoachId])
        .filter(Boolean),
    ),
  ] as string[];
  const eventNameMap = new Map<string, string>();
  if (eventUserIds.length > 0) {
    const nameRows = await db.admin
      .select({ id: users.id, rawUserMetaData: users.rawUserMetaData })
      .from(users)
      .where(inArray(users.id, eventUserIds));
    for (const r of nameRows) {
      eventNameMap.set(r.id, getUserFullNameFromMetaData(r.rawUserMetaData));
    }
  }

  const transferEvents = eventRows.map((e) => ({
    id: e.id,
    eventType: e.eventType as "takeover" | "transferred",
    performedByName: e.performedByCoachId
      ? (eventNameMap.get(e.performedByCoachId) ?? "Unknown")
      : "Unknown",
    transferToName: e.transferToCoachId
      ? (eventNameMap.get(e.transferToCoachId) ?? null)
      : null,
    createdAt: e.createdAt.toISOString(),
  }));

  return {
    handoffId,
    studentName,
    studentInitials,
    coachName,
    coachInitials,
    topic: row.handoff.topic,
    reason: row.handoff.reason,
    status,
    startedAt: row.handoff.requestedAt.toISOString(),
    closedAt,
    closedByName,
    transferredAt,
    transferredToCoachName,
    messages,
    safetyWorkflowActivatedAt:
      safetyWorkflow?.activatedAt?.toISOString() ?? null,
    safetyWorkflowInitiatedBy,
    transferEvents,
  };
}
