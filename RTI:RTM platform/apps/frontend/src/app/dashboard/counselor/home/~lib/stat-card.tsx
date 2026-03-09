import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/lib/core-ui/card";
import { cn } from "@/lib/tailwind-utils";
import * as Icons from "./icons";

function trend(description: string, heading: string) {
  if (heading === "Total Active Alerts") {
    return null;
  }

  if (description && description[0] === "+") {
    return "up";
  } else if (description && description[0] === "-") {
    return "down";
  }
  return null;
}

export function StatCard({
  heading,
  iconClassName,
  iconBgColor = "bg-gray-100",
  stat,
  statColor,
  description,
  loading,
  className,
  children,
}: {
  heading: string;
  iconClassName?: React.ReactNode;
  iconBgColor?: string;
  stat: string | number;
  description?: string;
  statColor?: string;
  loading?: boolean;
  error?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const statTrend = trend(description ?? "", heading);
  const trendColor =
    statTrend === "up"
      ? "text-green-600"
      : statTrend === "down"
        ? "text-red-600"
        : "text-muted-foreground";

  return (
    <Card
      className={cn(
        "flex w-full flex-col items-start gap-2 rounded-xl border bg-white/70 p-6 shadow-md",
        className,
      )}
    >
      <div className="flex w-full items-start justify-between">
        <CardHeader className="w-3/4 break-words p-0 font-medium text-lg">
          {heading}
        </CardHeader>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            iconBgColor,
          )}
        >
          {iconClassName}
        </div>
      </div>
      <div className={cn("font-semibold text-3xl", statColor)}>
        {loading ? <span className="animate-pulse">---</span> : stat}
      </div>
      {description && (
        <CardDescription
          className={cn("flex items-center gap-1 p-0 font-normal", trendColor)}
        >
          {description}
          {statTrend === "up" && <Icons.GreenArrow />}
          {statTrend === "down" && <Icons.RedArrow />}
        </CardDescription>
      )}
      <CardContent className="w-full p-0">{children}</CardContent>
    </Card>
  );
}
