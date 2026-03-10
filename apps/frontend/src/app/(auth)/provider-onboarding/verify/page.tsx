"use client";

import { ArrowLeft, ArrowRight, Loader2, Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { Input } from "@/lib/core-ui/input";

const TOTAL_STEPS = 6;
const CURRENT_STEP = 2;

export default function ProviderVerifyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<"email" | "phone">("email");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Mock contact info - in real app, this would come from the claim verification
  const email = "j***@example.com";
  const phone = "(***) ***-1234";

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOtp = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setOtpSent(true);
    setResendTimer(60);
    setIsLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Navigate to password creation
    router.push("/provider-onboarding/password");
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setResendTimer(60);
    setOtp(["", "", "", "", "", ""]);
    setIsLoading(false);
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
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => otpSent ? setOtpSent(false) : router.back()}
            className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* Badge */}
          <div className="relative mb-6 mt-4 flex justify-center">
            <Image
              src="/images/sparkle-1.svg"
              alt=""
              width={24}
              height={24}
              className="-top-3 -right-3 absolute"
            />
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-900 bg-white px-5 py-2">
              <span className="font-medium text-gray-900 text-sm md:text-base">
                Verification
              </span>
            </div>
          </div>

          {!otpSent ? (
            <>
              {/* Heading */}
              <h1 className="mb-2 text-center font-bold text-3xl text-gray-900 md:text-4xl">
                Verify it's you
              </h1>
              <p className="mb-8 text-center text-gray-500 md:text-lg">
                Choose how you'd like to receive your verification code
              </p>

              {/* Verification Method Selection */}
              <div className="space-y-3">
                <button
                  onClick={() => setVerificationMethod("email")}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 transition-all ${
                    verificationMethod === "email"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    verificationMethod === "email" ? "bg-primary/10" : "bg-gray-100"
                  }`}>
                    <Mail className={`h-6 w-6 ${
                      verificationMethod === "email" ? "text-primary" : "text-gray-500"
                    }`} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-gray-500 text-sm">{email}</p>
                  </div>
                </button>

                <button
                  onClick={() => setVerificationMethod("phone")}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 transition-all ${
                    verificationMethod === "phone"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    verificationMethod === "phone" ? "bg-primary/10" : "bg-gray-100"
                  }`}>
                    <Phone className={`h-6 w-6 ${
                      verificationMethod === "phone" ? "text-primary" : "text-gray-500"
                    }`} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Phone</p>
                    <p className="text-gray-500 text-sm">{phone}</p>
                  </div>
                </button>
              </div>

              {/* Send Code Button */}
              <Button
                onClick={handleSendOtp}
                disabled={isLoading}
                className="mt-6 w-full rounded-full py-6 text-base"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Send verification code <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {/* OTP Entry */}
              <h1 className="mb-2 text-center font-bold text-3xl text-gray-900 md:text-4xl">
                Enter your code
              </h1>
              <p className="mb-8 text-center text-gray-500 md:text-lg">
                We sent a 6-digit code to your {verificationMethod}
              </p>

              {/* OTP Inputs */}
              <div className="mb-6 flex justify-center gap-2 md:gap-3">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="h-14 w-12 border-gray-200 text-center font-semibold text-xl shadow-none md:h-16 md:w-14"
                  />
                ))}
              </div>

              {error && (
                <p className="mb-4 text-center text-destructive text-sm">{error}</p>
              )}

              {/* Verify Button */}
              <Button
                onClick={handleVerify}
                disabled={isLoading}
                className="w-full rounded-full py-6 text-base"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Verify <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              {/* Resend */}
              <p className="mt-6 text-center text-gray-500 text-sm">
                Didn't receive a code?{" "}
                {resendTimer > 0 ? (
                  <span className="text-gray-400">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    onClick={handleResend}
                    className="text-primary hover:underline"
                  >
                    Resend code
                  </button>
                )}
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
