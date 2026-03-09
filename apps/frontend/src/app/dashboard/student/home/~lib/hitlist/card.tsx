import { Star } from "lucide-react";
import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/lib/core-ui/card";
import { Separator } from "@/lib/core-ui/separator";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { Small } from "@/lib/core-ui/typography";
import CheckInHitListItem from "./check-in";
import HitListItem from "./item";
import WellnessCheckHitListSection from "./wellness-check-section";

function Fallback() {
  return <Skeleton className="h-36 bg-white/50" />;
}

export async function HitListCard() {
  return (
    <Card className="h-full bg-white px-6 shadow-sm">
      <CardHeader className="pt-6">
        <h2 className="font-semibold text-xl sm:text-2xl">Today's Hitlist</h2>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 p-4">
        <Suspense fallback={<Fallback />}>
          <CheckInHitListItem />
        </Suspense>
        <Separator />

        <Suspense fallback={<Fallback />}>
          <WellnessCheckHitListSection />
        </Suspense>

        <HitListItem
          icon="/home/quick-lesson-icon.png"
          title="Quick Lesson"
          subtitle="Learn something new today!"
          time="5-7 min"
          footer={
            <div className="flex items-center gap-1">
              <Star fill="currentColor" className="h-4 w-4 text-orange-400" />
              <Small className="text-orange-400 text-sm sm:text-base">
                Personalized
              </Small>
            </div>
          }
          href="/dashboard/student/lessons"
          disabled
        />
      </CardContent>
    </Card>
  );
}
