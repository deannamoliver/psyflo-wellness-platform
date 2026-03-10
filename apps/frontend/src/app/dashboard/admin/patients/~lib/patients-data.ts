export type Patient = {
  id: string;
  patientId: string;
  name: string;
  organization: string;
  status: string;
  addedAt: string;
};

export type SortColumn = "name" | "organization" | "status" | "addedAt";
export type SortDirection = "asc" | "desc";
export type SortState = { column: SortColumn; direction: SortDirection } | null;

export type PatientsStats = {
  total: number;
  active: number;
  inactive: number;
  inviteSent: number;
};

export type PatientsPageData = {
  patients: Patient[];
  stats: PatientsStats;
  organizations: string[];
};
