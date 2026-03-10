"use client";

import { ArrowRight, BarChart3, ClipboardCheck, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/lib/core-ui/button";

const TOTAL_STEPS = 6;
const CURRENT_STEP = 4;

export default function ProviderWelcomePage() {
  const router = useRouter();

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
            Welcome, Provider!
          </h1>
          <p className="mb-8 text-center text-gray-500 md:text-lg">
            Psyflo helps you monitor patient wellness between appointments through Remote Therapeutic Monitoring (RTM).
          </p>

          {/* How It Works */}
          <h2 className="mb-6 text-center font-semibold text-gray-900 text-xl md:text-2xl">
            Here's what you can do with Psyflo
          </h2>

          <div className="mb-8 space-y-4">
            {/* Feature 1 */}
            <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">Manage Your Caseload</h3>
                <p className="text-gray-500">
                  Enroll patients, view their engagement, and manage your entire caseload from one dashboard.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                <ClipboardCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">Review Patient Check-ins</h3>
                <p className="text-gray-500">
                  Access daily mood check-in responses and wellness data to stay informed between sessions.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-purple-100">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">Track Trends & Insights</h3>
                <p className="text-gray-500">
                  View wellness trends, patterns, and receive alerts when patients may need additional support.
                </p>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => router.push("/provider-onboarding/crisis")}
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
