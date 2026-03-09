"server-only";

import { conversationEvents, users } from "@feelwell/database";
import { desc, eq } from "drizzle-orm";
import type { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullNameFromMetaData } from "@/lib/user/utils";

export type LatestEventResult = {
  eventType: string;
  createdAt: Date;
  coachName: string | null;
  transferToCoachId: string | null;
  transferCoachName: string | null;
  transferCoachInitials: string | null;
};

/** Fetch the most recent conversation event for a handoff. */
export async function fetchLatestEvent(
  db: Awaited<ReturnType<typeof serverDrizzle>>,
  handoffId: string,
): Promise<LatestEventResult | null> {
  const event = await db.admin
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
    .then((res) => res[0]);

  if (!event) return null;

  let coachName: string | null = null;
  if (event.performedByCoachId) {
    const coach = await db.admin
      .select({ rawUserMetaData: users.rawUserMetaData })
      .from(users)
      .where(eq(users.id, event.performedByCoachId))
      .limit(1)
      .then((res) => res[0]);
    if (coach) coachName = getUserFullNameFromMetaData(coach.rawUserMetaData);
  }

  let transferCoachName: string | null = null;
  let transferCoachInitials: string | null = null;
  if (event.transferToCoachId) {
    const tCoach = await db.admin
      .select({ rawUserMetaData: users.rawUserMetaData })
      .from(users)
      .where(eq(users.id, event.transferToCoachId))
      .limit(1)
      .then((res) => res[0]);
    if (tCoach) {
      transferCoachName = getUserFullNameFromMetaData(tCoach.rawUserMetaData);
      transferCoachInitials = transferCoachName
        .split(" ")
        .map((w) => w[0]?.toUpperCase())
        .slice(0, 2)
        .join("");
    }
  }

  return {
    eventType: event.eventType,
    createdAt: event.createdAt,
    coachName,
    transferToCoachId: event.transferToCoachId,
    transferCoachName,
    transferCoachInitials,
  };
}
