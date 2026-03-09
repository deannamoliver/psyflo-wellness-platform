import Image from "next/image";
import { cn } from "@/lib/tailwind-utils";

const moodImagePaths = {
  happy: "/images/moods/happy.svg",
  sad: "/images/moods/sad.svg",
  surprised: "/images/moods/excited.svg",
  angry: "/images/moods/angry.svg",
  afraid: "/images/moods/worried.svg",
  calm: "/images/moods/calm.svg",
  bad: "/images/moods/sad.svg",
  disgusted: "/images/moods/angry.svg",
  proud: "/images/moods/proud.svg",
  lonely: "/images/moods/lonely.svg",
} as const;

export type Mood = keyof typeof moodImagePaths;

interface MoodProps {
  mood: Mood;
  withShadow?: boolean;
  className?: string;
}

export default function Mood({
  mood,
  withShadow = true,
  className,
}: MoodProps) {
  const imagePath = moodImagePaths[mood] || moodImagePaths.happy;

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "flex items-center justify-center",
          className ?? "h-16 w-16",
          withShadow && "mb-2 drop-shadow-md",
        )}
      >
        <Image
          src={imagePath}
          alt={mood}
          width={64}
          height={64}
          className="h-full w-full object-contain"
        />
      </div>
      {withShadow && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="46"
          height="17"
          viewBox="0 0 46 17"
          fill="none"
          className="mx-auto"
        >
          <ellipse
            cx="23"
            cy="8"
            rx="23"
            ry="8"
            transform="matrix(-1 0 0 1 46 0.5)"
            fill="black"
            fillOpacity="0.3"
          />
        </svg>
      )}
    </div>
  );
}
