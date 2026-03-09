"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  ResolveAlertModal,
  type ResolveAlertStudentInfo,
} from "@/lib/alerts/resolve-alert-modal";
import { Button } from "@/lib/core-ui/button";
import { changeStudentAlertsStatusAction } from "@/lib/student-alerts/actions";

export function AlertTimelineActions({
  studentId,
  unresolvedAlertIds,
  student,
}: {
  studentId: string;
  unresolvedAlertIds: string[];
  student: ResolveAlertStudentInfo;
}) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [resolveOpen, setResolveOpen] = useState(false);

  const handleBulkAction = async (
    status: "in_progress" | "resolved",
    action: string,
  ) => {
    setLoadingAction(action);
    try {
      await changeStudentAlertsStatusAction({ studentId, status });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => handleBulkAction("in_progress", "mark_all_review")}
        disabled={loadingAction !== null}
      >
        {loadingAction === "mark_all_review" && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Mark All in Review
      </Button>
      <Button
        onClick={() => setResolveOpen(true)}
        disabled={loadingAction !== null || unresolvedAlertIds.length === 0}
        className="bg-green-600 text-white hover:bg-green-700"
      >
        Resolve All
      </Button>

      <ResolveAlertModal
        open={resolveOpen}
        onOpenChange={setResolveOpen}
        alertIds={unresolvedAlertIds}
        student={student}
      />
    </div>
  );
}
