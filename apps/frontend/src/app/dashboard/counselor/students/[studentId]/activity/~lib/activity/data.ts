"server-only";

import { moodCheckIns, screenerSessions, screeners } from "@feelwell/database";
import { desc, eq } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";

export async function getRecentCheckIns(studentId: string) {
  const db = await serverDrizzle();

  return await db.admin
    .select({
      id: moodCheckIns.id,
      createdAt: moodCheckIns.createdAt,
      updatedAt: moodCheckIns.updatedAt,
      universalEmotion: moodCheckIns.universalEmotion,
      specificEmotion: moodCheckIns.specificEmotion,
    })
    .from(moodCheckIns)
    .where(eq(moodCheckIns.userId, studentId))
    .orderBy(desc(moodCheckIns.createdAt))
    .limit(5);
}

export async function getRecentScreeners(studentId: string) {
  const db = await serverDrizzle();
  return await db.admin
    .select({
      id: screenerSessions.id,
      createdAt: screenerSessions.createdAt,
      updatedAt: screenerSessions.updatedAt,
      subtype: screenerSessions.subtype,
    })
    .from(screenerSessions)
    .innerJoin(screeners, eq(screenerSessions.screenerId, screeners.id))
    .where(eq(screeners.userId, studentId))
    .orderBy(desc(screenerSessions.createdAt))
    .limit(5);
}
