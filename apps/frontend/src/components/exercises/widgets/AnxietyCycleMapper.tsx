"use client";

import React, { useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import { Button } from "@/lib/core-ui/button";
import { ArrowRight, Check } from "lucide-react";

interface AnxietyCycleMapperProps {
  onComplete?: (data: AnxietyCycleData) => void;
  className?: string;
}

export interface AnxietyCycleData {
  trigger: string;
  thought: string;
  bodySensation: string;
  behavior: string;
  consequence: string;
}

const cycleSteps = [
  {
    id: "trigger",
    label: "Trigger",
    emoji: "⚡",
    color: "bg-yellow-100 border-yellow-400 text-yellow-800",
    activeColor: "bg-yellow-200 border-yellow-500",
    prompt: "What triggers your anxiety?",
    placeholder: "e.g., Walking into a crowded room, getting an email from my boss...",
  },
  {
    id: "thought",
    label: "Thought",
    emoji: "💭",
    color: "bg-blue-100 border-blue-400 text-blue-800",
    activeColor: "bg-blue-200 border-blue-500",
    prompt: "What thoughts go through your mind?",
    placeholder: "e.g., 'Everyone is judging me', 'I'm going to mess this up'...",
  },
  {
    id: "bodySensation",
    label: "Body Sensation",
    emoji: "💓",
    color: "bg-red-100 border-red-400 text-red-800",
    activeColor: "bg-red-200 border-red-500",
    prompt: "What do you feel in your body?",
    placeholder: "e.g., Racing heart, sweaty palms, tight chest, nausea...",
  },
  {
    id: "behavior",
    label: "Behavior",
    emoji: "🏃",
    color: "bg-green-100 border-green-400 text-green-800",
    activeColor: "bg-green-200 border-green-500",
    prompt: "What do you do in response?",
    placeholder: "e.g., Avoid the situation, leave early, seek reassurance...",
  },
  {
    id: "consequence",
    label: "Consequence",
    emoji: "🔄",
    color: "bg-purple-100 border-purple-400 text-purple-800",
    activeColor: "bg-purple-200 border-purple-500",
    prompt: "What happens as a result?",
    placeholder: "e.g., Temporary relief, but fear grows, missed opportunities...",
  },
];

export function AnxietyCycleMapper({ onComplete, className }: AnxietyCycleMapperProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState<AnxietyCycleData>({
    trigger: "",
    thought: "",
    bodySensation: "",
    behavior: "",
    consequence: "",
  });
  const [isComplete, setIsComplete] = useState(false);

  const handleInputChange = (stepId: string, value: string) => {
    setData((prev) => ({ ...prev, [stepId]: value }));
  };

  const handleNext = () => {
    if (activeStep < cycleSteps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      setIsComplete(true);
      onComplete?.(data);
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    if (isComplete) setIsComplete(false);
  };

  const currentStep = cycleSteps[activeStep]!;
  const currentValue = data[currentStep.id as keyof AnxietyCycleData];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Circular flow diagram */}
      <div className="relative flex flex-wrap justify-center items-center gap-2 py-4">
        {cycleSteps.map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              type="button"
              onClick={() => handleStepClick(index)}
              className={cn(
                "flex flex-col items-center justify-center w-24 h-24 rounded-full border-2 transition-all cursor-pointer",
                activeStep === index ? step.activeColor : step.color,
                activeStep === index && "ring-2 ring-offset-2 ring-gray-400 scale-110",
                data[step.id as keyof AnxietyCycleData] && "shadow-md"
              )}
            >
              <span className="text-2xl">{step.emoji}</span>
              <span className="text-xs font-medium mt-1">{step.label}</span>
              {data[step.id as keyof AnxietyCycleData] && (
                <Check className="w-3 h-3 mt-0.5 text-green-600" />
              )}
            </button>
            {index < cycleSteps.length - 1 && (
              <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
        {/* Loop back arrow indication */}
        <div className="w-full flex justify-center mt-2">
          <span className="text-xs text-gray-500">↩️ Cycle repeats...</span>
        </div>
      </div>

      {/* Input area */}
      {!isComplete ? (
        <div className={cn("p-4 rounded-lg border-2", currentStep.color)}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{currentStep.emoji}</span>
            <h3 className="font-semibold text-lg">{currentStep.label}</h3>
            <span className="text-sm text-gray-500 ml-auto">
              Step {activeStep + 1} of {cycleSteps.length}
            </span>
          </div>

          <p className="text-sm text-gray-700 mb-3">{currentStep.prompt}</p>

          <textarea
            value={currentValue}
            onChange={(e) => handleInputChange(currentStep.id, e.target.value)}
            placeholder={currentStep.placeholder}
            className="w-full p-3 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />

          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={activeStep === 0}
            >
              Previous
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
              disabled={!currentValue.trim()}
            >
              {activeStep === cycleSteps.length - 1 ? "Complete" : "Next"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-green-50 border-2 border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <Check className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-800">Your Anxiety Cycle</h3>
          </div>

          <div className="space-y-3">
            {cycleSteps.map((step) => (
              <div key={step.id} className="flex gap-2">
                <span className="text-lg">{step.emoji}</span>
                <div>
                  <span className="font-medium text-sm text-gray-600">
                    {step.label}:
                  </span>
                  <p className="text-sm text-gray-800">
                    {data[step.id as keyof AnxietyCycleData]}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-600 mt-4 italic">
            Understanding your cycle is the first step. Each link is a potential intervention point!
          </p>

          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              setIsComplete(false);
              setActiveStep(0);
            }}
          >
            Edit Cycle
          </Button>
        </div>
      )}

      {/* Progress indicator */}
      {!isComplete && (
        <div className="flex gap-1 justify-center">
          {cycleSteps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === activeStep
                  ? "bg-blue-600"
                  : data[step.id as keyof AnxietyCycleData]
                  ? "bg-green-400"
                  : "bg-gray-300"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AnxietyCycleMapper;
