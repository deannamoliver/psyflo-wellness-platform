import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import { rangeOf } from "@/lib/number-utils";

const SAFETY_RISK_LEVELS = ["emergency", "high", "moderate", "low"] as const;

const STATUS_VALUES = ["new", "in_progress", "resolved"] as const;

export const searchParamsParsers = {
  status: parseAsArrayOf(parseAsStringLiteral(STATUS_VALUES)).withDefault(
    [] as (typeof STATUS_VALUES)[number][],
  ),
  gradeLevel: parseAsStringLiteral([
    "all",
    ...rangeOf(1, 12).map((level) => level.toString()),
  ]).withDefault("all"),
  riskLevel: parseAsStringLiteral(["all", ...SAFETY_RISK_LEVELS]).withDefault(
    "all",
  ),
  sort: parseAsStringLiteral([
    "most_recent",
    "risk_level",
    "name_asc",
    "status",
  ]).withDefault("most_recent"),
  search: parseAsString.withDefault(""),
};
