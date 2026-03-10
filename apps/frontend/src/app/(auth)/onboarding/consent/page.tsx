"use client";

import { ArrowRight, Check, FileText, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";

const TOTAL_STEPS = 9;
const CURRENT_STEP = 9;

export default function ConsentFormPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasReadConsent, setHasReadConsent] = useState(false);
  const [agreedToConsent, setAgreedToConsent] = useState(false);

  const canContinue = hasReadConsent && agreedToConsent;

  const handleContinue = async () => {
    if (!canContinue) return;
    
    setIsLoading(true);
    // Store consent
    sessionStorage.setItem("onboarding_consentAgreed", "true");
    
    router.push("/onboarding/complete");
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
                Consent
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="mb-2 text-center font-bold text-3xl text-gray-900 md:text-4xl">
            Informed Consent
          </h1>
          <p className="mb-8 text-center text-gray-500 md:text-lg">
            Please review and sign the consent form to use Psyflo
          </p>

          {/* Consent Form Preview */}
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Form Header */}
            <div className="flex items-center gap-3 border-b border-gray-100 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Remote Therapeutic Monitoring Consent</h3>
                <p className="text-gray-500 text-sm">Required for RTM services</p>
              </div>
            </div>

            {/* Scrollable Consent Content */}
            <div className="max-h-80 overflow-y-auto p-6">
              <div className="prose prose-sm text-gray-600">
                <h4 className="font-semibold text-gray-900">What You Are Consenting To</h4>
                <p>
                  You are enrolling in RTM through the <strong>Psyflo web portal</strong> (app.psyflo.com). 
                  You will complete a short daily check-in (3-4 questions, ~60 seconds). Your provider 
                  reviews your responses between appointments.
                </p>

                <h4 className="mt-4 font-semibold text-gray-900">Data Collected</h4>
                <p>
                  Check-in responses, submission timestamps, and questionnaire answers. 
                  <strong> No location, camera, or contact data is collected.</strong>
                </p>

                <h4 className="mt-4 font-semibold text-gray-900">Who Sees Your Data</h4>
                <p>
                  Your provider and authorized clinic staff only. Data is <strong>never sold</strong>. 
                  Psyflo staff access de-identified aggregated data for quality purposes only.
                </p>

                <h4 className="mt-4 font-semibold text-gray-900">Your Rights</h4>
                <p>
                  Participation is <strong>voluntary</strong>. You may withdraw at any time without 
                  affecting your other care. HIPAA-compliant. TLS 1.3 / AES-256 encryption.
                </p>

                <h4 className="mt-4 font-semibold text-gray-900">Insurance Billing & Your Costs</h4>
                <p>
                  Your provider may bill RTM CPT codes 98975-98981. You are responsible for any 
                  applicable co-pay, co-insurance, or deductible amounts as determined by your 
                  insurance plan, unless your provider has elected to waive patient cost-sharing 
                  for RTM services.
                </p>

                <div className="mt-4 rounded-lg border-2 border-red-200 bg-red-50 p-3">
                  <p className="font-semibold text-red-700">
                    ⚠️ NOT a crisis or emergency service
                  </p>
                  <p className="mt-1 text-red-600 text-xs">
                    Do not use Psyflo to report an emergency. Check-ins are <strong>not monitored in real time</strong>. 
                    In an emergency: Call/text 988 · Call 911 · Go to nearest ER.
                  </p>
                </div>
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="border-t border-gray-100 p-3 text-center">
              <p className="text-gray-400 text-xs">Scroll to read the full consent form</p>
            </div>
          </div>

          {/* Agreement Checkboxes */}
          <div className="mb-8 space-y-3">
            <button
              onClick={() => setHasReadConsent(!hasReadConsent)}
              className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
            >
              <div className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors ${
                hasReadConsent ? "border-primary bg-primary" : "border-gray-300"
              }`}>
                {hasReadConsent && <Check className="h-4 w-4 text-white" />}
              </div>
              <span className="text-left text-gray-700 text-sm">
                I have read and understand the consent form above
              </span>
            </button>

            <button
              onClick={() => setAgreedToConsent(!agreedToConsent)}
              className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
            >
              <div className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors ${
                agreedToConsent ? "border-primary bg-primary" : "border-gray-300"
              }`}>
                {agreedToConsent && <Check className="h-4 w-4 text-white" />}
              </div>
              <span className="text-left text-gray-700 text-sm">
                I consent to participate in Remote Therapeutic Monitoring through Psyflo
              </span>
            </button>
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
                  Sign & Continue <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
