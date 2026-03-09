"use server";

import {
  screenerQuestionSets,
  screenerSessionResponses,
  screenerSessions,
  screeners,
  type screenerTypeEnum,
  userSchools,
} from "@feelwell/database";
import { and, eq } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getCurrentUserInfo } from "@/lib/user/info";

type AssessmentDetails = {
  id: string;
  type: (typeof screenerTypeEnum.enumValues)[number];
  completedAt: Date;
  score: number;
  maxScore: number;
  questionsAndAnswers: Array<{
    questionText: string;
    answerText: string;
    score: number;
  }>;
};

export async function getAssessmentDetails(
  assessmentId: string,
): Promise<AssessmentDetails | null> {
  const db = await serverDrizzle();
  const currentUser = await getCurrentUserInfo();

  // Get the screener
  const screener = await db.admin
    .select()
    .from(screeners)
    .where(eq(screeners.id, assessmentId))
    .limit(1)
    .then((res) => res[0]);

  if (!screener) {
    return null;
  }

  // Authorization: Verify the counselor has access to this student
  // Both the counselor and the student must be in the same school
  const counselorSchool = await db.admin.query.userSchools.findFirst({
    where: and(
      eq(userSchools.userId, currentUser.id),
      eq(userSchools.role, "counselor"),
    ),
  });

  if (!counselorSchool) {
    // Current user is not an counselor
    return null;
  }

  const studentSchool = await db.admin.query.userSchools.findFirst({
    where: and(
      eq(userSchools.userId, screener.userId),
      eq(userSchools.schoolId, counselorSchool.schoolId),
      eq(userSchools.role, "student"),
    ),
  });

  if (!studentSchool) {
    // Student is not in the same school as the counselor, or screener doesn't belong to a student
    return null;
  }

  // Get all sessions for this screener
  const sessions = await db.admin
    .select()
    .from(screenerSessions)
    .where(eq(screenerSessions.screenerId, assessmentId));

  // Get all responses for all sessions
  const allResponses = await Promise.all(
    sessions.map(async (session) => {
      const responses = await db.admin
        .select()
        .from(screenerSessionResponses)
        .where(eq(screenerSessionResponses.sessionId, session.id))
        .orderBy(screenerSessionResponses.ordinal);

      return { session, responses };
    }),
  );

  // Build questions and answers
  const questionsAndAnswers: Array<{
    questionText: string;
    answerText: string;
    score: number;
  }> = [];

  for (const { session, responses } of allResponses) {
    // Find the question set for this session
    const questionSet = screenerQuestionSets.find(
      (qs) => qs.subtype === session.subtype,
    );

    if (!questionSet) {
      continue;
    }

    for (const response of responses) {
      const question = questionSet.questions.find(
        (q) => q.code === response.questionCode,
      );

      if (!question) {
        continue;
      }

      const answer = question.options.find(
        (opt) => opt.code === response.answerCode,
      );

      questionsAndAnswers.push({
        questionText: question.text,
        answerText: answer?.text || "No answer",
        score: answer?.score || 0,
      });
    }
  }

  return {
    id: screener.id,
    type: screener.type,
    completedAt: screener.completedAt || screener.createdAt,
    score: screener.score,
    maxScore: screener.maxScore,
    questionsAndAnswers,
  };
}
