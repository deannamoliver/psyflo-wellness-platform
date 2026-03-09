import { titleCase } from "@/lib/string-utils";
import ActivityCard from "./card";
import { getRecentCheckIns, getRecentScreeners } from "./data";

function getModuleNameFromScoreType(scoreType: string): string {
  switch (scoreType) {
    case "cognitive":
      return "Cognitive Skills";
    case "emotion":
      return "Understanding Emotions";
    case "social":
      return "Social Skills";
    case "values":
      return "Personal Values";
    case "perspective":
      return "Perspective Taking";
    case "identity":
      return "Self Identity";
    default:
      return "SEL Module";
  }
}

export async function ActivityCards({ studentId }: { studentId: string }) {
  const [recentCheckIns, recentScreeners] = await Promise.all([
    getRecentCheckIns(studentId),
    getRecentScreeners(studentId),
  ]);

  const checkInActivities = recentCheckIns.map((checkIn) => ({
    id: checkIn.id,
    createdAt: checkIn.createdAt,
    updatedAt: checkIn.updatedAt,
    type: "mood-check-in" as const,
    subtitle: checkIn.universalEmotion
      ? titleCase(checkIn.universalEmotion, { delimiter: "_" })
      : "Mood Check-in",
  }));

  const screenerActivities = recentScreeners.map((screener) => ({
    id: screener.id,
    createdAt: screener.createdAt,
    updatedAt: screener.updatedAt,
    type: "completed-sel-module" as const,
    subtitle: getModuleNameFromScoreType(screener.subtype),
  }));

  const activitiesData = [...checkInActivities, ...screenerActivities]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-4">
      {activitiesData.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
