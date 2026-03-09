"use server";

import {
  emergencyContacts,
  locationBlackoutDays,
  locationContacts,
  locationEmergencyServices,
  locationGradeRestrictions,
  locationPlatformConfig,
  schoolAllowedEmails,
  schoolDomains,
  schoolEmailFilterSettings,
  schoolHours,
  schools,
} from "@feelwell/database";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { serverDrizzle } from "@/lib/database/drizzle";
import { serverSupabase } from "@/lib/database/supabase";
import {
  insertAllowedEmails,
  insertBlackoutDays,
  insertEmergencyContacts,
  insertEmergencyServices,
  insertGradeRestrictions,
  insertLocationContacts,
  insertPlatformConfig,
  insertSchoolHours,
  insertStudentDomains,
} from "./add-location-insert-helpers";
import {
  deleteStaffForLocation,
  insertStaff,
} from "./add-location-insert-staff";
import { getOrgDomains } from "./load-location-form-data";
import type { LocationFormData } from "./types";

async function checkAdminAccess() {
  const supabase = await serverSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email?.endsWith("@psyflo.com")) {
    throw new Error("Unauthorized: Admin access required");
  }

  return user;
}

export async function createLocationAction(formData: LocationFormData) {
  await checkAdminAccess();

  if (!formData.locationName.trim()) {
    throw new Error("Location name is required");
  }

  const db = await serverDrizzle();

  // School type = organization type (inherit from parent)
  type OrgType = "k12" | "college" | "clinic" | "cbo";
  const validTypes: OrgType[] = ["k12", "college", "clinic", "cbo"];
  let orgType: OrgType | null = null;
  if (formData.parentOrganizationId) {
    const [orgRow] = await db.admin
      .select({ type: schools.type })
      .from(schools)
      .where(
        and(
          eq(schools.id, formData.parentOrganizationId),
          isNull(schools.deletedAt),
        ),
      )
      .limit(1);
    const t = orgRow?.type ?? null;
    orgType = t && validTypes.includes(t as OrgType) ? (t as OrgType) : null;
  }

  const [school] = await db.admin
    .insert(schools)
    .values({
      name: formData.locationName.trim(),
      schoolCode: formData.schoolCode || null,
      phone: formData.phone || null,
      streetAddress: formData.streetAddress || null,
      streetAddress2: formData.addressLine2 || null,
      city: formData.city || null,
      state: formData.state || null,
      zipCode: formData.zipCode || null,
      country: formData.country || null,
      gradeLevels: formData.gradeLevels,
      type: orgType,
      estimatedStudentCount: Number(formData.estimatedStudentCount) || 0,
      timezone: formData.timezone || null,
      inviteLinkActive: formData.inviteLinkActive,
      inviteLinkCode: formData.inviteLink || null,
      academicYearStart: formData.academicYearStart || null,
      academicYearEnd: formData.academicYearEnd || null,
      organizationId: formData.parentOrganizationId || null,
      status: "onboarding",
    })
    .returning();

  if (!school) {
    throw new Error("Failed to create location");
  }

  const schoolId = school.id;

  const orgDomains = formData.parentOrganizationId
    ? await getOrgDomains(formData.parentOrganizationId)
    : undefined;

  await Promise.all([
    insertLocationContacts(db.admin, schoolId, formData),
    insertSchoolHours(db.admin, schoolId, formData),
    insertBlackoutDays(db.admin, schoolId, formData),
    insertEmergencyContacts(db.admin, schoolId, formData),
    insertEmergencyServices(db.admin, schoolId, formData),
    insertPlatformConfig(db.admin, schoolId, formData),
    insertStudentDomains(db.admin, schoolId, formData, { orgDomains }),
    insertGradeRestrictions(db.admin, schoolId, formData),
    insertAllowedEmails(db.admin, schoolId, formData),
  ]);

  // Staff requires sequential Supabase auth calls, run after parallel inserts
  await insertStaff(db.admin, schoolId, formData);

  revalidatePath("/dashboard/admin/organizations");
  if (formData.parentOrganizationId) {
    revalidatePath(
      `/dashboard/admin/organizations/${formData.parentOrganizationId}`,
    );
  }

  return { id: schoolId };
}

