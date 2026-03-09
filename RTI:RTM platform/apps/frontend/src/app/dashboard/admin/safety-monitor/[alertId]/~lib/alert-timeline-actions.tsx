"use client";

import { Loader2, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { changeAlertStatusAction } from "@/lib/alerts/actions";
import {
  ResolveAlertModal,
  type ResolveAlertStudentInfo,
} from "@/lib/alerts/resolve-alert-modal";
import { Button } from "@/lib/core-ui/button";
import { cn } from "@/lib/tailwind-utils";

type Props = {
  alertId: string;
  status: string;
  student: ResolveAlertStudentInfo;
  hasConversation: boolean;
  onViewConversation: () => void;
};

export function AlertTimelineActions({
  alertId,
  status,
  student,
  hasConversation,
  onViewConversation,
}: Props) {
  const router = useRouter();
  const [resolveOpen, setResolveOpen] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [loadingAction, setLoadingAction] = useState<
    "mark_new" | "mark_in_review" | null
  >(null);
  const [expectedStatus, setExpectedStatus] = useState<
    "new" | "in_progress" | null
  >(null);

  const isInReview = status === "in_progress";
  const isResolved = status === "resolved";

  // Clear loading state when status actually changes to what we expect
  useEffect(() => {
    if (loadingAction && expectedStatus && status === expectedStatus) {
      setLoadingAction(null);
      setExpectedStatus(null);
    }
  }, [status, loadingAction, expectedStatus]);

  // Clear resolving state once the resolution is reflected
  useEffect(() => {
    if (status === "resolved") {
      setIsResolving(false);
    }
  }, [status]);

  const handleStatusChange = async (
    newStatus: "new" | "in_progress",
    actionType: "mark_new" | "mark_in_review",
  ) => {
    setLoadingAction(actionType);
    setExpectedStatus(newStatus);
    try {
      await changeAlertStatusAction({ alertId, status: newStatus });
      router.refresh();
    } catch {
      setLoadingAction(null);
      setExpectedStatus(null);
    }
  };

  const isMarkNewLoading = loadingAction === "mark_new";
  const isMarkInReviewLoading = loadingAction === "mark_in_review";

  return (
    <>
      <div className="flex items-center justify-between border-gray-200 border-t px-6 py-4">
        <div>
          {hasConversation && (
            <button
              type="button"
              onClick={onViewConversation}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 font-medium text-blue-700 text-sm hover:bg-blue-100"
            >
              <MessageSquare className="size-4" />
              View Conversation
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isInReview ? (
            <Button
              variant="outline"
              disabled={isMarkNewLoading || isResolved}
              onClick={() => handleStatusChange("new", "mark_new")}
              className={cn(
                "border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-700",
                (isMarkNewLoading || isResolved) &&
                  "cursor-not-allowed opacity-50",
              )}
            >
              {isMarkNewLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Mark New
            </Button>
          ) : (
            <Button
              disabled={isMarkInReviewLoading || isResolved}
              onClick={() =>
                handleStatusChange("in_progress", "mark_in_review")
              }
              className={cn(
                (isResolved || isMarkInReviewLoading) &&
                  "cursor-not-allowed opacity-50",
              )}
            >
              {isMarkInReviewLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Mark in Review
            </Button>
          )}
          <Button
            className={cn(
              "bg-green-600 text-white hover:bg-green-700",
              (isResolved || isResolving) && "cursor-not-allowed opacity-50",
            )}
            disabled={isResolved || isResolving}
            onClick={() => setResolveOpen(true)}
          >
            Resolve
          </Button>
        </div>
      </div>

      <ResolveAlertModal
        open={resolveOpen}
        onOpenChange={setResolveOpen}
        alertIds={[alertId]}
        student={student}
        onResolveStart={() => setIsResolving(true)}
        onResolveEnd={() => {
          setIsResolving(false);
          router.refresh();
        }}
      />
    </>
  );
}
