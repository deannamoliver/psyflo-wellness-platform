import { TZDate } from "@date-fns/tz";
import { isBefore } from "date-fns";
import { Star } from "lucide-react";
import { Small } from "@/lib/core-ui/typography";
import { getCurrUserOngoingResponses } from "@/lib/screener/data";
import { getUserTimezone } from "@/lib/user/server-utils";
import HitListItem from "./item";
import AvailabilityTimer from "./timer";

function AvailabilityStatus({
  nextAvailableTime,
  userTimezone,
}: {
  nextAvailableTime: Date;
  userTimezone: string;
}) {
  if (
    isBefore(
      new TZDate(new Date(), userTimezone),
      new TZDate(nextAvailableTime, userTimezone),
    )
  ) {
    return (
      <AvailabilityTimer
        nextAvailableTime={nextAvailableTime}
        preText="Next Wellness Check Available In"
      />
    );
  }

  return "How are you feeling right now?";
}

export default async function WellnessCheckHitListItem({
  completedToday = false,
}: {
  completedToday?: boolean;
} = {}) {
  if (completedToday) {
    return (
      <HitListItem
        icon="/home/wellness-check-icon.png"
        title="Wellness Check"
        subtitle="Completed for today"
        time="2-3 min"
        completed
        footer={
          <div className="flex items-center gap-1">
            <Star fill="currentColor" className="h-4 w-4 text-orange-400" />
            <Small className="text-orange-400 text-sm sm:text-base">
              Personalized
            </Small>
          </div>
        }
      />
    );
  }

  const [ongoingResponses, userTimezone] = await Promise.all([
    getCurrUserOngoingResponses(),
    getUserTimezone(),
  ]);

  const firstUnansweredResponse = ongoingResponses[0];

  if (ongoingResponses.length === 0) {
    return null;
  }

  return (
    <HitListItem
      icon="/home/wellness-check-icon.png"
      title="Wellness Check"
      subtitle={
        firstUnansweredResponse ? (
          <AvailabilityStatus
            nextAvailableTime={firstUnansweredResponse.startAt}
            userTimezone={userTimezone}
          />
        ) : (
          "Will be available soon"
        )
      }
      time="2-3 min"
      footer={
        <div className="flex items-center gap-1">
          <Star fill="currentColor" className="h-4 w-4 text-orange-400" />
          <Small className="text-orange-400 text-sm sm:text-base">
            Personalized
          </Small>
        </div>
      }
      disabled={!firstUnansweredResponse}
    />
  );
}
