"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import * as Icons from "@/lib/emergency-resources/icons";

type SafetyCardProps = {
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
  title: string;
  orgName: string;
  orgColor: string;
  description: string;
  phone?: string;
  textInfo?: string;
  websiteUrl: string;
};

function SafetyCard({
  icon,
  iconBg,
  borderColor,
  title,
  orgName,
  orgColor,
  description,
  phone,
  textInfo,
  websiteUrl,
}: SafetyCardProps) {
  return (
    <div
      className={`flex flex-col rounded-lg border-l-4 bg-white p-5 shadow-sm ${borderColor}`}
    >
      <div className="mb-2 flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg p-2 ${iconBg}`}
        >
          {icon}
        </div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      <p className={`mb-1 font-medium text-sm ${orgColor}`}>{orgName}</p>
      <p className="mb-4 text-gray-500 text-sm">{description}</p>
      <div className="mt-auto space-y-1">
        {phone && (
          <p className="flex items-center gap-2 text-gray-700 text-sm">
            <Icons.GrayPhone className="h-4 w-4" />
            {phone}
          </p>
        )}
        {textInfo && (
          <p className="flex items-center gap-2 text-gray-700 text-sm">
            <Icons.GrayCrisisTextIcon className="h-4 w-4" />
            {textInfo}
          </p>
        )}
        <Link
          href={websiteUrl}
          target="_blank"
          className={`flex items-center gap-1 font-semibold text-sm ${orgColor} hover:underline`}
        >
          Visit Website <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

export function HomeSafetySection() {
  return (
    <section>
      <h3 className="mb-4 font-semibold text-gray-900 text-lg">
        Home & Safety
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SafetyCard
            icon={<Icons.FamilyConflict className="h-5 w-5" />}
            iconBg="bg-blue-100"
            borderColor="border-blue-400"
            title="Family Conflict"
            orgName="Boys Town National Hotline"
            orgColor="text-blue-600"
            description="For youth and families in conflict or crisis."
            phone="1-800-448-3000"
            textInfo="Text VOICE to 20121"
            websiteUrl="https://www.boystown.org/hotline"
          />
          <SafetyCard
            icon={<Icons.UnsafeAtHome className="h-5 w-5" />}
            iconBg="bg-yellow-100"
            borderColor="border-yellow-400"
            title="Unsafe at Home"
            orgName="TXT 4 HELP (Safe Place)"
            orgColor="text-yellow-600"
            description="Find nearby Safe Place locations for immediate support."
            textInfo="Text SAFE and your location to 44357"
            websiteUrl="https://www.nationalsafeplace.org"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SafetyCard
            icon={<Icons.RunawayYouth className="h-5 w-5" />}
            iconBg="bg-teal-100"
            borderColor="border-teal-400"
            title="Runaway Youth"
            orgName="National Runaway Safeline"
            orgColor="text-teal-600"
            description="Help for youth thinking about running away or currently homeless."
            phone="1-800-RUNAWAY (786-2929)"
            websiteUrl="https://www.1800runaway.org"
          />
        </div>
      </div>
    </section>
  );
}
