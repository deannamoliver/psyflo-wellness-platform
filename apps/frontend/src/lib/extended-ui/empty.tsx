import { PackageOpenIcon } from "lucide-react";
import { cn } from "../tailwind-utils";

export function Empty({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className,
      )}
    >
      <PackageOpenIcon className="size-8 text-muted-foreground" />
      {children}
    </div>
  );
}
