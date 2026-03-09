import { redirect } from "next/navigation";
import { canCheckIn } from "@/lib/check-in/server-utils";
import { isDemoUser } from "@/lib/user/info";

export default async function StudentPage() {
  const isDemo = await isDemoUser();

  if (isDemo) {
    const checkInStatus = await canCheckIn();
    if (checkInStatus.value) {
      redirect("/dashboard/student/check-in");
    }
  }

  redirect("/dashboard/student/home");
}
