import Link from "next/link";
import type * as React from "react";
import { H3, P } from "@/lib/core-ui/typography";
import { VisitWebsite } from "./icons";

type ResourceCardProps = {
  sidebarColor: string;
  textColor?: string;
  icon: React.ReactNode;
  heading: string;
  subHeading?: string;
  description: string;
  websiteUrl: string;
  children: React.ReactNode;
};

export function ResourceCard({
  sidebarColor,
  textColor,
  icon,
  heading,
  subHeading,
  description,
  websiteUrl,
  children,
}: ResourceCardProps) {
  return (
    <div
      className="flex flex-1 flex-col items-start gap-4 rounded-lg border-l-4 bg-white p-6 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.10)]"
      style={{ borderLeftColor: sidebarColor }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-md"
          style={{ backgroundColor: `${sidebarColor}1A` }}
        >
          {icon}
        </div>
        <H3>{heading}</H3>
      </div>
      <P className="font-semibold text-base" style={{ color: textColor }}>
        {subHeading}
      </P>
      <P className="font-normal text-base text-muted-foreground">
        {description}
      </P>
      {children}
      <Link
        href={websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 font-medium"
        style={{ color: textColor }}
      >
        Visit Website <VisitWebsite color={textColor} />
      </Link>
    </div>
  );
}
