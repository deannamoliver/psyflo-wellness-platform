"server-only";

import type { ScreenerQuestionSet } from "@feelwell/database";
import {
  profiles,
  screenerSessionResponses,
  screenerSessions,
  screeners,
  type screenerTypeEnum,
} from "@feelwell/database";
import { addDays } from "date-fns";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { serverDrizzle } from "@/lib/database/drizzle";
import { internalServerError } from "@/lib/errors";
import {
  getMaxScoreForQuestionSet,
  getScreenerQuestionSet,
  getSubtypesFromType,
} from "@/lib/screener/utils";

async function createScreenerSession({
  screenerId,
  startAt,
  questionSet,
}: {
  screenerId: string;
  startAt: Date;
  questionSet: ScreenerQuestionSet;
}): Promise<string> {
  const db = await serverDrizzle();

  const sessionId = await db.admin
    .insert(screenerSessions)
    .values({
      screenerId,
      startAt,
      part: questionSet.part,
      subtype: questionSet.subtype,
      maxScore: getMaxScoreForQuestionSet(questionSet),
    })
    .returning()
    .then((res) => res[0]?.id);

  if (!sessionId) {
    internalServerError("Failed to create screener session");
  }

  await db.admin.insert(screenerSessionResponses).values(
    questionSet.questions.map((q, index) => ({
      ordinal: index + 1,
      sessionId,
      questionCode: q.code,
      answerCode: null,
    })),
  );

  return sessionId;
}

export async function createScreener(props: {
  studentId: string;
  type: (typeof screenerTypeEnum.enumValues)[number];
  startAt: Date;
}): Promise<string> {
  const db = await serverDrizzle();

  const studentProfile = await db.admin.query.profiles.findFirst({
    where: eq(profiles.id, props.studentId),
  });

  if (!studentProfile) {
    notFound();
  }

  // Calculate age from dateOfBirth, or estimate from grade as fallback
  let age: number;
  if (studentProfile.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(studentProfile.dateOfBirth);
    age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
  } else if (studentProfile.grade != null) {
    // Fallback: estimate age from grade (grade + 5 for typical age)
    age = studentProfile.grade + 5;
  } else {
    internalServerError("Student age or grade is required");
  }

  const id = await db.admin
    .insert(screeners)
    .values({
      userId: props.studentId,
      age: age,
      type: props.type,
    })
    .returning({ id: screeners.id })
    .then((res) => res[0]?.id);

  if (!id) {
    internalServerError("Failed to create screener");
  }

  const subtypes = getSubtypesFromType(props.type);

  // For SEL, we need to create sessions across 4 days (parts 2-5)
  if (props.type === "sel") {
    for (const part of [2, 3, 4, 5]) {
      for (const subtype of subtypes) {
        const questionSet = getScreenerQuestionSet({
          part,
          subtype,
          age: age,
        });

        if (questionSet == null) {
          continue;
        }

        await createScreenerSession({
          screenerId: id,
          startAt: addDays(props.startAt, part - 1),
          questionSet,
        });
      }
    }
  } else {
    // For mental health screeners (phq_a, phq_9, gad_child, gad_7), they are single-part
    for (const subtype of subtypes) {
      const questionSet = getScreenerQuestionSet({
        part: 1,
        subtype,
        age: age,
      });

      if (questionSet == null) {
        continue;
      }

      await createScreenerSession({
        screenerId: id,
        startAt: props.startAt,
        questionSet,
      });
    }
  }

  return id;
}

export async function createAllScreeners({
  studentId,
  startAt,
}: {
  studentId: string;
  startAt: Date;
}) {
  const db = await serverDrizzle();

  const studentProfile = await db.admin.query.profiles.findFirst({
    where: eq(profiles.id, studentId),
  });

  if (!studentProfile) {
    notFound();
  }

  // Calculate age (same logic as in createScreener)
  let age: number;
  if (studentProfile.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(studentProfile.dateOfBirth);
    age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
  } else if (studentProfile.grade != null) {
    age = studentProfile.grade + 5;
  } else {
    internalServerError("Student age or grade is required");
  }

  // Age-specific mental health screeners (Day 1 for ages >= 11)
  if (age >= 11 && age <= 17) {
    // For ages 11-17: PHQ-A and GAD-Child on Day 1
    await createScreener({
      studentId,
      type: "phq_a",
      startAt,
    });

    await createScreener({
      studentId,
      type: "gad_child",
      startAt,
    });

    // SEL screener for ages 11-17 (Days 2-5, parts 2-5 auto-shift from startAt)
    await createScreener({
      studentId,
      type: "sel",
      startAt,
    });
  } else if (age >= 18) {
    // For ages 18+: PHQ-9 and GAD-7 on Day 1
    await createScreener({
      studentId,
      type: "phq_9",
      startAt,
    });

    await createScreener({
      studentId,
      type: "gad_7",
      startAt,
    });

    // SEL screener for ages 18+ (Days 2-5, parts 2-5 auto-shift from startAt)
    await createScreener({
      studentId,
      type: "sel",
      startAt,
    });
  } else {
    // For ages < 11: SEL only, starting Day 1
    // Pass startAt - 1 day so parts 2-5 map to Days 1-4
    await createScreener({
      studentId,
      type: "sel",
      startAt: addDays(startAt, -1),
    });
  }
}
