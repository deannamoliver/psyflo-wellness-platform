"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import * as Icons from "@/lib/emergency-resources/icons";

type SupportCardProps = {
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

function SupportCard({
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
}: SupportCardProps) {
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

export function SpecializedSupportServices() {
  return (
    <section>
      <h3 className="mb-4 font-semibold text-gray-900 text-lg">
        Specific Support
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SupportCard
          icon={<Icons.LGBTQYouth className="h-5 w-5" />}
          iconBg="bg-purple-100"
          borderColor="border-purple-400"
          title="LGBTQ+ Youth"
          orgName="The Trevor Project"
          orgColor="text-purple-600"
          description="Support for LGBTQ+ young people."
          phone="1-866-488-7386"
          textInfo="Text START to 678678"
          websiteUrl="https://www.thetrevorproject.org"
        />
        <SupportCard
          icon={<Icons.GamingSupport className="h-5 w-5" />}
          iconBg="bg-green-100"
          borderColor="border-green-400"
          title="Gaming Support"
          orgName="Pause Before You Play"
          orgColor="text-green-600"
          description="Helps with screen time, gaming habits, and balance."
          websiteUrl="https://www.youngminds.org.uk/young-person/coping-with-life/gaming-and-mental-health/"
        />
        <SupportCard
          icon={<Icons.Relationships className="h-5 w-5" />}
          iconBg="bg-pink-100"
          borderColor="border-pink-400"
          title="Relationships"
          orgName="Love is Respect"
          orgColor="text-pink-600"
          description="Support for teens facing relationship conflict or abuse."
          phone="1-866-331-9474"
          textInfo="Text LOVEIS to 22522"
          websiteUrl="https://www.loveisrespect.org"
        />
        <SupportCard
          icon={<Icons.BodyImage className="h-5 w-5" />}
          iconBg="bg-orange-100"
          borderColor="border-orange-400"
          title="Body Image"
          orgName="NEDA Helpline"
          orgColor="text-orange-600"
          description="Support for disordered eating and body image concerns."
          phone="1-800-931-2237"
          websiteUrl="https://www.nationaleatingdisorders.org"
        />
        <SupportCard
          icon={<Icons.SubstanceUse className="h-5 w-5" />}
          iconBg="bg-indigo-100"
          borderColor="border-indigo-400"
          title="Substance Use"
          orgName="SAMHSA Helpline"
          orgColor="text-indigo-600"
          description="Confidential support for youth dealing with drugs, alcohol, or mental health."
          phone="1-800-662-HELP (4357)"
          websiteUrl="https://www.samhsa.gov/find-help/national-helpline"
        />
        <SupportCard
          icon={<Icons.DomesticViolence className="h-5 w-5 text-[#EF4444]" />}
          iconBg="bg-red-100"
          borderColor="border-red-400"
          title="Domestic Violence"
          orgName="National Domestic Violence Hotline"
          orgColor="text-[#EF4444]"
          description="For anyone feeling unsafe at home or in a relationship."
          phone="1-800-799-SAFE (7233)"
          textInfo="Text START to 88788"
          websiteUrl="https://www.thehotline.org"
        />
      </div>
    </section>
  );
}
