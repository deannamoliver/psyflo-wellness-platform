"use client";

import { titleCase } from "@/lib/string-utils";
import MoodChart from "./mood-chart";

export type EmotionAggregate = {
  emotion: string;
  count: number;
};

export type MoodData = {
  universal: EmotionAggregate[];
  specific: EmotionAggregate[];
};

export default function MoodDistribution({
  data,
  onSelect,
}: {
  data: MoodData;
  onSelect: (emotion: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <MoodChart
        data={data.universal.map(({ emotion, count }) => ({
          type: emotion,
          label: titleCase(emotion, { delimiter: "_" }),
          count,
        }))}
        onSelect={onSelect}
      />
    </div>
  );
}
