import { feedback } from "@feelwell/database";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { serverDrizzle } from "@/lib/database/drizzle";

type FeedbackRequestBody = {
  isHelpful: boolean;
  comment?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as FeedbackRequestBody;

    if (typeof body.isHelpful !== "boolean") {
      return NextResponse.json(
        { error: "Missing or invalid isHelpful flag" },
        { status: 400 },
      );
    }

    const comment =
      typeof body.comment === "string" && body.comment.trim().length > 0
        ? body.comment.trim().slice(0, 1000)
        : null;

    const db = await serverDrizzle();
    const userId = db.userId();

    await db.admin.insert(feedback).values({
      userId,
      isHelpful: body.isHelpful,
      comment,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to store Soli feedback:", error);
    return NextResponse.json(
      { error: "Failed to store Soli feedback" },
      { status: 500 },
    );
  }
}
