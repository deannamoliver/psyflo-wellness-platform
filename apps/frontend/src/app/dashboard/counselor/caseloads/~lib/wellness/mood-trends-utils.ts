import { format, subDays, subMonths, subYears } from "date-fns";
import type { ChartDataPoint, TimeRange } from "./mood-trends-config";
import type { TimeSeriesRow } from "./mood-trends-data";

export function getDateCutoff(timeRange: TimeRange): Date {
  const now = new Date();
  switch (timeRange) {
    case "7d":
      return subDays(now, 7);
    case "30d":
      return subDays(now, 30);
    case "90d":
      return subDays(now, 90);
    case "6m":
      return subMonths(now, 6);
    case "1y":
      return subYears(now, 1);
  }
}

type BucketGranularity = "day" | "week" | "month";

export function getBucketGranularity(timeRange: TimeRange): BucketGranularity {
  switch (timeRange) {
    case "7d":
    case "30d":
      return "day";
    case "90d":
      return "week";
    case "6m":
    case "1y":
      return "month";
  }
}

function toBucketKey(dateStr: string, bucket: BucketGranularity): string {
  const d = new Date(dateStr);
  if (bucket === "day") return format(d, "yyyy-MM-dd");
  if (bucket === "week") {
    const dayOfWeek = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));
    return format(monday, "yyyy-MM-dd");
  }
  return format(d, "yyyy-MM");
}

export function formatBucketLabel(
  key: string,
  bucket: BucketGranularity,
): string {
  const d = new Date(key);
  if (bucket === "day") return format(d, "MMM d");
  if (bucket === "week") return format(d, "MMM d");
  return format(d, "MMM yyyy");
}

export function aggregateIntoBuckets(
  points: TimeSeriesRow[],
  bucket: BucketGranularity,
): ChartDataPoint[] {
  const bucketMap = new Map<string, Record<string, number>>();

  for (const p of points) {
    const key = toBucketKey(p.period, bucket);
    if (!bucketMap.has(key)) bucketMap.set(key, {});
    const emotions = bucketMap.get(key)!;
    emotions[p.emotion] = (emotions[p.emotion] ?? 0) + p.count;
  }

  return Array.from(bucketMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, emotions]) => ({
      bucket: key,
      label: formatBucketLabel(key, bucket),
      ...emotions,
    }));
}
