import { userSchools, users, wellnessCoachHandoffs } from "@feelwell/database";
import { and, eq, inArray } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { serverDrizzle } from "@/lib/database/drizzle";
import { createWellnessToken } from "@/lib/realtime/wellness-token";

export async function GET(req: NextRequest) {
  try {
    const handoffId = req.nextUrl.searchParams.get("handoffId");
    if (!handoffId) {
      return NextResponse.json({ error: "Missing handoffId" }, { status: 400 });
    }

    const db = await serverDrizzle();
    const userId = db.userId();

    const handoff = await db.admin
      .select({
        studentId: wellnessCoachHandoffs.studentId,
        schoolId: wellnessCoachHandoffs.schoolId,
        acceptedByCoachId: wellnessCoachHandoffs.acceptedByCoachId,
      })
      .from(wellnessCoachHandoffs)
      .where(eq(wellnessCoachHandoffs.id, handoffId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!handoff) {
      return NextResponse.json({ error: "Handoff not found" }, { status: 404 });
    }

    const [user] = await db.admin
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const isOwner = handoff.studentId === userId;
    const isAssignedCoach = handoff.acceptedByCoachId === userId;
    const isPsyfloAdmin = user?.email?.endsWith("@psyflo.com") ?? false;

    const schoolStaff = handoff.schoolId
      ? await db.admin
          .select({ id: userSchools.id })
          .from(userSchools)
          .where(
            and(
              eq(userSchools.userId, userId),
              eq(userSchools.schoolId, handoff.schoolId),
              inArray(userSchools.role, ["counselor", "wellness_coach"]),
            ),
          )
          .limit(1)
          .then((rows) => rows[0])
      : null;

    if (!isOwner && !isAssignedCoach && !schoolStaff && !isPsyfloAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const token = createWellnessToken({ userId, handoffId });
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Failed to create realtime token:", error);
    return NextResponse.json(
      { error: "Failed to create token" },
      { status: 500 },
    );
  }
}
