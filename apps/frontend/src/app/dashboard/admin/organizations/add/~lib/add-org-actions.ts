"use server";

import { schoolContacts, schools } from "@feelwell/database";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { serverDrizzle } from "@/lib/database/drizzle";
import { serverSupabase } from "@/lib/database/supabase";
import {
  createContact,
  EMPTY_CONTACT,
  type OrgFormData,
} from "./add-org-types";
import { cascadeOrgStatus } from "./cascade-org-status";

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

export async function createOrganizationAction(formData: OrgFormData) {
  await checkAdminAccess();

  if (!formData.name.trim()) {
    throw new Error("Organization name is required");
  }

  if (!formData.type) {
    throw new Error("Organization type is required");
  }

  const db = await serverDrizzle();

  const [org] = await db.admin
    .insert(schools)
    .values({
      name: formData.name.trim(),
      type: formData.type,
      districtCode: formData.districtCode || null,
      status: formData.status || "onboarding",
      timezone: formData.timezone || null,
      website: formData.website || null,
      phone: formData.phone || null,
      emailDomain: formData.emailDomain || null,
      streetAddress: formData.streetAddress || null,
      streetAddress2: formData.streetAddress2 || null,
      city: formData.city || null,
      state: formData.state || null,
      country: formData.country || null,
      zipCode: formData.zipCode || null,
      internalNotes: formData.internalNotes || null,
    })
    .returning();

  if (!org) {
    throw new Error("Failed to create organization");
  }

  const contactsToInsert: {
    schoolId: string;
    contactRole: "admin" | "billing" | "technical" | "additional";
    name: string | null;
    title: string | null;
    email: string | null;
    phone: string | null;
  }[] = [];

  if (formData.adminContact.name || formData.adminContact.email) {
    contactsToInsert.push({
      schoolId: org.id,
      contactRole: "admin",
      name: formData.adminContact.name || null,
      title: formData.adminContact.title || null,
      email: formData.adminContact.email || null,
      phone: formData.adminContact.phone || null,
    });
  }

  const billingSource = formData.billingSameAsAdmin
    ? formData.adminContact
    : formData.billingContact;

  if (billingSource.name || billingSource.email) {
    contactsToInsert.push({
      schoolId: org.id,
      contactRole: "billing",
      name: billingSource.name || null,
      title: billingSource.title || null,
      email: billingSource.email || null,
      phone: billingSource.phone || null,
    });
  }

  if (formData.technicalContact.name || formData.technicalContact.email) {
    contactsToInsert.push({
      schoolId: org.id,
      contactRole: "technical",
      name: formData.technicalContact.name || null,
      title: formData.technicalContact.title || null,
      email: formData.technicalContact.email || null,
      phone: formData.technicalContact.phone || null,
    });
  }

  for (const additional of formData.additionalContacts) {
    if (additional.name || additional.email) {
      contactsToInsert.push({
        schoolId: org.id,
        contactRole: "additional",
        name: additional.name || null,
        title: additional.title || null,
        email: additional.email || null,
        phone: additional.phone || null,
      });
    }
  }

  if (contactsToInsert.length > 0) {
    await db.admin.insert(schoolContacts).values(contactsToInsert);
  }

  revalidatePath("/dashboard/admin/organizations");

  return { id: org.id };
}

