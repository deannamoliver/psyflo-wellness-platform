import { Suspense } from "react";
import TopNavWrapper from "./top-nav-wrapper";

export async function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Suspense fallback={<div className="h-16 border-b bg-white" />}>
        <TopNavWrapper />
      </Suspense>
      <main className="flex-1">{children}</main>
    </div>
  );
}
