"use client";

import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { Large, Lead } from "@/lib/core-ui/typography";
import { PageContainer, PageContent } from "@/lib/extended-ui/page";
import { completeWellnessCheck } from "@/lib/screener/actions";
import { cn } from "@/lib/tailwind-utils";
import {
  getWellnessCheckSoliImage,
  syncSoliSettingsToLocalStorage,
} from "@/lib/user/soli-settings";

export default function CompletedPage() {
  const [soliImage, setSoliImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ensure all answered sessions are marked complete in the database
  useEffect(() => {
    completeWellnessCheck();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSoliSettings = async () => {
      const storedColor = localStorage.getItem("soliColor");
      const storedShape = localStorage.getItem("soliShape");

      if (storedColor && storedShape) {
        if (isMounted) {
          setSoliImage(getWellnessCheckSoliImage(storedColor, storedShape));
          setIsLoading(false);
        }
      } else {
        try {
          const settings = await syncSoliSettingsToLocalStorage();
          if (!isMounted) return;

          if (settings) {
            setSoliImage(
              getWellnessCheckSoliImage(settings.soliColor, settings.soliShape),
            );
          }
        } catch (error: unknown) {
          console.error("Failed to sync soli settings:", error);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }
    };

    loadSoliSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PageContainer className="h-full">
      <PageContent className="flex h-full flex-col items-center justify-center">
        <div
          className={cn(
            "relative flex w-full max-w-2xl flex-col items-center gap-6 rounded-2xl bg-white p-8 shadow-lg",
          )}
        >
          {/* Close Button */}
          <Link
            href="/dashboard/student/home"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Link>

          {/* Customized Soli Icon */}
          <div className="flex justify-center pt-4">
            {soliImage && !isLoading ? (
              <Image
                src={soliImage}
                alt="Wellness Check Complete"
                width={80}
                height={80}
                className="h-auto w-20"
              />
            ) : (
              <Skeleton className="h-20 w-20 rounded-full border border-gray-300 bg-gray-100" />
            )}
          </div>

          {/* Completion Messages */}
          <div className="flex max-w-2xl flex-col gap-2">
            <Large className="text-center font-medium text-gray-800 text-lg">
              Your wellness check-in is complete!
            </Large>
            <Lead className="text-center font-normal text-gray-600 text-lg">
              Remember your doing great no matter how your feeling 🚀
            </Lead>
          </div>

          {/* Submit Button */}
          <Button
            className="bg-primary px-8 font-semibold text-primary-foreground text-sm hover:bg-primary/90"
            asChild
          >
            <Link href="/dashboard/student/home">Submit</Link>
          </Button>
        </div>
      </PageContent>
    </PageContainer>
  );
}
// 1f87dd0c-02fa-4260-99f3-87db025fe955
