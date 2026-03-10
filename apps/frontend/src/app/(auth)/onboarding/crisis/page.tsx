"use client";

import { AlertTriangle, ArrowRight, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/lib/core-ui/button";

const TOTAL_STEPS = 9;
const CURRENT_STEP = 6;

export default function CrisisDisclosurePage() {
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
        <div className="w-full max-w-xl">
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
                Important Notice
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="mb-4 text-center font-bold text-3xl text-gray-900 md:text-4xl">
            Psyflo is not a crisis service
          </h1>

          {/* Warning Card */}
          <div className="mb-8 rounded-2xl border-2 border-amber-200 bg-amber-50 p-6">
            <div className="mb-4 flex items-center justify-center gap-3">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <p className="mb-4 text-center text-gray-700 md:text-lg">
              <strong>Psyflo is not designed to handle mental health emergencies or crisis situations.</strong>
            </p>
            <p className="text-center text-gray-600">
              If you or someone you know is in immediate danger or experiencing a mental health crisis, please reach out to professional crisis services.
            </p>
          </div>

          {/* Crisis Resources */}
          <div className="mb-8 space-y-3">
            <h2 className="mb-4 font-semibold text-gray-900 text-lg">If you're in crisis, please contact:</h2>
            
            <a
              href="tel:988"
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Phone className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">988 Suicide & Crisis Lifeline</p>
                <p className="text-gray-500 text-sm">Call or text 988 (available 24/7)</p>
              </div>
            </a>

            <a
              href="sms:741741&body=HELLO"
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <span className="font-bold text-blue-600">💬</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Crisis Text Line</p>
                <p className="text-gray-500 text-sm">Text HOME to 741741</p>
              </div>
            </a>

            <a
              href="tel:911"
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <span className="font-bold text-emerald-600">🚨</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Emergency Services</p>
                <p className="text-gray-500 text-sm">Call 911 for immediate emergencies</p>
              </div>
            </a>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => router.push("/onboarding/provider")}
              className="rounded-full px-8 py-6 text-base md:text-lg"
              size="lg"
            >
              I understand <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
