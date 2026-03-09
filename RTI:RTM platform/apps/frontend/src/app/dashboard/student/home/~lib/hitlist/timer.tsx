"use client";

import { useTimer } from "react-timer-hook";

function formatTime(time: number) {
  return time.toString().padStart(2, "0");
}

export default function AvailabilityTimer({
  nextAvailableTime,
  preText,
}: {
  nextAvailableTime: Date;
  preText: string;
}) {
  const { seconds, minutes, hours, days } = useTimer({
    expiryTimestamp: nextAvailableTime,
  });

  return (
    <span>
      {preText}: {days > 0 && `${days} day${days > 1 ? "s" : ""} `}
      {hours > 0 &&
        `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`}
    </span>
  );
}
