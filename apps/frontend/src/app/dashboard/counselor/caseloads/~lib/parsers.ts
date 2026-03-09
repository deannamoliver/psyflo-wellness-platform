import {
  parseAsNumberLiteral,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

export const snapshotRangeValues = [
  "latest",
  "30d",
  "90d",
  "6m",
  "1y",
] as const;

export type SnapshotRange = (typeof snapshotRangeValues)[number];

export const searchParamsParsers = {
  schoolId: parseAsString.withDefault(""),
  gradeLevel: parseAsNumberLiteral([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
  sortBy: parseAsStringLiteral([
    "newest-first",
    "oldest-first",
    "student-name-a-z",
    "grade-low-high",
  ]).withDefault("newest-first"),
  snapshotRange:
    parseAsStringLiteral(snapshotRangeValues).withDefault("latest"),
};
