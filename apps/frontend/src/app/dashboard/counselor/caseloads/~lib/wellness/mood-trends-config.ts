import type { UniversalEmotion } from "@/lib/check-in/utils";

export const MOOD_DISPLAY_ORDER: {
  key: UniversalEmotion;
  label: string;
  color: string;
}[] = [
  { key: "happy", label: "Happy", color: "#FEC84B" },
  { key: "disgusted", label: "Calm", color: "#039855" },
  { key: "surprised", label: "Excited", color: "#FD853A" },
  { key: "sad", label: "Sad", color: "#84CAFF" },
  { key: "angry", label: "Angry", color: "#F04438" },
  { key: "afraid", label: "Worried", color: "#7A5AF8" },
  { key: "bad", label: "Lonely", color: "#DD2590" },
];

export const MOOD_LABEL_MAP: Record<string, string> = Object.fromEntries(
  MOOD_DISPLAY_ORDER.map((m) => [m.key, m.label]),
);

export const MOOD_COLOR_MAP: Record<string, string> = Object.fromEntries(
  MOOD_DISPLAY_ORDER.map((m) => [m.key, m.color]),
);

export type TimeRange = "7d" | "30d" | "90d" | "6m" | "1y";

export const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "6m", label: "Last 6 months" },
  { value: "1y", label: "Last year" },
];

export type ChartDataPoint = {
  bucket: string;
  label: string;
  [emotion: string]: number | string;
};
