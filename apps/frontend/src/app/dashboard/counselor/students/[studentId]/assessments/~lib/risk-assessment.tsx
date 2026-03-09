import { screeners, type screenerTypeEnum } from "@feelwell/database";
import { and, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { InfoIcon } from "lucide-react";
import { Suspense } from "react";
import { Card, CardContent } from "@/lib/core-ui/card";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/core-ui/tooltip";
import { H3, Large } from "@/lib/core-ui/typography";
import { serverDrizzle } from "@/lib/database/drizzle";
import type { RiskLevel } from "@/lib/screener/type";
import { getRiskLevel, getRiskLevelTitle } from "@/lib/screener/utils";

type Screener = typeof screeners.$inferSelect;

function levelColor(level: RiskLevel | null) {
  if (level === null) {
    return "text-muted-foreground";
  }

  switch (level) {
    case 0:
    case 1:
      return "text-green-700"; // Minimal - Green

    case 2:
      return "text-yellow-700"; // Mild - Yellow

    case 3:
      return "text-orange-700"; // Moderate - Orange

    case 4:
      return "text-red-700"; // Moderately Severe - Red

    case 5:
      return "text-red-800"; // Severe - Dark Red
  }
}

function Item({
  title,
  screener,
}: {
  title: string;
  screener: Screener | null;
}) {
  const level = screener == null ? null : getRiskLevel(screener);

  const levelTitle =
    level === null || !screener?.type
      ? null
      : getRiskLevelTitle({
          type: screener.type,
          riskLevel: level,
        });

  return (
    <Card className="bg-white shadow-sm">
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Large className="font-normal">{title}</Large>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Most recent score</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <H3 className={`font-normal ${levelColor(level)}`}>
            {levelTitle ?? "No Data"}
          </H3>
        </div>
      </CardContent>
    </Card>
  );
}

async function getLatestScreener(
  studentId: string,
  type: (typeof screenerTypeEnum.enumValues)[number][],
): Promise<Screener | null> {
  const db = await serverDrizzle();

  return (
    (await db.admin
      .select()
      .from(screeners)
      .where(
        and(
          eq(screeners.userId, studentId),
          isNotNull(screeners.completedAt),
          inArray(screeners.type, type),
        ),
      )
      .orderBy(desc(screeners.completedAt))
      .limit(1)
      .then((res) => res[0])) ?? null
  );
}

async function Anxiety({ studentId }: { studentId: string }) {
  return (
    <Item
      title="Anxiety"
      screener={await getLatestScreener(studentId, ["gad_child", "gad_7"])}
    />
  );
}

async function Depression({ studentId }: { studentId: string }) {
  return (
    <Item
      title="Depression"
      screener={await getLatestScreener(studentId, ["phq_a", "phq_9"])}
    />
  );
}

function Fallback() {
  return <Skeleton className="h-24 w-full bg-white/50" />;
}

export default function RiskAssessment({ studentId }: { studentId: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Large className="font-normal">Risk Assessment</Large>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Suspense fallback={<Fallback />}>
          <Anxiety studentId={studentId} />
        </Suspense>

        <Suspense fallback={<Fallback />}>
          <Depression studentId={studentId} />
        </Suspense>
      </div>
    </div>
  );
}
