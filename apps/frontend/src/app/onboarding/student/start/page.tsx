import Link from "next/link";
import { Button } from "@/lib/core-ui/button";
import { H2, P } from "@/lib/core-ui/typography";
import Mood from "@/lib/emotion/mood";

export default function StudentOnboardingStart() {
  return (
    <div className="h-screen p-16">
      <div className="relative flex h-full flex-col items-center justify-center rounded-lg border border-gray-200">
        <div className="absolute top-12 left-12 cursor-pointer font-bold text-2xl text-primary">
          feelwell
        </div>
        <div className="flex flex-col items-center">
          <Mood mood="surprised" withShadow={true} />
          <H2 className="mt-7 text-center text-gray-500">Almost there!</H2>
          <P className="mt-3 rounded-full bg-accent px-4 py-3 text-center text-accent-foreground">
            We&apos;re going to ask you a few questions to customize your
            experience!
          </P>
          <Button asChild className="mt-6">
            <Link href="/onboarding/student/profile/birthday">Get started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
