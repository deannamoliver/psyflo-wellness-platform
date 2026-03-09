import { profiles } from "@feelwell/database";
import { redirect } from "next/navigation";
import { Button } from "@/lib/core-ui/button";
import { H2, P } from "@/lib/core-ui/typography";
import { serverDrizzle } from "@/lib/database/drizzle";
import Mood from "@/lib/emotion/mood";
import { createAllScreeners } from "@/lib/screener/service/create";

export default function StudentOnboardingComplete() {
  async function handleComplete() {
    "use server";

    const db = await serverDrizzle();

    await createAllScreeners({ studentId: db.userId(), startAt: new Date() });

    await db.rls(async (tx) =>
      tx.update(profiles).set({
        onboardingCompletedAt: new Date(),
      }),
    );

    redirect("/dashboard");
  }

  return (
    <div className="h-screen p-16">
      <div className="relative flex h-full flex-col items-center justify-center rounded-lg border border-gray-200">
        <div className="absolute top-12 left-12 cursor-pointer font-bold text-2xl text-primary">
          feelwell
        </div>
        <div className="flex flex-col items-center">
          <Mood mood="surprised" withShadow={true} />
          <H2 className="mt-7 text-center text-gray-500">
            You&apos;re all set!
          </H2>
          <P className="mt-3 rounded-full bg-accent px-4 py-3 text-center text-accent-foreground">
            Your space is being prepped. Let&apos;s check in and take on today
            together.
          </P>
          <Button className="mt-6" onClick={handleComplete}>
            Go to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
