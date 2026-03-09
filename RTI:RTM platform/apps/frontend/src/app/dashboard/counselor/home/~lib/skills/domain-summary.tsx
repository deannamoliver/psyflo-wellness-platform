"use client";

/**
 * Expandable domain summary rows for the SEL skills overview.
 *
 * Each row represents one of the 8 SEL subtypes with a colored progress bar
 * and average score. Rows expand to reveal individual question-level averages.
 */

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import {
  getPerformanceLevel,
  getPerformanceLevelColor,
  SEL_SUBTYPE_LABELS,
  SEL_SUBTYPE_ORDER,
} from "./config";

export type DomainData = {
  subtype: string;
  avgScore: number;
  questions: { ordinal: number; text: string; avgScore: number }[];
};

type DomainRowProps = {
  subtype: string;
  avgScore: number;
  questions: { ordinal: number; text: string; avgScore: number }[];
  isExpanded: boolean;
  onToggle: () => void;
};

function ScoreBar({ score }: { score: number }) {
  const level = getPerformanceLevel(score);
  const color = getPerformanceLevelColor(level);
  const pct = (score / 4.0) * 100;

  // Two-segment bar: green base up to 2.0, then level color for developing range
  if (level === "developing") {
    const greenPct = (2.0 / 4.0) * 100;
    const yellowPct = ((score - 2.0) / 4.0) * 100;
    return (
      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className="absolute inset-y-0 left-0 rounded-l-full"
          style={{ width: `${greenPct}%`, backgroundColor: "#22c55e" }}
        />
        <div
          className="absolute inset-y-0 rounded-r-full"
          style={{
            left: `${greenPct}%`,
            width: `${yellowPct}%`,
            backgroundColor: color,
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
      <div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

function DomainRow({
  subtype,
  avgScore,
  questions,
  isExpanded,
  onToggle,
}: DomainRowProps) {
  const label = SEL_SUBTYPE_LABELS[subtype] ?? subtype;
  const level = getPerformanceLevel(avgScore);
  const dotColor = getPerformanceLevelColor(level);
  const ChevronIcon = isExpanded ? ChevronUp : ChevronDown;

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3.5"
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
        <span className="font-medium text-gray-900 text-sm">{label}</span>
        <ChevronIcon className="h-4 w-4 shrink-0 text-gray-400" />
        <div className="ml-auto flex flex-1 items-center gap-3">
          <ScoreBar score={avgScore} />
          <span className="w-8 text-right font-bold text-gray-900 text-sm">
            {avgScore.toFixed(1)}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-gray-100 border-t px-4 pt-1 pb-3">
          {questions.map((q) => {
            const qLevel = getPerformanceLevel(q.avgScore);
            const qColor = getPerformanceLevelColor(qLevel);
            return (
              <div
                key={q.ordinal}
                className="flex items-center justify-between py-2.5"
              >
                <span className="text-gray-600 text-sm">
                  {q.ordinal}. {q.text}
                </span>
                <span
                  className="ml-4 shrink-0 font-semibold text-sm"
                  style={{ color: qColor }}
                >
                  {q.avgScore.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DomainSummary({ domains }: { domains: DomainData[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  const toggleDomain = (subtype: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(subtype)) next.delete(subtype);
      else next.add(subtype);
      return next;
    });
  };

  const toggleAll = () => {
    if (allExpanded) {
      setExpanded(new Set());
      setAllExpanded(false);
    } else {
      setExpanded(new Set(SEL_SUBTYPE_ORDER));
      setAllExpanded(true);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-dm font-semibold text-gray-500 text-sm uppercase tracking-wider">
        Domain Summary
      </h3>
      {domains.map((d) => (
        <DomainRow
          key={d.subtype}
          subtype={d.subtype}
          avgScore={d.avgScore}
          questions={d.questions}
          isExpanded={expanded.has(d.subtype)}
          onToggle={() => toggleDomain(d.subtype)}
        />
      ))}
      <button
        type="button"
        onClick={toggleAll}
        className="flex w-full items-center justify-center gap-1.5 py-2 font-medium text-blue-600 text-sm hover:text-blue-800"
      >
        {allExpanded ? "Collapse all domains" : "Expand all domains"}
        {allExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
