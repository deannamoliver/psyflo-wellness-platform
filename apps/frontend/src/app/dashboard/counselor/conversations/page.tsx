import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/lib/core-ui/skeleton";
import {
  PageContainer,
  PageContent,
  PageSubtitle,
  PageTitle,
} from "@/lib/extended-ui/page";
import { ConversationsClient } from "./~lib/conversations-client";
import { ConversationsSummaryCards } from "./~lib/conversations-summary-cards";
import { fetchConversations } from "./~lib/data";

const EMPTY_SUMMARY = {
  active: 0,
  needsCoachReply: 0,
  waitingOnStudent: 0,
  closed: 0,
};

async function ConversationsData() {
  const result = await fetchConversations();
  if (!result) notFound();

  return (
    <>
      <ConversationsSummaryCards summary={result.summary} />
      <ConversationsClient
        conversations={result.conversations}
        schools={result.schools}
      />
    </>
  );
}

export default function ConversationsPage() {
  return (
    <PageContainer>
      <PageContent className="space-y-6">
        <div>
          <PageTitle className="font-semibold">Messages</PageTitle>
          <PageSubtitle>
            Manage patient communications and between-session support.
          </PageSubtitle>
        </div>
        <Suspense
          fallback={
            <>
              <ConversationsSummaryCards summary={EMPTY_SUMMARY} />
              <Skeleton className="h-96 w-full bg-white/50" />
            </>
          }
        >
          <ConversationsData />
        </Suspense>
      </PageContent>
    </PageContainer>
  );
}
