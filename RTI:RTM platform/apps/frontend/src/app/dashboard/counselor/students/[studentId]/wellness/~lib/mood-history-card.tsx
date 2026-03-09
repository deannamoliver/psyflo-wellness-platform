"use client";

import {
  addDays,
  endOfWeek,
  format,
  isAfter,
  startOfDay,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { MoodName } from "@/app/dashboard/student/home/~lib/sidebar-data";
import { normalizeEmotionToMoodName } from "@/app/dashboard/student/home/~lib/sidebar-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/core-ui/card";
import { Muted } from "@/lib/core-ui/typography";
import Mood from "@/lib/emotion/mood";
import { cn } from "@/lib/tailwind-utils";

type MoodHistoryEntry = {
  date: string;
  mood: string | null;
  specificMood: string | null;
};

export function MoodHistoryCard({ studentId }: { studentId: string }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [moodByDate, setMoodByDate] = useState<Record<string, MoodName | null>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);

  const { rangeLabel, daysInRange, todayStart } = useMemo(() => {
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 0 });
    const blockStart = startOfWeek(
      subWeeks(currentWeekStart, weekOffset * 2 + 1),
      { weekStartsOn: 0 },
    );
    const blockEnd = endOfWeek(subWeeks(currentWeekStart, weekOffset * 2), {
      weekStartsOn: 0,
    });
    const label = `${format(blockStart, "MMM d")} - ${format(
      blockEnd,
      "MMM d",
    )}`;
    const days = Array.from({ length: 14 }, (_, i) => addDays(blockStart, i));

    return {
      rangeLabel: label,
      daysInRange: days,
      todayStart: startOfDay(now),
    };
  }, [weekOffset]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadMoodHistory = async () => {
      setIsLoading(true);
      setMoodByDate({});
      try {
        const response = await fetch(
          `/api/students/${studentId}/mood-history?weekOffset=${weekOffset}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch mood history");
        }

        const data: { entries: MoodHistoryEntry[] } = await response.json();

        if (!isMounted) return;

        const dayMap: Record<string, MoodName | null> = {};

        for (const entry of data.entries) {
          const moodName = normalizeEmotionToMoodName(
            entry.mood,
            entry.specificMood,
          );
          if (!moodName) continue;
          const date = new Date(entry.date);
          const dateKey = format(date, "yyyy-MM-dd");
          dayMap[dateKey] = moodName;
        }

        setMoodByDate(dayMap);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error loading mood history:", error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMoodHistory();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [weekOffset, studentId]);

  return (
    <Card className="gap-2 bg-white font-dm shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-dm font-semibold text-base">
            Mood Check-In History
          </CardTitle>
          <div className="flex items-center gap-1 font-dm">
            {isLoading && (
              <Loader2 className="mr-1 h-3 w-3 animate-spin text-gray-400" />
            )}
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setWeekOffset((prev) => prev + 1)}
              aria-label="View previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-gray-600 text-sm">{rangeLabel}</span>
            <button
              className={cn(
                "text-gray-400 hover:text-gray-600",
                weekOffset === 0 && "cursor-not-allowed opacity-40",
              )}
              onClick={() => setWeekOffset((prev) => Math.max(0, prev - 1))}
              disabled={weekOffset === 0}
              aria-label="View more recent week"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <Muted className="font-dm text-xs">
          Weekly mood check-ins for this student
        </Muted>
      </CardHeader>
      <CardContent className="flex items-center justify-center py-3">
        <div className="grid w-full grid-cols-7 justify-items-center gap-x-1 gap-y-2">
          {daysInRange.map((date, i) => {
            const dateKey = format(date, "yyyy-MM-dd");
            const mood = moodByDate[dateKey];
            const isFuture = isAfter(startOfDay(date), todayStart);
            const dayLabel = format(date, "EEEEE");

            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: Static array with fixed order
              <div
                key={i}
                className="flex flex-col items-center justify-center gap-1.5"
              >
                <span className="text-center font-dm text-gray-500 text-xs">
                  {dayLabel}
                </span>
                {isFuture ? (
                  <div className="h-10 w-10" />
                ) : mood ? (
                  <Mood
                    mood={mood}
                    withShadow={false}
                    className="h-10 w-10 flex-shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
