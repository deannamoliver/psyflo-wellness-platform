"use client";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/lib/core-ui/checkbox";
import { Label } from "@/lib/core-ui/label";
import { Form, useFormPersist } from "@/lib/extended-ui/form";
import OnboardingContainer from "../~lib/container";
import { updatePersonalGoals } from "./action";
import { PersonalGoalsSchema } from "./schema";

const personalGoalsOptions = [
  {
    id: "school-performance",
    label: "📚 Doing better in school",
  },
  {
    id: "making-friends",
    label: "🤝 Making friends or feeling more connected",
  },
  {
    id: "emotional-wellbeing",
    label: "🧠 Understanding my feelings / Managing stress",
  },
  {
    id: "health-fitness",
    label: "💪 Getting healthier or more active",
  },
  {
    id: "confidence",
    label: "✨ Feeling more confident",
  },
  {
    id: "new-experiences",
    label: "🎯 Trying something new (hobby, skill, or tech)",
  },
  {
    id: "life-balance",
    label: "⚖️ Finding balance in life",
  },
  {
    id: "something-else",
    label: "🌟 Something else!",
  },
];

export default function PersonalGoalsForm({
  defaultValue,
}: {
  defaultValue: PersonalGoalsSchema;
}) {
  const router = useRouter();
  const [lastResult, action, isPending] = useActionState(
    updatePersonalGoals,
    null,
  );

  const [form, fields] = useForm({
    lastResult: lastResult,
    defaultValue: defaultValue,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: PersonalGoalsSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  useFormPersist(form);

  useEffect(() => {
    if (lastResult?.status === "success") {
      toast.success("Personal goals updated");
      router.push("/onboarding/student/complete");
    }
    if (lastResult?.status === "error") {
      toast.error(form.errors?.join(", ") ?? "Failed to update personal goals");
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
            router.push("/onboarding/student/profile/learning-style");
          },
        }}
        question="What's one thing you're excited about achieving soon (big or small)?"
        isPending={isPending}
      >
        <div className="grid w-full max-w-5xl grid-cols-2 gap-8 p-6">
          {personalGoalsOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-start space-x-3 space-y-0"
            >
              <Checkbox
                id={`${fields.personalGoals.id}-${option.id}`}
                name={fields.personalGoals.name}
                value={option.id}
                defaultChecked={fields.personalGoals.defaultOptions?.includes(
                  option.id,
                )}
                aria-describedby={
                  !fields.personalGoals.valid
                    ? fields.personalGoals.errorId
                    : undefined
                }
              />
              <Label
                htmlFor={`${fields.personalGoals.id}-${option.id}`}
                className="text-lg"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
        <div className="p-6 text-destructive text-sm">
          {form.allErrors["personalGoals"]?.join(", ")}
        </div>
      </OnboardingContainer>
    </Form>
  );
}
