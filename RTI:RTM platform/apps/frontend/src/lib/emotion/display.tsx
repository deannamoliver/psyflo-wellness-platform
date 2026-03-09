import { H2, P } from "../core-ui/typography";
import { cn } from "../tailwind-utils";
import Mood, { type Mood as MoodType } from "./mood";

interface EmotionDisplayProps {
  className?: string;
  title: string;
  description: string;
  mood?: MoodType;
  withShadow?: boolean;
}

export default function EmotionDisplay({
  className,
  title,
  description,
  mood = "calm",
  withShadow = true,
}: EmotionDisplayProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <Mood mood={mood} withShadow={withShadow} />
      <H2 className="mt-12 text-center">{title}</H2>
      <P className="mt-2 text-center">{description}</P>
    </div>
  );
}
