import { Card, CardContent, CardHeader } from "@/lib/core-ui/card";
import { cn } from "@/lib/tailwind-utils";

type PrivacyPolicyCardProps = {
  heading: string;
  children: React.ReactNode;
  className?: string;
};

export function PrivacyPolicyCard({
  heading,
  children,
  className,
}: PrivacyPolicyCardProps) {
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
      <CardContent className="w-full p-0">{children}</CardContent>
    </Card>
  );
}
