"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createChatSession } from "@/lib/chat/api";

export async function createNewSessionAction() {
  const session = await createChatSession();
  revalidatePath("/admin/agents", "layout");
  redirect(`/admin/agents/${session.id}`);
}
