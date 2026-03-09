"use client";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Form, FormDatePicker, useFormPersist } from "@/lib/extended-ui/form";
import OnboardingContainer from "../~lib/container";
import { updateBirthday } from "./action";
import { BirthdaySchema } from "./schema";

export default function BirthdayForm({
  defaultValue,
}: {
  defaultValue: BirthdaySchema;
}) {
  const router = useRouter();
  const [lastResult, action, isPending] = useActionState(updateBirthday, null);

  const [form, fields] = useForm({
    lastResult: lastResult,
    defaultValue: defaultValue,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: BirthdaySchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  useFormPersist(form);

  useEffect(() => {
    if (lastResult?.status === "success") {
      toast.success("Birthday updated");
      router.push("/onboarding/student/profile/grade");
    }
    if (lastResult?.status === "error") {
      toast.error(form.errors?.join(", ") ?? "Failed to update birthday");
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
            router.push("/onboarding/student/start");
          },
        }}
        question="When's your birthday?"
        isPending={isPending}
      >
        <FormDatePicker field={fields.birthday} label="" />
      </OnboardingContainer>
    </Form>
  );
}
