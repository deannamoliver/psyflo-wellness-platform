"use client";

import React, { useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import { ChevronDown, ChevronRight, Check } from "lucide-react";

interface EmotionPickerProps {
  value?: EmotionSelection;
  onChange?: (value: EmotionSelection) => void;
  className?: string;
}

export interface EmotionSelection {
  emotion: string;
  primaryCategory: string;
  intensity: number;
}

interface EmotionCategory {
  name: string;
  color: string;
  bgColor: string;
  emotions: string[];
}

const emotionCategories: EmotionCategory[] = [
  {
    name: "Joy",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50 hover:bg-yellow-100",
    emotions: ["happy", "content", "cheerful", "grateful", "optimistic", "excited", "peaceful", "proud"],
  },
  {
    name: "Sadness",
    color: "text-blue-700",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    emotions: ["sad", "disappointed", "lonely", "melancholy", "hopeless", "grief-stricken", "dejected", "sorrowful"],
  },
  {
    name: "Anger",
    color: "text-red-700",
    bgColor: "bg-red-50 hover:bg-red-100",
    emotions: ["angry", "irritated", "frustrated", "annoyed", "resentful", "furious", "bitter", "outraged"],
  },
  {
    name: "Fear",
    color: "text-purple-700",
    bgColor: "bg-purple-50 hover:bg-purple-100",
    emotions: ["anxious", "nervous", "terrified", "panicky", "uneasy", "worried", "dread", "apprehensive"],
  },
  {
    name: "Surprise",
    color: "text-orange-700",
    bgColor: "bg-orange-50 hover:bg-orange-100",
    emotions: ["surprised", "amazed", "astonished", "shocked", "startled", "confused", "bewildered", "stunned"],
  },
  {
    name: "Disgust",
    color: "text-green-700",
    bgColor: "bg-green-50 hover:bg-green-100",
    emotions: ["disgusted", "repulsed", "revolted", "nauseated", "averse", "contemptuous", "loathing", "disapproving"],
  },
  {
    name: "Shame",
    color: "text-pink-700",
    bgColor: "bg-pink-50 hover:bg-pink-100",
    emotions: ["ashamed", "embarrassed", "guilty", "humiliated", "regretful", "self-conscious", "mortified", "remorseful"],
  },
  {
    name: "Love",
    color: "text-rose-700",
    bgColor: "bg-rose-50 hover:bg-rose-100",
    emotions: ["loving", "affectionate", "caring", "tender", "compassionate", "devoted", "adoring", "warm"],
  },
];

export function EmotionPicker({ value, onChange, className }: EmotionPickerProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    value?.primaryCategory || null
  );

  const handleCategoryClick = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  const handleEmotionSelect = (emotion: string, categoryName: string) => {
    onChange?.({
      emotion,
      primaryCategory: categoryName,
      intensity: value?.emotion === emotion ? value.intensity : 5,
    });
  };

  const handleIntensityChange = (intensity: number) => {
    if (value) {
      onChange?.({ ...value, intensity });
    }
  };

  const getIntensityLabel = (intensity: number): string => {
    if (intensity <= 2) return "Barely noticeable";
    if (intensity <= 4) return "Mild";
    if (intensity <= 6) return "Moderate";
    if (intensity <= 8) return "Strong";
    return "Overwhelming";
  };

  const getIntensityColor = (intensity: number): string => {
    if (intensity <= 3) return "bg-green-500";
    if (intensity <= 5) return "bg-yellow-500";
    if (intensity <= 7) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Category grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {emotionCategories.map((category) => (
          <div key={category.name} className="space-y-1">
            <button
              type="button"
              onClick={() => handleCategoryClick(category.name)}
              className={cn(
                "w-full px-3 py-2 rounded-lg text-left font-medium transition-colors flex items-center justify-between",
                category.bgColor,
                category.color,
                expandedCategory === category.name && "ring-2 ring-offset-1 ring-current"
              )}
            >
              <span>{category.name}</span>
              {expandedCategory === category.name ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Expanded emotions grid */}
      {expandedCategory && (
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="text-sm font-medium text-gray-600 mb-2">
            Select a specific emotion:
          </div>
          <div className="flex flex-wrap gap-2">
            {emotionCategories
              .find((c) => c.name === expandedCategory)
              ?.emotions.map((emotion) => {
                const isSelected = value?.emotion === emotion;
                const category = emotionCategories.find((c) => c.name === expandedCategory);
                return (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() => handleEmotionSelect(emotion, expandedCategory)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                      isSelected
                        ? `${category?.bgColor} ${category?.color} ring-2 ring-current`
                        : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                    {emotion}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Intensity slider */}
      {value?.emotion && (
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              How intense is this feeling?
            </span>
            <span className="text-sm font-bold text-gray-900">{value.intensity}/10</span>
          </div>

          <div className="relative">
            <input
              type="range"
              min={1}
              max={10}
              value={value.intensity}
              onChange={(e) => handleIntensityChange(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600"
              style={{
                background: `linear-gradient(to right, 
                  #22c55e 0%, 
                  #eab308 33%, 
                  #f97316 66%, 
                  #ef4444 100%
                )`,
              }}
            />
          </div>

          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Barely there</span>
            <span>Overwhelming</span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", getIntensityColor(value.intensity))} />
            <span className="text-sm text-gray-600">
              {getIntensityLabel(value.intensity)}
            </span>
          </div>

          {/* Summary */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Selected:</div>
            <div className="font-medium text-gray-900">
              <span className="capitalize">{value.emotion}</span>
              <span className="text-gray-500"> ({value.primaryCategory})</span>
              <span className="text-gray-500"> — Intensity: {value.intensity}/10</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmotionPicker;
