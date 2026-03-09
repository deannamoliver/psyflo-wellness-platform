/**
 * Shared quick response pills for mobile dashboard and mobile chat.
 * Used on the dashboard (start chat) and in the chat view (suggested replies).
 */
export const MOBILE_QUICK_RESPONSES = [
  {
    text: "I'm overwhelmed",
    color: "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100",
  },
  {
    text: "I need friendship advice",
    color: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
  },
  {
    text: "Dealing with emotions",
    color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
  },
  {
    text: "I am having a conflict",
    color: "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100",
  },
] as const;
