/**
 * Skill Development Overview header: overall score bar, strengths, and intervention areas.
 *
 * Displays the school-wide SEL overall average, top 3 strengths, and bottom 3
 * intervention areas based on individual question-level averages.
 */

import { getPerformanceLevel, getPerformanceLevelColor } from "./config";
import type { SubtypeAverage } from "./data";

export type ResolvedQuestion = { text: string; avgScore: number };

function OverallScoreBar({ score }: { score: number }) {
  const pct = (score / 4.0) * 100;
  const level = getPerformanceLevel(score);
  const color = getPerformanceLevelColor(level);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
        <span className="font-bold text-gray-900 text-lg">
          {score.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

function TopItems({
  title,
  items,
  borderColor,
  bgClass,
}: {
  title: string;
  items: ResolvedQuestion[];
  borderColor: string;
  bgClass: string;
}) {
  return (
    <div className="flex-1 rounded-lg border border-gray-200 bg-white">
      <div className={`px-4 py-2.5 ${bgClass} rounded-t-lg`}>
        <h4 className="font-dm font-semibold text-gray-900 text-sm">{title}</h4>
      </div>
      <div className="divide-y divide-gray-100">
        {items.map((item) => {
          const level = getPerformanceLevel(item.avgScore);
          const scoreColor = getPerformanceLevelColor(level);
          return (
            <div
              key={`${title}-${item.text}`}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div
                className="h-8 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: borderColor }}
              />
              <span className="flex-1 text-gray-700 text-sm">{item.text}</span>
              <span className="font-bold text-lg" style={{ color: scoreColor }}>
                {item.avgScore.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SkillOverview({
  subtypeAverages,
  resolvedQuestions,
}: {
  subtypeAverages: SubtypeAverage[];
  resolvedQuestions: ResolvedQuestion[];
}) {
  // Overall score: weighted average of all subtypes
  const totalScore = subtypeAverages.reduce(
    (s, d) => s + d.avgScore * d.studentCount,
    0,
  );
  const totalStudents = subtypeAverages.reduce((s, d) => s + d.studentCount, 0);
  const overallScore = totalStudents > 0 ? totalScore / totalStudents : 0;

  const sorted = [...resolvedQuestions].sort((a, b) => b.avgScore - a.avgScore);
  const strengths = sorted.slice(0, 3);
  const interventions = sorted.slice(-3).reverse();

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-dm font-semibold text-gray-500 text-sm uppercase tracking-wider">
            Overall Score
          </h3>
          <div className="flex items-center gap-4 text-gray-500 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              Strong (3.0-4.0)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
              Developing (2.0-2.9)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              Needs Support (&lt;2.0)
            </span>
          </div>
        </div>
        <OverallScoreBar score={overallScore} />
      </div>

      {/* Strengths & Intervention Areas */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopItems
          title="Strengths"
          items={strengths}
          borderColor="#3b82f6"
          bgClass="bg-blue-50"
        />
        <TopItems
          title="Intervention Areas"
          items={interventions}
          borderColor="#ef4444"
          bgClass="bg-red-50"
        />
      </div>
    </div>
  );
}
