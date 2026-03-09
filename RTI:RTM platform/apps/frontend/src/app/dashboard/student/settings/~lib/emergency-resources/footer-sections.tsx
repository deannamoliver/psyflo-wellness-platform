"use client";

import { AlertTriangle, Phone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/lib/core-ui/button";
import * as Icons from "@/lib/emergency-resources/icons";

export function RememberYouMatter() {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <h3 className="mb-2 font-semibold text-gray-900 text-xl">
        Remember: You Matter
      </h3>
      <p className="mb-6 text-gray-500 text-sm">
        These resources are here for you 24/7. Don't hesitate to reach out when
        you need support.
      </p>
      <div className="flex gap-3">
        <Button asChild className="bg-[#EF4444] hover:bg-[#EF4444]/90">
          <Link href="tel:988">
            <Phone className="h-4 w-4" />
            Call 988 Now
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="hover:bg-gray-100 hover:text-gray-900"
        >
          <Link href="sms:988">
            <Icons.GrayCrisisTextIcon className="h-4 w-4" />
            Text for Help
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function WarningSignsSection() {
  const behavioralChanges = [
    "Talking about wanting to die or feeling hopeless",
    "Withdrawing from friends, family, and activities",
    "Increased use of alcohol or drugs",
    "Giving away prized possessions",
  ];

  const emotionalSigns = [
    "Extreme mood swings or sudden calmness",
    "Expressing feelings of being a burden",
    "Increased anxiety or agitation",
    "Sleeping too much or too little",
  ];

  return (
    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-yellow-200 p-2">
          <AlertTriangle className="h-5 w-5 text-yellow-700" />
        </div>
        <h3 className="font-semibold text-gray-900 text-lg">
          Recognizing Warning Signs
        </h3>
      </div>
      <p className="mb-6 text-gray-600 text-sm">
        If you or someone you know shows these signs, reach out for help
        immediately.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-3 font-semibold text-yellow-700">
            Behavioral Changes
          </h4>
          <ul className="space-y-2">
            {behavioralChanges.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-600" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-yellow-700">
            Emotional Signs
          </h4>
          <ul className="space-y-2">
            {emotionalSigns.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-600" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
