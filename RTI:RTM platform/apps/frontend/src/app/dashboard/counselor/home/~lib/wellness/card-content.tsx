"use client";

import { useState } from "react";
import { emotionConfigs, type UniversalEmotion } from "@/lib/check-in/utils";
import { titleCase } from "@/lib/string-utils";
import StudentList from "../student-list";
import type { Student } from "../type";
import MoodDistribution, { type MoodData } from "./distribution";

export default function WellnessCardContent({
  moodData,
  students,
}: {
  moodData: MoodData;
  students: (Student & { universalEmotion: UniversalEmotion | null })[];
}) {
  const [selectedEmotion, setSelectedEmotion] =
    useState<UniversalEmotion | null>(null);

  const handleEmotionClick = (emotion: string) => {
    const emotionAsUniversal = emotion as UniversalEmotion;
    // Toggle: if clicking the same emotion, clear the filter
    if (selectedEmotion === emotionAsUniversal) {
      setSelectedEmotion(null);
    } else {
      setSelectedEmotion(emotionAsUniversal);
    }
  };

  // Filter students for the selected universal emotion
  const filteredStudents = selectedEmotion
    ? students.filter((student) => student.universalEmotion === selectedEmotion)
    : students;

  const selectedEmotionConfig = emotionConfigs.find(
    (e) => e.id === selectedEmotion,
  );

  const title = selectedEmotion
    ? `Patient List (${filteredStudents.length}) - ${selectedEmotionConfig?.name || titleCase(selectedEmotion, { delimiter: "_" })}`
    : `Patient List (${students.length})`;

  return (
    <div className="grid h-[480px] grid-cols-1 gap-6 overflow-hidden lg:grid-cols-[1fr_360px]">
      <div className="min-w-0 overflow-hidden rounded bg-white pt-6 pr-0 pb-6 pl-0">
        <MoodDistribution data={moodData} onSelect={handleEmotionClick} />
      </div>
      <div className="flex min-h-0 flex-col overflow-hidden bg-white">
        <StudentList
          students={filteredStudents}
          title={title}
          showMood
          showRelativeTime
        />
      </div>
    </div>
  );
}
