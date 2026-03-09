import AIChat from "@/lib/chat/ai-chat";
import { getChatSession, markSessionAsRead } from "@/lib/chat/api";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const [session] = await Promise.all([
    getChatSession(sessionId),
    markSessionAsRead(sessionId),
  ]);

  return (
    <AIChat
      sessionId={sessionId}
      sessionTitle={session.title}
      messages={session.messages}
      statusMessage="Online and ready to chat"
      placeholder="Tell me anything"
      className="h-full min-h-0 flex-1"
    />
  );
}
