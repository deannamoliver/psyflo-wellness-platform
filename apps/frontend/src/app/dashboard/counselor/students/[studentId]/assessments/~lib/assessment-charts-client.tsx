"use client";

import {
  Activity,
  Brain,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileText,
  Heart,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import type { AssessmentGroup, SeverityZone } from "./assessment-charts";
import { AssessmentDetailsModal } from "./assessment-details-modal";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  brain: Brain,
  activity: Activity,
  heart: Heart,
  shield: Shield,
  users: Users,
};

function getSeverityForScore(zones: SeverityZone[], score: number): SeverityZone | null {
  for (const zone of zones) {
    if (score >= zone.min && score <= zone.max) return zone;
  }
  return zones[zones.length - 1] ?? null;
}

function isHigherBetter(type: string): boolean {
  return type === "sel";
}

function ScoreGaugeBar({ score, maxScore, zones, color }: {
  score: number;
  maxScore: number;
  zones: SeverityZone[];
  color: string;
}) {
  const pct = Math.min((score / maxScore) * 100, 100);
  return (
    <div className="relative w-full">
      {/* Zone segments */}
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
        {zones.map((zone, i) => {
          const zoneWidth = ((zone.max - zone.min) / maxScore) * 100;
          const zoneColors: Record<string, string> = {
            "text-emerald-700": "bg-emerald-200",
            "text-green-600": "bg-green-200",
            "text-yellow-700": "bg-yellow-200",
            "text-orange-700": "bg-orange-200",
            "text-red-600": "bg-red-200",
            "text-red-700": "bg-red-300",
          };
          return (
            <div
              key={`${zone.label}-${i}`}
              className={cn("h-full", zoneColors[zone.color] ?? "bg-gray-200")}
              style={{ width: `${zoneWidth}%` }}
            />
          );
        })}
      </div>
      {/* Score indicator */}
      <div
        className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-white shadow-md"
        style={{ left: `calc(${pct}% - 8px)`, backgroundColor: color }}
      />
    </div>
  );
}

