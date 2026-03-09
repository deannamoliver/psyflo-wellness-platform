import { NextRequest, NextResponse } from "next/server";

/**
 * Exercise Responses API
 * 
 * POST: Save an exercise response (draft, saved, or completed)
 * GET: Retrieve responses by patientId and optionally exerciseId
 * 
 * NOTE: Using localStorage/in-memory pattern until database is ready.
 * In production, this should use Supabase tables.
 */

// ─── Types ───────────────────────────────────────────────────────────

interface ExerciseResponseData {
  id: string;
  exerciseId: string;
  assignmentId: string;
  patientId: string;
  clinicianId: string;
  status: "draft" | "saved" | "completed";
  responses: Record<string, unknown>;
  startedAt: string;
  savedAt?: string;
  completedAt?: string;
  score?: {
    total: number;
    interpretation?: string;
    subscores?: Record<string, number>;
    flags?: string[];
  };
}

// ─── In-Memory Store (temporary until DB is ready) ───────────────────

// In a real implementation, this would be stored in Supabase
// For now, we use a simple in-memory store that persists for the server lifetime
const responseStore: Map<string, ExerciseResponseData> = new Map();

function generateId(): string {
  return `resp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ─── Scoring Functions ───────────────────────────────────────────────

function applyScoring(
  exerciseId: string,
  responses: Record<string, unknown>
): ExerciseResponseData["score"] | undefined {
  // Import scoring functions dynamically based on exercise ID
  // For now, check if it's a PHQ-9 or GAD-7 tracker
  if (exerciseId.includes("phq9") || exerciseId.includes("phq-9")) {
    return scorePHQ9(responses as Record<string, string | number>);
  }
  if (exerciseId.includes("gad7") || exerciseId.includes("gad-7")) {
    return scoreGAD7(responses as Record<string, string | number>);
  }
  return undefined;
}

function scorePHQ9(responses: Record<string, string | number>): ExerciseResponseData["score"] {
  const questionIds = [
    "phq9_q1", "phq9_q2", "phq9_q3", "phq9_q4", "phq9_q5",
    "phq9_q6", "phq9_q7", "phq9_q8", "phq9_q9"
  ];
  
  let total = 0;
  const flags: string[] = [];

  for (const qId of questionIds) {
    const value = responses[qId];
    if (value !== undefined) {
      const numValue = typeof value === "string" ? parseInt(value, 10) : value;
      if (!isNaN(numValue)) {
        total += numValue;
      }
    }
  }

  // Check for suicidal ideation (question 9)
  const q9Value = responses["phq9_q9"];
  const q9Numeric = typeof q9Value === "string" ? parseInt(q9Value, 10) : (q9Value ?? 0);
  if (q9Numeric > 0) {
    flags.push("suicidal_ideation");
  }

  let interpretation: string;
  if (total <= 4) interpretation = "Minimal depression";
  else if (total <= 9) interpretation = "Mild depression";
  else if (total <= 14) interpretation = "Moderate depression";
  else if (total <= 19) interpretation = "Moderately severe depression";
  else interpretation = "Severe depression";

  if (total >= 20) flags.push("severe_depression");

  return { total, interpretation, flags };
}

function scoreGAD7(responses: Record<string, string | number>): ExerciseResponseData["score"] {
  const questionIds = [
    "gad7_q1", "gad7_q2", "gad7_q3", "gad7_q4",
    "gad7_q5", "gad7_q6", "gad7_q7"
  ];
  
  let total = 0;
  const flags: string[] = [];

  for (const qId of questionIds) {
    const value = responses[qId];
    if (value !== undefined) {
      const numValue = typeof value === "string" ? parseInt(value, 10) : value;
      if (!isNaN(numValue)) {
        total += numValue;
      }
    }
  }

  let interpretation: string;
  if (total <= 4) interpretation = "Minimal anxiety";
  else if (total <= 9) interpretation = "Mild anxiety";
  else if (total <= 14) interpretation = "Moderate anxiety";
  else interpretation = "Severe anxiety";

  if (total >= 10) flags.push("moderate_anxiety");
  if (total >= 15) flags.push("severe_anxiety");

  return { total, interpretation, flags };
}

// ─── POST Handler ────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { exerciseId, assignmentId, patientId, clinicianId, status, responses } = body;

    if (!exerciseId || !assignmentId || !patientId || !clinicianId) {
      return NextResponse.json(
        { error: "Missing required fields: exerciseId, assignmentId, patientId, clinicianId" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    
    // Check if we're updating an existing response
    const existingKey = `${patientId}-${assignmentId}`;
    const existing = responseStore.get(existingKey);

    const responseData: ExerciseResponseData = {
      id: existing?.id ?? generateId(),
      exerciseId,
      assignmentId,
      patientId,
      clinicianId,
      status: status ?? "draft",
      responses: responses ?? {},
      startedAt: existing?.startedAt ?? now,
      savedAt: status === "saved" || status === "completed" ? now : existing?.savedAt,
      completedAt: status === "completed" ? now : existing?.completedAt,
    };

    // Apply scoring if completing
    if (status === "completed") {
      responseData.score = applyScoring(exerciseId, responses);
    }

    // Store the response
    responseStore.set(existingKey, responseData);

    return NextResponse.json({
      success: true,
      response: responseData,
    });
  } catch (error) {
    console.error("Error saving exercise response:", error);
    return NextResponse.json(
      { error: "Failed to save exercise response" },
      { status: 500 }
    );
  }
}

// ─── GET Handler ─────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const exerciseId = searchParams.get("exerciseId");
    const assignmentId = searchParams.get("assignmentId");

    if (!patientId) {
      return NextResponse.json(
        { error: "Missing required parameter: patientId" },
        { status: 400 }
      );
    }

    // Filter responses based on query parameters
    const responses: ExerciseResponseData[] = [];
    
    for (const [key, value] of responseStore.entries()) {
      if (!key.startsWith(patientId)) continue;
      if (exerciseId && value.exerciseId !== exerciseId) continue;
      if (assignmentId && value.assignmentId !== assignmentId) continue;
      responses.push(value);
    }

    // Sort by savedAt/completedAt descending (most recent first)
    responses.sort((a, b) => {
      const dateA = a.completedAt ?? a.savedAt ?? a.startedAt;
      const dateB = b.completedAt ?? b.savedAt ?? b.startedAt;
      return dateB.localeCompare(dateA);
    });

    return NextResponse.json({
      success: true,
      responses,
      count: responses.length,
    });
  } catch (error) {
    console.error("Error retrieving exercise responses:", error);
    return NextResponse.json(
      { error: "Failed to retrieve exercise responses" },
      { status: 500 }
    );
  }
}
