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
import { updateInterests } from "./action";
import { InterestsSchema } from "./schema";

const interestOptions = [
  {
    id: "gaming",
    label: "Gaming (console, PC, mobile)",
  },
  {
    id: "sports",
    label: "Sports (playing, watching, following teams)",
  },
  {
    id: "art",
    label: "Art & Creativity (drawing, painting, design, crafts)",
  },
  {
    id: "music",
    label: "Music (listening, playing instruments, singing)",
  },
  {
    id: "reading",
    label: "Reading & Writing (books, fanfic, poetry, journaling)",
  },
  {
    id: "fashion",
    label: "Fashion & Style",
  },
  {
    id: "social-media",
    label: "Social Media (TikTok, Instagram, Snapchat, etc.)",
  },
  {
    id: "movies",
    label: "Movies & TV Shows",
  },
  {
    id: "outdoors",
    label: "Outdoors & Nature (hiking, camping, exploring)",
  },
  {
    id: "tech",
    label: "Tech & Coding",
  },
  {
    id: "science",
    label: "Science & Discovery",
  },
  {
    id: "travel",
    label: "Travel & Culture",
  },
  {
    id: "chilling",
    label: "Just chilling / Hanging with friends",
  },
];

export default function InterestsForm({
  defaultValue,
}: {
  defaultValue: InterestsSchema;
}) {
  const router = useRouter();
  const [lastResult, action, isPending] = useActionState(updateInterests, null);

  const [form, fields] = useForm({
    lastResult: lastResult,
    defaultValue: defaultValue,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: InterestsSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  useFormPersist(form);

  useEffect(() => {
    if (lastResult?.status === "success") {
      toast.success("Interests updated");
      router.push("/onboarding/student/profile/learning-style");
    }
    if (lastResult?.status === "error") {
      toast.error(form.errors?.join(", ") ?? "Failed to update interests");
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
            router.push("/onboarding/student/profile/language");
          },
        }}
        isPending={isPending}
        question="What are you interested in?"
      >
        <div className="grid w-full max-w-5xl grid-cols-3 gap-8 p-6">
          {interestOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-start space-x-3 space-y-0"
            >
              <Checkbox
                id={`${fields.interests.id}-${option.id}`}
                name={fields.interests.name}
                value={option.id}
                defaultChecked={fields.interests.defaultOptions?.includes(
                  option.id,
                )}
                aria-describedby={
                  !fields.interests.valid ? fields.interests.errorId : undefined
                }
              />
              <Label
                htmlFor={`${fields.interests.id}-${option.id}`}
                className="text-lg"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
        <div className="p-6 text-destructive text-sm">
          {form.allErrors["interests"]?.join(", ")}
        </div>
      </OnboardingContainer>
    </Form>
  );
}
