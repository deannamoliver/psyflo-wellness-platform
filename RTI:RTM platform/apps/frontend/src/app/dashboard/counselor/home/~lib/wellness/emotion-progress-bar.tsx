type EmotionProgressBarProps = {
  subEmotion: string;
  score: number;
  maxScore: number;
  color: string;
};

export default function EmotionProgressBar({
  subEmotion,
  score,
  maxScore,
  color,
}: EmotionProgressBarProps) {
  const percentage = Math.min((score / maxScore) * 100, 100);

  return (
    <div className="flex items-start gap-3">
      <div
        className="h-6 w-1 flex-shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-semibold text-sm">{subEmotion}</span>
          <span className="text-right font-semibold text-sm">{score}</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full transition-all duration-300 ease-in-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>
    </div>
  );
}
