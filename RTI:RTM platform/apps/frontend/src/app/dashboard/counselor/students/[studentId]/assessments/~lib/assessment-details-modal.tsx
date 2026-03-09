"use client";

import type { screenerTypeEnum } from "@feelwell/database";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/lib/core-ui/dialog";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { Muted } from "@/lib/core-ui/typography";
import { getAssessmentDetails } from "./get-assessment-details";

type AssessmentDetailsModalProps = {
  assessmentId: string | null;
  onClose: () => void;
};

type AssessmentDetails = {
  id: string;
  type: (typeof screenerTypeEnum.enumValues)[number];
  completedAt: Date;
  score: number;
  maxScore: number;
  questionsAndAnswers: Array<{
    questionText: string;
    answerText: string;
    score: number;
  }>;
};

export function AssessmentDetailsModal({
  assessmentId,
  onClose,
}: AssessmentDetailsModalProps) {
  const [details, setDetails] = useState<AssessmentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assessmentId) {
      setLoading(true);
      setError(null);
      getAssessmentDetails(assessmentId)
        .then((data) => {
          if (data) {
            setDetails(data);
          } else {
            setError("Assessment not found");
          }
        })
        .catch((err) => {
          setError("Failed to load assessment details");
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [assessmentId]);

  const getScreenerTitle = (
    type: (typeof screenerTypeEnum.enumValues)[number],
  ): string => {
    switch (type) {
      case "phq_a":
        return "PHQ-A (Depression - Adolescent)";
      case "phq_9":
        return "PHQ-9 (Depression)";
      case "gad_child":
        return "GAD-Child (Anxiety)";
      case "gad_7":
        return "GAD-7 (Anxiety)";
      case "sel":
        return "SEL Assessment";
    }
  };

  return (
    <Dialog open={!!assessmentId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {details ? getScreenerTitle(details.type) : "Assessment Details"}
          </DialogTitle>
          {details && (
            <DialogDescription>
              Completed on{" "}
              {details.completedAt.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}{" "}
              - Score: {Math.round(details.score)} / {details.maxScore}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="mt-4">
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton list
                <Skeleton key={`skeleton-${i}`} className="h-16 w-full" />
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-700">
              {error}
            </div>
          )}

          {details && !loading && !error && (
            <div className="space-y-4">
              {details.questionsAndAnswers.map((qa, index) => (
                <div
                  key={`qa-${details.id}-${index}`}
                  className="space-y-2 rounded-lg border bg-muted/30 p-4"
                >
                  <div className="flex items-start gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-xs">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{qa.questionText}</p>
                    </div>
                  </div>
                  <div className="ml-8">
                    <Muted className="text-xs">Answer:</Muted>
                    <p className="font-medium text-primary text-sm">
                      {qa.answerText}
                    </p>
                    <Muted className="mt-1 text-xs">Score: {qa.score}</Muted>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
