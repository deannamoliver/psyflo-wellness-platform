"use client";

import { ArrowRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { Large } from "@/lib/core-ui/typography";
import { cn } from "@/lib/tailwind-utils";
import {
  getWellnessCheckSoliImage,
  syncSoliSettingsToLocalStorage,
} from "@/lib/user/soli-settings";

export default function FirstScreen({
  firstResponseId,
  className,
}: {
  firstResponseId: string;
  className?: string;
}) {
  const [soliImage, setSoliImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    <div
      className={cn(
        "relative flex w-full flex-col items-center gap-6 rounded-2xl bg-white p-8 shadow-lg",
        className,
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
      <div className="flex justify-center pt-8">
        {soliImage && !isLoading ? (
          <Image
            src={soliImage}
            alt="Wellness Check"
            width={100}
            height={100}
            className="h-auto w-24"
          />
        ) : (
          <Skeleton className="h-24 w-24 rounded-full border border-gray-300 bg-gray-100" />
        )}
      </div>

      {/* Welcome Message */}
      <div className="flex max-w-2xl flex-col gap-2">
        <Large className="text-center font-medium text-gray-800 text-lg">
          Take a moment to reflect on your{" "}
          <span className="font-semibold">well-being.</span> This personalized
          wellness check helps you track your physical, mental, and emotional
          health journey.
        </Large>
      </div>

      {/* Get Started Button */}
      <Button
        className="bg-primary px-6 py-5 font-semibold text-primary-foreground text-sm hover:bg-primary/90"
        asChild
      >
        <Link
          href={`/dashboard/student/wellness-check/${firstResponseId}`}
          className="flex items-center gap-2"
        >
          Get Started
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
