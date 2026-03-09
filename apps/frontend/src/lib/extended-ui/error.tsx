"use client";

import Image from "next/image";
import { Button } from "../core-ui/button";
import { H4 } from "../core-ui/typography";
import { cn } from "../tailwind-utils";

type Props = {
  title?: string;
  message: string;
  reset: () => void;
  className?: string;
};

export default function GenericErrorDisplay({
  title = "Something went wrong",
  message,
  reset,
  className,
}: Props) {
  const isGenericError = message.includes(
    "An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details. A digest property is included on this error instance which may provide additional details about the nature of the error",
  );
  return (
    <div
      className={cn(
        "flex min-h-[80vh] w-full flex-col items-center justify-center gap-5 px-5",
        className,
      )}
    >
      <Image alt="not-found" src="/v3/error.png" width={100} height={100} />
      <div className="flex flex-col items-center gap-4 text-center">
        <H4>{title}</H4>
        <div className="w-full break-all text-center">
          {isGenericError ? "An unexpected error occurred" : message}
        </div>
        <Button variant="outline" onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  );
}
