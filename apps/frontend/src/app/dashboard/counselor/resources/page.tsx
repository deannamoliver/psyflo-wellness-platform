import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { SVGProps } from "react";
import { Card, CardContent, CardTitle } from "@/lib/core-ui/card";
import { P } from "@/lib/core-ui/typography";
import {
  PageContainer,
  PageContent,
  PageSubtitle,
  PageTitle,
} from "@/lib/extended-ui/page";
import { cn } from "@/lib/tailwind-utils";

function EmergencyResourcesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={48}
      height={48}
      fill="none"
      {...props}
    >
      <path
        fill="#FEE2E2"
        d="M24 0c13.255 0 24 10.745 24 24S37.255 48 24 48 0 37.255 0 24 10.745 0 24 0Z"
      />
      <path
        stroke="#E5E7EB"
        d="M24 0c13.255 0 24 10.745 24 24S37.255 48 24 48 0 37.255 0 24 10.745 0 24 0Z"
      />
      <path d="M34 38H14V10h20v28Z" />
      <path stroke="#E5E7EB" d="M34 33.5H14v-20h20v20Z" />
      <path
        fill="#EF4444"
        d="m22.918 31.824-7.059-6.59a6.045 6.045 0 0 1-.464-.484h3.398c.883 0 1.68-.531 2.02-1.348l.41-.984 1.925 4.277a.925.925 0 0 0 .836.551.948.948 0 0 0 .86-.52L26.5 23.41l.066.133a2.189 2.189 0 0 0 1.957 1.21h4.082c-.144.169-.3.333-.464.485l-7.059 6.586a1.586 1.586 0 0 1-2.164 0Zm10.758-8.949h-5.157a.318.318 0 0 1-.28-.172l-.907-1.808a.937.937 0 0 0-1.68 0l-1.617 3.234-1.992-4.45a.933.933 0 0 0-.867-.55.941.941 0 0 0-.852.578l-1.242 2.98a.31.31 0 0 1-.289.192h-4.168a.97.97 0 0 0-.285.043 5.855 5.855 0 0 1-.34-1.965v-.227a5.583 5.583 0 0 1 9.531-3.949l.469.469.469-.469A5.585 5.585 0 0 1 34 20.731v.226c0 .66-.11 1.309-.324 1.918Z"
      />
    </svg>
  );
}

function TermsConditionsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={48}
      height={48}
      fill="none"
      {...props}
    >
      <path
        fill="#EFF6FF"
        d="M24 0c13.255 0 24 10.745 24 24S37.255 48 24 48 0 37.255 0 24 10.745 0 24 0Z"
      />
      <path
        stroke="#E5E7EB"
        d="M24 0c13.255 0 24 10.745 24 24S37.255 48 24 48 0 37.255 0 24 10.745 0 24 0Z"
      />
      <path d="M31.5 38h-15V10h15v28Z" />
      <path
        fill="#3B82F6"
        d="M19 13.5a2.502 2.502 0 0 0-2.5 2.5v15c0 1.379 1.121 2.5 2.5 2.5h10c1.379 0 2.5-1.121 2.5-2.5V19.75h-5c-.691 0-1.25-.559-1.25-1.25v-5H19Zm7.5 0v5h5l-5-5ZM19.625 16h2.5c.344 0 .625.281.625.625a.627.627 0 0 1-.625.625h-2.5a.627.627 0 0 1-.625-.625c0-.344.281-.625.625-.625Zm0 2.5h2.5c.344 0 .625.281.625.625a.627.627 0 0 1-.625.625h-2.5a.627.627 0 0 1-.625-.625c0-.344.281-.625.625-.625Zm2.117 9.914a1.876 1.876 0 0 1-1.797 1.336h-.32a.627.627 0 0 1-.625-.625c0-.344.281-.625.625-.625h.32a.62.62 0 0 0 .598-.445l.582-1.934a1.042 1.042 0 0 1 2 0l.453 1.508a1.638 1.638 0 0 1 2.512.527l.172.344h2.113c.344 0 .625.281.625.625a.627.627 0 0 1-.625.625h-2.5a.622.622 0 0 1-.559-.344l-.343-.691a.385.385 0 0 0-.344-.215.38.38 0 0 0-.344.215l-.344.691a.622.622 0 0 1-1.156-.097l-.66-2.176-.383 1.281Z"
      />
    </svg>
  );
}

function PrivacyPolicyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={48}
      height={48}
      fill="none"
      {...props}
    >
      <path
        fill="#F0FDF4"
        d="M24 0c13.255 0 24 10.745 24 24S37.255 48 24 48 0 37.255 0 24 10.745 0 24 0Z"
      />
      <path
        stroke="#E5E7EB"
        d="M24 0c13.255 0 24 10.745 24 24S37.255 48 24 48 0 37.255 0 24 10.745 0 24 0Z"
      />
      <path d="M34 38H14V10h20v28Z" />
      <path
        fill="#22C55E"
        d="M24 13.5c.18 0 .36.04.523.113l7.356 3.121c.86.364 1.5 1.211 1.496 2.235-.02 3.875-1.613 10.965-8.344 14.187a2.385 2.385 0 0 1-2.062 0c-6.73-3.222-8.325-10.312-8.344-14.187-.004-1.024.637-1.871 1.496-2.235l7.36-3.12c.16-.075.34-.114.519-.114Zm0 2.61v14.765c5.39-2.61 6.84-8.387 6.875-11.852L24 16.11Z"
      />
    </svg>
  );
}

const options = [
  {
    title: "Emergency Resources",
    description: "Immediate help and support contacts.",
    icon: <EmergencyResourcesIcon />,
    href: "/dashboard/counselor/resources/emergency-resources",
  },
  {
    title: "Terms and Conditions",
    description: "Read the terms that govern our service.",
    icon: <TermsConditionsIcon />,
    href: "/dashboard/counselor/resources/terms-and-conditions",
  },
  {
    title: "Privacy Policy",
    description: "How we handle and protect your data.",
    icon: <PrivacyPolicyIcon />,
    href: "/dashboard/counselor/resources/privacy-policy",
  },
];

export default function MorePage() {
  return (
    <PageContainer>
      <PageContent size="medium" className="flex flex-col gap-6">
        <div>
          <PageTitle>More Options</PageTitle>
          <PageSubtitle className="text-muted-foreground">
            Find helpful resources, legal information, and ways to get in touch.
          </PageSubtitle>
        </div>

        <div className="grid gap-4">
          {options.map((option) => (
            <Card
              key={option.title}
              className="p-0 transition-shadow hover:shadow-md"
            >
              <Link
                href={option.href}
                className={cn(
                  "block w-full",
                  "rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                      <span className="text-lg">{option.icon}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <CardTitle className="mb-1 font-medium text-base">
                        {option.title}
                      </CardTitle>
                      <P className="text-muted-foreground text-sm">
                        {option.description}
                      </P>
                    </div>
                    <ChevronRight className="text-muted-foreground" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </PageContent>
    </PageContainer>
  );
}
