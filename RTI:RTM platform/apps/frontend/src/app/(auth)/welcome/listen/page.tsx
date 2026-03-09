"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/lib/core-ui/button";

export default function WelcomePage2() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      {/* Progress Bar - Top */}
      <header className="flex items-center justify-center px-4 pt-6 md:px-8 md:pt-8">
        <div className="flex gap-1.5 md:gap-2">
          <div className="h-1 w-8 rounded-full bg-primary md:w-12" />
          <div className="h-1 w-8 rounded-full bg-primary md:w-12" />
          <div className="h-1 w-8 rounded-full bg-gray-200 md:w-12" />
          <div className="h-1 w-8 rounded-full bg-gray-200 md:w-12" />
          <div className="h-1 w-8 rounded-full bg-gray-200 md:w-12" />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col items-center px-4 pt-8 pb-48 md:justify-center md:px-8 md:pt-0 md:pb-0">
        {/* What's next Badge with decorative sparkle */}
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
              What's next
            </span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="mb-2 text-center font-bold text-4xl text-gray-900 md:mb-4 md:text-6xl 2xl:text-8xl">
          I'm here to listen
        </h1>

        {/* Subtext with sparkle decoration */}
        <div className="relative mb-8 flex items-center justify-center md:mb-10 2xl:mb-16">
          {/* Sparkle decoration - hidden on mobile, visible on desktop */}
          <Image
            src="/images/sparkle-2.svg"
            alt=""
            width={59}
            height={68}
            className="md:-left-16 2xl:-left-20 hidden md:absolute md:top-3 md:block md:h-13 md:w-11 2xl:top-4 2xl:h-17 2xl:w-15"
          />
          <p className="text-center text-gray-600 text-lg md:whitespace-nowrap md:text-xl 2xl:text-[30px]">
            Think of me as your personal space to vent,
            <br className="md:hidden" /> learn, and grow.
          </p>
        </div>

        {/* Feature Cards - Mobile: List layout, Desktop: Grid */}
        <div className="mb-8 w-full max-w-md space-y-4 md:mb-10 md:grid md:max-w-3xl md:grid-cols-3 md:gap-5 md:space-y-0 2xl:mb-16 2xl:max-w-4xl 2xl:gap-6">
          {/* Just Chat */}
          <div className="flex flex-row items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_12px_-2px_rgba(220,235,255,0.6)] md:flex-col md:rounded-3xl md:border-[0.5px] md:px-6 md:py-5 md:shadow-[0_20px_40px_-5px_rgba(210,233,255,1)] 2xl:px-8 2xl:py-6">
            <div className="shrink-0 md:mb-4">
              <Image
                src="/images/im-here-to-listen/just-chat.png"
                alt="Just Chat"
                width={100}
                height={100}
                className="h-12 w-12 object-contain md:h-[72px] md:w-[72px] 2xl:h-[100px] 2xl:w-[100px]"
              />
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-base text-gray-900 md:mb-2 md:text-xl 2xl:text-2xl">
                Just Chat
              </h3>
              <p className="text-gray-500 text-sm md:text-base">
                Whatever's on your mind—big or small—I'm here. No judgment.
              </p>
            </div>
          </div>

          {/* Build Skills */}
          <div className="flex flex-row items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_12px_-2px_rgba(240,230,255,0.6)] md:flex-col md:rounded-3xl md:border-[0.5px] md:px-6 md:py-5 md:shadow-[0_20px_40px_-5px_rgba(240,228,255,1)] 2xl:px-8 2xl:py-6">
            <div className="shrink-0 md:mb-4">
              <Image
                src="/images/im-here-to-listen/build-skills.png"
                alt="Build Skills"
                width={100}
                height={100}
                className="h-12 w-12 object-contain md:h-[72px] md:w-[72px] 2xl:h-[100px] 2xl:w-[100px]"
              />
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-base text-gray-900 md:mb-2 md:text-xl 2xl:text-2xl">
                Build Skills
              </h3>
              <p className="text-gray-500 text-sm md:text-base">
                Discover simple, proven tricks to handle stress, boost your
                mood, and feel more like yourself.
              </p>
            </div>
          </div>

          {/* Real Support */}
          <div className="flex flex-row items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_12px_-2px_rgba(255,240,230,0.6)] md:flex-col md:rounded-3xl md:border-[0.5px] md:px-6 md:py-5 md:shadow-[0_20px_40px_-5px_rgba(255,234,209,1)] 2xl:px-8 2xl:py-6">
            <div className="shrink-0 md:mb-4">
              <Image
                src="/images/im-here-to-listen/real-support.png"
                alt="Real Support"
                width={100}
                height={100}
                className="h-12 w-12 object-contain md:h-[72px] md:w-[72px] 2xl:h-[100px] 2xl:w-[100px]"
              />
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-base text-gray-900 md:mb-2 md:text-xl 2xl:text-2xl">
                Real Support
              </h3>
              <p className="text-gray-500 text-sm md:text-base">
                Most of the time it's just us, but if things get really tough, I
                can help connect you with a real human.
              </p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          onClick={() => router.push("/welcome/privacy")}
          className="rounded-full px-5 py-5 text-base hover:bg-[#C8CCD5] md:px-[20px] md:py-6 md:text-lg 2xl:py-7 2xl:text-xl"
          size="lg"
        >
          Sounds good to me <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </main>

      {/* Mini Soli - peeking from bottom (mobile only) */}
      <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-0 md:hidden">
        <img
          src="/images/mini-soli.svg"
          alt="Soli mascot"
          className="h-auto w-full"
          style={{ display: "block" }}
        />
      </div>
    </div>
  );
}
