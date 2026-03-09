"use client";

import { ArrowLeft, ArrowRight, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { Large, Lead } from "@/lib/core-ui/typography";
import {
  completeWellnessCheck,
  getWellnessCheckData,
  updateResponseAndSession,
} from "@/lib/screener/actions";
import { getInstructionsForQuestion } from "@/lib/screener/instructions";
import { cn } from "@/lib/tailwind-utils";
import {
  getWellnessCheckSoliImage,
  syncSoliSettingsToLocalStorage,
} from "@/lib/user/soli-settings";

type WellnessResponse = {
  id: string;
  questionCode: string;
  answerCode: string | null;
};

type Question = {
  code: string;
  text: string;
  options: { code: string; text: string }[];
};

type WellnessCheckModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Called when user completes the screening and clicks Submit. Use to hide the wellness check from Start Your Day. */
  onComplete?: () => void;
};

export default function WellnessCheckModal({
  isOpen,
  onClose,
  onComplete,
}: WellnessCheckModalProps) {
  const [soliImage, setSoliImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [screen, setScreen] = useState<"first" | "questions" | "completed">(
    "first",
  );
  const [responses, setResponses] = useState<WellnessResponse[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Soli settings
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadSoliSettings = async () => {
      const storedColor = localStorage.getItem("soliColor");
      const storedShape = localStorage.getItem("soliShape");

      if (storedColor && storedShape) {
        if (isMounted) {
          setSoliImage(getWellnessCheckSoliImage(storedColor, storedShape));
          setIsLoading(false);
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
        } catch (error) {
          console.error("Failed to sync soli settings:", error);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      }
    };

    loadSoliSettings();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Fetch wellness check data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const data = await getWellnessCheckData();
        setResponses(data.responses);
        setQuestions(data.questions);

        // Find first unanswered question
        const firstUnansweredIdx = data.responses.findIndex(
          (r) => r.answerCode == null,
        );
        if (firstUnansweredIdx >= 0) {
          setCurrentIndex(firstUnansweredIdx);
        }
      } catch (error) {
        console.error("Failed to fetch wellness check data:", error);
      }
    };

    fetchData();
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setScreen("first");
      setCurrentIndex(0);
      setSelectedAnswer(null);
    }
  }, [isOpen]);

  const currentResponse = responses[currentIndex];

  // Sync selectedAnswer when currentIndex or responses change
  useEffect(() => {
    if (currentResponse) {
      setSelectedAnswer(currentResponse.answerCode || null);
    }
  }, [currentIndex, responses, currentResponse]);
  const currentQuestion = questions.find(
    (q) => q.code === currentResponse?.questionCode,
  );

  const handleAnswerSelect = (answerCode: string) => {
    if (isSubmitting) return;
    setSelectedAnswer(answerCode);
  };

  const handleNext = async () => {
    if (!currentResponse || !selectedAnswer || isSubmitting) return;

    setIsSubmitting(true);
    const responseId = currentResponse.id;
    const isLastQuestion = currentIndex === responses.length - 1;

    try {
      // Save answer using server action
      // Only check completion on the last question to avoid expensive queries
      await updateResponseAndSession(responseId, selectedAnswer, {
        checkCompletion: isLastQuestion,
      });

      // Update local state
      setResponses((prev) =>
        prev.map((r) =>
          r.id === responseId ? { ...r, answerCode: selectedAnswer } : r,
        ),
      );

      // Advance to next question or completed screen
      if (currentIndex < responses.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(responses[currentIndex + 1]?.answerCode || null);
      } else {
        setScreen("completed");
      }
    } catch (error) {
      console.error("Failed to save answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(responses[currentIndex - 1]?.answerCode || null);
    }
  };

  const [isCompleting, setIsCompleting] = useState(false);

  const handleClose = async () => {
    setIsCompleting(true);
    try {
      await completeWellnessCheck();
    } finally {
      setIsCompleting(false);
    }
    onComplete?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={cn(
          "relative mx-4 w-full max-w-3xl rounded-2xl bg-white p-8 shadow-xl",
        )}
      >
        {/* Close X - show on first and questions screens only, not on completed */}
        {screen !== "completed" && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* First Screen */}
        {screen === "first" && (
          <div className="flex flex-col items-center gap-6">
            <div className="flex justify-center pt-8">
              {soliImage && !isLoading ? (
                <Image
                  src={soliImage}
                  alt="Wellness Check"
                  width={100}
                  height={100}
                  className="h-auto w-24"
                />
              ) : (
                <Skeleton className="h-24 w-24 rounded-full border border-gray-300 bg-gray-100" />
              )}
            </div>

            <div className="flex max-w-2xl flex-col gap-2">
              <Large className="text-center font-medium text-gray-800 text-lg">
                Take a moment to reflect on your{" "}
                <span className="font-semibold">well-being.</span> This
                personalized wellness check helps you track your physical,
                mental, and emotional health journey.
              </Large>
            </div>

            <Button
              className="bg-primary px-6 py-5 font-semibold text-primary-foreground text-sm hover:bg-primary/90"
              onClick={() => setScreen("questions")}
            >
              <span className="flex items-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </div>
        )}

        {/* Questions Screen */}
        {screen === "questions" && currentQuestion && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-center">
              {soliImage && !isLoading ? (
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

            <div className="flex flex-col">
              {(() => {
                const instructions = getInstructionsForQuestion(
                  currentQuestion.code,
                );
                const prefix = instructions?.questionPrefix;
                return (
                  <>
                    <Large className="pb-4 text-center font-semibold text-black text-xl">
                      {prefix
                        ? `${prefix} ${currentQuestion.text}`
                        : currentQuestion.text}
                    </Large>
                    {instructions?.directions ? (
                      <p className="text-center font-medium text-gray-700 text-sm">
                        {instructions.directions}
                      </p>
                    ) : null}
                  </>
                );
              })()}
            </div>

            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  className={cn(
                    "w-full rounded-lg border-2 p-4 text-left font-medium transition-all duration-200",
                    selectedAnswer === option.code
                      ? "border-sky-400 bg-sky-400 text-white shadow-sm"
                      : "border-gray-300 bg-white text-gray-800 hover:border-sky-300 hover:bg-sky-50",
                  )}
                  onClick={() => handleAnswerSelect(option.code)}
                >
                  {option.text}
                </button>
              ))}
            </div>

            <div className="flex w-full items-center justify-between px-2">
              <Button
                variant="ghost"
                disabled={currentIndex === 0}
                onClick={handlePrevious}
                className="flex items-center gap-1 font-semibold text-sky-600 text-sm hover:bg-transparent hover:text-sky-700 disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {/* Mobile: Show x / y format */}
              <div className="font-medium text-gray-700 text-sm md:hidden">
                {currentIndex + 1} / {responses.length}
              </div>
              {/* Desktop: Show dots */}
              <div className="hidden gap-2 md:flex">
                {responses.map((response, index) => (
                  <div
                    key={response.id}
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors",
                      index === currentIndex ? "bg-sky-400" : "bg-gray-300",
                    )}
                  />
                ))}
              </div>

              <Button
                className="flex min-w-[120px] items-center justify-center gap-2 bg-primary font-semibold text-primary-foreground text-sm hover:bg-primary/90"
                onClick={handleNext}
                disabled={!selectedAnswer || isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Completed Screen */}
        {screen === "completed" && (
          <div className="flex flex-col items-center gap-6">
            <div className="flex justify-center pt-4">
              {soliImage && !isLoading ? (
                <Image
                  src={soliImage}
                  alt="Wellness Check Complete"
                  width={80}
                  height={80}
                  className="h-auto w-20"
                />
              ) : (
                <Skeleton className="h-20 w-20 rounded-full border border-gray-300 bg-gray-100" />
              )}
            </div>

            <div className="flex max-w-2xl flex-col gap-2">
              <Large className="text-center font-medium text-gray-800 text-lg">
                Your wellness check-in is complete!
              </Large>
              <Lead className="text-center font-normal text-gray-600 text-lg">
                Remember your doing great no matter how your feeling 🚀
              </Lead>
            </div>

            <Button
              className="flex min-w-[120px] items-center justify-center gap-2 bg-primary px-8 font-semibold text-primary-foreground text-sm hover:bg-primary/90"
              onClick={handleClose}
              disabled={isCompleting}
            >
              {isCompleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
