"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { completeOnboarding } from "./action";

export default function ExpectPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true);
    // Mark welcome as seen in localStorage
    localStorage.setItem("welcomeSeen", "true");
    // Mark onboarding as complete in database and redirect
    await completeOnboarding();
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Progress Bar - Top */}
      <header className="flex items-center justify-center px-4 pt-6 md:px-8 md:pt-8">
        <div className="flex gap-1.5 md:gap-2">
          <div className="h-1 w-8 rounded-full bg-primary md:w-12" />
          <div className="h-1 w-8 rounded-full bg-primary md:w-12" />
          <div className="h-1 w-8 rounded-full bg-primary md:w-12" />
          <div className="h-1 w-8 rounded-full bg-primary md:w-12" />
          <div className="h-1 w-8 rounded-full bg-primary md:w-12" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 md:px-8">
        {/* How it works Badge with decorative sparkle */}
        <div className="relative mb-4 md:mb-8">
          {/* Sparkle decoration - top right of badge */}
          <Image
            src="/images/sparkle-1.svg"
            alt=""
            width={32}
            height={33}
            className="-top-4 -right-5 md:-top-5 md:-right-6 2xl:-top-6 2xl:-right-7 absolute h-5 w-5 md:h-6 md:w-6 2xl:h-8 2xl:w-8"
          />
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-900 bg-white px-4 py-1.5 md:px-5 md:py-2 2xl:px-6 2xl:py-2.5">
            <span className="font-medium text-gray-900 text-sm md:text-base 2xl:text-xl">
              How it Works
            </span>
          </div>
        </div>

        {/* Heading with sparkle decoration */}
        <div className="relative mb-10 md:mb-14 2xl:mb-24">
          {/* Sparkle decoration - left of heading */}
          <Image
            src="/images/sparkle-2.svg"
            alt=""
            width={59}
            height={68}
            className="-left-8 md:-left-12 2xl:-left-15 absolute top-7 h-10 w-9 md:top-14 md:h-13 md:w-11 2xl:top-20 2xl:h-17 2xl:w-15"
          />
          <h1 className="text-center font-bold text-4xl text-gray-900 md:text-6xl 2xl:text-8xl">
            What to expect
          </h1>
        </div>

        {/* Subtext */}
        <div className="mb-10 flex flex-col items-center justify-center md:mb-10 2xl:mb-16">
          <p className="text-center text-gray-600 text-lg md:text-xl 2xl:text-[30px]">
            Every day, we'll start with a quick mood check-in to see how you're
            doing.
          </p>
          <p className="mt-2 text-center font-semibold text-gray-900 text-lg md:text-xl 2xl:text-[30px]">
            After that, start your day however you'd like!
          </p>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={isLoading}
          className="rounded-full px-5 py-5 text-base hover:bg-[#C8CCD5] md:px-[20px] md:py-6 md:text-lg 2xl:py-7 2xl:text-xl"
          size="lg"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin md:h-5 md:w-5" />
          ) : (
            <>
              Let's go <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
            </>
          )}
        </Button>
      </main>
    </div>
  );
}
