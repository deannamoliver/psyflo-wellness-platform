"use client";

import Link from "next/link";

function HeartPulseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-12 w-12 shrink-0"
      fill="none"
      viewBox="0 0 48 48"
    >
      <circle cx={24} cy={24} r={24} fill="rgba(255,255,255,0.2)" />
      <path
        fill="#fff"
        d="M24 36l-2.1-1.9C14.4 27.2 10 23.2 10 18.3c0-4 3.1-7.3 7-7.3 2.2 0 4.4 1.1 5.7 2.8l1.3 1.7 1.3-1.7c1.3-1.7 3.5-2.8 5.7-2.8 3.9 0 7 3.3 7 7.3 0 4.9-4.4 8.9-11.9 15.8L24 36z"
      />
      <path
        stroke="#EF4444"
        strokeWidth={2}
        strokeLinecap="round"
        d="M14 24h4l2-4 4 8 2-4h4"
      />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className || "h-4 w-4"}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        fill="currentColor"
        d="M5.153.77A1.246 1.246 0 0 0 3.672.043l-2.75.75C.378.944 0 1.438 0 2.001c0 7.731 6.269 14 14 14 .563 0 1.056-.378 1.206-.922l.75-2.75a1.246 1.246 0 0 0-.725-1.481l-3-1.25a1.246 1.246 0 0 0-1.447.362L9.522 12A10.562 10.562 0 0 1 4.5 6.98l1.54-1.26c.429-.35.576-.937.363-1.446l-1.25-3V.769Z"
      />
    </svg>
  );
}

export function CrisisBanner() {
  return (
    <div className="rounded-2xl bg-[#EF4444] p-6 text-white">
      <div className="flex items-start gap-4">
        <HeartPulseIcon />
        <div className="flex-1">
          <h2 className="mb-2 font-semibold text-xl">
            24/7 Crisis Support Available
          </h2>
          <p className="mb-5 text-red-100 text-sm leading-relaxed">
            If you're in immediate danger or having thoughts of self-harm or
            suicide, please reach out for immediate help. You're not alone, and
            support is available. Feelwell is a supportive tool, NOT an
            emergency service. For mental health emergencies, immediately call
            911 or the crisis hotline: 988.
          </p>
          <div className="flex gap-3">
            <Link
              href="tel:988"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 font-medium text-[#EF4444] text-sm transition-colors hover:bg-gray-100"
            >
              <PhoneIcon className="h-4 w-4" />
              Call 988
            </Link>
            <Link
              href="tel:911"
              className="inline-flex items-center gap-2 rounded-lg border border-white/50 bg-white/10 px-5 py-2.5 font-medium text-sm text-white transition-colors hover:bg-white/20"
            >
              <PhoneIcon className="h-4 w-4" />
              Call 911
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
