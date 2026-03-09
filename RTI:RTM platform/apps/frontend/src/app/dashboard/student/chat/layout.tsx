import { getChatSessions } from "@/lib/chat/api";
import ChatSessionsSidebar from "@/lib/chat/chat-sessions-sidebar";
import { P } from "@/lib/core-ui/typography";
import { PageContainer, PageContent } from "@/lib/extended-ui/page";
import { createNewSession } from "./actions";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessions = await getChatSessions();

  return (
    <PageContainer>
      <PageContent size="wide" className="flex h-full flex-col">
        <div className="mb-4 flex-shrink-0 rounded-lg border border-primary/50 bg-primary/20 p-4">
          <P className="text-sm">
            Your parents, teachers, and counselors can't see what we chat about.
            I'll only message your school counselor if you tell me about harming
            yourself, others, or abuse.
          </P>
        </div>
        <div className="flex h-[calc(100vh-10rem)] gap-4">
          {children}
          <ChatSessionsSidebar
            sessions={sessions}
            basePath="/dashboard/student/chat"
            createAction={createNewSession}
            emptyMessage="You have no chat sessions. Start a session and try it out!"
            className="w-72 flex-shrink-0 border-r"
          />
        </div>
      </PageContent>
    </PageContainer>
  );
}
