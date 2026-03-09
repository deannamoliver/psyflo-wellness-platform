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
import { updateLearningStyle } from "./action";
import { LearningStyleSchema } from "./schema";

const learningStyleOptions = [
  {
    id: "reading",
    label: "📖 Reading about it (articles, books)",
  },
  {
    id: "watching-videos",
    label: "🎬 Watching videos (YouTube, tutorials)",
  },
  {
    id: "listening-audio",
    label: "🎧 Listening to podcasts or audio",
  },
  {
    id: "taking-notes",
    label: "✍️ Writing things down / Taking notes",
  },
  {
    id: "hands-on",
    label: "🎮 Doing hands-on activities / Trying it myself",
  },
  {
    id: "talking-through",
    label: "💬 Talking it through with someone",
  },
  {
    id: "interactive-tools",
    label: "📱 Using interactive tools / Apps",
  },
];

export default function LearningStyleForm({
  defaultValue,
}: {
  defaultValue: LearningStyleSchema;
}) {
  const router = useRouter();
  const [lastResult, action, isPending] = useActionState(
    updateLearningStyle,
    null,
  );

  const [form, fields] = useForm({
    lastResult: lastResult,
    defaultValue: defaultValue,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LearningStyleSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  useFormPersist(form);

  useEffect(() => {
    if (lastResult?.status === "success") {
      toast.success("Learning style updated");
      router.push("/onboarding/student/profile/personal-goals");
    }
    if (lastResult?.status === "error") {
      toast.error(form.errors?.join(", ") ?? "Failed to update learning style");
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
            router.push("/onboarding/student/profile/interest");
          },
        }}
        question="How do you usually like to learn new things?"
        isPending={isPending}
      >
        <div className="grid w-full max-w-5xl grid-cols-2 gap-8 p-6">
          {learningStyleOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-start space-x-3 space-y-0"
            >
              <Checkbox
                id={`${fields.learningStyle.id}-${option.id}`}
                name={fields.learningStyle.name}
                value={option.id}
                defaultChecked={fields.learningStyle.defaultOptions?.includes(
                  option.id,
                )}
                aria-describedby={
                  !fields.learningStyle.valid
                    ? fields.learningStyle.errorId
                    : undefined
                }
              />
              <Label
                htmlFor={`${fields.learningStyle.id}-${option.id}`}
                className="text-lg"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
        <div className="p-6 text-destructive text-sm">
          {form.allErrors["learningStyle"]?.join(", ")}
        </div>
      </OnboardingContainer>
    </Form>
  );
}
