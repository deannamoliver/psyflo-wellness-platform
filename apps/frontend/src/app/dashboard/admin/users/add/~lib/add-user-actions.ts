"use server";

import { profiles, userSchools } from "@feelwell/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { serverDrizzle } from "@/lib/database/drizzle";
import { supabaseAdmin } from "@/lib/database/supabase-admin";

export type AddUserFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

type PlatformRole = "admin" | "clinical_supervisor" | "user";
type SchoolRole = "counselor" | "wellness_coach";

function mapFormRole(role: string): {
  platform: PlatformRole;
  school: SchoolRole | null;
} {
  switch (role) {
    case "Super Admin":
      return { platform: "admin", school: null };
    case "Clinical Supervisor":
      return { platform: "clinical_supervisor", school: null };
    case "Site Staff":
    case "Provider":
      return { platform: "user", school: "counselor" };
    case "Coach":
    case "Therapist":
      return { platform: "user", school: "wellness_coach" };
    default:
      return { platform: "user", school: null };
  }
}

function mapFormStatus(status: string): "active" | "blocked" | "archived" {
  if (status === "Inactive") return "archived";
  if (status === "Suspended") return "blocked";
  return "active";
}

export async function createUser(
  _prevState: AddUserFormState,
  formData: FormData,
): Promise<AddUserFormState> {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const role = formData.get("role") as string;
  const status = formData.get("status") as string;
  const orgId = formData.get("organizationId") as string;
  const locationIds = formData.getAll("locationIds") as string[];
  const roleTitle = formData.get("roleTitle") as string;
  const internalNotes = formData.get("internalNotes") as string;

  if (!firstName?.trim()) return { fieldErrors: { firstName: "Required" } };
  if (!lastName?.trim()) return { fieldErrors: { lastName: "Required" } };
  if (!email?.trim()) return { fieldErrors: { email: "Required" } };
  if (!role) return { fieldErrors: { role: "Required" } };

  const { platform, school } = mapFormRole(role);
  const accountStatus = mapFormStatus(status || "Active");

  try {
    const supabase = supabaseAdmin();
    const db = await serverDrizzle();
    const addedBy = db.userId();

    // Use inviteUserByEmail so Supabase sends a magic-link email
    // that lets the user set their own password on first login.
    const { data: authUser, error: authError } =
      await supabase.auth.admin.inviteUserByEmail(email, {
        data: {
          first_name: firstName,
          last_name: lastName,
          role_title: roleTitle?.trim() || "",
          phone: phone?.trim() || "",
          internal_notes: internalNotes?.trim() || "",
        },
      });

    if (authError || !authUser.user) {
      return { error: authError?.message ?? "Failed to create user" };
    }

    const userId = authUser.user.id;

    await db.admin.insert(profiles).values({
      id: userId,
      platformRole: platform,
      accountStatus,
      phone: phone || null,
      internalNotes: internalNotes || null,
      addedBy,
      canManageUsers: platform === "admin",
      receivesAlertNotifications: false,
    });

    const schoolIds =
      locationIds.length > 0 ? locationIds : orgId ? [orgId] : [];
    if (school && schoolIds.length > 0) {
      await db.admin.insert(userSchools).values(
        schoolIds.map((sid) => ({
          userId,
          schoolId: sid,
          role: school,
        })),
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { error: msg };
  }

  revalidatePath("/dashboard/admin/users");
  redirect("/dashboard/admin/users");
}
