"use client";

import { ArrowRight, CheckCircle, Loader2, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/lib/core-ui/button";

export default function ProviderOnboardingCompletePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<"provider" | "practice_manager">("provider");

  useEffect(() => {
    // In real app, this would come from the user's session/auth context
    const role = sessionStorage.getItem("provider_onboarding_role");
    if (role === "practice_manager") {
      setUserRole("practice_manager");
    }
  }, []);

  const handleGetStarted = async () => {
    setIsLoading(true);
    // Mark onboarding as complete
    localStorage.setItem("providerOnboardingComplete", "true");
    
    // Navigate to respective dashboard based on role
    if (userRole === "practice_manager") {
      router.push("/dashboard/practice");
    } else {
      router.push("/dashboard/counselor");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 md:px-8">
        <div className="w-full max-w-lg text-center">
          {/* Success Icon */}
          <div className="relative mb-8 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-12 w-12 text-emerald-500" />
            </div>
            <Image
              src="/images/sparkle-1.svg"
              alt=""
              width={32}
              height={32}
              className="-top-2 -right-2 absolute"
            />
          </div>

          {/* Heading */}
          <h1 className="mb-4 font-bold text-4xl text-gray-900 md:text-5xl">
            You're all set!
          </h1>
          <p className="mb-8 text-gray-500 text-lg md:text-xl">
            Your account is ready. Welcome to Psyflo!
          </p>

          {/* What's Next */}
          <div className="mb-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-6">
            <div className="mb-4 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-gray-900 text-lg">What's Next?</h2>
            </div>
            <p className="text-gray-600">
              {userRole === "practice_manager" 
                ? "Head to your dashboard to set up your practice, invite providers, and start enrolling patients."
                : "Head to your dashboard to view your caseload, enroll patients, and start monitoring their wellness."
              }
            </p>
          </div>

          {/* Get Started Button */}
          <Button
            onClick={handleGetStarted}
            disabled={isLoading}
            className="rounded-full px-10 py-7 text-lg"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
