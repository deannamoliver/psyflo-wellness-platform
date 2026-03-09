import { screeners, type screenerTypeEnum } from "@feelwell/database";
import { and, desc, eq, isNotNull, ne } from "drizzle-orm";
import { Card, CardContent } from "@/lib/core-ui/card";
import { Progress } from "@/lib/core-ui/progress";
import { Large, Muted, P } from "@/lib/core-ui/typography";
import { serverDrizzle } from "@/lib/database/drizzle";
import { Timestamp } from "@/lib/extended-ui/timestamp";
import { getRiskLevel, getRiskLevelTitle } from "@/lib/screener/utils";

function progressColor(score: number) {
  if (score < 30) {
    return "[&>div]:bg-success";
  }

  if (score < 60) {
    return "[&>div]:bg-warning";
  }

  return "[&>div]:bg-destructive";
}

function title(type: (typeof screenerTypeEnum.enumValues)[number]): string {
  switch (type) {
    case "sel":
      return "Social-Emotional Learning";
    case "phq_a":
      return "PHQ-A (Depression - Adolescent)";
    case "phq_9":
      return "PHQ-9 (Depression)";
    case "gad_child":
      return "GAD-Child (Anxiety)";
    case "gad_7":
      return "GAD-7 (Anxiety)";
  }
}

function Item({
  type,
  score,
  maxScore,
  completedAt,
}: {
  type: (typeof screenerTypeEnum.enumValues)[number];
  score: number;
  maxScore: number;
  completedAt: Date;
}) {
  const color = progressColor(score);
  const level = getRiskLevel({ type, score });
  const levelTitle = getRiskLevelTitle({ type, riskLevel: level });
  return (
    <Card className="bg-background">
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <P className="font-medium">{title(type)}</P>
          <Muted>
            <Timestamp value={completedAt} format="MMM d, yyyy" />
          </Muted>
        </div>
        <Progress value={(score / maxScore) * 100} className={color} />
        <Muted>
          {levelTitle} • {score} / {maxScore}
        </Muted>
      </CardContent>
    </Card>
  );
}

export default async function RecentScreenings({
  studentId,
}: {
  studentId: string;
}) {
  const db = await serverDrizzle();

  const items = await db.admin
    .select()
    .from(screeners)
    .where(
      and(
        eq(screeners.userId, studentId),
        isNotNull(screeners.completedAt),
        ne(screeners.type, "sel"),
      ),
    )
    .orderBy(desc(screeners.completedAt))
    .limit(5)
    .then((data) =>
      data
        .map((item) =>
          item.completedAt == null
            ? null
            : { ...item, completedAt: item.completedAt },
        )
        .filter((item) => item !== null),
    );

  return (
    <div className="flex flex-col gap-4">
      <Large className="font-normal">Most Recent Screenings</Large>
      {items.map((item) => (
        <Item key={item.id} {...item} />
      ))}
    </div>
  );
}
