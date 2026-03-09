"use client";

import { Clock } from "lucide-react";
import { Button } from "@/lib/core-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/lib/core-ui/dropdown-menu";

type Props = {
  value: string;
  onChange: (value: string) => void;
  "aria-label"?: string;
};

/** Value is always stored as HH:mm (24-hour). */

function nowAsTimeValue(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function parseTime(value: string): { hour: number; minute: number } {
  if (!value || !/^\d{1,2}:\d{2}$/.test(value)) {
    return { hour: 0, minute: 0 };
  }
  const [h = 0, m = 0] = value.split(":").map(Number);
  return {
    hour: Math.min(23, Math.max(0, h)),
    minute: Math.min(59, Math.max(0, m)),
  };
}

/** 24h hour to 12h display hour (1-12). */
function to12Hour(hour24: number): number {
  if (hour24 === 0) return 12;
  if (hour24 > 12) return hour24 - 12;
  return hour24;
}

function isPM(hour24: number): boolean {
  return hour24 >= 12;
}

/** 12h + AM/PM to 24h hour. */
function to24Hour(hour12: number, pm: boolean): number {
  if (pm) return hour12 === 12 ? 12 : hour12 + 12;
  return hour12 === 12 ? 0 : hour12;
}

function formatDisplay(value: string): string {
  if (!value) return "Select time";
  const { hour, minute } = parseTime(value);
  const h12 = to12Hour(hour);
  const ampm = isPM(hour) ? "PM" : "AM";
  return `${h12}:${String(minute).padStart(2, "0")} ${ampm}`;
}

const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const AMPM = ["AM", "PM"] as const;

const selectClassName =
  "rounded border border-gray-300 bg-white px-2 py-1 font-dm text-xs text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

/**
 * Time picker that matches counselor dashboard filters: a trigger (clock + time)
 * opens a styled dropdown with hour/minute selects; "Now" button sets current time.
 */
export function TimeInputWithNow({
  value,
  onChange,
  "aria-label": ariaLabel,
}: Props) {
  const { hour, minute } = parseTime(value);
  const hour12 = to12Hour(hour);
  const ampm = isPM(hour) ? "PM" : "AM";

  function handleHour12Change(e: React.ChangeEvent<HTMLSelectElement>) {
    const h12 = Number(e.target.value);
    const h24 = to24Hour(h12, ampm === "PM");
    onChange(
      `${String(h24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    );
  }
  function handleMinuteChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const m = Number(e.target.value);
    onChange(`${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  function handleAmPmChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const pm = e.target.value === "PM";
    const h24 = to24Hour(hour12, pm);
    onChange(
      `${String(h24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 font-dm"
      role="group"
      aria-label={ariaLabel}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            type="button"
            className="h-8 min-w-[100px] flex-1 justify-start gap-1.5 rounded border-gray-200 bg-white px-2.5 py-1 font-dm font-normal text-gray-700 text-xs hover:bg-gray-50 hover:text-gray-700"
          >
            <Clock className="size-3.5 shrink-0 text-gray-400" aria-hidden />
            <span className="truncate">{formatDisplay(value)}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-auto border-gray-200 bg-white p-2.5 font-dm shadow-md"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-center gap-1.5">
            <select
              value={hour12}
              onChange={handleHour12Change}
              aria-label="Hour"
              className={selectClassName}
            >
              {HOURS_12.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <span className="font-dm text-gray-500 text-xs">:</span>
            <select
              value={minute}
              onChange={handleMinuteChange}
              aria-label="Minute"
              className={selectClassName}
            >
              {MINUTES.map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, "0")}
                </option>
              ))}
            </select>
            <select
              value={ampm}
              onChange={handleAmPmChange}
              aria-label="AM/PM"
              className={selectClassName}
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
      <button
        type="button"
        onClick={() => onChange(nowAsTimeValue())}
        className="h-8 shrink-0 rounded border border-gray-200 bg-white px-2 font-dm font-normal text-gray-700 text-xs hover:bg-gray-50 hover:text-gray-700"
      >
        Now
      </button>
    </div>
  );
}
