"use client";

import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/core-ui/tooltip";
import {
  MOOD_COLOR_MAP,
  MOOD_DISPLAY_ORDER,
  MOOD_LABEL_MAP,
} from "./mood-trends-config";
import type { StudentBreakdown } from "./mood-trends-data";

export function MoodTrendsStudentRow({
  student,
}: {
  student: StudentBreakdown;
}) {
  const lastEmotion = student.lastCheckInEmotion;
  const lastColor = MOOD_COLOR_MAP[lastEmotion] ?? "#6B7280";
  const lastLabel = MOOD_LABEL_MAP[lastEmotion] ?? lastEmotion;
  const relativeTime = formatDistanceToNow(student.lastCheckInAt, {
    addSuffix: false,
  });

  return (
    <div className="space-y-2 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <span>Total {student.totalCheckIns}</span>
            <span aria-hidden>&middot;</span>
            <span>Last check-in: {relativeTime} ago</span>
            <span
              className="ml-2 rounded-full px-2 py-0.5 font-medium text-xs"
              style={{
                backgroundColor: `${lastColor}20`,
                color: lastColor,
              }}
            >
              {lastLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {MOOD_DISPLAY_ORDER.map((mood) => {
          const count = student.emotionCounts[mood.key] ?? 0;
          if (count === 0) return null;
          const pct = (count / student.totalCheckIns) * 100;
          return (
            <Tooltip key={mood.key}>
              <TooltipTrigger asChild>
                <div
                  className="h-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: mood.color,
                  }}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-white text-gray-900">
                {mood.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
