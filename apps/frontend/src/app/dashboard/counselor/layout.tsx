import { Suspense } from "react";
import { LayoutWrapper } from "./~lib/layout-wrapper";

export default function CounselorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="flex min-h-screen bg-gray-50" />}>
      <LayoutWrapper>{children}</LayoutWrapper>
    </Suspense>
  );
}
