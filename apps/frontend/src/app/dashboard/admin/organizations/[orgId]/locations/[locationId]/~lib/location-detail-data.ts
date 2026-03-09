export type LocationContact = {
  role: string;
  name: string;
  title: string;
  email: string;
  phones: string[];
};

export type NonSchoolContact = {
  label: string;
  name: string;
  phone: string;
  address: string[];
};

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  locations: string[];
  email: string;
  status: "Active" | "Inactive";
  /** Fields for the edit modal */
  firstName: string;
  lastName: string;
  roleTitle: string;
  phone: string;
  notes: string;
  platformRole: string;
  schoolRole: string;
};

export type StudentRecord = {
  id: string;
  name: string;
  email: string;
  studentId: string;
  grade: number;
  alertStatus?: "Safety Alert" | null;
};

export type AssessmentConfig = {
  name: string;
  description: string;
  icon: "sel" | "phq9" | "gad7";
  frequency: string;
  nextScheduledDate: string;
  active: boolean;
  note?: string;
};

export type LocationDetail = {
  id: string;
  name: string;
  code: string;
  orgId: string;
  orgName: string;
  createdAt: string;
  locationName: string;
  locationNpi: string;
  locationCode: string;
  timeZone: string;
  locationType: string;
  address: string[];
  phone: string;
  // Patient population characteristics
  agesServed: string;
  mentalHealthNeeds: string[];
  languagesSpoken: string[];
  modalities: string[];
  approaches: string[];
  estPatientCount: number;
  // Location hours
  operatingDays: string;
  startTime: string;
  endTime: string;
  generalContacts: LocationContact[];
  emergencyContacts: LocationContact[];
  externalContacts: NonSchoolContact[];
  staff: StaffMember[];
  patients: StudentRecord[];
  chatbotEnabled: boolean;
  is24HourAccess: boolean;
  closuresEnabled: boolean;
  assessments: AssessmentConfig[];
};
