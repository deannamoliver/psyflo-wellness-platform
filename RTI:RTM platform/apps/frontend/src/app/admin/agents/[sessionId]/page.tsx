import { getChatSession } from "@/lib/chat/api";
import { AgentChatWithTrace } from "./agent-chat-with-trace";

export default async function AgentChatPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await getChatSession(sessionId);

  return (
    <AgentChatWithTrace
      sessionId={sessionId}
      sessionTitle={session.title}
      messages={session.messages}
    />
  );
}
