"use client";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Form, FormSelect, useFormPersist } from "@/lib/extended-ui/form";
import OnboardingContainer from "../~lib/container";
import { updateLanguage } from "./action";
import { LanguageSchema } from "./schema";

export default function LanguageForm({
  defaultValue,
}: {
  defaultValue: LanguageSchema;
}) {
  const router = useRouter();
  const [lastResult, action, isPending] = useActionState(updateLanguage, null);

  const [form, fields] = useForm({
    lastResult: lastResult,
    defaultValue: defaultValue,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LanguageSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  useFormPersist(form);

  useEffect(() => {
    if (lastResult?.status === "success") {
      toast.success("Language updated");
      router.push("/onboarding/student/profile/interest");
    }
    if (lastResult?.status === "error") {
      toast.error(form.errors?.join(", ") ?? "Failed to update language");
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
            router.push("/onboarding/student/profile/race");
          },
        }}
        question="What is your home language?"
        isPending={isPending}
      >
        <FormSelect
          field={fields.language}
          label=""
          placeholder="Select language"
          options={[
            { label: "English", value: "english" },
            { label: "Spanish", value: "spanish" },
            { label: "French", value: "french" },
            { label: "Chinese (Simplified)", value: "chinese_simplified" },
            { label: "Arabic", value: "arabic" },
            { label: "Haitian Creole", value: "haitian_creole" },
            { label: "Bengali", value: "bengali" },
            { label: "Russian", value: "russian" },
            { label: "Urdu", value: "urdu" },
            { label: "Vietnamese", value: "vietnamese" },
            { label: "Portuguese", value: "portuguese" },
          ]}
        />
      </OnboardingContainer>
    </Form>
  );
}
