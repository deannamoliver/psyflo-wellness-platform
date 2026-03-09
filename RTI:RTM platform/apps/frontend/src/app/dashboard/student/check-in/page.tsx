import { getCheckInStreak } from "@/lib/check-in/streak";
import CheckInForm from "./~lib/check-in";

export default async function CheckInPage() {
  const streak = await getCheckInStreak();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-8">
      <CheckInForm streak={streak} />
    </div>
  );
}
