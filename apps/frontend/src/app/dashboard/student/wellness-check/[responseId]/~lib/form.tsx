"use client";

import type { screenerSessionResponses } from "@feelwell/database";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { Large } from "@/lib/core-ui/typography";
import { updateResponseAndSession } from "@/lib/screener/actions";
import { getInstructionsForQuestion } from "@/lib/screener/instructions";
import { getScreenerQuestion } from "@/lib/screener/utils";
import { cn } from "@/lib/tailwind-utils";
import {
  getWellnessCheckSoliImage,
  syncSoliSettingsToLocalStorage,
} from "@/lib/user/soli-settings";

function Option({
  text,
  selected,
  onClick,
}: {
  text: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "w-full rounded-lg border-2 p-4 text-left font-medium transition-all duration-200",
        selected
          ? "border-sky-400 bg-sky-400 text-white shadow-sm"
          : "border-gray-300 bg-white text-gray-800 hover:border-sky-300 hover:bg-sky-50",
      )}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export default function ResponseForm({
  currentResponse,
  responseIds,
  className,
}: {
  currentResponse: typeof screenerSessionResponses.$inferSelect;
  responseIds: string[];
  className?: string;
}) {
  const router = useRouter();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(
    currentResponse.answerCode,
  );
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const [soliImage, setSoliImage] = useState<string | null>(null);
  const [isSoliLoading, setIsSoliLoading] = useState(true);

  // Load Soli settings
  useEffect(() => {
    let isMounted = true;

    const loadSoliSettings = async () => {
      const storedColor = localStorage.getItem("soliColor");
      const storedShape = localStorage.getItem("soliShape");

      if (storedColor && storedShape) {
        if (isMounted) {
          setSoliImage(getWellnessCheckSoliImage(storedColor, storedShape));
          setIsSoliLoading(false);
        }
      } else {
        try {
          const settings = await syncSoliSettingsToLocalStorage();
          if (!isMounted) return;

          if (settings) {
            setSoliImage(
              getWellnessCheckSoliImage(settings.soliColor, settings.soliShape),
            );
          }
        } catch (error: unknown) {
          console.error("Failed to sync soli settings:", error);
        } finally {
          if (isMounted) {
            setIsSoliLoading(false);
          }
        }
      }
    };

    loadSoliSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const question = getScreenerQuestion(currentResponse.questionCode);
  if (question == null) {
    notFound();
  }

  const currentIndex = responseIds.indexOf(currentResponse.id);
  const totalQuestions = responseIds.length;

  const previousId = responseIds[currentIndex - 1];
  const nextId = responseIds[currentIndex + 1];

  const handlePreviousClick = () => {
    if (previousId) {
      router.push(`/dashboard/student/wellness-check/${previousId}`);
    }
  };

  const handleAnswerSelect = async (answerCode: string) => {
    if (isAutoAdvancing) {
      return;
    }

    setSelectedAnswer(answerCode);

    // Save the answer
    // Only check completion on the last question to avoid expensive queries
    const isLastQuestion = !nextId;
    await updateResponseAndSession(currentResponse.id, answerCode, {
      checkCompletion: isLastQuestion,
    });
  };

  const handleNextClick = () => {
    if (nextId) {
      router.push(`/dashboard/student/wellness-check/${nextId}`);
    } else {
      router.push("/dashboard/student/wellness-check/completed");
    }
  };

  // Reset auto-advancing state when response changes
  useEffect(() => {
    setIsAutoAdvancing(false);
    setSelectedAnswer(currentResponse.answerCode);
  }, [currentResponse.id, currentResponse.answerCode]);

  return (
    <div
      className={cn(
        "relative flex w-full max-w-3xl flex-col gap-6 rounded-2xl bg-white p-8 shadow-xl",
        className,
      )}
    >
      {/* Close Button */}
      <Link
        href="/dashboard/student/home"
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <X className="h-5 w-5" />
      </Link>

      {/* Customized Soli Icon */}
      <div className="flex justify-center">
        {soliImage && !isSoliLoading ? (
          <Image
            src={soliImage}
            alt="Wellness Check"
            width={80}
            height={80}
            className="h-auto w-20"
          />
        ) : (
          <Skeleton className="h-20 w-20 rounded-full border border-gray-300 bg-gray-100" />
        )}
      </div>

      {/* Question */}
      <div className="flex flex-col">
        <Large className="pb-4 text-center font-semibold text-black text-xl">
          {question.text}
        </Large>
        {(() => {
          const instructions = getInstructionsForQuestion(
            currentResponse.questionCode,
          );
          if (!instructions) return null;
          return (
            <p className="pb-4 text-center font-medium text-gray-700 text-sm">
              {instructions.directions}
            </p>
          );
        })()}
      </div>

      {/* Answer Options */}
      <div className="flex flex-col gap-3">
        {question.options.map((option) => (
          <Option
            key={option.code}
            text={option.text}
            selected={selectedAnswer === option.code}
            onClick={() => handleAnswerSelect(option.code)}
          />
        ))}
      </div>

      {/* Navigation and Progress */}
      <div className="flex w-full items-center justify-between px-2">
        <Button
          variant="ghost"
          disabled={!previousId}
          onClick={handlePreviousClick}
          className="flex items-center gap-1 font-semibold text-sky-600 text-sm hover:bg-transparent hover:text-sky-700 disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        {/* Mobile: Show x / y format */}
        <div className="font-medium text-gray-700 text-sm md:hidden">
          {currentIndex + 1} / {totalQuestions}
        </div>
        {/* Desktop: Show dots */}
        <div className="hidden gap-2 md:flex">
          {Array.from({ length: totalQuestions }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                index === currentIndex ? "bg-sky-400" : "bg-gray-300",
              )}
            />
          ))}
        </div>

        <Button
          className="flex items-center gap-2 bg-primary font-semibold text-primary-foreground text-sm hover:bg-primary/90"
          onClick={handleNextClick}
          disabled={!selectedAnswer || isAutoAdvancing}
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
