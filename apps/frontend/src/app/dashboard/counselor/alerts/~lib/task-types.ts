export type TaskPriority = "urgent" | "high" | "medium" | "low";
export type TaskStatus = "todo" | "done";
export type CreatedBy = "system" | "you";

export type Task = {
  id: string;
  patientId: string;
  patientName: string;
  patientCode?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdBy: CreatedBy;
  source?: "safety_alert" | "manual";
  sourceAlertId?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  assignedTo?: string;
  notes?: string;
};

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; bg: string; text: string; dot: string }> = {
  urgent: { label: "Urgent", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-600" },
  high: { label: "High", bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-600" },
  medium: { label: "Medium", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-600" },
  low: { label: "Low", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-600" },
};

export const STATUS_CONFIG: Record<TaskStatus, { label: string; bg: string; text: string; dot: string }> = {
  todo: { label: "To Do", bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" },
  done: { label: "Done", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-600" },
};

export const CREATED_BY_CONFIG: Record<CreatedBy, { label: string; bg: string; text: string }> = {
  system: { label: "System", bg: "bg-purple-100", text: "text-purple-700" },
  you: { label: "You", bg: "bg-blue-100", text: "text-blue-700" },
};
