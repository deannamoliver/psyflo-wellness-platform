import { Info } from "lucide-react";
import type { inferParserType } from "nuqs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/core-ui/card";
import { cn } from "@/lib/tailwind-utils";
import type { searchParamsParsers } from "../parsers";
import WellnessCardContent from "./card-content";
import {
  getSpecificEmotionAggregates,
  getStudents,
  getUniversalEmotionAggregates,
} from "./data";
import { MoodTrendsCard } from "./mood-trends-card";
import {
  getMoodTrendsTimeSeries,
  getStudentMoodBreakdowns,
} from "./mood-trends-data";

export async function WellnessOverviewSection({
  schoolId,
  sParams,
  className,
}: {
  schoolId: string;
  sParams: inferParserType<typeof searchParamsParsers>;
  className?: string;
}) {
  const [
    students,
    universalAggregates,
    specificAggregates,
    timeSeriesData,
    studentBreakdowns,
  ] = await Promise.all([
    getStudents(schoolId, sParams),
    getUniversalEmotionAggregates(schoolId, sParams),
    getSpecificEmotionAggregates(schoolId, sParams),
    getMoodTrendsTimeSeries(schoolId),
    getStudentMoodBreakdowns(schoolId),
  ]);

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="gap-0 overflow-clip border-0 bg-white p-0 shadow-none">
        <CardHeader className="mb-2 rounded-t-xl border-b-0 bg-white px-6 pt-6 pb-2">
          <CardTitle
            className="font-bold text-2xl text-gray-900"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Daily Mood Snapshot
          </CardTitle>
          <p
            className="mt-1 flex items-center gap-1.5 text-gray-500 text-sm"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <Info className="h-4 w-4 shrink-0" aria-hidden />
            Based on patient self-reported check-ins
          </p>
        </CardHeader>

        <CardContent className="overflow-hidden bg-white px-6 pt-0 pb-6">
          <WellnessCardContent
            moodData={{
              universal: universalAggregates,
              specific: specificAggregates,
            }}
            students={students}
          />
        </CardContent>
      </Card>

      <MoodTrendsCard
        timeSeriesData={timeSeriesData}
        studentBreakdowns={studentBreakdowns}
      />
    </div>
  );
}
