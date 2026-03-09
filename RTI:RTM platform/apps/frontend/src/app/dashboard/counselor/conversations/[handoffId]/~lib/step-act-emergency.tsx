"use client";

import { AlertTriangle, Phone } from "lucide-react";
import { useState } from "react";
import type {
  EmergencyActionsData,
  EmergencyContactInfo,
} from "./safety-workflow-types";
import { ActionContinueConversation } from "./step-act-emergency-continue";
import { ActionNotifyParent } from "./step-act-emergency-parent";
import { ActionNotifySchool } from "./step-act-emergency-school";
import { ActionEmergencyServices } from "./step-act-emergency-services";

type Props = {
  isDuringSchoolHours: boolean;
  contacts: EmergencyContactInfo[];
  value: EmergencyActionsData;
  onChange: (value: EmergencyActionsData) => void;
};

const HOTLINES = [
  {
    name: "911 – Emergency Services",
    desc: "Immediate medical or police response",
    color: "bg-red-100 text-red-700",
  },
  {
    name: "988 – Suicide & Crisis Lifeline",
    desc: "24/7 mental health crisis support",
    color: "bg-blue-100 text-blue-700",
  },
  {
    name: "Crisis Text Line",
    desc: "Text HOME to 741741",
    color: "bg-green-100 text-green-700",
  },
];

export function StepActEmergency({
  isDuringSchoolHours,
  contacts,
  value,
  onChange,
}: Props) {
  const [data, setData] = useState<EmergencyActionsData>(value);

  function update(patch: Partial<EmergencyActionsData>) {
    const updated = { ...data, ...patch };
    setData(updated);
    onChange(updated);
  }

  const completedCount = [
    data.emergencyServices.complete,
    data.notifySchool.complete,
    data.notifyParent.complete,
    data.continueConversation.complete,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex-1 space-y-4 p-4">
        {/* School hours badge */}
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 font-semibold text-xs ${isDuringSchoolHours ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}
          >
            {isDuringSchoolHours ? "During School Hours" : "After School Hours"}
          </span>
        </div>

        {/* Emergency header */}
        <div className="rounded-lg bg-red-600 p-4 text-white">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5" />
            <h3 className="font-bold text-base">
              EMERGENCY – Complete these actions NOW
            </h3>
          </div>
          <p className="mt-1 text-red-100 text-xs">
            Do not leave student alone. All actions must be completed.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-red-800">
              <div
                className="h-2 rounded-full bg-white transition-all"
                style={{ width: `${(completedCount / 4) * 100}%` }}
              />
            </div>
            <span className="font-semibold text-xs">{completedCount}/4</span>
          </div>
        </div>

        {/* Emergency Contacts (hotlines) */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h4 className="mb-2 flex items-center gap-2 font-bold text-red-800 text-sm">
            <Phone className="size-4" />
            Emergency Contacts
          </h4>
          <div className="space-y-2">
            {HOTLINES.map((h) => (
              <div
                key={h.name}
                className={`flex items-center gap-3 rounded-lg ${h.color} px-3 py-2`}
              >
                <Phone className="size-4 shrink-0" />
                <div>
                  <p className="font-semibold text-xs">{h.name}</p>
                  <p className="text-[11px] opacity-80">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action items — order differs by school hours */}
        <ActionEmergencyServices
          actionNumber={1}
          value={data.emergencyServices}
          onChange={(v) => update({ emergencyServices: v })}
        />

        {isDuringSchoolHours ? (
          <>
            <ActionNotifySchool
              actionNumber={2}
              isDuringSchoolHours
              contacts={contacts}
              value={data.notifySchool}
              onChange={(v) => update({ notifySchool: v })}
            />
            <ActionNotifyParent
              actionNumber={3}
              isDuringSchoolHours
              value={data.notifyParent}
              onChange={(v) => update({ notifyParent: v })}
            />
          </>
        ) : (
          <>
            <ActionNotifyParent
              actionNumber={2}
              isDuringSchoolHours={false}
              value={data.notifyParent}
              onChange={(v) => update({ notifyParent: v })}
            />
            <ActionNotifySchool
              actionNumber={3}
              isDuringSchoolHours={false}
              contacts={contacts}
              value={data.notifySchool}
              onChange={(v) => update({ notifySchool: v })}
            />
          </>
        )}

        <ActionContinueConversation
          actionNumber={4}
          value={data.continueConversation}
          onChange={(v) => update({ continueConversation: v })}
        />

        {/* All actions must be completed reminder */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-600" />
            <p className="font-bold text-amber-800 text-xs">
              All Actions Must Be Completed
            </p>
          </div>
          <p className="mt-1 text-[11px] text-amber-700">
            Once all four emergency actions are marked complete, you will
            proceed to documentation. This ensures proper protocol is followed
            and the student receives comprehensive support.
          </p>
        </div>
      </div>
    </div>
  );
}
