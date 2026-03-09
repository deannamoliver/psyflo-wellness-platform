import { cn } from "@/lib/tailwind-utils";
import { H2, P } from "../core-ui/typography";

export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-center px-12 py-6", className)}>
      {children}
    </div>
  );
}

export function PageContent({
  children,
  size = "wide",
  className,
}: {
  children: React.ReactNode;
  size?: "narrow" | "medium" | "wide" | "full";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full",
        size === "narrow" && "max-w-4xl",
        size === "medium" && "max-w-6xl",
        size === "wide" && "max-w-7xl",
        size === "full" && "max-w-full",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <H2 className={cn("font-normal", className)}>{children}</H2>;
}

export function PageSubtitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <P className={cn("text-muted-foreground", className)}>{children}</P>;
}
