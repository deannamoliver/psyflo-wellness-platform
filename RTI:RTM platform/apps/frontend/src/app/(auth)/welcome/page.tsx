import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/lib/core-ui/button";
import { getCurrentUserInfo } from "@/lib/user/info";
import { ResponsiveTitle } from "./responsive-title";

export default async function WelcomePage1() {
  const userInfo = await getCurrentUserInfo();
  const firstName = userInfo.firstName || "Friend";
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white">
      {/* Progress Bar - Top */}
      <header className="flex items-center justify-center px-4 pt-6 md:px-8 md:pt-8">
        <div className="flex gap-2 md:gap-2">
          <div className="h-1.5 w-10 rounded-full bg-primary md:w-12" />
          <div className="h-1.5 w-10 rounded-full bg-gray-200 md:w-12" />
          <div className="h-1.5 w-10 rounded-full bg-gray-200 md:w-12" />
          <div className="h-1.5 w-10 rounded-full bg-gray-200 md:w-12" />
          <div className="h-1.5 w-10 rounded-full bg-gray-200 md:w-12" />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col items-center px-4 pt-32 md:px-8 md:pt-24">
        {/* Welcome Badge with decorative sparkle */}
        <div className="relative mb-6 md:mb-8">
          {/* Sparkle decoration - top right of badge */}
          <Image
            src="/images/sparkle-1.svg"
            alt=""
            width={32}
            height={33}
            className="-top-5 -right-6 md:-top-5 md:-right-6 2xl:-top-6 2xl:-right-7 absolute h-6 w-6 md:h-6 md:w-6 2xl:h-8 2xl:w-8"
          />
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-900 bg-white px-5 py-2 md:px-5 md:py-2 2xl:px-6 2xl:py-2.5">
            <span className="font-medium text-gray-900 text-sm md:text-base 2xl:text-xl">
              Welcome
            </span>
          </div>
        </div>

        {/* Heading */}
        <ResponsiveTitle firstName={firstName} />
        {/* Heading with sparkle decoration */}
        <div className="relative mb-[32px] md:mb-10">
          {/* Sparkle decoration - bottom left of "I'm" */}
          <Image
            src="/images/sparkle-2.svg"
            alt=""
            width={50}
            height={57}
            className="-left-10 -bottom-[30px] md:-left-11 md:-bottom-8 2xl:-left-14 2xl:-bottom-10 absolute h-12 w-11 md:h-11 md:w-10 2xl:h-14 2xl:w-12"
          />
          <h2 className="text-center font-bold text-7xl md:text-6xl 2xl:text-8xl">
            I'm <span className="text-[#5FB1FD]">Soli</span>
          </h2>
        </div>

        {/* Nice to meet you button */}
        <Link href="/welcome/listen">
          <Button
            className="rounded-full px-6 py-6 text-base hover:bg-[#C8CCD5] md:px-[20px] md:py-6 md:text-lg 2xl:py-7 2xl:text-xl"
            size="lg"
          >
            Nice to meet you <ArrowRight className="h-5 w-5 md:h-5 md:w-5" />
          </Button>
        </Link>
      </main>

      {/* Mini Soli - peeking from bottom */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 flex justify-center">
        <Image
          src="/images/mini-soli.svg"
          alt="Soli mascot"
          width={812}
          height={406}
          className="w-full max-w-md md:max-w-3xl 2xl:max-w-4xl"
          priority
        />
      </div>
    </div>
  );
}
