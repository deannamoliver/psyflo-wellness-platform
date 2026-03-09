"use client";

import { Clock } from "lucide-react";
import { Button } from "@/lib/core-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/lib/core-ui/dropdown-menu";

const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const AMPM = ["AM", "PM"] as const;

function parseTime(value: string) {
  if (!value || !/^\d{1,2}:\d{2}$/.test(value)) return { hour: 0, minute: 0 };
  const [h = 0, m = 0] = value.split(":").map(Number);
  return {
    hour: Math.min(23, Math.max(0, h)),
    minute: Math.min(59, Math.max(0, m)),
  };
}

function to12Hour(h24: number) {
  return h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
}

function to24Hour(h12: number, pm: boolean) {
  return pm ? (h12 === 12 ? 12 : h12 + 12) : h12 === 12 ? 0 : h12;
}

function formatDisplay(value: string) {
  if (!value) return "Select time";
  const { hour, minute } = parseTime(value);
  return `${to12Hour(hour)}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

const selectClass =
  "rounded border border-gray-300 bg-white px-2 py-1.5 font-dm text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

export function TimePicker({ value, onChange, label }: Props) {
  const { hour, minute } = parseTime(value);
  const hour12 = to12Hour(hour);
  const ampm = hour >= 12 ? "PM" : "AM";
  const emit = (h: number, m: number) =>
    onChange(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className="h-10 w-full justify-start gap-2 rounded border-gray-200 bg-white px-3 font-dm font-normal text-gray-700 text-sm hover:bg-gray-50 hover:text-gray-700"
          aria-label={label}
        >
          <Clock className="size-4 shrink-0 text-gray-400" aria-hidden />
          <span className="truncate">{formatDisplay(value)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-auto border-gray-200 bg-white p-3 font-dm shadow-md"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center gap-2">
          <select
            value={hour12}
            onChange={(e) =>
              emit(to24Hour(Number(e.target.value), ampm === "PM"), minute)
            }
            aria-label="Hour"
            className={selectClass}
          >
            {HOURS_12.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <span className="font-dm text-gray-500 text-sm">:</span>
          <select
            value={minute}
            onChange={(e) => emit(hour, Number(e.target.value))}
            aria-label="Minute"
            className={selectClass}
          >
            {MINUTES.map((m) => (
              <option key={m} value={m}>
                {String(m).padStart(2, "0")}
              </option>
            ))}
          </select>
          <select
            value={ampm}
            onChange={(e) =>
              emit(to24Hour(hour12, e.target.value === "PM"), minute)
            }
            aria-label="AM/PM"
            className={selectClass}
          >
            {AMPM.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
