"use client";

import { useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { ReferTherapistModal, type StudentInfo } from "./refer-therapist-modal";

export function ReferTherapistButton({
  student,
  disabled,
}: {
  student: StudentInfo;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="bg-primary font-medium text-primary-foreground hover:bg-primary/90"
      >
        Refer to a Therapist
      </Button>
      <ReferTherapistModal
        open={open}
        onOpenChange={setOpen}
        student={student}
      />
    </>
  );
}
