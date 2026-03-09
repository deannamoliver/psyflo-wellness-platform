import { ArrowRight, Check, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { H4, Small } from "@/lib/core-ui/typography";
import { cn } from "@/lib/tailwind-utils";

export default function HitListItem({
  icon,
  title,
  subtitle,
  time,
  href,
  footer,
  disabled,
  completed,
}: {
  icon: string;
  title: string;
  subtitle: React.ReactNode;
  time: string;
  href?: string;
  footer: React.ReactNode;
  disabled?: boolean;
  completed?: boolean;
}) {
  const content = (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          {completed && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500">
              <Check className="h-4 w-4 text-white" strokeWidth={3} />
            </div>
          )}
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center overflow-visible sm:h-14 sm:w-14",
            )}
          >
            <Image
              src={icon}
              alt={title}
              width={54}
              height={54}
              className="h-auto w-full"
            />
          </div>
          <div className="min-w-0">
            <H4 className="mb-1 truncate font-semibold text-base text-blue-800 sm:text-lg">
              {title}
            </H4>
            <Small className="text-gray-600 text-sm sm:text-base">
              {subtitle}
            </Small>
          </div>
        </div>
        {href && !completed && (
          <ArrowRight className="h-5 w-5 shrink-0 text-blue-800" />
        )}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-blue-800" />
          <Small className="text-blue-800 text-sm sm:text-base">{time}</Small>
        </div>
        <div>{footer}</div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "-m-2 block rounded-lg p-2 transition-colors hover:bg-gray-50",
          disabled && "pointer-events-none opacity-50",
        )}
        prefetch={!disabled}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={cn("-m-2 block rounded-lg p-2", disabled && "opacity-50")}>
      {content}
    </div>
  );
}
