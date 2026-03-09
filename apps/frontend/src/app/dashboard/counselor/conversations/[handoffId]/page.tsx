import { notFound } from "next/navigation";
import { fmtUserName } from "@/lib/string-utils";
import { getCurrentUserInfo } from "@/lib/user/info";
import { ConversationDetailView } from "./~lib/conversation-detail";
import {
  fetchActiveSafetyWorkflow,
  fetchConversationDetail,
  fetchInboxConversations,
} from "./~lib/data";
import { fetchTransferCandidates } from "./~lib/data-transfer-coaches";

type PageProps = {
  params: Promise<{ handoffId: string }>;
};

export default async function ConversationDetailPage({ params }: PageProps) {
  const { handoffId } = await params;

  const [conversation, inboxConversations, userInfo, coaches] =
    await Promise.all([
      fetchConversationDetail(handoffId),
      fetchInboxConversations(),
      getCurrentUserInfo(),
      fetchTransferCandidates(),
    ]);

  if (!conversation) notFound();

  const activeWorkflow = await fetchActiveSafetyWorkflow(
    handoffId,
    conversation.studentName,
    conversation.gradeLabel,
  );

  const coachName = fmtUserName(userInfo);

  return (
    <ConversationDetailView
      conversation={conversation}
      inboxConversations={inboxConversations}
      coachName={coachName}
      activeWorkflow={activeWorkflow}
      coaches={coaches}
    />
  );
}
