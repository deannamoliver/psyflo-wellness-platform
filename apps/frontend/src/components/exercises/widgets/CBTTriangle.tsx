"use client";

import React, { useState } from "react";
import { cn } from "@/lib/tailwind-utils";

interface CBTTriangleProps {
  prompt?: string;
  onSelect?: (selection: CBTSelection) => void;
  className?: string;
}

export interface CBTSelection {
  corner: "thoughts" | "feelings" | "behaviors";
  explanation: string;
}

const cornerExplanations: Record<string, { title: string; explanation: string; examples: string }> = {
  thoughts: {
    title: "Thoughts Drive the Cycle",
    explanation:
      "Our thoughts interpret situations and create meaning. Negative or distorted thoughts can trigger difficult emotions and lead to unhelpful behaviors. By changing our thoughts, we can influence how we feel and act.",
    examples:
      "Example: The thought 'I always mess things up' leads to feeling hopeless, which leads to avoiding challenges.",
  },
  feelings: {
    title: "Feelings Influence Everything",
    explanation:
      "Emotions are powerful signals that affect our thinking and behavior. When we feel anxious or sad, we tend to think more negatively and act in ways that maintain those feelings. Understanding emotions helps us respond more skillfully.",
    examples:
      "Example: Feeling anxious leads to catastrophic thoughts ('This will be a disaster'), which leads to avoidance behavior.",
  },
  behaviors: {
    title: "Behaviors Reinforce Patterns",
    explanation:
      "What we do affects how we think and feel. Avoidance, withdrawal, or other unhelpful behaviors can maintain negative thought patterns and emotions. Changing behavior can break the cycle.",
    examples:
      "Example: Staying in bed all day (behavior) reinforces thoughts of worthlessness and maintains feelings of depression.",
  },
};

export function CBTTriangle({ prompt, onSelect, className }: CBTTriangleProps) {
  const [selectedCorner, setSelectedCorner] = useState<string | null>(null);
  const [hoveredCorner, setHoveredCorner] = useState<string | null>(null);

  const handleCornerClick = (corner: "thoughts" | "feelings" | "behaviors") => {
    setSelectedCorner(corner);
    const cornerData = cornerExplanations[corner];
    if (cornerData) {
      onSelect?.({
        corner,
        explanation: cornerData.explanation,
      });
    }
  };

  const activeCorner = hoveredCorner || selectedCorner;

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      {prompt && (
        <p className="text-center text-gray-700 font-medium">{prompt}</p>
      )}

      {/* SVG Triangle */}
      <div className="relative w-80 h-72">
        <svg viewBox="0 0 300 260" className="w-full h-full">
          {/* Triangle outline */}
          <polygon
            points="150,20 280,240 20,240"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="2"
          />

          {/* Bidirectional arrows */}
          {/* Thoughts to Feelings */}
          <g>
            <line x1="90" y1="130" x2="150" y2="210" stroke="#9ca3af" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="140" y1="200" x2="80" y2="120" stroke="#9ca3af" strokeWidth="2" markerEnd="url(#arrowhead)" />
          </g>
          
          {/* Feelings to Behaviors */}
          <g>
            <line x1="160" y1="210" x2="220" y2="130" stroke="#9ca3af" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="210" y1="120" x2="150" y2="200" stroke="#9ca3af" strokeWidth="2" markerEnd="url(#arrowhead)" />
          </g>
          
          {/* Thoughts to Behaviors */}
          <g>
            <line x1="130" y1="50" x2="70" y2="110" stroke="#9ca3af" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="170" y1="50" x2="230" y2="110" stroke="#9ca3af" strokeWidth="2" markerEnd="url(#arrowhead)" />
          </g>

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
            </marker>
          </defs>
        </svg>

        {/* Thought corner (top) */}
        <button
          type="button"
          onClick={() => handleCornerClick("thoughts")}
          onMouseEnter={() => setHoveredCorner("thoughts")}
          onMouseLeave={() => setHoveredCorner(null)}
          className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg font-semibold transition-all",
            selectedCorner === "thoughts"
              ? "bg-blue-600 text-white shadow-lg scale-110"
              : hoveredCorner === "thoughts"
              ? "bg-blue-100 text-blue-700 scale-105"
              : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400"
          )}
        >
          💭 Thoughts
        </button>

        {/* Feelings corner (bottom left) */}
        <button
          type="button"
          onClick={() => handleCornerClick("feelings")}
          onMouseEnter={() => setHoveredCorner("feelings")}
          onMouseLeave={() => setHoveredCorner(null)}
          className={cn(
            "absolute bottom-0 left-0 px-4 py-2 rounded-lg font-semibold transition-all",
            selectedCorner === "feelings"
              ? "bg-red-600 text-white shadow-lg scale-110"
              : hoveredCorner === "feelings"
              ? "bg-red-100 text-red-700 scale-105"
              : "bg-white text-gray-700 border-2 border-gray-300 hover:border-red-400"
          )}
        >
          ❤️ Feelings
        </button>

        {/* Behaviors corner (bottom right) */}
        <button
          type="button"
          onClick={() => handleCornerClick("behaviors")}
          onMouseEnter={() => setHoveredCorner("behaviors")}
          onMouseLeave={() => setHoveredCorner(null)}
          className={cn(
            "absolute bottom-0 right-0 px-4 py-2 rounded-lg font-semibold transition-all",
            selectedCorner === "behaviors"
              ? "bg-green-600 text-white shadow-lg scale-110"
              : hoveredCorner === "behaviors"
              ? "bg-green-100 text-green-700 scale-105"
              : "bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400"
          )}
        >
          🎯 Behaviors
        </button>

        {/* Center label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 text-center">
          <span className="text-xs text-gray-500">Click a corner</span>
        </div>
      </div>

      {/* Explanation panel */}
      {activeCorner && cornerExplanations[activeCorner] && (
        <div
          className={cn(
            "w-full max-w-md p-4 rounded-lg border-2 transition-all",
            activeCorner === "thoughts" && "bg-blue-50 border-blue-200",
            activeCorner === "feelings" && "bg-red-50 border-red-200",
            activeCorner === "behaviors" && "bg-green-50 border-green-200"
          )}
        >
          <h4
            className={cn(
              "font-semibold mb-2",
              activeCorner === "thoughts" && "text-blue-800",
              activeCorner === "feelings" && "text-red-800",
              activeCorner === "behaviors" && "text-green-800"
            )}
          >
            {cornerExplanations[activeCorner]?.title}
          </h4>
          <p className="text-sm text-gray-700 mb-3">
            {cornerExplanations[activeCorner]?.explanation}
          </p>
          <p className="text-xs text-gray-500 italic">
            {cornerExplanations[activeCorner]?.examples}
          </p>
        </div>
      )}

      {!activeCorner && (
        <p className="text-sm text-gray-500 text-center">
          Click on a corner of the triangle to learn how it drives the cycle
        </p>
      )}
    </div>
  );
}

export default CBTTriangle;
