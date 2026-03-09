import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/lib/core-ui/card";
import { cn } from "@/lib/tailwind-utils";

export function TermsAndConditionsCard({
  heading,
  description,
  children,
  className,
}: {
  heading: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "flex w-full flex-col gap-2 rounded-lg bg-white p-6",
        className,
      )}
    >
      <CardHeader className="p-0 font-medium text-xl leading-7">
        {heading}
      </CardHeader>
      <CardDescription className="p-0 font-normal text-base text-muted-foreground leading-6">
        {description}
      </CardDescription>
      <CardContent className="w-full p-0">{children}</CardContent>
    </Card>
  );
}
