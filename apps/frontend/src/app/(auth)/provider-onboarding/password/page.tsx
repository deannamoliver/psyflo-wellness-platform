"use client";

import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { Input } from "@/lib/core-ui/input";
import { Label } from "@/lib/core-ui/label";

const TOTAL_STEPS = 6;
const CURRENT_STEP = 3;

const PASSWORD_REQUIREMENTS = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
];

export default function ProviderCreatePasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const allRequirementsMet = PASSWORD_REQUIREMENTS.every((req) => req.test(password));
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleContinue = async () => {
    if (!allRequirementsMet) {
      setError("Please meet all password requirements");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    // Store password securely (in real app, this would be sent to server)
    sessionStorage.setItem("provider_onboarding_passwordSet", "true");
    
    // Navigate to welcome
    router.push("/provider-onboarding/welcome");
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
            onClick={() => router.back()}
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
                Security
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="mb-2 text-center font-bold text-3xl text-gray-900 md:text-4xl">
            Create your password
          </h1>
          <p className="mb-8 text-center text-gray-500 md:text-lg">
            Choose a strong password to keep your account secure
          </p>

          {/* Form */}
          <div className="space-y-4">
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="h-12 border-gray-200 pr-12 pl-10 text-base shadow-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="-translate-y-1/2 absolute top-1/2 right-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="mb-2 font-medium text-gray-700 text-sm">Password must have:</p>
              <div className="space-y-1">
                {PASSWORD_REQUIREMENTS.map((req, index) => {
                  const met = req.test(password);
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div className={`flex h-4 w-4 items-center justify-center rounded-full ${
                        met ? "bg-emerald-500" : "bg-gray-300"
                      }`}>
                        {met && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className={`text-sm ${met ? "text-emerald-600" : "text-gray-500"}`}>
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-base text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  className="h-12 border-gray-200 pr-12 pl-10 text-base shadow-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="-translate-y-1/2 absolute top-1/2 right-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {confirmPassword && (
                <div className="flex items-center gap-2">
                  {passwordsMatch ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span className="text-emerald-600 text-sm">Passwords match</span>
                    </>
                  ) : (
                    <span className="text-destructive text-sm">Passwords do not match</span>
                  )}
                </div>
              )}
            </div>

            {error && (
              <p className="text-center text-destructive text-sm">{error}</p>
            )}

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              disabled={isLoading || !allRequirementsMet || !passwordsMatch}
              className="mt-6 w-full rounded-full py-6 text-base"
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
