import type { PatientsPageData, Patient, PatientsStats } from "./patients-data";

// Mock data for patients - replace with actual database query when schema is ready
const MOCK_PATIENTS: Patient[] = [
  { id: "1", patientId: "PAT001", name: "John Smith", organization: "Downtown Mental Health", status: "Active", addedAt: "Jan 15, 2024" },
  { id: "2", patientId: "PAT002", name: "Sarah Johnson", organization: "Westside Behavioral", status: "Active", addedAt: "Jan 20, 2024" },
  { id: "3", patientId: "PAT003", name: "Michael Chen", organization: "Downtown Mental Health", status: "Inactive", addedAt: "Feb 1, 2024" },
  { id: "4", patientId: "PAT004", name: "Emily Davis", organization: "North County Wellness", status: "Active", addedAt: "Feb 10, 2024" },
  { id: "5", patientId: "PAT005", name: "Robert Wilson", organization: "Westside Behavioral", status: "Invite Sent", addedAt: "Feb 15, 2024" },
];

export async function fetchAdminPatients(): Promise<PatientsPageData> {
  const patients = MOCK_PATIENTS;

  // Get unique organizations
  const orgSet = new Set(patients.map((p) => p.organization));
  const organizationsList = Array.from(orgSet).sort();

  // Calculate stats
  const stats: PatientsStats = {
    total: patients.length,
    active: patients.filter((p) => p.status === "Active").length,
    inactive: patients.filter((p) => p.status === "Inactive" || p.status === "Archived").length,
    inviteSent: patients.filter((p) => p.status === "Invite Sent").length,
  };

  return {
    patients,
    stats,
    organizations: organizationsList,
  };
}
