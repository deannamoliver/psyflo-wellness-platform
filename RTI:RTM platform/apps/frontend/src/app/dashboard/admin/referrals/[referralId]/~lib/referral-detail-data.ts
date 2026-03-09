export type ReferralDetail = {
  id: string;
  student: {
    id: string;
    fullName: string;
    preferredName: string;
    gradeLevel: number;
    dateOfBirth: string;
    gender: string;
    ethnicity: string;
    pronouns: string;
    homeLanguage: string;
    email: string;
    homeAddress: string;
  };
  parent: {
    guardianName: string;
    relationship: string;
    phone: string;
    email: string;
  };
  referral: {
    status: "Submitted" | "In Progress" | "Connected" | "Closed";
    reason: string;
    urgency: "Routine" | "Urgent";
    urgencyDescription: string;
    additionalContext: string;
  };
  insurance: {
    status: "Has Insurance" | "Uninsured" | "Unknown";
    provider: string;
    memberId: string;
  };
  notes: ReferralNote[];
};

export type ReferralNote = {
  id: string;
  authorName: string;
  authorInitials: string;
  authorRole: string;
  content: string;
  createdAt: string;
};
