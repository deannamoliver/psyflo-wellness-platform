"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/lib/core-ui/dialog";
import { Label } from "@/lib/core-ui/label";
import { Textarea } from "@/lib/core-ui/textarea";
import { addReferralNote } from "./referral-detail-actions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralId: string;
};

export function AddNoteModal({ open, onOpenChange, referralId }: Props) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    setError(null);
    const result = await addReferralNote(referralId, content.trim());
    setSaving(false);
    if (result.ok) {
      setContent("");
      onOpenChange(false);
    } else {
      setError(result.error ?? "Failed to add note.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white font-dm">
        <DialogHeader>
          <DialogTitle className="font-bold font-dm text-lg">
            Add Note
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div>
            <Label className="mb-1.5 font-medium text-gray-700 text-sm">
              Note
            </Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              className="min-h-[120px] resize-none text-sm"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-700"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !content.trim()}
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            Add Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
