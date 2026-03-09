"use client";

import { Lightbulb } from "lucide-react";

const STEPS = [
  {
    number: 1,
    label: "Enter Provider Details",
    description: "Provide basic information including name and email address",
    color: "bg-blue-500",
  },
  {
    number: 2,
    label: "Select Platform",
    description: "Choose the platform for this user to perform their duties",
    color: "bg-orange-400",
  },
  {
    number: 3,
    label: "Assign Role",
    description: "Choose role based on responsibilities",
    color: "bg-green-500",
  },
  {
    number: 4,
    label: "Select Practice*",
    description:
      "Choose the practice and location(s) for this provider",
    color: "bg-blue-400",
  },
  {
    number: 5,
    label: "Review & Create",
    description: "Verify all details and create the provider account",
    color: "bg-purple-500",
  },
];

export function QuickGuide() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100">
          <span className="font-bold text-blue-600 text-sm">?</span>
        </div>
        <h3 className="font-semibold text-gray-900">Quick Guide</h3>
      </div>

      <div className="flex flex-col gap-4">
        {STEPS.map((step) => (
          <div key={step.number} className="flex items-start gap-3">
            <div
              className={`flex size-6 shrink-0 items-center justify-center rounded-full font-bold text-white text-xs ${step.color}`}
            >
              {step.number}
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{step.label}</p>
              <p className="text-gray-500 text-xs">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-lg bg-amber-50 p-3">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" />
        <div>
          <p className="font-semibold text-gray-900 text-xs">Pro Tip</p>
          <p className="text-gray-600 text-xs">
            Providers can be assigned to multiple locations.
          </p>
        </div>
      </div>
    </div>
  );
}
