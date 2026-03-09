import { NextResponse } from "next/server";
import { getUserSoliSettings } from "@/lib/user/server-utils";

export async function GET() {
  try {
    const settings = await getUserSoliSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch soli settings" },
      { status: 500 },
    );
  }
}
