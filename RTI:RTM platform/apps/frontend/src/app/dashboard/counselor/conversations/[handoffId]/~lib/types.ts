export type ConversationStatus =
  | "needs_coach_reply"
  | "waiting_on_student"
  | "closed"
  | "transferred";

export type ChatEntry = {
  id: string;
  content: string;
  author: "student" | "coach";
  createdAt: string;
  senderInitials: string;
};

export type AiMessage = {
  id: string;
  role: "user" | "model";
  content: string;
};

export type TransferCoach = {
  id: string;
  name: string;
  initials: string;
  activeConversations: number;
};

export type ConversationDetail = {
  handoffId: string;
  chatSessionId: string;
  studentId: string;
  studentName: string;
  studentInitials: string;
  studentCode: string;
  grade: number | null;
  gradeLabel: string;
  dateOfBirth: string | null;
  email: string | null;
  homeAddress: string | null;
  school: string;
  schoolId: string | null;
  status: ConversationStatus;
  topic: string;
  reason: string;
  startedAt: string;
  aiMessages: AiMessage[];
  messages: ChatEntry[];
  /** Present when status is "closed" */
  closedAt: string | null;
  closedByName: string | null;
  /** Present when status is "transferred" */
  transferredAt: string | null;
  transferredToCoachId: string | null;
  transferredToCoachName: string | null;
  transferredToCoachInitials: string | null;
  /** Whether the current viewer is the assigned coach */
  isAssignedCoach: boolean;
  /** Has an active alert (risk flag) */
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

export type InboxItem = {
  id: string;
  studentName: string;
  status: ConversationStatus;
  lastMessageAt: string;
};
