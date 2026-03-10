"use client";

import { ArrowRight, Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/lib/core-ui/button";

const TOTAL_STEPS = 9;
const CURRENT_STEP = 7;

export default function ProviderContactPage() {
  const router = useRouter();

  // Mock provider info - in real app, this would come from the user's assignment
  const provider = {
    name: "Dr. Sarah Johnson",
    title: "Licensed Clinical Psychologist",
    organization: "Wellness Clinic",
    phone: "(555) 123-4567",
    email: "appointments@wellnessclinic.com",
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
                Your Provider
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="mb-2 text-center font-bold text-3xl text-gray-900 md:text-4xl">
            How to reach your provider
          </h1>
          <p className="mb-8 text-center text-gray-500 md:text-lg">
            Save this information for when you need to contact your care team
          </p>

          {/* Provider Card */}
          <div className="mb-6 rounded-2xl border border-gray-100 bg-gradient-to-br from-primary/5 to-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="font-bold text-2xl text-primary">
                  {provider.name.split(" ").map(n => n[0]).join("")}
                </span>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-xl">{provider.name}</h2>
                <p className="text-gray-500">{provider.title}</p>
                <p className="text-gray-400 text-sm">{provider.organization}</p>
              </div>
            </div>

          </div>

          {/* Contact Methods */}
          <div className="mb-8 space-y-3">
            <a
              href={`tel:${provider.phone.replace(/\D/g, "")}`}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Phone</p>
                <p className="text-gray-500">{provider.phone}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </a>

            <a
              href={`mailto:${provider.email}`}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Email</p>
                <p className="text-gray-500">{provider.email}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </a>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => router.push("/onboarding/terms")}
              className="rounded-full px-8 py-6 text-base md:text-lg"
              size="lg"
            >
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
