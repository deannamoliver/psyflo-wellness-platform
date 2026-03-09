import { profiles } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/lib/core-ui/sidebar";
import { H2, P } from "@/lib/core-ui/typography";
import { serverDrizzle } from "@/lib/database/drizzle";
import { serverSupabase } from "@/lib/database/supabase";
import { cn } from "@/lib/tailwind-utils";
import AdminSidebar from "./~lib/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await serverSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const db = await serverDrizzle();
  const profile = await db.admin.query.profiles.findFirst({
    where: eq(profiles.id, db.userId()),
  });

  if (profile?.platformRole !== "admin") {
    redirect("/dashboard");
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F4F7F7]">
        <AdminSidebar />
        <SidebarInset
          className={cn(
            "flex-1 bg-white",
            "md:peer-data-[variant=inset]:my-0 md:peer-data-[variant=inset]:mr-0",
            "md:peer-data-[variant=inset]:rounded-none",
          )}
        >
          <div className="flex flex-col gap-6 p-8">
            {/* Header */}
            <div className="border-gray-100 border-b pb-6">
              <H2 className="font-semibold text-gray-900">Admin Dashboard</H2>
              <P className="text-gray-500 text-sm">
                Logged in as {user?.email}
              </P>
            </div>

            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
