"use client";

import { ArrowRight, Calendar, Loader2, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { Input } from "@/lib/core-ui/input";
import { Label } from "@/lib/core-ui/label";

const TOTAL_STEPS = 9;
const CURRENT_STEP = 1;

export default function ClaimAccountPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; dob?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!dob) {
      newErrors.dob = "Date of birth is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    // Store in session for later use
    sessionStorage.setItem("onboarding_firstName", firstName);
    sessionStorage.setItem("onboarding_lastName", lastName);
    sessionStorage.setItem("onboarding_dob", dob);
    
    // Navigate to OTP verification
    router.push("/onboarding/verify");
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
          {/* Badge with sparkle */}
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
                Welcome to Psyflo
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="mb-2 text-center font-bold text-3xl text-gray-900 md:text-4xl">
            Let's verify your account
          </h1>
          <p className="mb-8 text-center text-gray-500 md:text-lg">
            Enter your information to claim your account
          </p>

          {/* Form */}
          <div className="space-y-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-base text-gray-700">
                First Name
              </Label>
              <div className="relative">
                <User className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-gray-400" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-12 border-gray-200 pl-10 text-base shadow-none"
                />
              </div>
              {errors.firstName && (
                <p className="text-destructive text-sm">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-base text-gray-700">
                Last Name
              </Label>
              <div className="relative">
                <User className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-gray-400" />
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-12 border-gray-200 pl-10 text-base shadow-none"
                />
              </div>
              {errors.lastName && (
                <p className="text-destructive text-sm">{errors.lastName}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dob" className="text-base text-gray-700">
                Date of Birth
              </Label>
              <div className="relative">
                <Calendar className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-gray-400" />
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="h-12 border-gray-200 pl-10 text-base shadow-none"
                />
              </div>
              {errors.dob && (
                <p className="text-destructive text-sm">{errors.dob}</p>
              )}
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              disabled={isLoading}
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

          <p className="mt-6 text-center text-gray-400 text-sm">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>

    </div>
  );
}
