"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/lib/core-ui/dialog";
import { Button } from "@/lib/core-ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionLabel: string;
  onConfirm: () => void;
};

export function ConfirmActionModal({
  open,
  onOpenChange,
  actionLabel,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogDescription>
            Are you sure you want to {actionLabel}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
