/**
 * Skills tab section server component.
 *
 * Fetches all SEL data and renders the three main sections:
 * 1. Skill Development Overview (overall score, strengths/interventions, domain summary)
 * 2. Student Distribution by Performance Level (donut chart + student list)
 * 3. Skill Development Progress Timeline (line chart + student table)
 */

import { screenerQuestionSets } from "@feelwell/database";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/core-ui/card";
import { SEL_SUBTYPE_ORDER } from "./config";
import {
  getQuestionAverages,
  getSelTimeSeries,
  getStudentSelScores,
  getSubtypeAverages,
} from "./data";
import { getStudentTableData } from "./data-table";
import { type DomainData, DomainSummary } from "./domain-summary";
import { ProgressCard } from "./progress-card";
import { type ResolvedQuestion, SkillOverview } from "./skill-overview";
import { StudentDistribution } from "./student-distribution";

/** Resolve question text from the static question sets (server-only). */
function getQuestionText(code: string): string {
  for (const qs of screenerQuestionSets) {
    const q = qs.questions.find((q) => q.code === code);
    if (q) return q.text;
  }
  return code;
}

export async function SkillsSection({
  schoolId,
  gradeLevel,
}: {
  schoolId: string;
  gradeLevel: number | null;
}) {
  const [
    subtypeAverages,
    questionAverages,
    studentScores,
    timeSeriesData,
    tableData,
  ] = await Promise.all([
    getSubtypeAverages(schoolId, gradeLevel),
    getQuestionAverages(schoolId, gradeLevel),
    getStudentSelScores(schoolId, gradeLevel),
    getSelTimeSeries(schoolId),
    getStudentTableData(schoolId),
  ]);

  if (subtypeAverages.length === 0) {
    return (
      <Card className="overflow-clip p-0">
        <CardContent className="bg-white p-6">
          <div className="flex min-h-[300px] items-center justify-center px-4 py-8 text-center">
            <p className="max-w-md text-muted-foreground">
              Skill development data will appear here once patients have
              completed the SEL screener series, which covers 8 domains
              administered over a 4-day period.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Resolve question texts server-side
  const resolvedQuestions: ResolvedQuestion[] = questionAverages.map((qa) => ({
    text: getQuestionText(qa.questionCode),
    avgScore: qa.avgScore,
  }));

  const avgMap = new Map(subtypeAverages.map((s) => [s.subtype, s.avgScore]));

  const domains: DomainData[] = SEL_SUBTYPE_ORDER.map((subtype) => {
    const qSet = screenerQuestionSets.find((qs) => qs.subtype === subtype);
    const questions = (qSet?.questions ?? []).map((q, i) => {
      const qa = questionAverages.find(
        (a) => a.questionCode === q.code && a.subtype === subtype,
      );
      return { ordinal: i + 1, text: q.text, avgScore: qa?.avgScore ?? 0 };
    });
    return {
      subtype,
      avgScore: avgMap.get(subtype) ?? 0,
      questions,
    };
  });


  return (
    <div className="space-y-6">
      {/* Skill Development Overview */}
      <Card className="gap-0 overflow-clip border-0 bg-white p-0 shadow-none">
        <CardHeader className="mb-2 rounded-t-xl border-b-0 bg-white px-6 pt-6 pb-2">
          <CardTitle
            className="font-bold text-2xl text-gray-900"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Skill Development Overview
          </CardTitle>
          <p
            className="mt-1 flex items-center gap-1.5 text-gray-500 text-sm"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <Info className="h-4 w-4 shrink-0" aria-hidden />
            Based on patient self-reported SEL assessment
          </p>
        </CardHeader>
        <CardContent className="space-y-6 bg-white px-6 pt-0 pb-6">
          <SkillOverview
            subtypeAverages={subtypeAverages}
            resolvedQuestions={resolvedQuestions}
          />
          <DomainSummary domains={domains} />
        </CardContent>
      </Card>

      {/* Student Distribution by Performance Level */}
      <Card className="gap-0 overflow-clip border-0 bg-white p-0 shadow-none">
        <CardHeader className="mb-2 rounded-t-xl border-b-0 bg-white px-6 pt-6 pb-2">
          <CardTitle
            className="font-bold text-2xl text-gray-900"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Patient Distribution by Performance Level
          </CardTitle>
          <p
            className="mt-1 flex items-center gap-1.5 text-gray-500 text-sm"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <Info className="h-4 w-4 shrink-0" aria-hidden />
            Based on patient self-reported assessments
          </p>
        </CardHeader>
        <CardContent className="overflow-hidden bg-white px-6 pt-0 pb-6">
          <StudentDistribution students={studentScores} />
        </CardContent>
      </Card>

      {/* Skill Development Progress Timeline */}
      <ProgressCard
        timeSeriesData={timeSeriesData}
        tableData={tableData}
      />
    </div>
  );
}
