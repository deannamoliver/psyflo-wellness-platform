import { profiles } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { serverDrizzle } from "@/lib/database/drizzle";
import { AdminLayoutWrapper } from "./~lib/admin-layout-wrapper";

export default async function DashboardAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const db = await serverDrizzle();
  const profile = await db.admin.query.profiles.findFirst({
    where: eq(profiles.id, db.userId()),
  });

  if (profile?.platformRole !== "admin") {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<div className="flex min-h-screen bg-gray-50" />}>
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </Suspense>
  );
}
