"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";
import { Button } from "@/lib/core-ui/button";
import { CBTTriangle, type CBTSelection } from "../widgets/CBTTriangle";
import { AnxietyCycleMapper, type AnxietyCycleData } from "../widgets/AnxietyCycleMapper";
import type { PsychoedConfig, PsychoedSlide, QuizQuestion } from "@/lib/exercises/types";

// ─── Types ───────────────────────────────────────────────────────────

export interface PsychoedRendererProps {
  config: PsychoedConfig;
  initialValues?: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
  readOnly?: boolean;
}

// ─── Text Formatting ─────────────────────────────────────────────────

function formatText(text: string): React.ReactNode {
  // Support **bold** markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ─── Slide Renderers ─────────────────────────────────────────────────

function TextSlideContent({ slide }: { slide: PsychoedSlide }) {
  if (slide.type !== "text") return null;
  
  const paragraphs = slide.content.split("\n\n");
  
  return (
    <div className="prose prose-sm max-w-none space-y-4">
      {paragraphs.map((para, i) => (
        <p key={i} className="text-gray-700 leading-relaxed">
          {formatText(para)}
        </p>
      ))}
    </div>
  );
}

function VideoSlideContent({ slide }: { slide: PsychoedSlide }) {
  if (slide.type !== "video") return null;
  
  return (
    <div className="space-y-4">
      <div className="aspect-video rounded-lg bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Video: {slide.videoUrl}</p>
      </div>
      {slide.transcript && (
        <details className="rounded-lg border bg-gray-50 p-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            View Transcript
          </summary>
          <p className="mt-3 text-sm text-gray-600 whitespace-pre-wrap">{slide.transcript}</p>
        </details>
      )}
    </div>
  );
}

function ImageSlideContent({ slide }: { slide: PsychoedSlide }) {
  if (slide.type !== "image") return null;
  
  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-gray-100 p-8 flex items-center justify-center">
        <p className="text-gray-500 text-sm">[Image: {slide.altText}]</p>
      </div>
      {slide.caption && (
        <p className="text-sm text-gray-600 italic text-center">{slide.caption}</p>
      )}
    </div>
  );
}

// ─── CBT Triangle Interactive ────────────────────────────────────────
// Now using the CBTTriangle widget from ../widgets/CBTTriangle

// ─── Quiz Interactive ────────────────────────────────────────────────

