import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { fmtUserName } from "@/lib/string-utils";
import { getCurrentUserInfo } from "@/lib/user/info";
import { AdminConversationDetailView } from "./~lib/admin-conversation-detail";
import {
  fetchAdminActiveSafetyWorkflow,
  fetchAdminConversationDetail,
  fetchAdminTransferCandidates,
} from "./~lib/data";

type PageProps = {
  params: Promise<{ handoffId: string }>;
};

async function ConversationData({ handoffId }: { handoffId: string }) {
  const [conversation, userInfo] = await Promise.all([
    fetchAdminConversationDetail(handoffId),
    getCurrentUserInfo(),
  ]);

  if (!conversation) notFound();

  const [coaches, activeWorkflow] = await Promise.all([
    fetchAdminTransferCandidates(conversation.schoolId),
    fetchAdminActiveSafetyWorkflow(
      handoffId,
      conversation.studentName,
      conversation.gradeLabel,
    ),
  ]);

  const adminName = fmtUserName(userInfo);

  return (
    <AdminConversationDetailView
      conversation={conversation}
      coaches={coaches}
      activeWorkflow={activeWorkflow}
      coachName={adminName}
    />
  );
}

export default async function AdminConversationDetailPage({
  params,
}: PageProps) {
  const { handoffId } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4 p-8 font-dm">
          <Skeleton className="h-8 w-48 bg-gray-200" />
          <Skeleton className="h-24 w-full bg-gray-100" />
          <Skeleton className="h-[60vh] w-full bg-gray-100" />
        </div>
      }
    >
      <ConversationData handoffId={handoffId} />
    </Suspense>
  );
}
