"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { Input } from "@/lib/core-ui/input";
import { Label } from "@/lib/core-ui/label";

const TOTAL_STEPS = 11;
const CURRENT_STEP = 10;

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "other", label: "Other" },
  { value: "prefer-not", label: "Prefer not to say" },
];

const ETHNICITY_OPTIONS = [
  { value: "american-indian", label: "American Indian or Alaska Native" },
  { value: "asian", label: "Asian" },
  { value: "black", label: "Black or African American" },
  { value: "hispanic", label: "Hispanic or Latino" },
  { value: "pacific-islander", label: "Native Hawaiian or Pacific Islander" },
  { value: "white", label: "White" },
  { value: "two-or-more", label: "Two or more races" },
  { value: "other", label: "Other" },
  { value: "prefer-not", label: "Prefer not to say" },
];

const GRADE_OPTIONS = [
  { value: "6", label: "6th Grade" },
  { value: "7", label: "7th Grade" },
  { value: "8", label: "8th Grade" },
  { value: "9", label: "9th Grade (Freshman)" },
  { value: "10", label: "10th Grade (Sophomore)" },
  { value: "11", label: "11th Grade (Junior)" },
  { value: "12", label: "12th Grade (Senior)" },
  { value: "college", label: "College" },
  { value: "other", label: "Other" },
];

export default function DemographicsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [gender, setGender] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [grade, setGrade] = useState("");
  const [zipCode, setZipCode] = useState("");

  const handleContinue = async () => {
    setIsLoading(true);
    
    // Store demographics (optional data)
    if (gender) sessionStorage.setItem("onboarding_gender", gender);
    if (ethnicity) sessionStorage.setItem("onboarding_ethnicity", ethnicity);
    if (grade) sessionStorage.setItem("onboarding_grade", grade);
    if (zipCode) sessionStorage.setItem("onboarding_zipCode", zipCode);
    
    // Navigate to customize Soli
    router.push("/onboarding/customize");
  };

  const handleSkip = () => {
    router.push("/onboarding/customize");
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
      <main className="flex flex-1 flex-col items-center px-4 py-8 md:justify-center md:px-8 md:py-0">
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
                Optional
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="mb-2 text-center font-bold text-3xl text-gray-900 md:text-4xl">
            Tell us about yourself
          </h1>
          <p className="mb-8 text-center text-gray-500 md:text-lg">
            This information helps us improve your experience. All fields are optional.
          </p>

          {/* Form */}
          <div className="space-y-5">
            {/* Gender */}
            <div className="space-y-2">
              <Label className="text-base text-gray-700">Gender</Label>
              <div className="flex flex-wrap gap-2">
                {GENDER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setGender(gender === option.value ? "" : option.value)}
                    className={`rounded-full px-4 py-2 text-sm transition-all ${
                      gender === option.value
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ethnicity */}
            <div className="space-y-2">
              <Label className="text-base text-gray-700">Race/Ethnicity</Label>
              <div className="flex flex-wrap gap-2">
                {ETHNICITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setEthnicity(ethnicity === option.value ? "" : option.value)}
                    className={`rounded-full px-4 py-2 text-sm transition-all ${
                      ethnicity === option.value
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grade Level */}
            <div className="space-y-2">
              <Label className="text-base text-gray-700">Grade Level</Label>
              <div className="flex flex-wrap gap-2">
                {GRADE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setGrade(grade === option.value ? "" : option.value)}
                    className={`rounded-full px-4 py-2 text-sm transition-all ${
                      grade === option.value
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zip Code */}
            <div className="space-y-2">
              <Label htmlFor="zipCode" className="text-base text-gray-700">
                Zip Code
              </Label>
              <Input
                id="zipCode"
                type="text"
                placeholder="Enter your zip code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.slice(0, 5))}
                maxLength={5}
                className="h-12 border-gray-200 text-base shadow-none"
              />
            </div>
          </div>

          {/* Privacy Note */}
          <p className="mt-6 text-center text-gray-400 text-sm">
            This information is used only to improve our services and is never shared with third parties.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="rounded-full px-6 py-6 text-base"
              size="lg"
            >
              Skip for now
            </Button>
            <Button
              onClick={handleContinue}
              disabled={isLoading}
              className="rounded-full px-8 py-6 text-base"
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
