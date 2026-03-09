export type ChatEntry = {
  id: string;
  content: string;
  author: "student" | "coach";
  createdAt: string;
  senderInitials: string;
};

export type EmergencyContact = {
  id: string;
  name: string;
  relation: string;
  contactType: "home" | "school";
  tag: "primary" | "backup_1" | "backup_2" | null;
  primaryPhone: string | null;
  secondaryPhone: string | null;
  primaryEmail: string | null;
  secondaryEmail: string | null;
};

export type AiMessage = {
  id: string;
  role: "user" | "model";
  content: string;
};

export type AdminConversationDetail = {
  handoffId: string;
  chatSessionId: string;
  studentId: string;
  studentName: string;
  studentInitials: string;
  grade: number | null;
  gradeLabel: string;
  dateOfBirth: string | null;
  email: string | null;
  homeAddress: string | null;
  school: string;
  schoolId: string | null;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  topic: string;
  reason: string;
  startedAt: string;
  aiMessages: AiMessage[];
  messages: ChatEntry[];
  coachId: string | null;
  coachName: string;
  coachInitials: string;
  emergencyContacts: EmergencyContact[];
  /** Whether the current admin has taken over this conversation */
  isTakenOver: boolean;
  hasAlert: boolean;
  safetyWorkflowActivatedAt: string | null;
  safetyWorkflowInitiatedBy: string | null;
  transferEvents: TransferEvent[];
};

export type TransferEvent = {
  id: string;
  eventType: "takeover" | "transferred";
  performedByName: string;
  transferToName: string | null;
  createdAt: string;
};

export type TransferCoach = {
  id: string;
  name: string;
  initials: string;
  activeConversations: number;
};