function MiniTrendLine({ dataPoints, color, maxScore }: {
  dataPoints: { score: number }[];
  color: string;
  maxScore: number;
}) {
  if (dataPoints.length < 2) return null;
  const w = 80;
  const h = 28;
  const pad = 2;
  const points = dataPoints.map((dp, i) => {
    const x = pad + (i / (dataPoints.length - 1)) * (w - pad * 2);
    const y = h - pad - ((dp.score / maxScore) * (h - pad * 2));
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AssessmentGroupSection({ group }: { group: AssessmentGroup }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  const hasData = group.dataPoints.length > 0;
  const latest = hasData ? group.dataPoints[group.dataPoints.length - 1]! : null;
  const previous = group.dataPoints.length >= 2 ? group.dataPoints[group.dataPoints.length - 2]! : null;
  const baseline = group.dataPoints.length > 0 ? group.dataPoints[0]! : null;

  const severity = latest ? getSeverityForScore(group.severityZones, latest.score) : null;
  const changeSinceLast = latest && previous ? latest.score - previous.score : null;
  const changeSinceBaseline = latest && baseline && baseline !== latest ? latest.score - baseline.score : null;
  const higherIsBetter = isHigherBetter(group.type);

  const IconComponent = ICON_MAP[group.icon] ?? ClipboardList;

  return (
    <div className={cn(
      "rounded-xl border bg-white overflow-hidden transition-shadow",
      hasData ? "shadow-sm hover:shadow-md" : "opacity-70",
    )}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50/80"
      >
        {/* Icon */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${group.color}15` }}
        >
          <IconComponent className="h-5 w-5" style={{ color: group.color }} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-900">{group.title}</span>
            <span className="text-xs text-gray-400">{group.subtitle}</span>
            {severity && (
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", severity.color, severity.bgColor)}>
                {severity.label}
              </span>
            )}
          </div>

          {hasData && latest ? (
            <div className="flex items-center gap-3 mt-1">
              <span className="text-lg font-bold text-gray-900" style={{ color: group.color }}>
                {group.type === "sel" ? latest.score.toFixed(1) : Math.round(latest.score)}
              </span>
              <span className="text-xs text-gray-400">/ {group.maxScore}</span>

              {/* Score gauge */}
              <div className="flex-1 max-w-[200px]">
                <ScoreGaugeBar score={latest.score} maxScore={group.maxScore} zones={group.severityZones} color={group.color} />
              </div>

              {/* Change indicators */}
              {changeSinceLast !== null && changeSinceLast !== 0 && (
                <span className={cn(
                  "text-[11px] font-semibold whitespace-nowrap",
                  higherIsBetter
                    ? (changeSinceLast > 0 ? "text-emerald-600" : "text-red-500")
                    : (changeSinceLast < 0 ? "text-emerald-600" : "text-red-500"),
                )}>
                  {changeSinceLast > 0 ? "↑" : "↓"}{Math.abs(Math.round(changeSinceLast))} since last
                </span>
              )}
              {changeSinceBaseline !== null && changeSinceBaseline !== 0 && (
                <span className={cn(
                  "text-[11px] font-medium whitespace-nowrap text-gray-400",
                )}>
                  ({changeSinceBaseline > 0 ? "+" : ""}{Math.round(changeSinceBaseline)} from baseline)
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-0.5">Not yet administered</p>
          )}
        </div>

        {/* Right side: mini trend + chevron */}
        <div className="flex items-center gap-3 shrink-0">
          {hasData && (
            <MiniTrendLine dataPoints={group.dataPoints} color={group.color} maxScore={group.maxScore} />
          )}
          <div className="flex items-center gap-1.5">
            {hasData && (
              <span className="text-[10px] text-gray-400 font-medium">{group.dataPoints.length}</span>
            )}
            {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t">
          {!hasData ? (
            <div className="px-5 py-8 text-center">
              <ClipboardList className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm font-medium text-gray-500">No assessments completed yet</p>
              <p className="mt-1 text-xs text-gray-400 max-w-sm mx-auto">{group.description}</p>
            </div>
          ) : (
            <div className="px-5 py-4 space-y-5">
              {/* Description + Severity Legend */}
              <div className="flex items-start justify-between gap-4">
                <p className="text-xs text-gray-500 max-w-md">{group.description}</p>
                <div className="flex items-center gap-1.5 shrink-0">
                  {group.severityZones.map((zone, i) => (
                    <span key={`${zone.label}-${i}`} className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", zone.color, zone.bgColor)}>
                      {zone.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Score Trend Chart (inline SVG) */}
              {group.dataPoints.length > 0 && (
                <div className="rounded-lg border bg-gray-50/50 p-4">
                  <h4 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score Trend</h4>
                  <div className="overflow-x-auto">
                    <InlineScoreChart
                      dataPoints={group.dataPoints.map((dp) => ({
                        id: dp.id,
                        score: dp.score,
                        maxScore: dp.maxScore,
                        completedAt: dp.completedAt,
                      }))}
                      maxScore={group.maxScore}
                      color={group.color}
                      zones={group.severityZones}
                      onPointClick={setSelectedAssessmentId}
                    />
                  </div>
                </div>
              )}

              {/* Assessment history table */}
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Assessment History
                </h4>
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        <th className="px-4 py-2.5">Date</th>
                        <th className="px-4 py-2.5">Score</th>
                        <th className="px-4 py-2.5">Severity</th>
                        <th className="px-4 py-2.5">Change</th>
                        <th className="px-4 py-2.5 text-right">Report</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[...group.dataPoints].reverse().map((dp, idx, arr) => {
                        const sev = getSeverityForScore(group.severityZones, dp.score);
                        const prev = idx < arr.length - 1 ? arr[idx + 1] : null;
                        const change = prev ? dp.score - prev.score : null;
                        const isLatest = idx === 0;
                        return (
                          <tr key={dp.id} className={cn("transition-colors hover:bg-gray-50", isLatest && "bg-blue-50/30")}>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1.5">
                                {isLatest && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />}
                                <span className={cn("text-gray-700", isLatest && "font-medium")}>
                                  {new Date(dp.completedAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="font-bold text-gray-900">
                                {group.type === "sel" ? dp.score.toFixed(1) : Math.round(dp.score)}
                              </span>
                              <span className="text-gray-400 text-xs"> / {group.maxScore}</span>
                            </td>
                            <td className="px-4 py-2.5">
                              {sev && (
                                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", sev.color, sev.bgColor)}>
                                  {sev.label}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              {change !== null && change !== 0 ? (
                                <span className={cn(
                                  "text-xs font-semibold",
                                  higherIsBetter
                                    ? (change > 0 ? "text-emerald-600" : "text-red-500")
                                    : (change < 0 ? "text-emerald-600" : "text-red-500"),
                                )}>
                                  {change > 0 ? "+" : ""}{group.type === "sel" ? change.toFixed(1) : Math.round(change)}
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">{change === 0 ? "No change" : "Baseline"}</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedAssessmentId(dp.id)}
                                className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                              >
                                <FileText className="h-3 w-3" />
                                View Report
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Assessment details modal */}
      <AssessmentDetailsModal
        assessmentId={selectedAssessmentId}
        onClose={() => setSelectedAssessmentId(null)}
      />
    </div>
  );
}

function InlineScoreChart({ dataPoints, maxScore, color, zones, onPointClick }: {
  dataPoints: { id: string; score: number; maxScore: number; completedAt: string }[];
  maxScore: number;
  color: string;
  zones: SeverityZone[];
  onPointClick: (id: string) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const sorted = [...dataPoints].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  if (sorted.length === 0) return null;

  const w = 600;
  const h = 180;
  const pad = { top: 16, right: 70, bottom: 40, left: 45 };
  const gw = w - pad.left - pad.right;
  const gh = h - pad.top - pad.bottom;

  const xScale = (i: number) => pad.left + (i / Math.max(sorted.length - 1, 1)) * gw;
  const yScale = (s: number) => pad.top + gh - (s / maxScore) * gh;

  return (
    <svg width={w} height={h} className="w-full" style={{ minWidth: 400 }} viewBox={`0 0 ${w} ${h}`}>
      {/* Zone backgrounds */}
      {zones.map((zone, i) => {
        const top = yScale(Math.min(zone.max, maxScore));
        const bot = yScale(zone.min);
        const zoneH = bot - top;
        if (zoneH <= 0) return null;
        const fills: Record<string, string> = {
          "text-emerald-700": "rgb(16 185 129 / 0.08)",
          "text-green-600": "rgb(34 197 94 / 0.06)",
          "text-yellow-700": "rgb(234 179 8 / 0.08)",
          "text-orange-700": "rgb(249 115 22 / 0.1)",
          "text-red-600": "rgb(239 68 68 / 0.1)",
          "text-red-700": "rgb(220 38 38 / 0.12)",
        };
        return (
          <g key={`zone-${i}`}>
            <rect x={pad.left} y={top} width={gw} height={zoneH} fill={fills[zone.color] ?? "rgb(0 0 0 / 0.03)"} />
            <text x={w - pad.right + 6} y={top + zoneH / 2} dominantBaseline="middle" fontSize="9" fill="#9ca3af">
              {zone.label}
            </text>
          </g>
        );
      })}

      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((r) => {
        const y = pad.top + gh * (1 - r);
        return (
          <g key={r}>
            <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="rgb(0 0 0 / 0.06)" strokeDasharray="3,3" />
            <text x={pad.left - 6} y={y} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="#9ca3af">
              {Math.round(maxScore * r)}
            </text>
          </g>
        );
      })}

      {/* Line */}
      {sorted.length > 1 && (
        <polyline
          points={sorted.map((p, i) => `${xScale(i)},${yScale(p.score)}`).join(" ")}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Points */}
      {sorted.map((p, i) => {
        const x = xScale(i);
        const y = yScale(p.score);
        const isHov = hovered === i;
        const isLast = i === sorted.length - 1;
        return (
          <g
            key={p.id}
            className="cursor-pointer"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onPointClick(p.id)}
          >
            {isHov && <circle cx={x} cy={y} r={14} fill={color} opacity={0.1} />}
            <circle cx={x} cy={y} r={isHov ? 6 : isLast ? 5 : 3.5} fill="white" stroke={color} strokeWidth={isHov || isLast ? 2.5 : 2} />
            <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fontWeight={isHov || isLast ? "600" : "400"} fill={isHov || isLast ? color : "#6b7280"}>
              {Math.round(p.score)}
            </text>
            <text x={x} y={h - pad.bottom + 16} textAnchor="middle" fontSize="9" fill={isHov ? color : "#9ca3af"} fontWeight={isHov ? "600" : "400"}>
              {new Date(p.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </text>
            {isHov && (
              <text x={x} y={y - 22} textAnchor="middle" fontSize="9" fill="#6b7280">
                Click to view report
              </text>
            )}
          </g>
        );
      })}

      {/* Axes */}
      <line x1={pad.left} y1={h - pad.bottom} x2={w - pad.right} y2={h - pad.bottom} stroke="rgb(0 0 0 / 0.12)" />
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={h - pad.bottom} stroke="rgb(0 0 0 / 0.12)" />
    </svg>
  );
}

export function AssessmentChartsClient({ groups, inactiveGroups = [] }: { groups: AssessmentGroup[]; inactiveGroups?: AssessmentGroup[] }) {
  const [showInactive, setShowInactive] = useState(false);

  return (
    <div className="space-y-3">
      {groups.length === 0 && (
        <div className="rounded-xl border bg-white px-6 py-12 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">No assessments completed yet</p>
          <p className="mt-1 text-xs text-gray-400">Assigned assessments will appear here once completed</p>
        </div>
      )}
      {groups.map((group) => (
        <AssessmentGroupSection key={group.type} group={group} />
      ))}

      {inactiveGroups.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowInactive(!showInactive)}
            className="flex w-full items-center justify-between rounded-lg border border-dashed bg-gray-50/50 px-4 py-3 text-left transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gray-300" />
              <span className="text-sm font-medium text-gray-500">
                {inactiveGroups.length} other assessment{inactiveGroups.length !== 1 ? "s" : ""} not yet administered
              </span>
            </div>
            {showInactive ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </button>
          {showInactive && (
            <div className="mt-2 space-y-2">
              {inactiveGroups.map((group) => {
                const IconComponent = ICON_MAP[group.icon] ?? ClipboardList;
                return (
                  <div key={group.type} className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3 opacity-60">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${group.color}15` }}>
                      <IconComponent className="h-4 w-4" style={{ color: group.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">{group.title}</span>
                        <span className="text-xs text-gray-400">{group.subtitle}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Not yet administered</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
