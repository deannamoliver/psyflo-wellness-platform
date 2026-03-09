/**
 * Shared chat library for student chat and admin agent testing
 *
 * This module provides reusable components, utilities, and types
 * for both the student chat interface and admin agent testing interface.
 */

export { default as AIChat } from "./ai-chat";
// API functions
export {
  createChatSession,
  getChatSession,
  getChatSessions,
  getExecutionTrace,
  sendMessage,
  updateSessionTitle,
} from "./api";

// Components
export { default as ChatSessionItem } from "./chat-session-item";
export { default as ChatSessionsSidebar } from "./chat-sessions-sidebar";
// Types
export type {
  ConversationTurn,
  ExecutionNode,
  ExecutionTrace,
  Message,
  MessageRequest,
  Session,
} from "./types";
