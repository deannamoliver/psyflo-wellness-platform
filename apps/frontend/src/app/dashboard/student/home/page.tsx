import type { SoliStateData } from "@/lib/check-in/soli-state";
import DashboardClient from "./~lib/dashboard-client";

export default async function HomePage() {
  // Demo data - no authentication required
  const firstName = "Demo";
  const fullName = "Demo Patient";
  const userEmail = "demo@example.com";

  const sessions: { id: string; title: string; hasUnread?: boolean }[] = [];
  const soliStateData: SoliStateData = {
    state: "happy",
    streak: 7,
    statusText: "You are thriving!",
    secondaryText: "Keep up the great work!",
    daysSinceCompletion: 0,
    energyPercent: 100,
    heartCount: 5,
    completedToday: true,
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#EDF2F9]">
      <DashboardClient
        firstName={firstName}
        fullName={fullName}
        userEmail={userEmail}
        initialSessions={sessions}
        soliStateData={soliStateData}
      />
    </div>
  );
}
