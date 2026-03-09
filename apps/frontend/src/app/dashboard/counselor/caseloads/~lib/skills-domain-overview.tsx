"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/lib/core-ui/card";
import { Large, Muted, P } from "@/lib/core-ui/typography";

import {
  CASEL_DOMAIN_COLORS,
  type CaselDomainScore,
  getScoreLevel,
  getScoreLevelLabel,
} from "./skills-tab-data";

export function SkillsDomainOverview({
  overallPercentage,
  domains,
  studentCount,
}: {
  overallPercentage: number;
  domains: CaselDomainScore[];
  studentCount: number;
}) {
  const overallPct = Math.round(overallPercentage * 100);
  const overallLevel = getScoreLevelLabel(getScoreLevel(overallPercentage));

  return (
    <Card className="overflow-clip p-0">
      <CardHeader className="px-6 pt-6 pb-2">
        <CardTitle className="font-bold text-2xl">
          Skill Development Overview
        </CardTitle>
        <Muted>
          {studentCount} student{studentCount !== 1 ? "s" : ""} assessed
        </Muted>
      </CardHeader>
      <CardContent className="space-y-6 bg-white p-6">
        {/* Overall Score */}
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <P className="font-semibold">Overall SEL Score</P>
            <div className="flex items-center gap-2">
              <span className="font-bold text-2xl text-primary">
                {overallPct}%
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs">
                {overallLevel}
              </span>
            </div>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-primary/20">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>

        {/* Domain Bars */}
        <div>
          <Large className="mb-4">Domain Scores</Large>
          <div className="space-y-4">
            {domains.map((d) => (
              <DomainBar key={d.domain} domain={d} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DomainBar({ domain }: { domain: CaselDomainScore }) {
  const pct = Math.round(domain.percentage * 100);
  const color = CASEL_DOMAIN_COLORS[domain.domain] ?? "var(--color-primary)";
  const levelLabel = getScoreLevelLabel(domain.level);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="font-medium text-sm">{domain.label}</span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">{pct}%</span>
          <span
            className="rounded-full px-2 py-0.5 font-medium text-xs"
            style={{
              backgroundColor: `${color}15`,
              color,
            }}
          >
            {levelLabel}
          </span>
        </div>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
