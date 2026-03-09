import { Suspense } from "react";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { ConversationsClient } from "./~lib/conversations-client";
import { fetchAdminConversations } from "./~lib/data";

async function ConversationsData() {
  const data = await fetchAdminConversations();

  return (
    <ConversationsClient
      liveSessions={data.liveSessions}
      historySessions={data.historySessions}
      organizations={data.organizations}
      locations={data.locations}
      coaches={data.coaches}
    />
  );
}

export default function ConversationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 p-8 font-dm">
          <div>
            <Skeleton className="h-9 w-64 bg-gray-200" />
            <Skeleton className="mt-2 h-5 w-96 bg-gray-100" />
          </div>
          <Skeleton className="h-10 w-80 bg-gray-100" />
          <Skeleton className="h-32 w-full bg-gray-100" />
          <Skeleton className="h-96 w-full bg-gray-100" />
        </div>
      }
    >
      <ConversationsData />
    </Suspense>
  );
}
