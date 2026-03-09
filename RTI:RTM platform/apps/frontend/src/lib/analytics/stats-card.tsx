"use client";

import { InfoIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/core-ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/core-ui/tooltip";
import { H2 } from "@/lib/core-ui/typography";
import { cn } from "@/lib/tailwind-utils";

function pickColor(
  change: number,
  increaseSentiment: "good" | "bad" | "neutral",
  colors: {
    good: string;
    bad: string;
    neutral: string;
  },
) {
  if (change === 0 || Number.isNaN(change)) {
    return colors.neutral;
  }

  if (increaseSentiment === "good") {
    return change > 0 ? colors.good : colors.bad;
  }

  if (increaseSentiment === "bad") {
    return change > 0 ? colors.bad : colors.good;
  }

  return colors.neutral;
}

function Message({ message, change }: { message?: string; change: number }) {
  if (message) {
    return message;
  }

  const sign = change >= 0 ? "+" : "-";
  return `${sign}${Math.abs(change)} since yesterday`;
}

export function StatsCard({
  title,
  icon,
  value,
  change = 0,
  increaseSentiment = "neutral",
  message,
  className,
  valueClassName,
  tooltip,
}: {
  title: string;
  icon: React.ReactNode;
  value: string;
  change?: number;
  increaseSentiment?: "good" | "bad" | "neutral";
  message?: string;
  className?: string;
  valueClassName?: string;
  tooltip?: string;
}) {
  return (
    <Card
      className={cn("flex w-full flex-col gap-0 bg-white shadow-sm", className)}
    >
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CardTitle className="font-normal">{title}</CardTitle>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        {icon}
      </CardHeader>
      <CardContent>
        <H2
          className={cn(
            "font-normal",
            valueClassName ||
              pickColor(change, increaseSentiment, {
                good: "text-success",
                bad: "text-destructive",
                neutral: "text-muted-foreground",
              }),
          )}
        >
          {value}
        </H2>
        <div className="text-muted-foreground text-sm">
          <Message message={message} change={change} />
        </div>
      </CardContent>
    </Card>
  );
}
