"use client";

import {
  AlertTriangle,
  Bot,
  Calendar,
  Clock,
  Info,
  Shield,
} from "lucide-react";
import { AccessRestrictionsSection } from "./location-config-restrictions";
import type { AssessmentConfig, LocationDetail } from "./location-detail-data";

export function LocationConfigTab({ location }: { location: LocationDetail }) {
  return (
    <div className="flex flex-col gap-8">
      <ChatbotAvailabilitySection location={location} />
      <AssessmentSection assessments={location.assessments} />
      <AccessRestrictionsSection
        restrictedGrades={location.restrictedGrades}
        restrictedCount={location.restrictedGrades.length}
      />
    </div>
  );
}

function ChatbotAvailabilitySection({
  location,
}: {
  location: LocationDetail;
}) {
  const enabled = location.chatbotEnabled;
  const is247 = location.is24HourAccess;
  const closuresActive = location.closuresEnabled;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
          <Bot className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-lg">
            AI Chatbot Availability
          </h2>
          <p className="text-gray-500 text-sm">
            Configure when students can access the AI-powered support chatbot
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between rounded-lg border border-gray-200 px-5 py-4">
        <div>
          <div className="font-medium text-gray-900">AI Chatbot Status</div>
          <div className="text-gray-500 text-sm">
            {enabled
              ? "Chatbot and crisis detection are active"
              : "Chatbot is currently disabled for this location"}
          </div>
        </div>
        <span
          className={`flex items-center gap-1.5 font-medium text-sm ${enabled ? "text-green-600" : "text-red-600"}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${enabled ? "bg-green-500" : "bg-red-500"}`}
          />
          {enabled ? "Enabled" : "Disabled"}
        </span>
      </div>

      <div className="mb-4">
        <h3 className="mb-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
          Availability Schedule
        </h3>
        <div className="rounded-lg border-2 border-blue-200 bg-blue-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-semibold text-gray-900">
                {is247 ? "24/7 Access" : "Clinic Hours Only"}
              </div>
              <div className="text-gray-600 text-sm">
                {is247
                  ? "Patients can access the chatbot anytime, day or night"
                  : "Patients can only access the chatbot during clinic hours"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
          Closures
        </h3>
        <div
          className={`rounded-lg border-2 px-5 py-4 ${closuresActive ? "border-blue-200 bg-blue-50/50" : "border-gray-200 bg-gray-50"}`}
        >
          <div className="flex items-center gap-3">
            <Clock
              className={`h-5 w-5 ${closuresActive ? "text-blue-500" : "text-gray-400"}`}
            />
            <div className="text-gray-700 text-sm">
              {closuresActive
                ? "Chatbot remains active during blackout days, holidays, and closures"
                : "Chatbot is disabled during blackout days, holidays, and closures"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ASSESSMENT_ICONS: Record<string, React.ReactNode> = {
  sel: (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100">
      <Shield className="h-4 w-4 text-pink-600" />
    </div>
  ),
  phq9: (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
      <Info className="h-4 w-4 text-blue-600" />
    </div>
  ),
  gad7: (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
      <AlertTriangle className="h-4 w-4 text-purple-600" />
    </div>
  ),
};

function AssessmentSection({
  assessments,
}: {
  assessments: AssessmentConfig[];
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
          <Calendar className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-lg">
            Assessment & Screener Frequency
          </h2>
          <p className="text-gray-500 text-sm">
            Configure how often students are prompted to complete assessments
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {assessments.map((a) => (
          <div key={a.name} className="rounded-lg border border-gray-200 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {ASSESSMENT_ICONS[a.icon]}
                <div>
                  <div className="font-semibold text-gray-900">{a.name}</div>
                  <div className="text-gray-500 text-sm">{a.description}</div>
                </div>
              </div>
              <span
                className={`flex items-center gap-1.5 font-medium text-sm ${a.active ? "text-green-600" : "text-gray-400"}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${a.active ? "bg-green-500" : "bg-gray-300"}`}
                />
                {a.active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 px-4 py-3">
                <div className="text-gray-500 text-xs">Frequency</div>
                <div className="font-medium text-gray-900">{a.frequency}</div>
              </div>
              <div className="rounded-lg border border-gray-200 px-4 py-3">
                <div className="text-gray-500 text-xs">Next Scheduled Date</div>
                <div className="flex items-center gap-1.5 font-medium text-gray-900">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  {a.nextScheduledDate}
                </div>
              </div>
            </div>
            {a.note && (
              <div className="mt-3 flex items-start gap-2 text-gray-500 text-sm">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <span>
                  <span className="font-medium">Note:</span> {a.note}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
