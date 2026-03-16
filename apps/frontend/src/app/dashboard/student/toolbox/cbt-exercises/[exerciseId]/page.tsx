"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import { getCbtExercise } from "@/components/exercises/cbt/types";
import { ThoughtFlip } from "@/components/exercises/cbt/thought-flip";
import { MoodBoost } from "@/components/exercises/cbt/mood-boost";
import type { CbtExerciseResult } from "@/components/exercises/cbt/types";

export default function CbtExercisePage() {
  const params = useParams();
  const router = useRouter();
  const exerciseId = params["exerciseId"] as string;
  const config = getCbtExercise(exerciseId);

  const handleComplete = useCallback(
    (result: CbtExerciseResult) => {
      console.log("Exercise completed:", result);
      router.push("/dashboard/student/toolbox/cbt-exercises");
    },
    [router],
  );

  const handleExit = useCallback(() => {
    router.push("/dashboard/student/toolbox/cbt-exercises");
  }, [router]);

  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-gray-500 text-sm">Exercise not found</p>
          <button
            type="button"
            onClick={() => router.push("/dashboard/student/toolbox/cbt-exercises")}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Back to exercises
          </button>
        </div>
      </div>
    );
  }

  if (config.id === "thought-flip") {
    return <ThoughtFlip onComplete={handleComplete} onExit={handleExit} />;
  }

  if (config.id === "mood-boost") {
    return <MoodBoost onComplete={handleComplete} onExit={handleExit} />;
  }

  return null;
}
