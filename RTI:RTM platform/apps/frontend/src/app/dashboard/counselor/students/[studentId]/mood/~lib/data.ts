import type { UniversalEmotion } from "@/lib/check-in/utils";

export interface MoodCheckIn {
  id: string;
  date: Date;
  mood: UniversalEmotion;
}

export async function getMoodCheckIns(): Promise<MoodCheckIn[]> {
  return [
    {
      id: "checkin-1",
      date: new Date("2025-08-24T10:30:00"),
      mood: "happy",
    },
    {
      id: "checkin-2",
      date: new Date("2025-08-22T14:15:00"),
      mood: "angry",
    },
    {
      id: "checkin-3",
      date: new Date("2025-08-20T09:00:00"),
      mood: "sad",
    },
    {
      id: "checkin-4",
      date: new Date("2025-08-15T16:45:00"),
      mood: "angry",
    },
    {
      id: "checkin-5",
      date: new Date("2025-08-10T11:20:00"),
      mood: "bad",
    },
  ];
}

export type WellnessStats = {
  currentMood: string;
  currentMoodDate: Date;
  checkIns: number;
  longestStreak: number;
  mostCommonMood: string;
};

export async function getWellnessStats(): Promise<WellnessStats> {
  return {
    currentMood: "Happy",
    currentMoodDate: new Date("2025-07-16T14:30:00"),
    checkIns: 24,
    longestStreak: 12,
    mostCommonMood: "Sad",
  };
}
