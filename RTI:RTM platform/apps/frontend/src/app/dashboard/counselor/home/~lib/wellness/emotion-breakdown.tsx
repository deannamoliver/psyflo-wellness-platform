"use client";

import EmotionProgressBar from "./emotion-progress-bar";

export default function EmotionBreakdown({
  data,
  color,
}: {
  data: { type: string; label: string; count: number }[];
  color: string;
}) {
  const totalScore = data.reduce((total, item) => total + item.count, 0);

  return (
    <div className="h-full w-full p-4">
      <h3 className="mb-4 font-semibold text-lg">Emotion Breakdown</h3>

      <div className="mb-6 grid grid-cols-3 gap-4">
        {data.map((item) => (
          <EmotionProgressBar
            key={item.type}
            subEmotion={item.label}
            score={item.count}
            maxScore={totalScore}
            color={color}
          />
        ))}
      </div>
    </div>
  );
}
