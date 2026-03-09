import {
  chatSessions,
  moodCheckIns,
  screenerSessions,
  screeners,
} from "@feelwell/database";
import { formatDistanceToNow } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { BarChartIcon, SmileIcon } from "lucide-react";
import { Card, CardContent } from "@/lib/core-ui/card";
import { H3, Muted } from "@/lib/core-ui/typography";
import { serverDrizzle } from "@/lib/database/drizzle";
import { titleCase } from "@/lib/string-utils";
import { cn } from "@/lib/tailwind-utils";
import * as Icons from "../../../../caseloads/~lib/icons";

type Activity = {
  id: string;
  type: "mood" | "conversation" | "assessment";
  title: string;
  subtitle: string;
  createdAt: Date;
};

function ActivityIcon({ type }: { type: Activity["type"] }) {
  const base = "flex h-10 w-10 items-center justify-center rounded-full";
  switch (type) {
    case "mood":
      return (
        <div className={cn(base, "bg-green-100")}>
          <SmileIcon className="h-5 w-5 text-green-600" />
        </div>
      );
    case "conversation":
      return (
        <div className={cn(base, "bg-blue-50")}>
          <Icons.ChatIcon />
        </div>
      );
    case "assessment":
      return (
        <div className={cn(base, "bg-primary/10")}>
          <BarChartIcon className="h-5 w-5 text-primary" />
        </div>
      );
  }
}

export async function RecentActivities({ studentId }: { studentId: string }) {
  const db = await serverDrizzle();

  const recentCheckIns = await db.admin
    .select({
      id: moodCheckIns.id,
      createdAt: moodCheckIns.createdAt,
      emotion: moodCheckIns.universalEmotion,
    })
    .from(moodCheckIns)
    .where(eq(moodCheckIns.userId, studentId))
    .orderBy(desc(moodCheckIns.createdAt))
    .limit(5);

  const recentScreeners = await db.admin
    .select({
      id: screenerSessions.id,
      createdAt: screenerSessions.createdAt,
      subtype: screenerSessions.subtype,
    })
    .from(screenerSessions)
    .innerJoin(screeners, eq(screenerSessions.screenerId, screeners.id))
    .where(eq(screeners.userId, studentId))
    .orderBy(desc(screenerSessions.createdAt))
    .limit(5);

  const recentConversations = await db.admin
    .select({
      id: chatSessions.id,
      createdAt: chatSessions.createdAt,
      title: chatSessions.title,
    })
    .from(chatSessions)
    .where(eq(chatSessions.userId, studentId))
    .orderBy(desc(chatSessions.createdAt))
    .limit(5);

  const activities: Activity[] = [
    ...recentCheckIns.map((c) => ({
      id: c.id,
      type: "mood" as const,
      title: `Mood Check-in: ${c.emotion ? titleCase(c.emotion, { delimiter: "_" }) : "Completed"}`,
      subtitle: `Completed ${formatDistanceToNow(c.createdAt)} ago`,
      createdAt: c.createdAt,
    })),
    ...recentScreeners.map((s) => ({
      id: s.id,
      type: "assessment" as const,
      title: `Assessment completed: ${formatScreenerType(s.subtype)}`,
      subtitle: `${formatDistanceToNow(s.createdAt)} ago`,
      createdAt: s.createdAt,
    })),
    ...recentConversations.map((c) => ({
      id: c.id,
      type: "conversation" as const,
      title:
        `Support conversation with Coach ${c.title !== "New Chat" ? `- ${c.title}` : ""}`.trim(),
      subtitle: `${formatDistanceToNow(c.createdAt)} ago`,
      createdAt: c.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);

  return (
    <div className="flex h-full min-h-0 flex-col font-dm">
      <H3 className="mb-4 shrink-0 font-semibold text-lg">Recent Activities</H3>
      {activities.length === 0 ? (
        <Card className="bg-white shadow-sm">
          <CardContent>
            <Muted>No recent activities.</Muted>
          </CardContent>
        </Card>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto">
          {activities.map((activity) => (
            <Card key={activity.id} className="bg-white shadow-sm">
              <CardContent className="flex items-center gap-4 py-3">
                <ActivityIcon type={activity.type} />
                <div>
                  <span className="font-medium text-gray-900 text-sm">
                    {activity.title}
                  </span>
                  <Muted className="block text-xs">{activity.subtitle}</Muted>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function formatScreenerType(subtype: string): string {
  if (subtype.startsWith("phq")) return "PHQ-9";
  if (subtype.startsWith("gad")) return "GAD-7";
  if (subtype.startsWith("sel")) return "SEL Assessment";
  return titleCase(subtype, { delimiter: "_" });
}
