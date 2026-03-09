"use client";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Form, FormSelect, useFormPersist } from "@/lib/extended-ui/form";
import OnboardingContainer from "../~lib/container";
import { updateRace } from "./action";
import { RaceSchema } from "./schema";

export default function RaceForm({
  defaultValue,
}: {
  defaultValue: RaceSchema;
}) {
  const router = useRouter();
  const [lastResult, action, isPending] = useActionState(updateRace, null);

  const [form, fields] = useForm({
    lastResult: lastResult,
    defaultValue: defaultValue,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: RaceSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  useFormPersist(form);

  useEffect(() => {
    if (lastResult?.status === "success") {
      toast.success("Ethnicity updated");
      router.push("/onboarding/student/profile/language");
    }
    if (lastResult?.status === "error") {
      toast.error(form.errors?.join(", ") ?? "Failed to update ethnicity");
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
            router.push("/onboarding/student/profile/pronouns");
          },
        }}
        question="What is your race/ethnicity?"
        isPending={isPending}
      >
        <FormSelect
          field={fields.ethnicity}
          label=""
          placeholder="Select race/ethnicity"
          options={[
            {
              label: "American Indian or Alaska Native",
              value: "american_indian_or_alaska_native",
            },
            { label: "Asian", value: "asian" },
            {
              label: "Black or African American",
              value: "black_or_african_american",
            },
            { label: "Hispanic or Latino", value: "hispanic_or_latino" },
            {
              label: "Middle Eastern or North African",
              value: "middle_eastern_or_north_african",
            },
            {
              label: "Native Hawaiian or Pacific Islander",
              value: "native_hawaiian_or_pacific_islander",
            },
            { label: "White", value: "white" },
            { label: "Prefer not to answer", value: "prefer_not_to_answer" },
          ]}
        />
      </OnboardingContainer>
    </Form>
  );
}
