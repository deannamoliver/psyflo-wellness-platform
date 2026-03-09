import type { ReactNode } from "react";
import { H3, P } from "@/lib/core-ui/typography";
import { cn } from "@/lib/tailwind-utils";

export function InformationCard({
  icon,
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 rounded-md border p-4",
        className,
      )}
    >
      <div className="flex flex-row items-center gap-2">
        {icon}
        <H3 className={cn("text-base", titleClassName)}>{title}</H3>
      </div>
      <P className={cn("mt-1 text-sm", descriptionClassName)}>{description}</P>
    </div>
  );
}
