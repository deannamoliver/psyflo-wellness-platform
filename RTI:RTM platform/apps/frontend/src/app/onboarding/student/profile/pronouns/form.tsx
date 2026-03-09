"use client";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Form, FormSelect, useFormPersist } from "@/lib/extended-ui/form";
import OnboardingContainer from "../~lib/container";
import { updatePronouns } from "./action";
import { PronounsSchema } from "./schema";

export default function PronounsForm({
  defaultValue,
}: {
  defaultValue: PronounsSchema;
}) {
  const router = useRouter();
  const [lastResult, action, isPending] = useActionState(updatePronouns, null);

  const [form, fields] = useForm({
    lastResult: lastResult,
    defaultValue: defaultValue,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: PronounsSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  useFormPersist(form);

  useEffect(() => {
    if (lastResult?.status === "success") {
      toast.success("Pronouns updated");
      router.push("/onboarding/student/profile/race");
    }
    if (lastResult?.status === "error") {
      toast.error(form.errors?.join(", ") ?? "Failed to update pronouns");
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
            router.push("/onboarding/student/profile/grade");
          },
        }}
        isPending={isPending}
        question="What are your preferred pronouns?"
      >
        <FormSelect
          field={fields.pronouns}
          label=""
          placeholder="Select pronouns"
          options={[
            { label: "she/her", value: "she/her" },
            { label: "he/him", value: "he/him" },
            { label: "they/them", value: "they/them" },
            { label: "Prefer not to answer", value: "prefer_not_to_answer" },
          ]}
        />
      </OnboardingContainer>
    </Form>
  );
}
