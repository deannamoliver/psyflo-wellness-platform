"use client";

import { ArrowRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";

const TOTAL_STEPS = 9;
const CURRENT_STEP = 5;

export default function DemoPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-6 md:px-8 md:pt-8">
        <span className="font-semibold text-primary text-xl">Psyflo</span>
        <Link
          href="/contact"
          className="flex items-center gap-1 text-muted-foreground text-sm hover:text-primary"
        >
          Need help? <span className="text-primary">Contact us</span>
        </Link>
      </header>

      {/* Progress Bar */}
      <div className="flex items-center justify-center px-4 pt-6 md:px-8 md:pt-8">
        <div className="flex gap-1.5 md:gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 w-6 rounded-full md:w-8 ${
                i < CURRENT_STEP ? "bg-primary" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pt-8 md:px-8">
        <div className="w-full max-w-2xl">
          {/* Badge with sparkle */}
          <div className="relative mb-6 mt-4 flex justify-center">
            <Image
              src="/images/sparkle-1.svg"
              alt=""
              width={28}
              height={28}
              className="-top-4 -right-4 absolute"
            />
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-900 bg-white px-5 py-2">
              <span className="font-medium text-gray-900 text-sm md:text-base">
                Quick Demo
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="mb-2 text-center font-bold text-3xl text-gray-900 md:text-4xl">
            See Psyflo in action
          </h1>
          <p className="mb-8 text-center text-gray-500 md:text-lg">
            Watch this short video to see how a typical day with Psyflo looks
          </p>

          {/* Video Placeholder */}
          <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 shadow-lg">
            <div className="aspect-video flex items-center justify-center">
              {!isPlaying ? (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="group flex flex-col items-center gap-4"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-lg transition-transform group-hover:scale-110">
                    <Play className="ml-1 h-8 w-8 text-white" fill="white" />
                  </div>
                  <span className="font-medium text-gray-600">Click to play demo</span>
                </button>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-900 text-white">
                  {/* Video placeholder - replace with actual video element */}
                  <div className="text-center">
                    <p className="mb-2 text-lg">Demo Video</p>
                    <p className="text-gray-400 text-sm">Video file will be added here</p>
                    <button
                      onClick={() => setIsPlaying(false)}
                      className="mt-4 rounded-full bg-white/20 px-4 py-2 text-sm hover:bg-white/30"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Key Points */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-blue-50 p-4 text-center">
              <p className="mb-1 font-bold text-2xl text-primary">~60 sec</p>
              <p className="text-gray-600 text-sm">Daily check-in</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-4 text-center">
              <p className="mb-1 font-bold text-2xl text-purple-600">20+</p>
              <p className="text-gray-600 text-sm">Wellness exercises</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4 text-center">
              <p className="mb-1 font-bold text-2xl text-emerald-600">100%</p>
              <p className="text-gray-600 text-sm">Private & secure</p>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/onboarding/crisis")}
              className="rounded-full px-6 py-6 text-base"
              size="lg"
            >
              Skip video
            </Button>
            <Button
              onClick={() => router.push("/onboarding/crisis")}
              className="rounded-full px-8 py-6 text-base"
              size="lg"
            >
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
