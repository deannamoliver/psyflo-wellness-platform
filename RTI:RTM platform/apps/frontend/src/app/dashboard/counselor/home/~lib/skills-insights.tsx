"use client";

import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

import { Card, CardContent } from "@/lib/core-ui/card";
import { Large, Muted, P } from "@/lib/core-ui/typography";

import type { CaselDomainScore, Distribution } from "./skills-tab-data";

export function SkillsInsights({
  strengths,
  growthAreas,
  distribution,
  studentCount,
}: {
  strengths: CaselDomainScore[];
  growthAreas: CaselDomainScore[];
  distribution: Distribution;
  studentCount: number;
}) {
  return (
    <Card className="overflow-clip p-0">
      <CardContent className="space-y-6 bg-white p-6">
        {/* Strengths vs Growth */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                <ArrowUpIcon className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <Large>Strengths</Large>
            </div>
            <div className="space-y-2">
              {strengths.map((d) => (
                <div
                  key={d.domain}
                  className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2"
                >
                  <span className="font-medium text-sm">{d.label}</span>
                  <span className="font-semibold text-emerald-700 text-sm">
                    {Math.round(d.percentage * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
                <ArrowDownIcon className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <Large>Areas for Growth</Large>
            </div>
            <div className="space-y-2">
              {growthAreas.map((d) => (
                <div
                  key={d.domain}
                  className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2"
                >
                  <span className="font-medium text-sm">{d.label}</span>
                  <span className="font-semibold text-amber-700 text-sm">
                    {Math.round(d.percentage * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Student Distribution */}
        <div>
          <Large className="mb-3">Student Distribution</Large>
          <div className="grid grid-cols-3 gap-3">
            <DistributionCard
              label="Excelling"
              count={distribution.excelling}
              total={studentCount}
              colorClass="bg-emerald-50 text-emerald-700"
            />
            <DistributionCard
              label="On Track"
              count={distribution.on_track}
              total={studentCount}
              colorClass="bg-blue-50 text-blue-700"
            />
            <DistributionCard
              label="Developing"
              count={distribution.developing}
              total={studentCount}
              colorClass="bg-amber-50 text-amber-700"
            />
          </div>
        </div>

        {/* Summary text */}
        {strengths.length > 0 && growthAreas.length > 0 && (
          <div className="rounded-lg bg-gray-50 p-4">
            <Muted>
              Most students are strongest in{" "}
              <span className="font-medium text-foreground">
                {strengths[0]?.label}
              </span>
              {strengths[1] && (
                <>
                  {" "}
                  and{" "}
                  <span className="font-medium text-foreground">
                    {strengths[1].label}
                  </span>
                </>
              )}
              . Focus areas include{" "}
              <span className="font-medium text-foreground">
                {growthAreas[0]?.label}
              </span>
              {growthAreas[1] && (
                <>
                  {" "}
                  and{" "}
                  <span className="font-medium text-foreground">
                    {growthAreas[1].label}
                  </span>
                </>
              )}
              .
            </Muted>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DistributionCard({
  label,
  count,
  total,
  colorClass,
}: {
  label: string;
  count: number;
  total: number;
  colorClass: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className={`rounded-lg p-3 text-center ${colorClass}`}>
      <P className="font-bold text-lg">{count}</P>
      <Muted className="text-xs">
        {label} ({pct}%)
      </Muted>
    </div>
  );
}
