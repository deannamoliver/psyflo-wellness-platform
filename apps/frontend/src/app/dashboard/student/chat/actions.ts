"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createChatSession } from "@/lib/chat/api";

export async function createNewSession() {
  const session = await createChatSession();

  revalidatePath("/dashboard/student/chat", "layout");
  redirect(`/dashboard/student/chat/${session.id}`);
}
