import { redirect } from "next/navigation";

/**
 * Student dashboard - demo mode, redirect directly to home
 */
export default async function StudentPage() {
  redirect("/dashboard/student/home");
}
