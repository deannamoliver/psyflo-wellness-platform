"use server";

import {
  addAllowedEmail,
  bulkUploadAllowedEmails,
  removeAllowedEmail,
  toggleStudentEmailFiltering,
} from "./actions";

export async function counselorToggleStudentFiltering(
  schoolId: string,
  enabled: boolean,
) {
  return toggleStudentEmailFiltering(schoolId, enabled);
}

export async function counselorAddEmail(
  schoolId: string,
  email: string,
  role: "student" | "counselor",
) {
  return addAllowedEmail(schoolId, email, role);
}

export async function counselorRemoveEmail(emailId: string, schoolId: string) {
  return removeAllowedEmail(emailId, schoolId);
}

export async function counselorBulkUpload(
  schoolId: string,
  emails: string[],
  role: "student" | "counselor",
) {
  return bulkUploadAllowedEmails(schoolId, emails, role);
}
