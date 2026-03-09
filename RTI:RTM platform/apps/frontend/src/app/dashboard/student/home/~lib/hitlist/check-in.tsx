import { canCheckIn } from "@/lib/check-in/server-utils";
import { getCheckInStreak } from "@/lib/check-in/streak";
import { Small } from "@/lib/core-ui/typography";
import HitListItem from "./item";
import AvailabilityTimer from "./timer";

export default async function CheckInHitListItem() {
  const [streak, canCheckInRes] = await Promise.all([
    getCheckInStreak(),
    canCheckIn(),
  ]);

  return (
    <HitListItem
      icon="/home/mood-check-in-icon.png"
      title="Mood Check-In"
      subtitle={
        canCheckInRes.value ? (
          "How are you feeling right now?"
        ) : (
          <AvailabilityTimer
            nextAvailableTime={canCheckInRes.nextAvailableTime}
            preText="Next Mood Check Available In"
          />
        )
      }
      time="1 min"
      disabled={!canCheckInRes.value}
      footer={
        <div className="flex items-center gap-1">
          <span className="text-orange-500">🔥</span>
          <Small className="text-blue-800 text-sm sm:text-base">
            Streak: {streak} {streak === 1 ? "day" : "days"}
          </Small>
        </div>
      }
      href="/dashboard/student/check-in"
    />
  );
}
