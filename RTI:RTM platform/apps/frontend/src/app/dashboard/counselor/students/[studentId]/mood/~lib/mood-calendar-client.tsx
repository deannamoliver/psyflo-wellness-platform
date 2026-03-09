"use client";

import { Card } from "@/lib/core-ui/card";
import {
  CalendarBody,
  CalendarDate,
  CalendarDatePagination,
  CalendarDatePicker,
  CalendarHeader,
  CalendarMonthPicker,
  CalendarProvider,
  CalendarYearPicker,
} from "@/lib/core-ui/grid-calendar";
import { H3 } from "@/lib/core-ui/typography";
import MoodComponent, { type Mood } from "@/lib/emotion/mood";

export interface MoodData {
  id: string;
  date: Date;
  mood: string;
}

export function MoodCalendarClient({ moodData }: { moodData: MoodData[] }) {
  if (!moodData || moodData.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">
          No mood data available for this student.
        </p>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  const features = moodData.map(({ id, date, mood }) => ({
    id,
    name: mood,
    startAt: new Date(date),
    endAt: new Date(date),
    status: { id: mood, name: mood, color: "#10B981" },
  }));

  const years =
    moodData.length > 0
      ? moodData.map((d) => d.date.getFullYear())
      : [currentYear];
  const startYear = Math.min(...years) - 1;
  const endYear = Math.max(...years) + 1;

  return (
    <CalendarProvider>
      <CalendarDate>
        <div className="flex w-full items-center justify-between gap-4">
          <H3 className="font-medium text-xl">Mood Check-In History</H3>
          <div className="flex items-center gap-2">
            <CalendarDatePicker className="ml-auto">
              <CalendarMonthPicker />
              <CalendarYearPicker start={startYear} end={endYear} />
            </CalendarDatePicker>
            <CalendarDatePagination />
          </div>
        </div>
      </CalendarDate>
      <Card className="bg-background p-10 px-20 shadow-none">
        <CalendarHeader />

        <CalendarBody features={features}>
          {({ feature }) => (
            <div
              key={feature.id}
              className="flex h-full w-full items-center justify-center p-1"
            >
              <MoodComponent
                mood={feature.name.toLowerCase() as Mood}
                className="h-12 w-12"
                withShadow={false}
              />
            </div>
          )}
        </CalendarBody>
      </Card>
    </CalendarProvider>
  );
}
