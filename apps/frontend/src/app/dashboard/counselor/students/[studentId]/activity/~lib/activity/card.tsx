import { GamepadIcon, SmileIcon } from "lucide-react";
import { Card, CardTitle } from "@/lib/core-ui/card";
import { P } from "@/lib/core-ui/typography";
import { Timestamp } from "@/lib/extended-ui/timestamp";
import { cn } from "@/lib/tailwind-utils";

type RecentActivity = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  type: "mood-check-in" | "completed-sel-module";
  subtitle: string;
};

function Icon({ activity }: { activity: RecentActivity }) {
  switch (activity.type) {
    case "mood-check-in":
      return (
        <span className="rounded-lg bg-success/10 p-2 text-success">
          <SmileIcon className="h-6 w-6" />
        </span>
      );
    case "completed-sel-module":
      return (
        <span className="rounded-lg bg-primary/10 p-2 text-primary">
          <GamepadIcon className="h-6 w-6" />
        </span>
      );
  }
}

function Title({ activity }: { activity: RecentActivity }) {
  if (activity.type === "mood-check-in") {
    return `Mood Check-in: "${activity.subtitle}"`;
  } else if (activity.type === "completed-sel-module") {
    return `Completed SEL Module: "${activity.subtitle}"`;
  }
}

export default function ActivityCard({
  activity,
  className,
}: {
  activity: RecentActivity;
  className?: string;
}) {
  return (
    <Card className="border-none bg-blue-100/25 p-4 shadow-xs">
      <div className={cn("flex items-center gap-4", className)}>
        <Icon activity={activity} />
        <div className="flex flex-col gap-2">
          <CardTitle>
            <Title activity={activity} />
          </CardTitle>
          <P className="text-muted-foreground">
            <Timestamp
              value={activity.createdAt}
              format="MMM d, yyyy, h:mm a"
            />
          </P>
        </div>
      </div>
    </Card>
  );
}
