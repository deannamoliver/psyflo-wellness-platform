"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/lib/core-ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/lib/core-ui/dialog";
import { deactivateUsers } from "./deactivate-users-action";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userIds: string[];
  onComplete: () => void;
};

export function DeactivateUsersModal({
  open,
  onOpenChange,
  userIds,
  onComplete,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const count = userIds.length;

  function handleConfirm() {
    startTransition(async () => {
      await deactivateUsers(userIds);
      onOpenChange(false);
      onComplete();
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-white font-dm">
        <DialogHeader>
          <DialogTitle className="font-semibold text-gray-900 text-lg">
            Are you sure you want to deactivate{" "}
            {count === 1 ? "this user" : `${count} users`}?
          </DialogTitle>
        </DialogHeader>

        <p className="text-gray-500 text-sm">
          {count === 1
            ? "This user will be marked as inactive and will no longer have access to the platform."
            : `These ${count} users will be marked as inactive and will no longer have access to the platform.`}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="border-gray-200 bg-white font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending}
            className="gap-2 bg-gray-900 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {isPending ? "Processing..." : "Yes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
