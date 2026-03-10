"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";

const TOTAL_STEPS = 11;
const CURRENT_STEP = 11;

const COLORS = [
  { name: "blue", hex: "#60a5fa", ring: "#60a5fa" },
  { name: "teal", hex: "#2dd4bf", ring: "#2dd4bf" },
  { name: "purple", hex: "#a855f7", ring: "#a855f7" },
  { name: "pink", hex: "#ec4899", ring: "#ec4899" },
  { name: "orange", hex: "#fb923c", ring: "#fb923c" },
  { name: "green", hex: "#22c55e", ring: "#22c55e" },
  { name: "yellow", hex: "#facc15", ring: "#facc15" },
  { name: "royal", hex: "#2563eb", ring: "#2563eb" },
];

const SHAPES = [
  { name: "round", label: "Round" },
  { name: "tall", label: "Tall" },
  { name: "wide", label: "Wide" },
  { name: "chunky", label: "Chunky" },
];

function getMascotImage(color: string, shape: string) {
  return `/images/soli_variations/soli_happy_${color}_${shape}.svg`;
}

function ShapeIcon({ shape, selected }: { shape: string; selected: boolean }) {
  const fillColor = selected ? "#60a5fa" : "#d1d5db";
  switch (shape) {
    case "round":
      return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="12" fill={fillColor} />
        </svg>
      );
    case "tall":
      return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="11" y="4" width="10" height="24" rx="5" fill={fillColor} />
        </svg>
      );
    case "wide":
      return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="11" width="24" height="10" rx="5" fill={fillColor} />
        </svg>
      );
    case "chunky":
      return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="6" y="6" width="20" height="20" rx="4" fill={fillColor} />
        </svg>
      );
    default:
      return null;
  }
}

export default function CustomizeSoliPage() {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState("blue");
  const [selectedShape, setSelectedShape] = useState("round");
  const [isSaving, setIsSaving] = useState(false);

  const mascotImage = getMascotImage(selectedColor, selectedShape);

  const handleContinue = async () => {
    setIsSaving(true);

    // Save to localStorage for immediate access
    localStorage.setItem("soliColor", selectedColor);
    localStorage.setItem("soliShape", selectedShape);

    // Navigate to completion/dashboard
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
      <main className="flex flex-1 flex-col items-center px-4 pt-8 md:justify-center md:px-8 md:pt-0">
        {/* Badge with sparkle */}
        <div className="relative mb-4 md:mb-8">
          <Image
            src="/images/sparkle-1.svg"
            alt=""
            width={32}
            height={33}
            className="-top-4 -right-5 md:-top-5 md:-right-6 absolute h-5 w-5 md:h-6 md:w-6"
          />
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-900 bg-white px-4 py-1.5 md:px-5 md:py-2">
            <span className="font-medium text-gray-900 text-sm md:text-base">
              Almost Done!
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="relative mb-2 flex items-center justify-center md:mb-4">
          <Image
            src="/images/sparkle-2.svg"
            alt=""
            width={59}
            height={68}
            className="-left-10 md:-left-13 absolute top-6 h-10 w-9 md:top-14 md:h-13 md:w-11"
          />
          <h1 className="text-center font-bold text-3xl text-gray-900 md:text-5xl">
            Meet your companion
          </h1>
        </div>

        {/* Subtext */}
        <div className="mb-8 flex items-center justify-center md:mb-10">
          <p className="text-center text-base text-gray-600 md:text-xl">
            Customize Soli to make them yours!
          </p>
        </div>

        {/* Customization Area */}
        <div className="mb-8 flex w-full max-w-md flex-col items-center gap-8 md:mb-10 md:max-w-none md:flex-row md:items-start md:justify-center md:gap-12">
          {/* Mascot Preview Card */}
          <div className="flex flex-col items-center rounded-3xl border-[0.5px] border-gray-100 bg-white px-8 py-6 shadow-[0_20px_40px_-5px_rgba(210,233,255,1)] md:px-12 md:py-8">
            <div className="relative mb-2 h-36 w-36 md:mb-4 md:h-40 md:w-40">
              <Image
                src={mascotImage}
                alt="Soli mascot"
                fill
                className="object-contain"
              />
            </div>
            {/* Shadow */}
            <svg
              width="101"
              height="35"
              viewBox="0 0 101 35"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-2 h-4 w-16 md:mb-4 md:h-auto md:w-auto"
            >
              <ellipse
                cx="50.5"
                cy="17.5"
                rx="50.5"
                ry="17.5"
                transform="matrix(-1 0 0 1 101 0)"
                fill="black"
                fillOpacity="0.2"
              />
            </svg>
            <p className="font-semibold text-gray-900 text-xl md:text-xl">
              Soli
            </p>
          </div>

          {/* Options */}
          <div className="w-full max-w-sm space-y-6 md:w-auto md:max-w-none md:space-y-8">
            {/* Color Selection */}
            <div>
              <p className="mb-3 font-semibold text-primary text-xs uppercase tracking-wider md:mb-4 md:text-sm">
                Color
              </p>
              <div className="flex flex-wrap justify-start gap-2 md:gap-3">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className="relative h-9 w-9 rounded-full transition-transform hover:scale-105 md:h-10 md:w-10"
                    aria-label={`Select ${color.name} color`}
                  >
                    {selectedColor === color.name ? (
                      <span
                        className="absolute inset-0 rounded-full border-2"
                        style={{ borderColor: color.ring }}
                      />
                    ) : null}
                    <span
                      className="absolute inset-1 rounded-full md:inset-1.5"
                      style={{ backgroundColor: color.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Shape Selection */}
            <div>
              <p className="mb-3 font-semibold text-gray-900 text-xs uppercase tracking-wider md:mb-4 md:text-sm">
                Shape
              </p>
              <div className="grid grid-cols-4 gap-2 md:flex md:gap-3">
                {SHAPES.map((shape) => (
                  <button
                    key={shape.name}
                    onClick={() => setSelectedShape(shape.name)}
                    className={`flex h-24 w-20 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 transition-colors md:h-28 md:w-24 md:gap-2 ${
                      selectedShape === shape.name
                        ? "border-primary bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <ShapeIcon
                      shape={shape.name}
                      selected={selectedShape === shape.name}
                    />
                    <span className="text-gray-600 text-xs md:text-sm">
                      {shape.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={isSaving}
          className="rounded-full px-8 py-6 text-base hover:bg-[#C8CCD5] md:px-[20px] md:py-6 md:text-lg"
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              That's my Soli! <ArrowRight className="h-5 w-5" />
            </>
          )}
        </Button>
      </main>
    </div>
  );
}
