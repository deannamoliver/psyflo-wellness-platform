"use server";

import {
  adminAddAllowedEmail,
  adminBulkUploadAllowedEmails,
  adminRemoveAllowedEmail,
  adminToggleStudentEmailFiltering,
} from "./actions";

export async function adminToggleStudentFiltering(
  schoolId: string,
  enabled: boolean,
) {
  return adminToggleStudentEmailFiltering(schoolId, enabled);
}

export async function adminAddEmail(
  schoolId: string,
  email: string,
  role: "student" | "counselor",
) {
  return adminAddAllowedEmail(schoolId, email, role);
}

export async function adminRemoveEmail(emailId: string) {
  return adminRemoveAllowedEmail(emailId);
}

export async function adminBulkUpload(
  schoolId: string,
  emails: string[],
  role: "student" | "counselor",
) {
  return adminBulkUploadAllowedEmails(schoolId, emails, role);
}
