import { getChatSessions } from "@/lib/chat/api";
import ChatSessionsSidebar from "@/lib/chat/chat-sessions-sidebar";
import { createNewSessionAction } from "./actions";

export default async function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessions = await getChatSessions();

  return (
    <div className="flex h-full gap-4">
      <div className="flex-[3]">{children}</div>
      <ChatSessionsSidebar
        sessions={sessions}
        basePath="/admin/agents"
        createAction={createNewSessionAction}
        emptyMessage="No chat sessions yet. Click + to start testing!"
        className="h-[calc(100vh-16rem)] flex-[1]"
      />
    </div>
  );
}