export async function updateLocationAction(
  locationId: string,
  formData: LocationFormData,
) {
  await checkAdminAccess();

  if (!formData.locationName.trim()) {
    throw new Error("Location name is required");
  }

  const db = await serverDrizzle();

  // School type = organization type (inherit from parent)
  type OrgType = "k12" | "college" | "clinic" | "cbo";
  const validTypes: OrgType[] = ["k12", "college", "clinic", "cbo"];
  let orgType: OrgType | null = null;
  if (formData.parentOrganizationId) {
    const [orgRow] = await db.admin
      .select({ type: schools.type })
      .from(schools)
      .where(
        and(
          eq(schools.id, formData.parentOrganizationId),
          isNull(schools.deletedAt),
        ),
      )
      .limit(1);
    const t = orgRow?.type ?? null;
    orgType = t && validTypes.includes(t as OrgType) ? (t as OrgType) : null;
  }

  // Update the school row
  await db.admin
    .update(schools)
    .set({
      name: formData.locationName.trim(),
      schoolCode: formData.schoolCode || null,
      phone: formData.phone || null,
      streetAddress: formData.streetAddress || null,
      streetAddress2: formData.addressLine2 || null,
      city: formData.city || null,
      state: formData.state || null,
      zipCode: formData.zipCode || null,
      country: formData.country || null,
      gradeLevels: formData.gradeLevels,
      type: orgType,
      estimatedStudentCount: Number(formData.estimatedStudentCount) || 0,
      timezone: formData.timezone || null,
      inviteLinkActive: formData.inviteLinkActive,
      inviteLinkCode: formData.inviteLink || null,
      academicYearStart: formData.academicYearStart || null,
      academicYearEnd: formData.academicYearEnd || null,
      organizationId: formData.parentOrganizationId || null,
    })
    .where(eq(schools.id, locationId));

  // Delete old related rows and re-insert
  await Promise.all([
    db.admin
      .delete(locationContacts)
      .where(eq(locationContacts.schoolId, locationId)),
    db.admin.delete(schoolHours).where(eq(schoolHours.schoolId, locationId)),
    db.admin
      .delete(locationBlackoutDays)
      .where(eq(locationBlackoutDays.schoolId, locationId)),
    db.admin
      .delete(emergencyContacts)
      .where(eq(emergencyContacts.schoolId, locationId)),
    db.admin
      .delete(locationEmergencyServices)
      .where(eq(locationEmergencyServices.schoolId, locationId)),
    db.admin
      .delete(locationPlatformConfig)
      .where(eq(locationPlatformConfig.schoolId, locationId)),
    db.admin
      .delete(schoolDomains)
      .where(eq(schoolDomains.schoolId, locationId)),
    db.admin
      .delete(locationGradeRestrictions)
      .where(eq(locationGradeRestrictions.schoolId, locationId)),
    db.admin
      .delete(schoolAllowedEmails)
      .where(eq(schoolAllowedEmails.schoolId, locationId)),
    db.admin
      .delete(schoolEmailFilterSettings)
      .where(eq(schoolEmailFilterSettings.schoolId, locationId)),
    deleteStaffForLocation(db.admin, locationId),
  ]);

  // Re-insert all related data
  const orgDomains = formData.parentOrganizationId
    ? await getOrgDomains(formData.parentOrganizationId)
    : undefined;

  await Promise.all([
    insertLocationContacts(db.admin, locationId, formData),
    insertSchoolHours(db.admin, locationId, formData),
    insertBlackoutDays(db.admin, locationId, formData),
    insertEmergencyContacts(db.admin, locationId, formData),
    insertEmergencyServices(db.admin, locationId, formData),
    insertPlatformConfig(db.admin, locationId, formData),
    insertStudentDomains(db.admin, locationId, formData, { orgDomains }),
    insertGradeRestrictions(db.admin, locationId, formData),
    insertAllowedEmails(db.admin, locationId, formData),
  ]);

  // Staff requires sequential Supabase auth calls, run after parallel inserts
  await insertStaff(db.admin, locationId, formData);

  revalidatePath("/dashboard/admin/organizations");
  if (formData.parentOrganizationId) {
    revalidatePath(
      `/dashboard/admin/organizations/${formData.parentOrganizationId}`,
    );
    revalidatePath(
      `/dashboard/admin/organizations/${formData.parentOrganizationId}/locations/${locationId}`,
    );
  }

  return { id: locationId };
}
