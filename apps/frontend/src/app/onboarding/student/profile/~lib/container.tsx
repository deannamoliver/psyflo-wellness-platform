import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/lib/core-ui/button";
import { H4, Muted } from "@/lib/core-ui/typography";
import Mood from "@/lib/emotion/mood";

type NextButtonProps = React.ComponentProps<typeof Button> & {
  isPending?: boolean;
};

function NextButton({ isPending, ...props }: NextButtonProps) {
  return (
    <Button {...props} type="submit">
      Next
      <ArrowRight className="h-4 w-4" />
      {isPending && <Loader2 className="h-4 w-4" />}
    </Button>
  );
}

function PreviousButton(props: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="link"
      className="hover:no-underline"
      type="button"
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      Previous
    </Button>
  );
}

type Props = {
  nextButtonProps?: React.ComponentProps<typeof NextButton>;
  previousButtonProps?: React.ComponentProps<typeof PreviousButton>;
  children: React.ReactNode;
  question: string;
  isPending?: boolean;
};

export default function OnboardingContainer({
  nextButtonProps,
  previousButtonProps,
  children,
  question,
  isPending,
}: Props) {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex w-full flex-1 items-center justify-center px-16 pt-16 pb-12">
        <div className="w-full rounded-2xl bg-card p-4">
          <div className="flex h-36 items-center justify-center">
            <div className="relative flex h-20 w-md flex-col items-center justify-center rounded-2xl rounded-bl-none bg-white">
              <div className="-left-20 absolute top-2">
                <Mood mood="calm" withShadow={false} />
              </div>
              <Muted className="text-center">Tell me about yourself</Muted>
              <H4 className="text-center">{question}</H4>
            </div>
          </div>
          <div className="flex h-full min-h-52 w-full flex-col items-center justify-center rounded-b-2xl bg-white">
            {children}
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-between px-16 py-4">
        <PreviousButton disabled={isPending} {...previousButtonProps} />
        <NextButton
          isPending={isPending}
          disabled={isPending}
          {...nextButtonProps}
        />
      </div>
    </div>
  );
}
