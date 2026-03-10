"use server";

import { profiles } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { serverDrizzle } from "@/lib/database/drizzle";
import { serverSupabase } from "@/lib/database/supabase";

type Result = { ok: boolean; error?: string };

type PlatformRole = "admin" | "clinical_supervisor" | "user";

function mapDisplayRole(role: string): PlatformRole {
  switch (role) {
    case "Super Admin":
      return "admin";
    case "Clinical Supervisor":
      return "clinical_supervisor";
    default:
      return "user";
  }
}

function mapDisplayStatus(status: string): "active" | "blocked" | "archived" {
  if (status === "Inactive") return "archived";
  return "active";
}

export async function updateUser(
  userId: string,
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    displayRole: string;
    displayStatus: string;
    internalNotes: string;
  },
): Promise<Result> {
  const supabase = await serverSupabase();
  const db = await serverDrizzle();

  try {
    const { error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        email: data.email,
        user_metadata: {
          first_name: data.firstName,
          last_name: data.lastName,
        },
      },
    );

    if (authError) {
      return { ok: false, error: authError.message };
    }

    await db.admin
      .update(profiles)
      .set({
        phone: data.phone || null,
        platformRole: mapDisplayRole(data.displayRole),
        accountStatus: mapDisplayStatus(data.displayStatus),
        internalNotes: data.internalNotes || null,
      })
      .where(eq(profiles.id, userId));
  } catch {
    return { ok: false, error: "Failed to update user." };
  }

  revalidatePath(`/dashboard/admin/users/${userId}`);
  revalidatePath("/dashboard/admin/users");
  return { ok: true };
}
