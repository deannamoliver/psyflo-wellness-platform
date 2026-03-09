"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import {
  CrisisTextIcon,
  EmergencyServicesIcon,
  NationalCrisisHotlineIcon,
} from "@/lib/emergency-resources/icons";

function PhoneRedIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path
        fill="#EF4444"
        d="M5.153.77A1.246 1.246 0 0 0 3.672.043l-2.75.75C.378.944 0 1.438 0 2.001c0 7.731 6.269 14 14 14 .563 0 1.056-.378 1.206-.922l.75-2.75a1.246 1.246 0 0 0-.725-1.481l-3-1.25a1.246 1.246 0 0 0-1.447.362L9.522 12A10.562 10.562 0 0 1 4.5 6.98l1.54-1.26c.429-.35.576-.937.363-1.446l-1.25-3V.769Z"
      />
    </svg>
  );
}

export function EmergencyResourcesSection() {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
          <PhoneRedIcon />
        </div>
        <h3 className="font-semibold text-[#EF4444] text-lg">
          Emergency Resources
        </h3>
      </div>
      <p className="mb-6 text-gray-500 text-sm">
        If you or someone you know is experiencing a mental health crisis,
        please reach out to these resources immediately.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* National Crisis Hotline */}
        <div className="rounded-xl border border-red-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center">
              <NationalCrisisHotlineIcon className="h-4 w-4" />
            </div>
            <span className="font-semibold text-gray-900">
              National Crisis Hotline
            </span>
          </div>
          <p className="mb-3 text-gray-400 text-xs">
            24/7 free support for anyone in emotional distress or suicidal
            crisis.
          </p>
          <p className="mb-3 font-semibold text-[#EF4444]">
            Call 988 &nbsp;&nbsp;&nbsp; Text 988
          </p>
          <div className="flex items-center justify-between">
            <Link
              href="sms:988"
              className="font-semibold text-blue-600 text-sm hover:underline"
            >
              Send Text →
            </Link>
            <Link
              href="https://988lifeline.org"
              target="_blank"
              className="flex items-center gap-1 font-semibold text-blue-600 text-sm hover:underline"
            >
              Website <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Crisis Text Line */}
        <div className="rounded-xl border border-red-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center">
              <CrisisTextIcon className="h-4 w-4" />
            </div>
            <span className="font-semibold text-gray-900">
              Crisis Text Line
            </span>
          </div>
          <p className="mb-3 text-gray-400 text-xs">
            Confidential support via text from trained crisis counselors.
          </p>
          <p className="mb-3 font-semibold text-[#EF4444]">
            Text HOME to 741741
          </p>
          <div className="flex items-center justify-between">
            <Link
              href="sms:741741&body=HOME"
              className="font-semibold text-blue-600 text-sm hover:underline"
            >
              Send Text →
            </Link>
            <Link
              href="https://www.crisistextline.org"
              target="_blank"
              className="flex items-center gap-1 font-semibold text-blue-600 text-sm hover:underline"
            >
              Website <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Emergency Services */}
        <div className="rounded-xl border border-red-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center">
              <EmergencyServicesIcon className="h-4 w-5" />
            </div>
            <span className="font-semibold text-gray-900">
              Emergency Services
            </span>
          </div>
          <p className="mb-3 text-gray-400 text-xs">For immediate danger.</p>
          <p className="font-bold text-3xl text-[#EF4444]">911</p>
        </div>
      </div>
    </div>
  );
}
