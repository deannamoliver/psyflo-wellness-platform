"use client";

import { ArrowRight, Check, ExternalLink, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";

const TOTAL_STEPS = 9;
const CURRENT_STEP = 8;

export default function TermsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const canContinue = agreedToTerms && agreedToPrivacy;

  const handleContinue = async () => {
    if (!canContinue) return;
    
    setIsLoading(true);
    // Store agreement
    sessionStorage.setItem("onboarding_termsAgreed", "true");
    sessionStorage.setItem("onboarding_privacyAgreed", "true");
    
    router.push("/onboarding/consent");
  };

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
      <main className="flex flex-1 flex-col items-center justify-center px-4 md:px-8">
        <div className="w-full max-w-xl">
          {/* Badge with sparkle */}
          <div className="relative mb-6 flex justify-center">
            <Image
              src="/images/sparkle-1.svg"
              alt=""
              width={28}
              height={28}
              className="-top-4 -right-4 absolute"
            />
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-900 bg-white px-5 py-2">
              <span className="font-medium text-gray-900 text-sm md:text-base">
                Legal
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="mb-2 text-center font-bold text-3xl text-gray-900 md:text-4xl">
            Terms & Privacy
          </h1>
          <p className="mb-8 text-center text-gray-500 md:text-lg">
            Please review and agree to our policies to continue
          </p>

          {/* Agreement Cards */}
          <div className="mb-8 space-y-4">
            {/* Terms of Service */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900 text-lg">Terms of Service</h3>
                  <p className="text-gray-500 text-sm">
                    Our terms outline how you can use Psyflo and what we expect from users.
                  </p>
                </div>
                <Link
                  href="/terms-and-conditions"
                  target="_blank"
                  className="flex items-center gap-1 text-primary text-sm hover:underline"
                >
                  Read <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <button
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className="flex w-full items-center gap-3 rounded-xl border border-gray-200 p-4 transition-colors hover:bg-gray-50"
              >
                <div className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors ${
                  agreedToTerms ? "border-primary bg-primary" : "border-gray-300"
                }`}>
                  {agreedToTerms && <Check className="h-4 w-4 text-white" />}
                </div>
                <span className="text-gray-700 text-sm">
                  I have read and agree to the Terms of Service
                </span>
              </button>
            </div>

            {/* Privacy Policy */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900 text-lg">Privacy Policy</h3>
                  <p className="text-gray-500 text-sm">
                    Learn how we collect, use, and protect your personal information.
                  </p>
                </div>
                <Link
                  href="/privacy-policy"
                  target="_blank"
                  className="flex items-center gap-1 text-primary text-sm hover:underline"
                >
                  Read <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <button
                onClick={() => setAgreedToPrivacy(!agreedToPrivacy)}
                className="flex w-full items-center gap-3 rounded-xl border border-gray-200 p-4 transition-colors hover:bg-gray-50"
              >
                <div className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors ${
                  agreedToPrivacy ? "border-primary bg-primary" : "border-gray-300"
                }`}>
                  {agreedToPrivacy && <Check className="h-4 w-4 text-white" />}
                </div>
                <span className="text-gray-700 text-sm">
                  I have read and agree to the Privacy Policy
                </span>
              </button>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleContinue}
              disabled={!canContinue || isLoading}
              className="rounded-full px-8 py-6 text-base md:text-lg"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Continue <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
