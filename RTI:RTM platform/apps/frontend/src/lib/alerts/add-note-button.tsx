"use client";

import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { EditIcon } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { Button } from "@/lib/core-ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/core-ui/dialog";
import { Form, FormTextarea, useFormPersist } from "@/lib/extended-ui/form";
import { addAlertNoteAction } from "./actions";
import { AddNoteSchema } from "./schema";

export default function AddNoteButton({
  alertId,
  className,
}: {
  alertId: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [lastResult, action] = useActionState(addAlertNoteAction, null);

  const [form, fields] = useForm({
    lastResult,
    defaultValue: {
      alertId,
      note: "",
    },
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: AddNoteSchema }),
  });

  useFormPersist(form);

  useEffect(() => {
    if (lastResult?.status === "success") {
      setOpen(false);
    }
  }, [lastResult]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <EditIcon className="size-4" />
          Add Note
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>

        <Form form={form} action={action} className="flex flex-col gap-4">
          <input {...getInputProps(fields.alertId, { type: "hidden" })} />

          <FormTextarea
            field={fields.note}
            label="Note"
            placeholder="Enter your note here"
          />

          <div className="mt-2 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>

            <Button type="submit">Save</Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
