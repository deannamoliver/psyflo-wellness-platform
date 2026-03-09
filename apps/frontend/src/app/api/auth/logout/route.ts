import { NextResponse } from "next/server";
import { serverSupabase } from "@/lib/database/supabase";

export async function POST() {
  try {
    const supabase = await serverSupabase();
    await supabase.auth.signOut();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
