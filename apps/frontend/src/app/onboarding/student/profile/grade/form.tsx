"use client";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Form, FormSelect, useFormPersist } from "@/lib/extended-ui/form";
import OnboardingContainer from "../~lib/container";
import { updateGrade } from "./action";
import { GradeSchema } from "./schema";

export default function BirthdayForm({
  defaultValue,
}: {
  defaultValue: GradeSchema;
}) {
  const router = useRouter();
  const [lastResult, action, isPending] = useActionState(updateGrade, null);

  const [form, fields] = useForm({
    lastResult: lastResult,
    defaultValue: defaultValue,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: GradeSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  useFormPersist(form);

  useEffect(() => {
    if (lastResult?.status === "success") {
      toast.success("Grade updated");
      router.push("/onboarding/student/profile/pronouns");
    }
    if (lastResult?.status === "error") {
      toast.error(form.errors?.join(", ") ?? "Failed to update grade");
    }
  }, [lastResult, router, form.errors]);

  return (
    <Form form={form} action={action}>
      <OnboardingContainer
        nextButtonProps={{
          form: form.id,
        }}
        previousButtonProps={{
          onClick: (e) => {
            e.preventDefault();
            router.push("/onboarding/student/profile/birthday");
          },
        }}
        isPending={isPending}
        question="What is your grade level?"
      >
        <FormSelect
          field={fields.grade}
          label=""
          placeholder="Grade"
          options={Array.from({ length: 12 }, (_, i) => ({
            label: (i + 1).toString(),
            value: (i + 1).toString(),
          }))}
        />
      </OnboardingContainer>
    </Form>
  );
}
