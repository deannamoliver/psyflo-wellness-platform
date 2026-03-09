"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { chartConfig } from "@/lib/analytics/chart-config";
import { ChartContainer } from "@/lib/core-ui/chart";

type ContributorData = {
  name: string;
  value: number;
  fill: string;
};

export function MentalHealthContributorsChart({
  data,
}: {
  data: ContributorData[];
}) {
  return (
    <div className="flex items-center justify-center" aria-hidden>
      <ChartContainer config={chartConfig} style={{ width: 280, height: 280 }}>
        <PieChart width={280} height={280}>
          <Tooltip />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={110}
            paddingAngle={2}
            isAnimationActive={false}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
}
