import { NextResponse } from "next/server";
import { serverSupabase } from "@/lib/database/supabase";

export async function GET(request: Request) {
  const supabase = await serverSupabase();

  await supabase.auth.signOut();

  const url = new URL("/login", request.url);
  return NextResponse.redirect(url);
}
