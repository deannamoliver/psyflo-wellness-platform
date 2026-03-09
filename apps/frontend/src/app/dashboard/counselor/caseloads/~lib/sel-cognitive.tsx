"use client";

import { Large } from "@/lib/core-ui/typography";
import { skillToNameMap } from "@/lib/screener/sel-skills";

function Item({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-base">
        <span className="font-semibold">{label}</span>
        <span className="font-semibold">{Math.round(value)}%</span>
      </div>
      <div className="h-3 w-full rounded bg-gray-200">
        <div
          className="h-3 rounded bg-primary transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export type SELCognitiveData = {
  skill: string;
  score: number;
  maxScore: number;
};

export function SELCognitive({
  data,
  title,
}: {
  data: SELCognitiveData[];
  title: string;
}) {
  return (
    <div className="space-y-4">
      <Large>{title}</Large>

      <div className="space-y-6">
        {data.map((item) => (
          <Item
            key={item.skill}
            label={skillToNameMap[item.skill] ?? item.skill}
            value={(item.score / item.maxScore) * 100}
          />
        ))}
      </div>
    </div>
  );
}