function QuizInteractive({
  questions,
  value,
  onChange,
  disabled,
  showCorrectAnswers,
}: {
  questions: QuizQuestion[];
  value: Record<string, string> | undefined;
  onChange: (value: Record<string, string>) => void;
  disabled?: boolean;
  showCorrectAnswers?: boolean;
}) {
  const answers = value ?? {};
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionId: string, optionId: string) => {
    if (disabled || submitted) return;
    onChange({ ...answers, [questionId]: optionId });
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const allAnswered = questions.every((q) => answers[q.id]);
  const correctCount = submitted
    ? questions.filter((q) => {
        const selectedId = answers[q.id];
        const correctOption = q.options.find((o) => o.correct);
        return selectedId === correctOption?.id;
      }).length
    : 0;

  return (
    <div className="space-y-6">
      {questions.map((question, qi) => {
        const selectedId = answers[question.id];
        const correctOption = question.options.find((o) => o.correct);
        const isCorrect = submitted && selectedId === correctOption?.id;
        const isIncorrect = submitted && selectedId && selectedId !== correctOption?.id;

        return (
          <div key={question.id} className="rounded-lg border bg-white p-4 space-y-3">
            <p className="font-medium text-gray-900">
              {qi + 1}. {question.question}
            </p>
            <div className="space-y-2">
              {question.options.map((opt) => {
                const isSelected = selectedId === opt.id;
                const showAsCorrect = submitted && showCorrectAnswers && opt.correct;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(question.id, opt.id)}
                    disabled={disabled || submitted}
                    className={cn(
                      "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors flex items-center gap-3",
                      isSelected && !submitted && "border-blue-500 bg-blue-50 text-blue-700",
                      !isSelected && !submitted && "border-gray-200 bg-white hover:bg-gray-50",
                      submitted && isSelected && isCorrect && "border-emerald-500 bg-emerald-50 text-emerald-700",
                      submitted && isSelected && isIncorrect && "border-red-500 bg-red-50 text-red-700",
                      submitted && showAsCorrect && !isSelected && "border-emerald-300 bg-emerald-50/50",
                      (disabled || submitted) && "cursor-not-allowed"
                    )}
                  >
                    <span className="flex-1">{opt.text}</span>
                    {submitted && isSelected && isCorrect && <CheckCircle className="h-5 w-5 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
            {submitted && question.explanation && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mt-2">
                {question.explanation}
              </p>
            )}
          </div>
        );
      })}

      {!submitted && (
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered || disabled}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Submit Answers
        </Button>
      )}

      {submitted && (
        <div className={cn(
          "rounded-lg p-4 text-center",
          correctCount === questions.length ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
        )}>
          <p className="font-semibold">
            You got {correctCount} out of {questions.length} correct!
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────

export function PsychoedRenderer({
  config,
  initialValues,
  onChange,
  readOnly = false,
}: PsychoedRendererProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [values, setValues] = useState<Record<string, unknown>>(initialValues ?? {});
  const [showInteractive, setShowInteractive] = useState(false);
  const [showReflection, setShowReflection] = useState(false);

  const totalSlides = config.slides.length;
  const currentSlide = config.slides[currentSlideIndex];
  const isFirstSlide = currentSlideIndex === 0;
  const isLastSlide = currentSlideIndex === totalSlides - 1;

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange(values);
    }
  }, [values, onChange]);

  const handleNext = () => {
    if (isLastSlide) {
      // Check for interactive elements
      const hasQuiz = config.slides.some((s) => s.type === "quiz");
      const hasInteractive = config.slides.some((s) => s.type === "interactive");
      
      if (hasQuiz || hasInteractive) {
        setShowInteractive(true);
      } else {
        setShowReflection(true);
      }
    } else {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (showReflection) {
      setShowReflection(false);
      setShowInteractive(true);
    } else if (showInteractive) {
      setShowInteractive(false);
    } else {
      setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleValueChange = (key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  // Render quiz slides in interactive section
  const quizSlides = config.slides.filter((s) => s.type === "quiz") as Array<PsychoedSlide & { type: "quiz" }>;
  const interactiveSlides = config.slides.filter((s) => s.type === "interactive");

  if (showReflection) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900">Reflection</h3>
          <p className="mt-2 text-sm text-gray-600">
            Take a moment to reflect on what you&apos;ve learned.
          </p>
        </div>

        <textarea
          value={(values["reflection"] as string) ?? ""}
          onChange={(e) => handleValueChange("reflection", e.target.value)}
          disabled={readOnly}
          placeholder="What did you learn from this lesson? How might you apply it?"
          rows={6}
          className={cn(
            "w-full rounded-lg border px-4 py-3 text-sm resize-none",
            "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
            readOnly && "bg-gray-100 cursor-not-allowed"
          )}
        />

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleBack} className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={() => setShowReflection(false)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Complete Lesson
          </Button>
        </div>
      </div>
    );
  }

  if (showInteractive) {
    return (
      <div className="space-y-6">
        {/* CBT Triangle or other interactive */}
        {interactiveSlides.map((slide) => {
          if (slide.type === "interactive" && slide.interactionType === "cbt-triangle") {
            return (
              <CBTTriangle
                key={slide.id}
                prompt="Which part of the CBT triangle is most active for you right now?"
                onSelect={(selection: CBTSelection) => handleValueChange("interactiveSelection", selection)}
              />
            );
          }
          if (slide.type === "interactive" && slide.interactionType === "anxiety-cycle") {
            return (
              <AnxietyCycleMapper
                key={slide.id}
                onComplete={(data: AnxietyCycleData) => handleValueChange("anxietyCycle", data)}
              />
            );
          }
          return null;
        })}

        {/* Quiz */}
        {quizSlides.map((slide) => (
          <QuizInteractive
            key={slide.id}
            questions={slide.questions}
            value={values["quizAnswers"] as Record<string, string> | undefined}
            onChange={(v) => handleValueChange("quizAnswers", v)}
            disabled={readOnly}
            showCorrectAnswers={slide.showCorrectAnswers}
          />
        ))}

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleBack} className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={() => setShowReflection(true)}
            className="gap-1 bg-blue-600 hover:bg-blue-700"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (!currentSlide) {
    return <p className="text-sm text-gray-500">No slides configured</p>;
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">
          Slide {currentSlideIndex + 1} of {totalSlides}
        </span>
        <div className="flex gap-1">
          {config.slides.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 w-6 rounded-full transition-colors",
                i <= currentSlideIndex ? "bg-blue-500" : "bg-gray-200"
              )}
            />
          ))}
        </div>
      </div>

      {/* Slide Content */}
      <div className="min-h-[200px]">
        {currentSlide.title && (
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentSlide.title}</h2>
        )}

        {currentSlide.type === "text" && <TextSlideContent slide={currentSlide} />}
        {currentSlide.type === "video" && <VideoSlideContent slide={currentSlide} />}
        {currentSlide.type === "image" && <ImageSlideContent slide={currentSlide} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={isFirstSlide}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          className={cn(
            "gap-1",
            isLastSlide ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
          )}
        >
          {isLastSlide ? "Continue" : "Next"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
