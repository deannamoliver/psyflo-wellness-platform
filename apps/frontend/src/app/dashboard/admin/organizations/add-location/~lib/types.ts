export type AdditionalContact = {
  name: string;
  title: string;
  email: string;
  phone: string;
};

export type BlackoutDay = {
  startDate: string;
  endDate: string;
  name: string;
};

export type PatientContact = {
  contact: string;
  type: "email" | "phone";
};

export type StaffMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleTitle: string;
  role: "practice_management" | "provider";
  notes: string;
  patients?: PatientContact[];
  patientEmails?: string[];
  acceptedInsurance?: string[];
};

export type EmergencyContact = {
  id: string;
  name: string;
  relation: string;
  primaryPhone: string;
  secondaryPhone: string;
  primaryEmail: string;
  secondaryEmail: string;
};

export type LocationFormData = {
  // Step 1 - Location Profile
  parentOrganizationId: string;
  locationName: string;
  locationNpi?: string;
  schoolCode: string;
  phone: string;
  streetAddress: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  // Patient Population Characteristics
  agesServed?: string[];
  mentalHealthNeeds?: string[];
  languagesSpoken?: string[];
  modalities?: string[];
  approaches?: string[];
  gradeLevels: string[];
  schoolType: string;
  estimatedStudentCount: string;
  timezone: string;
  primaryContact: {
    name: string;
    jobTitle: string;
    email: string;
    phone: string;
    officePhone: string;
    mobilePhone: string;
  };
  additionalContacts: AdditionalContact[];
  schoolHoursStart: string;
  schoolHoursEnd: string;
  schoolDays: string[];
  academicYearStart: string;
  academicYearEnd: string;
  blackoutDays: BlackoutDay[];
  // Step 2 - Roles & Permissions
  staff: StaffMember[];
  studentDomains: string[];
  inviteLinkActive: boolean;
  inviteLink: string;
  manualStudentEmails: string[];
  restrictedGrades: string[];
  // Step 3 - Safety & Escalation
  primaryEmergencyContact: EmergencyContact | null;
  backupContacts: EmergencyContact[];
  policePhone: string;
  policeAddress: string;
  sroName: string;
  sroPhone: string;
  noSro: boolean;
  crisisCenterName: string;
  crisisHotline: string;
  crisisHours: string;
  mobileCrisisAvailable: boolean;
  mobileCrisisNumber: string;
  nearestHospital: string;
  erAddress: string;
  erPhone: string;
  stateCpsHotline: string;
  localCpsOffice: string;
  cpsReportUrl: string;
  emergencyNotes: string;
  // Step 4 - Platform Configuration
  chatbotEnabled: boolean;
  chatbotScheduleType: "24_7" | "school_hours_only";
  chatbotClosuresDisabled: boolean;
  selScreenerEnabled: boolean;
  selScreenerFrequency: string;
  selScreenerFirstDate: string;
  phq9Enabled: boolean;
  phq9Frequency: string;
  phq9FirstDate: string;
  gad7Enabled: boolean;
  gad7Frequency: string;
  gad7FirstDate: string;
};

export const INITIAL_FORM_DATA: LocationFormData = {
  parentOrganizationId: "",
  locationName: "",
  schoolCode: "",
  phone: "",
  streetAddress: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  country: "United States",
  gradeLevels: [],
  schoolType: "",
  estimatedStudentCount: "0",
  timezone: "America/Los_Angeles",
  primaryContact: {
    name: "",
    jobTitle: "Principal",
    email: "",
    phone: "",
    officePhone: "",
    mobilePhone: "",
  },
  additionalContacts: [{ name: "", title: "", email: "", phone: "" }],
  schoolHoursStart: "08:00",
  schoolHoursEnd: "15:30",
  schoolDays: ["M", "T", "W", "Th", "F"],
  academicYearStart: "2026-08-15",
  academicYearEnd: "2027-06-10",
  blackoutDays: [
    {
      startDate: "2026-11-26",
      endDate: "2026-11-28",
      name: "Thanksgiving Break",
    },
    {
      startDate: "2026-12-20",
      endDate: "2026-12-28",
      name: "Winter Break Start",
    },
    { startDate: "2027-03-15", endDate: "2027-03-15", name: "Spring Break" },
  ],
  staff: [],
  studentDomains: [],
  inviteLinkActive: false,
  inviteLink: "",
  manualStudentEmails: [],
  restrictedGrades: [],
  primaryEmergencyContact: null,
  backupContacts: [],
  policePhone: "",
  policeAddress: "",
  sroName: "",
  sroPhone: "",
  noSro: false,
  crisisCenterName: "",
  crisisHotline: "",
  crisisHours: "",
  mobileCrisisAvailable: false,
  mobileCrisisNumber: "",
  nearestHospital: "",
  erAddress: "",
  erPhone: "",
  stateCpsHotline: "",
  localCpsOffice: "",
  cpsReportUrl: "",
  emergencyNotes: "",
  chatbotEnabled: true,
  chatbotScheduleType: "24_7",
  chatbotClosuresDisabled: true,
  selScreenerEnabled: true,
  selScreenerFrequency: "Monthly",
  selScreenerFirstDate: "02/01/2024",
  phq9Enabled: true,
  phq9Frequency: "Quarterly",
  phq9FirstDate: "03/15/2024",
  gad7Enabled: true,
  gad7Frequency: "Quarterly",
  gad7FirstDate: "03/15/2024",
};

export const GRADE_LEVELS = [
  "K",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

export const ALL_SCHOOL_DAYS = ["M", "T", "W", "Th", "F", "Sa", "Su"];

export const TIMEZONES = [
  { value: "America/Los_Angeles", label: "Pacific Time (PT) – UTC-8" },
  { value: "America/Denver", label: "Mountain Time (MT) – UTC-7" },
  { value: "America/Chicago", label: "Central Time (CT) – UTC-6" },
  { value: "America/New_York", label: "Eastern Time (ET) – UTC-5" },
  { value: "America/Anchorage", label: "Alaska Time (AKT) – UTC-9" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT) – UTC-10" },
];

export const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

export const GRADE_LABELS: Record<string, { label: string; sub: string }> = {
  K: { label: "Kindergarten", sub: "Grade K" },
  "1": { label: "1st Grade", sub: "Grade 1" },
  "2": { label: "2nd Grade", sub: "Grade 2" },
  "3": { label: "3rd Grade", sub: "Grade 3" },
  "4": { label: "4th Grade", sub: "Grade 4" },
  "5": { label: "5th Grade", sub: "Grade 5" },
  "6": { label: "6th Grade", sub: "Grade 6" },
  "7": { label: "7th Grade", sub: "Grade 7" },
  "8": { label: "8th Grade", sub: "Grade 8" },
  "9": { label: "9th Grade", sub: "Grade 9 / Freshman" },
  "10": { label: "10th Grade", sub: "Grade 10 / Sophomore" },
  "11": { label: "11th Grade", sub: "Grade 11 / Junior" },
  "12": { label: "12th Grade", sub: "Grade 12 / Senior" },
};
