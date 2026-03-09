import { treatmentPlans } from "@feelwell/database";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { serverDrizzle } from "@/lib/database/drizzle";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Missing required query parameter: studentId" },
        { status: 400 },
      );
    }

    const db = await serverDrizzle();

    const plans = await db.admin
      .select()
      .from(treatmentPlans)
      .where(eq(treatmentPlans.studentId, studentId))
      .orderBy(desc(treatmentPlans.createdAt));

    return NextResponse.json({
      ok: true,
      plans,
    });
  } catch (error) {
    console.error("Failed to fetch treatment plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch treatment plans" },
      { status: 500 },
    );
  }
}