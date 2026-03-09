"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/lib/core-ui/button";

export default function WelcomePage3() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Progress Bar - Top */}
      <header className="flex items-center justify-center px-4 pt-6 md:px-8 md:pt-8">
        <div className="flex gap-1.5 md:gap-2">
          <div className="h-1 w-8 rounded-full bg-primary md:w-12" />
          <div className="h-1 w-8 rounded-full bg-primary md:w-12" />
          <div className="h-1 w-8 rounded-full bg-primary md:w-12" />
          <div className="h-1 w-8 rounded-full bg-gray-200 md:w-12" />
          <div className="h-1 w-8 rounded-full bg-gray-200 md:w-12" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 md:px-8">
        {/* Safe Zone Badge with decorative sparkle */}
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
              Safe Zone
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="relative">
          <h1 className="text-center font-bold text-4xl text-gray-900 md:text-6xl 2xl:text-8xl">
            Your space,
          </h1>
          <h2 className="mb-4 text-center font-bold text-4xl text-[#5FB1FD] md:mb-12 md:text-6xl 2xl:mb-20 2xl:text-8xl">
            your privacy
          </h2>
        </div>

        {/* Subtext */}
        <div className="relative mb-8 flex flex-col items-center justify-center md:mb-12 2xl:mb-20">
          <p className="text-center text-lg md:text-xl 2xl:text-[30px]">
            <span className="text-gray-600">
              This is a place just for you. Our conversations are private.
            </span>
            <br className="hidden md:block" />{" "}
            <span className="font-semibold text-gray-900">
              Teachers, counselors, and parents cannot read our chats.
            </span>
          </p>
        </div>

        {/* Privacy Cards - Mobile: Stacked list, Desktop: Grid */}
        <div className="mb-12 w-full max-w-md space-y-4 md:mb-10 md:grid md:max-w-3xl md:grid-cols-2 md:gap-5 md:space-y-0 2xl:mb-16 2xl:max-w-4xl 2xl:gap-6">
          {/* Just Between Us */}
          <div className="relative flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_12px_-2px_rgba(220,235,255,0.6)] md:rounded-3xl md:border-[0.5px] md:px-6 md:py-5 md:shadow-[0_20px_40px_-5px_rgba(210,233,255,1)] 2xl:px-8 2xl:py-6">
            <h3 className="mb-1 font-semibold text-base text-gray-900 md:mb-2 md:text-xl 2xl:text-2xl">
              Just Between Us
            </h3>
            <p className="text-gray-500 text-sm md:text-base">
              What you share here stays here. No one else has access to your
              chat history.
            </p>
          </div>

          {/* Safety First */}
          <div className="relative flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_12px_-2px_rgba(240,230,255,0.6)] md:rounded-3xl md:border-[0.5px] md:px-6 md:py-5 md:shadow-[0_20px_40px_-5px_rgba(240,228,255,1)] 2xl:px-8 2xl:py-6">
            <h3 className="mb-1 font-semibold text-base text-gray-900 md:mb-2 md:text-xl 2xl:text-2xl">
              Safety First
            </h3>
            <p className="text-gray-500 text-sm md:text-base">
              The only exception is if you or someone else is in danger. In that
              case, we'll help connect you to a safe adult.
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <Link href="/welcome/customize">
          <Button
            className="rounded-full px-5 py-5 text-base hover:bg-[#C8CCD5] md:px-[20px] md:py-6 md:text-lg 2xl:py-7 2xl:text-xl"
            size="lg"
          >
            I understand <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </Link>
      </main>
    </div>
  );
}
