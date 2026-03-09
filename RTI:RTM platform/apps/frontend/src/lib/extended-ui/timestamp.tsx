"use client";

import { formatDate } from "date-fns";

export function Timestamp({ value, format }: { value: Date; format: string }) {
  return formatDate(value, format);
}
