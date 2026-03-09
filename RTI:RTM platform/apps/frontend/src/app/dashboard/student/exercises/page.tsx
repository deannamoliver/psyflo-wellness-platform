import { serverDrizzle } from "@/lib/database/drizzle";
import {
  getStudentAssessmentsServer,
  getStudentExercisesServer,
  getStudentPlansServer,
} from "@/app/dashboard/~lib/provider-data-actions";
import { ExercisesClient } from "./~lib/exercises-client";

export default async function ExercisesPage() {
  const db = await serverDrizzle();
  const userId = db.userId();

  // Fetch provider-assigned data from the shared server-side store
  const [plans, planExercises, assessments] = await Promise.all([
    getStudentPlansServer(userId),
    getStudentExercisesServer(userId),
    getStudentAssessmentsServer(userId),
  ]);

  return (
    <ExercisesClient
      userId={userId}
      serverPlans={plans}
      serverPlanExercises={planExercises}
      serverAssessments={assessments}
    />
  );
}
