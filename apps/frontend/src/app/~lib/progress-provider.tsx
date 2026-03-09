"use client";

import { ProgressProvider as BProgressProvider } from "@bprogress/next/app";

export default function ProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BProgressProvider
      color="#54b946"
      height="4px"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </BProgressProvider>
  );
}
