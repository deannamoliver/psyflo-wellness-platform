import { NextResponse } from "next/server";
import { hasExploredToday } from "@/lib/chat/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const explored = await hasExploredToday();
    return NextResponse.json({ explored });
  } catch (error) {
    console.error("Error checking explore status:", error);
    return NextResponse.json({ explored: false });
  }
}