export async function getOrganizationForEdit(
  orgId: string,
): Promise<OrgFormData | null> {
  await checkAdminAccess();

  const db = await serverDrizzle();

  const orgRows = await db.admin
    .select()
    .from(schools)
    .where(and(eq(schools.id, orgId), isNull(schools.deletedAt)))
    .limit(1);

  const org = orgRows[0];
  if (!org) return null;

  const contactRows = await db.admin
    .select()
    .from(schoolContacts)
    .where(eq(schoolContacts.schoolId, orgId));

  // Map contacts by role
  const adminContact = contactRows.find((c) => c.contactRole === "admin");
  const billingContact = contactRows.find((c) => c.contactRole === "billing");
  const technicalContact = contactRows.find(
    (c) => c.contactRole === "technical",
  );
  const additionalContacts = contactRows.filter(
    (c) => c.contactRole === "additional",
  );

  // Check if billing is same as admin
  const billingSameAsAdmin =
    adminContact &&
    billingContact &&
    adminContact.email === billingContact.email &&
    adminContact.name === billingContact.name;

  // Strip https:// or http:// from website if present
  let website = org.website || "";
  if (website) {
    website = website.replace(/^https?:\/\//, "");
  }

  const formData: OrgFormData = {
    type: (org.type as OrgFormData["type"]) || "",
    name: org.name || "",
    districtCode: org.districtCode || "",
    streetAddress: org.streetAddress || "",
    streetAddress2: org.streetAddress2 || "",
    city: org.city || "",
    state: org.state || "",
    country: org.country || "",
    zipCode: org.zipCode || "",
    timezone: org.timezone || "",
    website: website,
    phone: org.phone || "",
    emailDomain: org.emailDomain || "",
    adminContact: adminContact
      ? {
          id: "admin",
          name: adminContact.name || "",
          title: adminContact.title || "",
          email: adminContact.email || "",
          phone: adminContact.phone || "",
        }
      : { ...EMPTY_CONTACT, id: "admin" },
    billingContact:
      billingContact && !billingSameAsAdmin
        ? {
            id: "billing",
            name: billingContact.name || "",
            title: billingContact.title || "",
            email: billingContact.email || "",
            phone: billingContact.phone || "",
          }
        : { ...EMPTY_CONTACT, id: "billing" },
    billingSameAsAdmin: billingSameAsAdmin || false,
    technicalContact: technicalContact
      ? {
          id: "technical",
          name: technicalContact.name || "",
          title: technicalContact.title || "",
          email: technicalContact.email || "",
          phone: technicalContact.phone || "",
        }
      : { ...EMPTY_CONTACT, id: "technical" },
    status: (org.status as OrgFormData["status"]) || "onboarding",
    internalNotes: org.internalNotes || "",
    additionalContacts:
      additionalContacts.length > 0
        ? additionalContacts.map((c, idx) => ({
            id: `contact-${idx + 1}`,
            name: c.name || "",
            title: c.title || "",
            email: c.email || "",
            phone: c.phone || "",
          }))
        : [createContact()],
  };

  return formData;
}

export async function updateOrganizationAction(
  orgId: string,
  formData: OrgFormData,
) {
  await checkAdminAccess();

  if (!formData.name.trim()) {
    throw new Error("Organization name is required");
  }

  if (!formData.type) {
    throw new Error("Organization type is required");
  }

  const db = await serverDrizzle();
  const newStatus = formData.status || "onboarding";

  // Fetch previous status to check if it changed
  const [currentOrg] = await db.admin
    .select({ status: schools.status })
    .from(schools)
    .where(eq(schools.id, orgId))
    .limit(1);

  // Update organization
  await db.admin
    .update(schools)
    .set({
      name: formData.name.trim(),
      type: formData.type,
      districtCode: formData.districtCode || null,
      status: newStatus,
      timezone: formData.timezone || null,
      website: formData.website || null,
      phone: formData.phone || null,
      emailDomain: formData.emailDomain || null,
      streetAddress: formData.streetAddress || null,
      streetAddress2: formData.streetAddress2 || null,
      city: formData.city || null,
      state: formData.state || null,
      country: formData.country || null,
      zipCode: formData.zipCode || null,
      internalNotes: formData.internalNotes || null,
    })
    .where(eq(schools.id, orgId));

  // Cascade status to child locations and users when deactivating
  if (
    currentOrg &&
    currentOrg.status !== newStatus &&
    newStatus === "archived"
  ) {
    await cascadeOrgStatus(orgId);
  }

  // Delete existing contacts
  await db.admin
    .delete(schoolContacts)
    .where(eq(schoolContacts.schoolId, orgId));

  // Insert updated contacts
  const contactsToInsert: {
    schoolId: string;
    contactRole: "admin" | "billing" | "technical" | "additional";
    name: string | null;
    title: string | null;
    email: string | null;
    phone: string | null;
  }[] = [];

  if (formData.adminContact.name || formData.adminContact.email) {
    contactsToInsert.push({
      schoolId: orgId,
      contactRole: "admin",
      name: formData.adminContact.name || null,
      title: formData.adminContact.title || null,
      email: formData.adminContact.email || null,
      phone: formData.adminContact.phone || null,
    });
  }

  const billingSource = formData.billingSameAsAdmin
    ? formData.adminContact
    : formData.billingContact;

  if (billingSource.name || billingSource.email) {
    contactsToInsert.push({
      schoolId: orgId,
      contactRole: "billing",
      name: billingSource.name || null,
      title: billingSource.title || null,
      email: billingSource.email || null,
      phone: billingSource.phone || null,
    });
  }

  if (formData.technicalContact.name || formData.technicalContact.email) {
    contactsToInsert.push({
      schoolId: orgId,
      contactRole: "technical",
      name: formData.technicalContact.name || null,
      title: formData.technicalContact.title || null,
      email: formData.technicalContact.email || null,
      phone: formData.technicalContact.phone || null,
    });
  }

  for (const additional of formData.additionalContacts) {
    if (additional.name || additional.email) {
      contactsToInsert.push({
        schoolId: orgId,
        contactRole: "additional",
        name: additional.name || null,
        title: additional.title || null,
        email: additional.email || null,
        phone: additional.phone || null,
      });
    }
  }

  if (contactsToInsert.length > 0) {
    await db.admin.insert(schoolContacts).values(contactsToInsert);
  }

  revalidatePath("/dashboard/admin/organizations");
  revalidatePath(`/dashboard/admin/organizations/${orgId}`);

  return { id: orgId };
}
