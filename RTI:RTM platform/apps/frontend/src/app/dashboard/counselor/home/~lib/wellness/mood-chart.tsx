"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import type { UniversalEmotion } from "@/lib/check-in/utils";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/lib/core-ui/chart";

const moodColors: Record<UniversalEmotion, string> = {
  happy: "#FEC84B",
  sad: "#84CAFF",
  disgusted: "#039855", // calm
  angry: "#F04438",
  afraid: "#7A5AF8", // worried
  surprised: "#FD853A", // excited
  bad: "#DD2590", // lonely
} as const;

const moodChartConfig = {
  count: {
    label: "Mood Count",
    color: "#2563eb",
  },
} satisfies ChartConfig;

export default function MoodChart({
  data,
  onSelect,
}: {
  data: { type: string; label: string; count: number }[];
  onSelect: (emotion: string) => void;
}) {
  return (
    <div className="h-full w-full">
      {data.length > 0 ? (
        <ChartContainer config={moodChartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{ left: 60, right: 0, top: 20, bottom: 20 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickMargin={8} fontSize={14} />
            <YAxis
              type="category"
              dataKey="label"
              tickMargin={10}
              fontSize={14}
              width={50}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.type}`}
                  fill={
                    moodColors[entry.type as keyof typeof moodColors] ||
                    "#2563eb"
                  }
                  onClick={() => onSelect(entry.type)}
                  className="cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      ) : (
        <div className="flex min-h-[300px] items-center justify-center px-4 py-8 text-center text-gray-500">
          No mood check-ins from patients today
        </div>
      )}
    </div>
  );
}
