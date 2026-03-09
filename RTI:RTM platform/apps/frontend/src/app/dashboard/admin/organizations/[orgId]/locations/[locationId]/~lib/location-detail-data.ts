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
  schoolCode: string;
  timeZone: string;
  schoolType: string;
  address: string[];
  phone: string;
  gradeLevels: string;
  estStudentCount: number;
  schoolDays: string;
  startTime: string;
  endTime: string;
  academicYear: string;
  blackoutDays: { date: string; label: string }[];
  generalContacts: LocationContact[];
  emergencyContacts: LocationContact[];
  nonSchoolContacts: NonSchoolContact[];
  staff: StaffMember[];
  students: StudentRecord[];
  chatbotEnabled: boolean;
  is24HourAccess: boolean;
  closuresEnabled: boolean;
  assessments: AssessmentConfig[];
  restrictedGrades: number[];
};
