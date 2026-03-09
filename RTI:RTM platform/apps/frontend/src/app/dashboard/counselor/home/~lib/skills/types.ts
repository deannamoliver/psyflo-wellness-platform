/** Shared types for the Skills (SEL) tab components and data layer. */

export type SubtypeAverage = {
  subtype: string;
  avgScore: number; // 1.0-4.0 scale
  studentCount: number;
};

export type QuestionAverage = {
  questionCode: string;
  subtype: string;
  avgScore: number; // 1.0-4.0 scale
};

export type SkillsStudent = {
  id: string;
  name: string;
  grade: number | null;
  avgScore: number;
  completedAt: Date;
};

export type SkillsTimeSeriesRow = {
  period: string;
  subtype: string;
  grade: number | null;
  avgScore: number;
  count: number;
};

export type SkillsStudentTableRow = {
  studentId: string;
  studentName: string;
  grade: number | null;
  subtypeScores: Record<string, number>;
  overallScore: number;
};
