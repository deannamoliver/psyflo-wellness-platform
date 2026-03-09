/**
 * Shared chat types used across student chat and admin agent testing
 */

export type Session = {
  id: string;
  title: string;
  hasUnread?: boolean;
};

export type Message = {
  id: string;
  content: string;
  role: "user" | "model";
};

export type WellnessCoachMessage = {
  id: string;
  content: string;
  author: "student" | "coach";
};

export type MessageRequest = {
  message: string;
};

/**
 * Execution trace types for visualizing LangGraph node execution
 * Re-exported from trace-history for convenience
 */
export type {
  ConversationTurn,
  ExecutionNode,
  ExecutionTrace,
} from "@/lib/langgraph/trace-history";
