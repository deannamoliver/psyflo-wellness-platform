"server-only";

import { TZDate } from "@date-fns/tz";
import { differenceInCalendarDays, startOfDay } from "date-fns";
import { getUserTimezone } from "@/lib/user/server-utils";
import { getLastCheckInTime } from "./server-utils";
import { getCheckInStreak } from "./streak";

export type SoliState = "thriving" | "happy" | "okay" | "lonely" | "sleepy";

export interface SoliStateData {
  state: SoliState;
  statusText: string;
  secondaryText: string;
  streak: number;
  daysSinceCompletion: number;
  energyPercent: number;
  heartCount: number;
  completedToday: boolean;
}

const STATE_COPY: Record<
  SoliState,
  { statusText: string; secondaryText: string | ((streak: number) => string) }
> = {
  thriving: {
    statusText: "Soli is thriving!",
    secondaryText: (streak) => `You're on a ${streak}-day streak 🔥`,
  },
  happy: {
    statusText: "Soli is feeling good!",
    secondaryText: "You completed everything today!",
  },
  okay: {
    statusText: "Soli is waiting for you",
    secondaryText: "Uh oh..it's been a few days",
  },
  lonely: {
    statusText: "Soli misses you",
    secondaryText: "It's been a while",
  },
  sleepy: {
    statusText: "Soli fell asleep",
    secondaryText: "Let's wake up Soli!",
  },
};

function getEnergyAndHearts(daysSince: number): {
  energyPercent: number;
  heartCount: number;
} {
  if (daysSince === 0) return { energyPercent: 100, heartCount: 5 };
  if (daysSince === 1) return { energyPercent: 85, heartCount: 4 };
  if (daysSince === 2) return { energyPercent: 65, heartCount: 3 };
  if (daysSince <= 4) return { energyPercent: 40, heartCount: 2 };
  if (daysSince === 5) return { energyPercent: 20, heartCount: 1 };
  return { energyPercent: 0, heartCount: 0 };
}

function determineState(
  completedToday: boolean,
  streak: number,
  daysSince: number,
): SoliState {
  if (completedToday) {
    return streak >= 3 ? "thriving" : "happy";
  }
  if (daysSince <= 2) return "okay";
  if (daysSince <= 5) return "lonely";
  return "sleepy";
}

export async function getSoliStateData(): Promise<SoliStateData> {
  const [lastCheckInTime, streak, userTimezone] = await Promise.all([
    getLastCheckInTime(),
    getCheckInStreak(),
    getUserTimezone(),
  ]);

  // New user edge case
  if (lastCheckInTime === null) {
    return {
      state: "happy",
      statusText: STATE_COPY.happy.statusText,
      secondaryText:
        typeof STATE_COPY.happy.secondaryText === "function"
          ? STATE_COPY.happy.secondaryText(1)
          : STATE_COPY.happy.secondaryText,
      streak: 1,
      daysSinceCompletion: 0,
      energyPercent: 100,
      heartCount: 5,
      completedToday: true,
    };
  }

  const nowInUserTZ = new TZDate(new Date(), userTimezone);
  const lastCheckInUserTZ = new TZDate(lastCheckInTime, userTimezone);

  const todayStart = startOfDay(nowInUserTZ);
  const lastCheckInDay = startOfDay(lastCheckInUserTZ);

  const daysSinceCompletion = differenceInCalendarDays(
    todayStart,
    lastCheckInDay,
  );
  const completedToday = daysSinceCompletion === 0;

  const state = determineState(completedToday, streak, daysSinceCompletion);
  const { energyPercent, heartCount } = getEnergyAndHearts(daysSinceCompletion);

  const stateCopy = STATE_COPY[state];
  const secondaryText =
    typeof stateCopy.secondaryText === "function"
      ? stateCopy.secondaryText(streak)
      : stateCopy.secondaryText;

  return {
    state,
    statusText: stateCopy.statusText,
    secondaryText,
    streak,
    daysSinceCompletion,
    energyPercent,
    heartCount,
    completedToday,
  };
}
