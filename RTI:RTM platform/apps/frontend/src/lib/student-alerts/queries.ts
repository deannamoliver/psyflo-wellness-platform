import {
  alerts,
  alertTimelineEntries,
  chatAlerts,
  profiles,
  screenerAlerts,
  screenerSessionResponses,
  screenerSessions,
  screeners,
  userSchools,
  users,
} from "@feelwell/database";
import { and, eq, inArray } from "drizzle-orm";
import type { inferParserType } from "nuqs";
import type { searchParamsParsers } from "@/app/dashboard/counselor/alerts/~lib/parsers";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullName } from "@/lib/user/utils";
import {
  transformToStudentGrouped,
  transformToStudentGroupedWithFiltered,
} from "./student-status";
import type { AlertWithScreener, StudentAlertsGrouped } from "./types";

export async function getStudentGroupedAlerts({
  schoolId,
  sParams,
}: {
  schoolId: string;
  sParams: inferParserType<typeof searchParamsParsers>;
}): Promise<StudentAlertsGrouped[]> {
  const db = await serverDrizzle();

  // Get ALL alerts for school (no alert-level filtering)
  const data = await db.admin
    .select()
    .from(alerts)
    .innerJoin(userSchools, eq(alerts.studentId, userSchools.userId))
    .innerJoin(profiles, eq(alerts.studentId, profiles.id))
    .innerJoin(users, eq(alerts.studentId, users.id))
    .leftJoin(screenerAlerts, eq(alerts.id, screenerAlerts.alertId))
    .leftJoin(screeners, eq(screenerAlerts.screenerId, screeners.id))
    .leftJoin(chatAlerts, eq(alerts.id, chatAlerts.alertId))
    .where(
      and(
        eq(userSchools.schoolId, schoolId),
        // Only keep grade level filter - remove alert status/source/type filters
        sParams.gradeLevel !== "all"
          ? eq(profiles.grade, parseInt(sParams.gradeLevel, 10))
          : undefined,
      ),
    );

  // Transform to AlertWithScreener format (same as getStudentWithAllAlerts)
  const alertsWithScreener = data.map((alert) => ({
    id: alert.alerts.id,
    createdAt: alert.alerts.createdAt,
    updatedAt: alert.alerts.updatedAt,
    status: alert.alerts.status,
    type: alert.alerts.type,
    source: alert.alerts.source,
    resolvedBy: alert.alerts.resolvedBy,
    summary: null,
    student: {
      id: alert.profiles.id,
      code: null,
      name: getUserFullName(alert.users),
      gradeLevel: alert.profiles.grade,
      room: null,
      avatar: null,
      dateOfBirth: alert.profiles.dateOfBirth,
    },
    // Include screener data if available
    screener: alert.screeners
      ? {
          id: alert.screeners.id,
          type: alert.screeners.type,
          completedAt: alert.screeners.completedAt,
          score: alert.screeners.score,
          maxScore: alert.screeners.maxScore,
        }
      : null,
    // Include chat data if available
    chat: alert.chat_alerts
      ? {
          id: alert.chat_alerts.id,
          chatSessionId: alert.chat_alerts.chatSessionId,
          triggeringStatement: alert.chat_alerts.triggeringStatement,
          conversationContext: alert.chat_alerts.conversationContext,
          clarificationResponses: alert.chat_alerts
            .clarificationResponses as unknown as
            | import("./types").ClarificationResponses
            | null,
          cssrState: alert.chat_alerts.cssrState as unknown as
            | import("./types").CSSRState
            | null,
          isShutdown: alert.chat_alerts.isShutdown,
          shutdownRiskType: alert.chat_alerts.shutdownRiskType,
        }
      : null,
  }));

  // Group alerts by student ID
  const studentAlertsMap = new Map<string, AlertWithScreener[]>();

  for (const alert of alertsWithScreener) {
    const studentId = alert.student.id;
    if (!studentAlertsMap.has(studentId)) {
      studentAlertsMap.set(studentId, []);
    }
    studentAlertsMap.get(studentId)?.push(alert);
  }

  // Transform each group to StudentAlertsGrouped and filter by student status
  const allStudentGroupedAlerts: StudentAlertsGrouped[] = [];
  const statusFilter = sParams.status;
  const noStatusFilter = statusFilter.length === 0;

  for (const [studentId, allAlerts] of studentAlertsMap.entries()) {
    const studentData = transformToStudentGrouped(studentId, allAlerts);

    // Filter students by tab status (student-level filtering, multi-select)
    const shouldIncludeStudent =
      noStatusFilter || statusFilter.includes(studentData.studentStatus);

    if (shouldIncludeStudent) {
      // Filter alerts to only show alerts matching the selected statuses
      const filteredAlerts = noStatusFilter
        ? allAlerts
        : allAlerts.filter((alert) => statusFilter.includes(alert.status));

      if (filteredAlerts.length > 0 || noStatusFilter) {
        // Create new StudentAlertsGrouped with filtered alerts for display
        const filteredStudentData = transformToStudentGroupedWithFiltered(
          studentId,
          allAlerts,
          filteredAlerts,
        );
        allStudentGroupedAlerts.push(filteredStudentData);
      }
    }
  }

  return allStudentGroupedAlerts;
}

