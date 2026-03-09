"use client";

import { Ban } from "lucide-react";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { BlockStudentModal } from "./block-student-modal";

type Props = {
  studentId: string;
  studentName: string;
  isBlocked: boolean;
};

export function BlockStudentButton({
  studentId,
  studentName,
  isBlocked,
}: Props) {
  const [open, setOpen] = useState(false);

  if (isBlocked) return null;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="gap-2 border-red-200 font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <Ban className="size-4" />
        Block Student
      </Button>
      <BlockStudentModal
        open={open}
        onOpenChange={setOpen}
        studentId={studentId}
        studentName={studentName}
      />
    </>
  );
}
