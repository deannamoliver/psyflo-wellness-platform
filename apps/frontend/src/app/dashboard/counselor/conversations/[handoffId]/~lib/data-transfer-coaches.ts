"server-only";

import { userSchools, users } from "@feelwell/database";
import { and, eq, ne, sql } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullNameFromMetaData } from "@/lib/user/utils";
import type { TransferCoach } from "./types";

/** Fetch coaches in the same school for transfer selection. */
export async function fetchTransferCandidates(): Promise<TransferCoach[]> {
  const db = await serverDrizzle();
  const coachId = db.userId();

  const coachSchool = await db.admin
    .select({ schoolId: userSchools.schoolId })
    .from(userSchools)
    .where(eq(userSchools.userId, coachId))
    .limit(1)
    .then((res) => res[0]?.schoolId);

  if (!coachSchool) return [];

  const coaches = await db.admin
    .select({
      userId: userSchools.userId,
      rawUserMetaData: users.rawUserMetaData,
      activeCount: sql<number>`(
        SELECT COUNT(*) FROM wellness_coach_handoffs
        WHERE accepted_by_coach_id = ${userSchools.userId}
        AND status IN ('pending', 'accepted', 'in_progress')
      )`,
    })
    .from(userSchools)
    .innerJoin(users, eq(userSchools.userId, users.id))
    .where(
      and(
        eq(userSchools.schoolId, coachSchool),
        eq(userSchools.role, "wellness_coach"),
        ne(userSchools.userId, coachId),
      ),
    );

  return coaches.map((c) => {
    const name = getUserFullNameFromMetaData(c.rawUserMetaData);
    return {
      id: c.userId,
      name,
      initials: name
        .split(" ")
        .map((w) => w[0]?.toUpperCase())
        .slice(0, 2)
        .join(""),
      activeConversations: Number(c.activeCount),
    };
  });
}
