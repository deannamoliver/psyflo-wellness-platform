"use client";
import GenericErrorDisplay from "@/lib/extended-ui/error";

export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <GenericErrorDisplay
      title={"We couldn't load check-in"}
      message={error.message}
      reset={reset}
    />
  );
}
