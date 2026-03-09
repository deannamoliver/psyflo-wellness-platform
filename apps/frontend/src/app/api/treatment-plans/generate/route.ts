import { treatmentPlans } from "@feelwell/database";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { serverDrizzle } from "@/lib/database/drizzle";
import {
  getTemplatesForDiagnosis,
  type TreatmentGoal,
} from "@/data/treatmentPlanTemplates";

type GenerateRequestBody = {
  studentId: string;
  diagnosisCode: string;
  diagnosisLabel: string;
  clinicianId: string;
};

type GeneratedGoal = TreatmentGoal & {
  targetDate: string;
};

type GeneratedPlanData = {
  goals: GeneratedGoal[];
  suggestedInterventions: string[];
  clinicianNotes: string;
};

function parseTimeframeToDays(timeframe: string): number {
  const normalized = timeframe.toLowerCase().trim();

  // Handle ranges like "8-12 weeks" - take the midpoint
  const rangeMatch = normalized.match(/(\d+)\s*-\s*(\d+)\s*(week|day|month)/);
  if (rangeMatch && rangeMatch[1] && rangeMatch[2] && rangeMatch[3]) {
    const min = Number.parseInt(rangeMatch[1], 10);
    const max = Number.parseInt(rangeMatch[2], 10);
    const unit = rangeMatch[3];
    const avg = Math.round((min + max) / 2);

    if (unit.startsWith("week")) return avg * 7;
    if (unit.startsWith("month")) return avg * 30;
    return avg;
  }

  // Handle single values like "30 days" or "6 weeks"
  const singleMatch = normalized.match(/(\d+)\s*(week|day|month)/);
  if (singleMatch && singleMatch[1] && singleMatch[2]) {
    const value = Number.parseInt(singleMatch[1], 10);
    const unit = singleMatch[2];

    if (unit.startsWith("week")) return value * 7;
    if (unit.startsWith("month")) return value * 30;
    return value;
  }

  // Default to 30 days if parsing fails
  return 30;
}

function calculateTargetDate(timeframe: string): string {
  const days = parseTimeframeToDays(timeframe);
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);
  const dateStr = targetDate.toISOString().split("T")[0];
  return dateStr ?? targetDate.toISOString().slice(0, 10);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateRequestBody;

    // Validate required fields
    if (!body.studentId || !body.diagnosisCode || !body.diagnosisLabel || !body.clinicianId) {
      return NextResponse.json(
        { error: "Missing required fields: studentId, diagnosisCode, diagnosisLabel, clinicianId" },
        { status: 400 },
      );
    }

    // Get matching template
    const templates = getTemplatesForDiagnosis(body.diagnosisCode);

    if (templates.length === 0) {
      return NextResponse.json(
        { error: `No treatment plan template found for diagnosis code: ${body.diagnosisCode}` },
        { status: 404 },
      );
    }

    const template = templates[0];
    if (!template) {
      return NextResponse.json(
        { error: `No treatment plan template found for diagnosis code: ${body.diagnosisCode}` },
        { status: 404 },
      );
    }

    // Generate plan data with calculated target dates
    const generatedGoals: GeneratedGoal[] = template.goals.map((goal) => ({
      ...goal,
      targetDate: calculateTargetDate(goal.targetTimeframe),
    }));

    const planData: GeneratedPlanData = {
      goals: generatedGoals,
      suggestedInterventions: template.suggestedInterventions,
      clinicianNotes: template.clinicianNotes,
    };

    // Save to database
    const db = await serverDrizzle();

    const [insertedPlan] = await db.admin
      .insert(treatmentPlans)
      .values({
        studentId: body.studentId,
        diagnosisCode: body.diagnosisCode,
        diagnosisLabel: body.diagnosisLabel,
        templateName: template.templateName,
        planData,
        status: "active",
        frequency: template.recommendedSessionFrequency,
        estimatedDuration: template.estimatedDuration,
        clinicalNotes: null,
        createdBy: body.clinicianId,
      })
      .returning();

    return NextResponse.json({
      ok: true,
      plan: insertedPlan,
    });
  } catch (error) {
    console.error("Failed to generate treatment plan:", error);
    return NextResponse.json(
      { error: "Failed to generate treatment plan" },
      { status: 500 },
    );
  }
}
