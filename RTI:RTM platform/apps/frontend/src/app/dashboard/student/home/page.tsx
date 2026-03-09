import { redirect } from "next/navigation";
import { getChatSessions } from "@/lib/chat/api";
import { canCheckIn } from "@/lib/check-in/server-utils";
import { getSoliStateData } from "@/lib/check-in/soli-state";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getCurrentUserInfo } from "@/lib/user/info";
import {
  getStudentAssessmentsServer,
  getStudentExercisesServer,
} from "@/app/dashboard/~lib/provider-data-actions";
import DashboardClient from "./~lib/dashboard-client";
import { ExpertTopicProvider } from "./~lib/expert-topic-context";

export default async function HomePage() {
  const checkInStatus = await canCheckIn();
  if (checkInStatus.value) {
    redirect("/check-in");
  }

  const db = await serverDrizzle();
  const userId = db.userId();

  const [userInfo, sessions, soliStateData, planExercises, assessments] =
    await Promise.all([
      getCurrentUserInfo(),
      getChatSessions(),
      getSoliStateData(),
      getStudentExercisesServer(userId),
      getStudentAssessmentsServer(userId),
    ]);

  const firstName = userInfo.firstName || "there";
  const fullName =
    `${userInfo.firstName || "User"} ${userInfo.lastName || ""}`.trim();
  const userEmail = userInfo.email || "";

  // Flatten all exercises across plans
  const todoExercises = Object.values(planExercises).flat();

  return (
    <ExpertTopicProvider>
      <div className="flex h-full w-full overflow-hidden bg-[#EDF2F9]">
        <DashboardClient
          firstName={firstName}
          fullName={fullName}
          userEmail={userEmail}
          initialSessions={sessions}
          soliStateData={soliStateData}
          todoExercises={todoExercises}
          todoAssessments={assessments}
        />
      </div>
    </ExpertTopicProvider>
  );
}
