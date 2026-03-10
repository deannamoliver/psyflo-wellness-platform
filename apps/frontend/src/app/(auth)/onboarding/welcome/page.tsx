"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/lib/core-ui/button";

const TOTAL_STEPS = 9;
const CURRENT_STEP = 4;

export default function WelcomeDetailPage() {
  const router = useRouter();
  
  // Mock provider info - in real app, this would come from the user's assignment
  const providerName = "Dr. Sarah Johnson";
  const organizationName = "Wellness Clinic";

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
                Welcome to Psyflo
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="mb-4 text-center font-bold text-3xl text-gray-900 md:text-5xl">
            You're all set up!
          </h1>
          
          {/* Provider Info */}
          <div className="mb-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center">
            <p className="mb-2 text-gray-600">Assigned by</p>
            <p className="font-bold text-gray-900 text-xl">{providerName}</p>
            <p className="text-gray-500">{organizationName}</p>
          </div>

          {/* How It Works */}
          <h2 className="mb-6 text-center font-semibold text-gray-900 text-xl md:text-2xl">
            Here's how Psyflo works
          </h2>

          <div className="mb-8 space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                1
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">Daily Check-ins</h3>
                <p className="text-gray-500">
                  Complete a short daily check-in (3-4 questions, ~60 seconds) to track how you're feeling over time.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                2
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">Exercises & Skill Building</h3>
                <p className="text-gray-500">
                  Access guided exercises and skill-building activities designed to support your mental wellness journey.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                3
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">Your Provider Stays Informed</h3>
                <p className="text-gray-500">
                  Your provider reviews your check-in responses to better support you during appointments.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                4
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">Build Healthy Habits</h3>
                <p className="text-gray-500">
                  Track habits, practice mindfulness, and build skills that support your mental health between appointments.
                </p>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => router.push("/onboarding/demo")}
              className="rounded-full px-8 py-6 text-base md:text-lg"
              size="lg"
            >
              Got it! <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