export async function getStudentWithAllAlerts({
  studentId,
  schoolId,
}: {
  studentId: string;
  schoolId: string;
}): Promise<StudentAlertsGrouped | null> {
  const db = await serverDrizzle();

  // Get ALL alerts for this specific student with screener data
  const data = await db.admin
    .select()
    .from(alerts)
    .innerJoin(userSchools, eq(alerts.studentId, userSchools.userId))
    .innerJoin(profiles, eq(alerts.studentId, profiles.id))
    .innerJoin(users, eq(alerts.studentId, users.id))
    .leftJoin(screenerAlerts, eq(alerts.id, screenerAlerts.alertId))
    .leftJoin(screeners, eq(screenerAlerts.screenerId, screeners.id))
    .leftJoin(chatAlerts, eq(alerts.id, chatAlerts.alertId))
    .where(
      and(eq(userSchools.schoolId, schoolId), eq(alerts.studentId, studentId)),
    );

  if (data.length === 0) {
    return null;
  }

  // Transform to AlertWithStudent format with screener data
  const alertsWithStudent = data.map((alert) => ({
    id: alert.alerts.id,
    createdAt: alert.alerts.createdAt,
    updatedAt: alert.alerts.updatedAt,
    status: alert.alerts.status,
    type: alert.alerts.type,
    source: alert.alerts.source,
    resolvedBy: alert.alerts.resolvedBy,
    summary: null,
    student: {
      id: alert.profiles.id,
      code: null,
      name: getUserFullName(alert.users),
      gradeLevel: alert.profiles.grade,
      room: null,
      avatar: null,
      dateOfBirth: alert.profiles.dateOfBirth,
    },
    // Include screener data if available
    screener: alert.screeners
      ? {
          id: alert.screeners.id,
          type: alert.screeners.type,
          completedAt: alert.screeners.completedAt,
          score: alert.screeners.score,
          maxScore: alert.screeners.maxScore,
        }
      : null,
    // Include chat data if available
    chat: alert.chat_alerts
      ? {
          id: alert.chat_alerts.id,
          chatSessionId: alert.chat_alerts.chatSessionId,
          triggeringStatement: alert.chat_alerts.triggeringStatement,
          conversationContext: alert.chat_alerts.conversationContext,
          clarificationResponses: alert.chat_alerts
            .clarificationResponses as unknown as
            | import("./types").ClarificationResponses
            | null,
          cssrState: alert.chat_alerts.cssrState as unknown as
            | import("./types").CSSRState
            | null,
          isShutdown: alert.chat_alerts.isShutdown,
          shutdownRiskType: alert.chat_alerts.shutdownRiskType,
        }
      : null,
  }));

  // Get timeline entries for all alerts
  const alertIds = alertsWithStudent.map((alert) => alert.id);
  const timelineData =
    alertIds.length > 0
      ? await db.admin
          .select()
          .from(alertTimelineEntries)
          .where(inArray(alertTimelineEntries.alertId, alertIds))
      : [];

  const timelineEntriesFormatted = timelineData.map((entry) => ({
    id: entry.id,
    alertId: entry.alertId,
    type: entry.type,
    description: entry.description,
    createdAt: entry.createdAt,
  }));

  // Get screener sessions and responses for all screeners
  const screenerIds = alertsWithStudent
    .map((alert) => alert.screener?.id)
    .filter((id): id is string => id != null);

  const screenerSessionsData =
    screenerIds.length > 0
      ? await db.admin
          .select()
          .from(screenerSessions)
          .innerJoin(screeners, eq(screenerSessions.screenerId, screeners.id))
          .where(inArray(screenerSessions.screenerId, screenerIds))
      : [];

  const sessionIds = screenerSessionsData.map(
    (row) => row.screener_sessions.id,
  );
  const responsesData =
    sessionIds.length > 0
      ? await db.admin
          .select()
          .from(screenerSessionResponses)
          .where(inArray(screenerSessionResponses.sessionId, sessionIds))
      : [];

  // Group responses by session and transform to match ScreenerResponse type
  const responsesBySession = new Map<
    string,
    Array<{
      id: string;
      sessionId: string;
      questionCode: string;
      answerCode: string;
      createdAt: Date;
    }>
  >();
  for (const response of responsesData) {
    // Filter out responses without answers (answerCode should never be null for completed sessions)
    if (response.answerCode === null) continue;

    if (!responsesBySession.has(response.sessionId)) {
      responsesBySession.set(response.sessionId, []);
    }
    responsesBySession.get(response.sessionId)?.push({
      id: response.id,
      sessionId: response.sessionId,
      questionCode: response.questionCode,
      answerCode: response.answerCode,
      createdAt: response.createdAt,
    });
  }

  // Group sessions by screener and transform to ScreenerSessionWithResponses type
  const sessionsByScreener = new Map<
    string,
    Array<{
      id: string;
      screenerId: string;
      studentId: string;
      status: string;
      createdAt: Date;
      updatedAt: Date;
      responses: Array<{
        id: string;
        sessionId: string;
        questionCode: string;
        answerCode: string;
        createdAt: Date;
      }>;
    }>
  >();
  for (const row of screenerSessionsData) {
    const session = row.screener_sessions;
    const screener = row.screeners;

    if (!sessionsByScreener.has(session.screenerId)) {
      sessionsByScreener.set(session.screenerId, []);
    }
    const responses = responsesBySession.get(session.id) ?? [];
    sessionsByScreener.get(session.screenerId)?.push({
      id: session.id,
      screenerId: session.screenerId,
      studentId: screener.userId, // Get studentId from joined screener
      status: session.completedAt ? "completed" : "in_progress", // Derive status from completedAt
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      responses,
    });
  }

  // Attach session data to alerts
  const alertsWithSessions = alertsWithStudent.map((alert) => ({
    ...alert,
    screenerSessions: alert.screener
      ? (sessionsByScreener.get(alert.screener.id) ?? [])
      : [],
  }));

  // Return student with all their alerts, timeline entries, and screener sessions
  const studentGrouped = transformToStudentGrouped(
    studentId,
    alertsWithSessions,
  );
  return {
    ...studentGrouped,
    timelineEntries: timelineEntriesFormatted,
  };
}
