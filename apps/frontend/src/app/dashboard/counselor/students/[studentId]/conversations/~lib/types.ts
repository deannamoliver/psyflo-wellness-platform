export type ConversationStatus = "active" | "closed";

export type DateRange = "this_week" | "this_month" | "this_year" | "all_time";

export type StatusFilter = "all" | "active" | "closed";

export type ConversationItem = {
  id: string;
  handoffId: string | null;
  title: string;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  hasSafetyAlert: boolean;
  notesCount: number;
};
