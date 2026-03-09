import { moodCheckIns } from "@feelwell/database";
import { endOfWeek, startOfWeek, subWeeks } from "date-fns";
import { and, eq, gte, lte } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { serverDrizzle } from "@/lib/database/drizzle";

type MoodHistoryEntry = {
  date: string;
  mood: string | null;
  specificMood: string | null;
};

type MoodHistoryResponse = {
  entries: MoodHistoryEntry[];
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const weekOffsetParam = searchParams.get("weekOffset");
    const weekOffset = Number.isFinite(Number(weekOffsetParam))
      ? Math.max(0, Number(weekOffsetParam))
      : 0;

    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 0 });
    const blockStart = startOfWeek(subWeeks(currentWeekStart, weekOffset), {
      weekStartsOn: 0,
    });
    const blockEnd = endOfWeek(subWeeks(currentWeekStart, weekOffset), {
      weekStartsOn: 0,
    });

    const db = await serverDrizzle();
    const userId = db.userId();

    const checkIns = await db.admin
      .select({
        date: moodCheckIns.createdAt,
        mood: moodCheckIns.universalEmotion,
        specificMood: moodCheckIns.specificEmotion,
      })
      .from(moodCheckIns)
      .where(
        and(
          eq(moodCheckIns.userId, userId),
          gte(moodCheckIns.createdAt, blockStart),
          lte(moodCheckIns.createdAt, blockEnd),
        ),
      )
      .orderBy(moodCheckIns.createdAt);

    const entries: MoodHistoryEntry[] = checkIns.map((item) => ({
      date: item.date.toISOString(),
      mood: item.mood,
      specificMood: item.specificMood,
    }));

    const body: MoodHistoryResponse = { entries };

    return NextResponse.json(body);
  } catch (error) {
    console.error("Failed to fetch mood history:", error);
    return NextResponse.json(
      { error: "Failed to fetch mood history" },
      { status: 500 },
    );
  }
}
