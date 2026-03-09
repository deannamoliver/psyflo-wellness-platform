"use client";

import {
  Activity,
  AlertTriangle,
  Brain,
  Calendar,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileText,
  Heart,
  Plus,
  Search,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { cn } from "@/lib/tailwind-utils";
import {
  loadProviderData,
  saveProviderData,
  type StoredAssessment,
} from "@/app/dashboard/~lib/provider-store";
import { saveProviderDataServer } from "@/app/dashboard/~lib/provider-data-actions";

// ─── Assessment Library Types ──────────────────────────────────────

type SeverityZone = {
  label: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
};

type AssessmentDefinition = {
  id: string;
  title: string;
  shortTitle: string;
  category: "depression" | "anxiety" | "trauma" | "suicide_risk" | "behavioral" | "social_emotional" | "substance" | "general";
  ageRange: string;
  itemCount: number;
  maxScore: number;
  description: string;
  icon: string;
  color: string;
  severityZones: SeverityZone[];
};

type AssignedAssessment = {
  id: string;
  definitionId: string;
  frequency: string;
  assignedDate: string;
  nextDue: string;
  status: "active" | "paused" | "completed";
  dataPoints: AssessmentDataPoint[];
};

type AssessmentDataPoint = {
  id: string;
  date: string;
  score: number;
  maxScore: number;
};

// ─── Assessment Definitions Library ─────────────────────────────────

const ASSESSMENT_LIBRARY: AssessmentDefinition[] = [
  // Depression
  {
    id: "phq-9", title: "PHQ-9", shortTitle: "PHQ-9", category: "depression",
    ageRange: "18+", itemCount: 9, maxScore: 27,
    description: "Patient Health Questionnaire — 9-item depression severity measure. Gold standard for adult depression screening.",
    icon: "brain", color: "#8b5cf6",
    severityZones: [
      { label: "Minimal", min: 0, max: 4, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Mild", min: 5, max: 9, color: "text-yellow-700", bgColor: "bg-yellow-50" },
      { label: "Moderate", min: 10, max: 14, color: "text-orange-700", bgColor: "bg-orange-50" },
      { label: "Mod. Severe", min: 15, max: 19, color: "text-red-600", bgColor: "bg-red-50" },
      { label: "Severe", min: 20, max: 27, color: "text-red-700", bgColor: "bg-red-100" },
    ],
  },
  {
    id: "phq-a", title: "PHQ-A (Adolescent)", shortTitle: "PHQ-A", category: "depression",
    ageRange: "11–17", itemCount: 9, maxScore: 27,
    description: "Modified PHQ for adolescents. Screens for depressive symptoms in teens ages 11–17.",
    icon: "brain", color: "#a78bfa",
    severityZones: [
      { label: "Minimal", min: 0, max: 4, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Mild", min: 5, max: 9, color: "text-yellow-700", bgColor: "bg-yellow-50" },
      { label: "Moderate", min: 10, max: 14, color: "text-orange-700", bgColor: "bg-orange-50" },
      { label: "Mod. Severe", min: 15, max: 19, color: "text-red-600", bgColor: "bg-red-50" },
      { label: "Severe", min: 20, max: 27, color: "text-red-700", bgColor: "bg-red-100" },
    ],
  },
  {
    id: "phq-2", title: "PHQ-2 (Quick Screen)", shortTitle: "PHQ-2", category: "depression",
    ageRange: "12+", itemCount: 2, maxScore: 6,
    description: "Ultra-brief 2-item depression screener. Scores ≥ 3 suggest further evaluation with PHQ-9.",
    icon: "brain", color: "#c4b5fd",
    severityZones: [
      { label: "Normal", min: 0, max: 2, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Elevated", min: 3, max: 6, color: "text-red-600", bgColor: "bg-red-50" },
    ],
  },
  {
    id: "ces-dc", title: "CES-DC (Child Depression)", shortTitle: "CES-DC", category: "depression",
    ageRange: "6–17", itemCount: 20, maxScore: 60,
    description: "Center for Epidemiological Studies Depression Scale for Children. 20-item self-report for youth.",
    icon: "brain", color: "#7c3aed",
    severityZones: [
      { label: "Not Significant", min: 0, max: 14, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Possible Depression", min: 15, max: 60, color: "text-red-600", bgColor: "bg-red-50" },
    ],
  },
  {
    id: "bdi-ii", title: "BDI-II (Beck Depression)", shortTitle: "BDI-II", category: "depression",
    ageRange: "13+", itemCount: 21, maxScore: 63,
    description: "Beck Depression Inventory-II. 21-item self-report for depression severity in adolescents and adults.",
    icon: "brain", color: "#6d28d9",
    severityZones: [
      { label: "Minimal", min: 0, max: 13, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Mild", min: 14, max: 19, color: "text-yellow-700", bgColor: "bg-yellow-50" },
      { label: "Moderate", min: 20, max: 28, color: "text-orange-700", bgColor: "bg-orange-50" },
      { label: "Severe", min: 29, max: 63, color: "text-red-700", bgColor: "bg-red-100" },
    ],
  },
  // Anxiety
  {
    id: "gad-7", title: "GAD-7", shortTitle: "GAD-7", category: "anxiety",
    ageRange: "18+", itemCount: 7, maxScore: 21,
    description: "Generalized Anxiety Disorder 7-item scale. Primary anxiety severity measure for adults.",
    icon: "activity", color: "#3b82f6",
    severityZones: [
      { label: "Minimal", min: 0, max: 4, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Mild", min: 5, max: 9, color: "text-yellow-700", bgColor: "bg-yellow-50" },
      { label: "Moderate", min: 10, max: 14, color: "text-orange-700", bgColor: "bg-orange-50" },
      { label: "Severe", min: 15, max: 21, color: "text-red-700", bgColor: "bg-red-100" },
    ],
  },
  {
    id: "gad-2", title: "GAD-2 (Quick Screen)", shortTitle: "GAD-2", category: "anxiety",
    ageRange: "12+", itemCount: 2, maxScore: 6,
    description: "Ultra-brief 2-item anxiety screener. Scores ≥ 3 suggest further evaluation with GAD-7.",
    icon: "activity", color: "#60a5fa",
    severityZones: [
      { label: "Normal", min: 0, max: 2, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Elevated", min: 3, max: 6, color: "text-red-600", bgColor: "bg-red-50" },
    ],
  },
  {
    id: "scared", title: "SCARED (Child Anxiety)", shortTitle: "SCARED", category: "anxiety",
    ageRange: "8–18", itemCount: 41, maxScore: 82,
    description: "Screen for Child Anxiety Related Disorders. Covers panic, GAD, separation, social, and school anxiety.",
    icon: "shield", color: "#f472b6",
    severityZones: [
      { label: "Not Significant", min: 0, max: 24, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Significant Anxiety", min: 25, max: 82, color: "text-red-600", bgColor: "bg-red-50" },
    ],
  },
  {
    id: "rcads", title: "RCADS (Child Anxiety/Depression)", shortTitle: "RCADS", category: "anxiety",
    ageRange: "8–18", itemCount: 47, maxScore: 141,
    description: "Revised Children's Anxiety and Depression Scale. 47-item scale covering 6 subscales of anxiety and depression.",
    icon: "activity", color: "#2563eb",
    severityZones: [
      { label: "Normal", min: 0, max: 50, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Borderline", min: 51, max: 70, color: "text-yellow-700", bgColor: "bg-yellow-50" },
      { label: "Clinical", min: 71, max: 141, color: "text-red-600", bgColor: "bg-red-50" },
    ],
  },
  {
    id: "gad-child", title: "GAD-Child", shortTitle: "GAD-Child", category: "anxiety",
    ageRange: "11–17", itemCount: 10, maxScore: 40,
    description: "Anxiety assessment for children ages 11–17. 10 items evaluating worry and nervousness.",
    icon: "activity", color: "#38bdf8",
    severityZones: [
      { label: "None", min: 0, max: 4, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Minimal", min: 5, max: 14, color: "text-green-600", bgColor: "bg-green-50" },
      { label: "Mild", min: 15, max: 24, color: "text-yellow-700", bgColor: "bg-yellow-50" },
      { label: "Moderate", min: 25, max: 34, color: "text-orange-700", bgColor: "bg-orange-50" },
      { label: "Severe", min: 35, max: 40, color: "text-red-700", bgColor: "bg-red-100" },
    ],
  },
  // Trauma
  {
    id: "pcl-5", title: "PCL-5 (PTSD)", shortTitle: "PCL-5", category: "trauma",
    ageRange: "18+", itemCount: 20, maxScore: 80,
    description: "PTSD Checklist for DSM-5. 20-item self-report measure for PTSD symptom severity in adults.",
    icon: "shield", color: "#ef4444",
    severityZones: [
      { label: "Below Threshold", min: 0, max: 30, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Probable PTSD", min: 31, max: 80, color: "text-red-600", bgColor: "bg-red-50" },
    ],
  },
  {
    id: "cpss-5", title: "CPSS-5 (Child PTSD)", shortTitle: "CPSS-5", category: "trauma",
    ageRange: "8–18", itemCount: 27, maxScore: 80,
    description: "Child PTSD Symptom Scale for DSM-5. Screens for trauma symptoms in children and adolescents.",
    icon: "shield", color: "#dc2626",
    severityZones: [
      { label: "Minimal", min: 0, max: 10, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Mild", min: 11, max: 20, color: "text-yellow-700", bgColor: "bg-yellow-50" },
      { label: "Moderate", min: 21, max: 40, color: "text-orange-700", bgColor: "bg-orange-50" },
      { label: "Severe", min: 41, max: 80, color: "text-red-700", bgColor: "bg-red-100" },
    ],
  },
  // Suicide Risk
  {
    id: "cssrs", title: "C-SSRS (Suicide Risk)", shortTitle: "C-SSRS", category: "suicide_risk",
    ageRange: "6+", itemCount: 6, maxScore: 5,
    description: "Columbia Suicide Severity Rating Scale. Gold standard for assessing suicidal ideation and behavior across all ages.",
    icon: "alert", color: "#b91c1c",
    severityZones: [
      { label: "No Risk", min: 0, max: 0, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Wish to Die", min: 1, max: 1, color: "text-yellow-700", bgColor: "bg-yellow-50" },
      { label: "Ideation", min: 2, max: 3, color: "text-orange-700", bgColor: "bg-orange-50" },
      { label: "Intent/Plan", min: 4, max: 5, color: "text-red-700", bgColor: "bg-red-100" },
    ],
  },
  {
    id: "ask-suicide", title: "ASQ (Ask Suicide Questions)", shortTitle: "ASQ", category: "suicide_risk",
    ageRange: "10+", itemCount: 4, maxScore: 4,
    description: "Ask Suicide-Screening Questions. 4-item validated screening tool developed by NIMH for rapid suicide risk assessment.",
    icon: "alert", color: "#991b1b",
    severityZones: [
      { label: "Negative Screen", min: 0, max: 0, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Positive Screen", min: 1, max: 4, color: "text-red-700", bgColor: "bg-red-100" },
    ],
  },
  // Behavioral
  {
    id: "sdq", title: "SDQ (Strengths & Difficulties)", shortTitle: "SDQ", category: "behavioral",
    ageRange: "4–17", itemCount: 25, maxScore: 40,
    description: "25-item behavioral screening for emotional, conduct, hyperactivity, peer, and prosocial domains.",
    icon: "users", color: "#14b8a6",
    severityZones: [
      { label: "Normal", min: 0, max: 13, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Borderline", min: 14, max: 16, color: "text-yellow-700", bgColor: "bg-yellow-50" },
      { label: "Abnormal", min: 17, max: 40, color: "text-red-600", bgColor: "bg-red-50" },
    ],
  },
  {
    id: "snap-iv", title: "SNAP-IV (ADHD)", shortTitle: "SNAP-IV", category: "behavioral",
    ageRange: "6–18", itemCount: 26, maxScore: 78,
    description: "Swanson, Nolan, and Pelham Questionnaire. Assesses ADHD symptoms — inattention, hyperactivity/impulsivity, and ODD.",
    icon: "activity", color: "#0d9488",
    severityZones: [
      { label: "Not Significant", min: 0, max: 25, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "Borderline", min: 26, max: 40, color: "text-yellow-700", bgColor: "bg-yellow-50" },
      { label: "Significant", min: 41, max: 78, color: "text-red-600", bgColor: "bg-red-50" },
    ],
  },
  // Social-Emotional
  {
    id: "sel", title: "SEL Assessment", shortTitle: "SEL", category: "social_emotional",
    ageRange: "K–12", itemCount: 40, maxScore: 100,
    description: "Measures social-emotional competencies including self-awareness, self-management, and relationship skills.",
    icon: "heart", color: "#f59e0b",
    severityZones: [
      { label: "Needs Support", min: 0, max: 39, color: "text-red-600", bgColor: "bg-red-50" },
      { label: "Emerging", min: 40, max: 59, color: "text-yellow-700", bgColor: "bg-yellow-50" },
      { label: "Developing", min: 60, max: 79, color: "text-green-600", bgColor: "bg-green-50" },
      { label: "Strong", min: 80, max: 100, color: "text-emerald-700", bgColor: "bg-emerald-50" },
    ],
  },
  // Substance Use
  {
    id: "crafft", title: "CRAFFT 2.1 (Substance)", shortTitle: "CRAFFT", category: "substance",
    ageRange: "12–21", itemCount: 9, maxScore: 6,
    description: "Screens for substance use risk in adolescents and young adults. Scores ≥ 2 indicate high risk.",
    icon: "alert", color: "#d97706",
    severityZones: [
      { label: "Low Risk", min: 0, max: 1, color: "text-emerald-700", bgColor: "bg-emerald-50" },
      { label: "High Risk", min: 2, max: 6, color: "text-red-600", bgColor: "bg-red-50" },
    ],
  },
  // General
  {
    id: "who-5", title: "WHO-5 (Well-Being)", shortTitle: "WHO-5", category: "general",
    ageRange: "9+", itemCount: 5, maxScore: 25,
    description: "WHO Well-Being Index. Short 5-item positive well-being measure. Scores ≤ 13 suggest poor well-being.",
    icon: "heart", color: "#22c55e",
    severityZones: [
      { label: "Poor", min: 0, max: 7, color: "text-red-600", bgColor: "bg-red-50" },
      { label: "Low", min: 8, max: 13, color: "text-yellow-700", bgColor: "bg-yellow-50" },
      { label: "Good", min: 14, max: 19, color: "text-green-600", bgColor: "bg-green-50" },
      { label: "Excellent", min: 20, max: 25, color: "text-emerald-700", bgColor: "bg-emerald-50" },
    ],
  },
];

const CATEGORY_META: Record<string, { label: string; color: string; bg: string }> = {
  depression: { label: "Depression", color: "text-violet-700", bg: "bg-violet-50" },
  anxiety: { label: "Anxiety", color: "text-blue-700", bg: "bg-blue-50" },
  trauma: { label: "Trauma / PTSD", color: "text-red-700", bg: "bg-red-50" },
  suicide_risk: { label: "Suicide Risk", color: "text-red-800", bg: "bg-red-50" },
  behavioral: { label: "Behavioral", color: "text-teal-700", bg: "bg-teal-50" },
  social_emotional: { label: "Social-Emotional", color: "text-amber-700", bg: "bg-amber-50" },
  substance: { label: "Substance Use", color: "text-orange-700", bg: "bg-orange-50" },
  general: { label: "General Well-Being", color: "text-green-700", bg: "bg-green-50" },
};

const FREQUENCY_OPTIONS = [
  "One Time",
  "Weekly",
  "Biweekly",
  "Monthly",
  "Quarterly",
  "As Needed",
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  brain: Brain,
  activity: Activity,
  heart: Heart,
  shield: Shield,
  users: Users,
  alert: AlertTriangle,
};

// ─── Assessment Questions Library ────────────────────────────────────

type AssessmentQuestion = {
  number: number;
  text: string;
  options: string[];
};

const ASSESSMENT_QUESTIONS: Record<string, AssessmentQuestion[]> = {
  "phq-9": [
    { number: 1, text: "Little interest or pleasure in doing things", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 2, text: "Feeling down, depressed, or hopeless", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 3, text: "Trouble falling or staying asleep, or sleeping too much", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 4, text: "Feeling tired or having little energy", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 5, text: "Poor appetite or overeating", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 6, text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 7, text: "Trouble concentrating on things, such as reading the newspaper or watching television", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 8, text: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 9, text: "Thoughts that you would be better off dead or of hurting yourself in some way", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
  ],
  "phq-a": [
    { number: 1, text: "Little interest or pleasure in doing things", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 2, text: "Feeling down, depressed, irritable, or hopeless", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 3, text: "Trouble falling or staying asleep, or sleeping too much", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 4, text: "Feeling tired or having little energy", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 5, text: "Poor appetite, weight loss, or overeating", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 6, text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 7, text: "Trouble concentrating on things, such as school work, reading, or watching TV", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 8, text: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 9, text: "Thoughts that you would be better off dead or of hurting yourself in some way", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
  ],
  "phq-2": [
    { number: 1, text: "Little interest or pleasure in doing things", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 2, text: "Feeling down, depressed, or hopeless", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
  ],
  "gad-7": [
    { number: 1, text: "Feeling nervous, anxious, or on edge", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 2, text: "Not being able to stop or control worrying", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 3, text: "Worrying too much about different things", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 4, text: "Trouble relaxing", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 5, text: "Being so restless that it's hard to sit still", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 6, text: "Becoming easily annoyed or irritable", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 7, text: "Feeling afraid, as if something awful might happen", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
  ],
  "gad-2": [
    { number: 1, text: "Feeling nervous, anxious, or on edge", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
    { number: 2, text: "Not being able to stop or control worrying", options: ["Not at all (0)", "Several days (1)", "More than half the days (2)", "Nearly every day (3)"] },
  ],
  "gad-child": [
    { number: 1, text: "I worry about things", options: ["Never (0)", "Sometimes (1)", "Often (2)", "Always (3)"] },
    { number: 2, text: "I feel nervous or anxious", options: ["Never (0)", "Sometimes (1)", "Often (2)", "Always (3)"] },
    { number: 3, text: "I can't stop worrying", options: ["Never (0)", "Sometimes (1)", "Often (2)", "Always (3)"] },
    { number: 4, text: "I worry about what might happen", options: ["Never (0)", "Sometimes (1)", "Often (2)", "Always (3)"] },
    { number: 5, text: "I have trouble relaxing", options: ["Never (0)", "Sometimes (1)", "Often (2)", "Always (3)"] },
    { number: 6, text: "I feel restless or on edge", options: ["Never (0)", "Sometimes (1)", "Often (2)", "Always (3)"] },
    { number: 7, text: "I get irritated or annoyed easily", options: ["Never (0)", "Sometimes (1)", "Often (2)", "Always (3)"] },
    { number: 8, text: "I feel afraid something bad will happen", options: ["Never (0)", "Sometimes (1)", "Often (2)", "Always (3)"] },
    { number: 9, text: "I have trouble concentrating because of worry", options: ["Never (0)", "Sometimes (1)", "Often (2)", "Always (3)"] },
    { number: 10, text: "I have trouble sleeping because of worry", options: ["Never (0)", "Sometimes (1)", "Often (2)", "Always (3)"] },
  ],
  "cssrs": [
    { number: 1, text: "Have you wished you were dead or wished you could go to sleep and not wake up?", options: ["Yes", "No"] },
    { number: 2, text: "Have you actually had any thoughts of killing yourself?", options: ["Yes", "No"] },
    { number: 3, text: "Have you been thinking about how you might do this?", options: ["Yes", "No"] },
    { number: 4, text: "Have you had these thoughts and had some intention of acting on them?", options: ["Yes", "No"] },
    { number: 5, text: "Have you started to work out or worked out the details of how to kill yourself? Do you intend to carry out this plan?", options: ["Yes", "No"] },
    { number: 6, text: "Have you ever done anything, started to do anything, or prepared to do anything to end your life?", options: ["Yes", "No"] },
  ],
  "ask-suicide": [
    { number: 1, text: "In the past few weeks, have you wished you were dead?", options: ["Yes", "No"] },
    { number: 2, text: "In the past few weeks, have you felt that you or your family would be better off if you were dead?", options: ["Yes", "No"] },
    { number: 3, text: "In the past week, have you been having thoughts about killing yourself?", options: ["Yes", "No"] },
    { number: 4, text: "Have you ever tried to kill yourself?", options: ["Yes", "No"] },
  ],
  "pcl-5": [
    { number: 1, text: "Repeated, disturbing, and unwanted memories of the stressful experience", options: ["Not at all (0)", "A little bit (1)", "Moderately (2)", "Quite a bit (3)", "Extremely (4)"] },
    { number: 2, text: "Repeated, disturbing dreams of the stressful experience", options: ["Not at all (0)", "A little bit (1)", "Moderately (2)", "Quite a bit (3)", "Extremely (4)"] },
    { number: 3, text: "Suddenly feeling or acting as if the stressful experience were actually happening again", options: ["Not at all (0)", "A little bit (1)", "Moderately (2)", "Quite a bit (3)", "Extremely (4)"] },
    { number: 4, text: "Feeling very upset when something reminded you of the stressful experience", options: ["Not at all (0)", "A little bit (1)", "Moderately (2)", "Quite a bit (3)", "Extremely (4)"] },
    { number: 5, text: "Having strong physical reactions when something reminded you of the stressful experience", options: ["Not at all (0)", "A little bit (1)", "Moderately (2)", "Quite a bit (3)", "Extremely (4)"] },
  ],
  "cpss-5": [
    { number: 1, text: "Having upsetting thoughts or images about the event that came into your head when you didn't want them to", options: ["Not at all (0)", "Once a week or less (1)", "2 to 4 times a week (2)", "5 or more times a week (3)", "Almost all the time (4)"] },
    { number: 2, text: "Having bad dreams or nightmares about the event", options: ["Not at all (0)", "Once a week or less (1)", "2 to 4 times a week (2)", "5 or more times a week (3)", "Almost all the time (4)"] },
    { number: 3, text: "Acting or feeling as if the event was happening again", options: ["Not at all (0)", "Once a week or less (1)", "2 to 4 times a week (2)", "5 or more times a week (3)", "Almost all the time (4)"] },
    { number: 4, text: "Feeling upset when you think about or hear about the event", options: ["Not at all (0)", "Once a week or less (1)", "2 to 4 times a week (2)", "5 or more times a week (3)", "Almost all the time (4)"] },
    { number: 5, text: "Having feelings in your body when you think about or hear about the event (for example, breaking out in a sweat, heart beating fast)", options: ["Not at all (0)", "Once a week or less (1)", "2 to 4 times a week (2)", "5 or more times a week (3)", "Almost all the time (4)"] },
  ],
  "sdq": [
    { number: 1, text: "Considerate of other people's feelings", options: ["Not True (0)", "Somewhat True (1)", "Certainly True (2)"] },
    { number: 2, text: "Restless, overactive, cannot stay still for long", options: ["Not True (0)", "Somewhat True (1)", "Certainly True (2)"] },
    { number: 3, text: "Often complains of headaches, stomach-aches or sickness", options: ["Not True (0)", "Somewhat True (1)", "Certainly True (2)"] },
    { number: 4, text: "Shares readily with other children (treats, toys, pencils etc.)", options: ["Not True (0)", "Somewhat True (1)", "Certainly True (2)"] },
    { number: 5, text: "Often has temper tantrums or hot tempers", options: ["Not True (0)", "Somewhat True (1)", "Certainly True (2)"] },
  ],
  "snap-iv": [
    { number: 1, text: "Often fails to give close attention to details or makes careless mistakes in schoolwork or tasks", options: ["Not at all (0)", "Just a little (1)", "Quite a bit (2)", "Very much (3)"] },
    { number: 2, text: "Often has difficulty sustaining attention in tasks or play activities", options: ["Not at all (0)", "Just a little (1)", "Quite a bit (2)", "Very much (3)"] },
    { number: 3, text: "Often does not seem to listen when spoken to directly", options: ["Not at all (0)", "Just a little (1)", "Quite a bit (2)", "Very much (3)"] },
    { number: 4, text: "Often does not follow through on instructions and fails to finish schoolwork or chores", options: ["Not at all (0)", "Just a little (1)", "Quite a bit (2)", "Very much (3)"] },
    { number: 5, text: "Often has difficulty organizing tasks and activities", options: ["Not at all (0)", "Just a little (1)", "Quite a bit (2)", "Very much (3)"] },
  ],
  "sel": [
    { number: 1, text: "I can describe my feelings", options: ["Not at all (1)", "A little (2)", "Somewhat (3)", "A lot (4)"] },
    { number: 2, text: "I know what makes me feel different emotions", options: ["Not at all (1)", "A little (2)", "Somewhat (3)", "A lot (4)"] },
    { number: 3, text: "I can calm myself down when I am upset", options: ["Not at all (1)", "A little (2)", "Somewhat (3)", "A lot (4)"] },
    { number: 4, text: "I think before I act", options: ["Not at all (1)", "A little (2)", "Somewhat (3)", "A lot (4)"] },
    { number: 5, text: "I can work well with other students", options: ["Not at all (1)", "A little (2)", "Somewhat (3)", "A lot (4)"] },
  ],
  "crafft": [
    { number: 1, text: "Have you ever ridden in a CAR driven by someone (including yourself) who was \"high\" or had been using alcohol or drugs?", options: ["Yes (1)", "No (0)"] },
    { number: 2, text: "Do you ever use alcohol or drugs to RELAX, feel better about yourself, or fit in?", options: ["Yes (1)", "No (0)"] },
    { number: 3, text: "Do you ever use alcohol or drugs while you are by yourself, or ALONE?", options: ["Yes (1)", "No (0)"] },
    { number: 4, text: "Do you ever FORGET things you did while using alcohol or drugs?", options: ["Yes (1)", "No (0)"] },
    { number: 5, text: "Do your FAMILY or friends ever tell you that you should cut down on your drinking or drug use?", options: ["Yes (1)", "No (0)"] },
    { number: 6, text: "Have you ever gotten into TROUBLE while you were using alcohol or drugs?", options: ["Yes (1)", "No (0)"] },
  ],
  "who-5": [
    { number: 1, text: "I have felt cheerful and in good spirits", options: ["At no time (0)", "Some of the time (1)", "Less than half the time (2)", "More than half the time (3)", "Most of the time (4)", "All of the time (5)"] },
    { number: 2, text: "I have felt calm and relaxed", options: ["At no time (0)", "Some of the time (1)", "Less than half the time (2)", "More than half the time (3)", "Most of the time (4)", "All of the time (5)"] },
    { number: 3, text: "I have felt active and vigorous", options: ["At no time (0)", "Some of the time (1)", "Less than half the time (2)", "More than half the time (3)", "Most of the time (4)", "All of the time (5)"] },
    { number: 4, text: "I woke up feeling fresh and rested", options: ["At no time (0)", "Some of the time (1)", "Less than half the time (2)", "More than half the time (3)", "Most of the time (4)", "All of the time (5)"] },
    { number: 5, text: "My daily life has been filled with things that interest me", options: ["At no time (0)", "Some of the time (1)", "Less than half the time (2)", "More than half the time (3)", "Most of the time (4)", "All of the time (5)"] },
  ],
  "scared": [
    { number: 1, text: "When I feel frightened, it is hard to breathe", options: ["Not true or hardly ever true (0)", "Somewhat true or sometimes true (1)", "Very true or often true (2)"] },
    { number: 2, text: "I get headaches when I am at school", options: ["Not true or hardly ever true (0)", "Somewhat true or sometimes true (1)", "Very true or often true (2)"] },
    { number: 3, text: "I don't like to be with people I don't know well", options: ["Not true or hardly ever true (0)", "Somewhat true or sometimes true (1)", "Very true or often true (2)"] },
    { number: 4, text: "I get scared if I sleep away from home", options: ["Not true or hardly ever true (0)", "Somewhat true or sometimes true (1)", "Very true or often true (2)"] },
    { number: 5, text: "I worry about other people liking me", options: ["Not true or hardly ever true (0)", "Somewhat true or sometimes true (1)", "Very true or often true (2)"] },
  ],
  "rcads": [
    { number: 1, text: "I feel sad or empty", options: ["Never (0)", "Sometimes (1)", "Often (2)", "Always (3)"] },
    { number: 2, text: "I worry when I think I have done poorly at something", options: ["Never (0)", "Sometimes (1)", "Often (2)", "Always (3)"] },
    { number: 3, text: "I would feel afraid of being on my own at home", options: ["Never (0)", "Sometimes (1)", "Often (2)", "Always (3)"] },
    { number: 4, text: "Nothing is much fun anymore", options: ["Never (0)", "Sometimes (1)", "Often (2)", "Always (3)"] },
    { number: 5, text: "I worry that something awful will happen to someone in my family", options: ["Never (0)", "Sometimes (1)", "Often (2)", "Always (3)"] },
  ],
  "ces-dc": [
    { number: 1, text: "I was bothered by things that usually don't bother me", options: ["Not at all (0)", "A little (1)", "Some (2)", "A lot (3)"] },
    { number: 2, text: "I did not feel like eating, I wasn't very hungry", options: ["Not at all (0)", "A little (1)", "Some (2)", "A lot (3)"] },
    { number: 3, text: "I wasn't able to feel happy, even when my family or friends tried to help me feel better", options: ["Not at all (0)", "A little (1)", "Some (2)", "A lot (3)"] },
    { number: 4, text: "I felt like I was just as good as other kids", options: ["Not at all (0)", "A little (1)", "Some (2)", "A lot (3)"] },
    { number: 5, text: "I felt like I couldn't pay attention to what I was doing", options: ["Not at all (0)", "A little (1)", "Some (2)", "A lot (3)"] },
  ],
  "bdi-ii": [
    { number: 1, text: "Sadness", options: ["I do not feel sad (0)", "I feel sad much of the time (1)", "I am sad all the time (2)", "I am so sad or unhappy that I can't stand it (3)"] },
    { number: 2, text: "Pessimism", options: ["I am not discouraged about my future (0)", "I feel more discouraged about my future than I used to (1)", "I do not expect things to work out for me (2)", "I feel my future is hopeless and will only get worse (3)"] },
    { number: 3, text: "Past Failure", options: ["I do not feel like a failure (0)", "I have failed more than I should have (1)", "As I look back, I see a lot of failures (2)", "I feel I am a total failure as a person (3)"] },
    { number: 4, text: "Loss of Pleasure", options: ["I get as much pleasure as I ever did from the things I enjoy (0)", "I don't enjoy things as much as I used to (1)", "I get very little pleasure from the things I used to enjoy (2)", "I can't get any pleasure from the things I used to enjoy (3)"] },
    { number: 5, text: "Guilty Feelings", options: ["I don't feel particularly guilty (0)", "I feel guilty over many things I have done or should have done (1)", "I feel quite guilty most of the time (2)", "I feel guilty all of the time (3)"] },
  ],
};

// ─── View Report Modal ──────────────────────────────────────────────

function ViewReportModal({
  def,
  dataPoint,
  onClose,
}: {
  def: AssessmentDefinition;
  dataPoint: AssessmentDataPoint | null;
  onClose: () => void;
}) {
  const questions = ASSESSMENT_QUESTIONS[def.id] ?? [];
  const severity = dataPoint ? getSeverityForScore(def.severityZones, dataPoint.score) : null;
  const IconComponent = ICON_MAP[def.icon] ?? ClipboardList;
  const isPartial = questions.length > 0 && questions.length < def.itemCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="relative mx-4 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${def.color}15` }}>
              <IconComponent className="h-5 w-5" style={{ color: def.color }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{def.title}</h2>
              <p className="text-xs text-gray-500">{def.description}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Score summary bar */}
        {dataPoint && (
          <div className="flex items-center gap-4 border-b bg-gray-50/80 px-6 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Score:</span>
              <span className="text-lg font-bold" style={{ color: def.color }}>{Math.round(dataPoint.score)}</span>
              <span className="text-sm text-gray-400">/ {def.maxScore}</span>
            </div>
            {severity && (
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", severity.color, severity.bgColor)}>
                {severity.label}
              </span>
            )}
            <span className="text-xs text-gray-400">
              {new Date(dataPoint.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>
        )}

        {/* Questions list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {questions.length === 0 ? (
            <div className="py-8 text-center">
              <ClipboardList className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">Questions for this assessment are not yet available.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {isPartial && (
                <p className="text-xs text-gray-400 italic">Showing {questions.length} of {def.itemCount} items (sample questions)</p>
              )}
              {questions.map((q) => (
                <div key={q.number} className="rounded-lg border bg-gray-50/50 p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: def.color }}
                    >
                      {q.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{q.text}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {q.options.map((opt) => (
                          <span key={opt} className="rounded-md border bg-white px-2 py-0.5 text-[11px] text-gray-500">
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-3">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{def.itemCount} items</span>
            <span>·</span>
            <span>Max score: {def.maxScore}</span>
            <span>·</span>
            <span>{def.ageRange}</span>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Mock data generator ────────────────────────────────────────────

function generateMockDataPoints(def: AssessmentDefinition, count: number): AssessmentDataPoint[] {
  const points: AssessmentDataPoint[] = [];
  const now = Date.now();
  const baseScore = Math.round(def.maxScore * 0.6);
  for (let i = 0; i < count; i++) {
    const daysAgo = (count - i) * 14;
    const date = new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!;
    const drift = Math.round((Math.random() - 0.55) * (def.maxScore * 0.15));
    const score = Math.max(0, Math.min(def.maxScore, baseScore + drift - i * Math.round(def.maxScore * 0.03)));
    points.push({
      id: `dp-${def.id}-${i}`,
      date,
      score,
      maxScore: def.maxScore,
    });
  }
  return points;
}

// ─── Assessment Library Modal ───────────────────────────────────────

function AssessmentLibraryModal({
  assignedIds,
  onAssign,
  onClose,
}: {
  assignedIds: Set<string>;
  onAssign: (def: AssessmentDefinition, frequency: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [assigningDef, setAssigningDef] = useState<AssessmentDefinition | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState("Monthly");

  const categories = Object.keys(CATEGORY_META);
  const filtered = categories.map((cat) => {
    const items = ASSESSMENT_LIBRARY.filter((d) => {
      if (d.category !== cat) return false;
      if (assignedIds.has(d.id)) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return d.title.toLowerCase().includes(q) || d.shortTitle.toLowerCase().includes(q) || d.description.toLowerCase().includes(q);
    });
    return { category: cat, items, meta: CATEGORY_META[cat]! };
  }).filter((c) => c.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="relative mx-4 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">Assessment Library</h2>
            <p className="text-sm text-gray-500">Select assessments to assign to this patient</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b px-6 py-3">
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assessments by name or description..."
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No matching assessments found.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((cat) => (
                <div key={cat.category} className="rounded-lg border">
                  <button
                    type="button"
                    onClick={() => setExpandedCategory(expandedCategory === cat.category ? null : cat.category)}
                    className={cn("flex w-full items-center justify-between rounded-t-lg px-4 py-3 text-left transition-colors", cat.meta.bg)}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-semibold", cat.meta.color)}>{cat.meta.label}</span>
                      <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-gray-500">{cat.items.length}</span>
                    </div>
                    {expandedCategory === cat.category ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </button>
                  {expandedCategory === cat.category && (
                    <div className="space-y-1 p-2">
                      {cat.items.map((def) => (
                        <div key={def.id} className="rounded-lg p-3 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 pr-3">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900">{def.title}</p>
                                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">{def.ageRange}</span>
                                <span className="text-[10px] text-gray-400">{def.itemCount} items</span>
                              </div>
                              <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{def.description}</p>
                            </div>
                            <Button size="sm" variant="outline" className="shrink-0 gap-1 text-xs" onClick={() => { setAssigningDef(def); setSelectedFrequency("Monthly"); }}>
                              <Plus className="h-3 w-3" />
                              Assign
                            </Button>
                          </div>
                          {assigningDef?.id === def.id && (
                            <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                              <p className="mb-2 text-xs font-semibold text-gray-700">Select Frequency</p>
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {FREQUENCY_OPTIONS.map((freq) => (
                                  <button
                                    key={freq}
                                    type="button"
                                    onClick={() => setSelectedFrequency(freq)}
                                    className={cn(
                                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                      selectedFrequency === freq
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600",
                                    )}
                                  >
                                    {freq}
                                  </button>
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  className="gap-1 bg-blue-600 hover:bg-blue-700 text-xs"
                                  onClick={() => {
                                    onAssign(def, selectedFrequency);
                                    setAssigningDef(null);
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                  Confirm Assignment
                                </Button>
                                <Button size="sm" variant="ghost" className="text-xs text-gray-500" onClick={() => setAssigningDef(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t bg-gray-50 px-6 py-3">
          <button type="button" onClick={onClose} className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Blueprint-style Trend Chart with Tooltips ──────────────────────

function getSeverityForScore(zones: SeverityZone[], score: number): SeverityZone | null {
  for (const zone of zones) {
    if (score >= zone.min && score <= zone.max) return zone;
  }
  return zones[zones.length - 1] ?? null;
}

function TrendChart({
  def,
  dataPoints,
}: {
  def: AssessmentDefinition;
  dataPoints: AssessmentDataPoint[];
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (dataPoints.length === 0) return null;

  const w = 560;
  const h = 200;
  const pad = { top: 20, right: 70, bottom: 40, left: 50 };
  const gw = w - pad.left - pad.right;
  const gh = h - pad.top - pad.bottom;

  const xScale = (i: number) => pad.left + (i / Math.max(dataPoints.length - 1, 1)) * gw;
  const yScale = (s: number) => pad.top + gh - (s / def.maxScore) * gh;

  const handleMouseEnter = (i: number, e: React.MouseEvent) => {
    setHoveredIdx(i);
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const hovered = hoveredIdx !== null ? dataPoints[hoveredIdx] : null;
  const hoveredSeverity = hovered ? getSeverityForScore(def.severityZones, hovered.score) : null;
  const hoveredPrev = hoveredIdx !== null && hoveredIdx > 0 ? dataPoints[hoveredIdx - 1] : null;
  const baseline = dataPoints[0];
  const changeSinceLast = hovered && hoveredPrev ? hovered.score - hoveredPrev.score : null;
  const changeSinceBaseline = hovered && baseline && hovered !== baseline ? hovered.score - baseline.score : null;

  return (
    <div className="relative">
      <svg ref={svgRef} width={w} height={h} className="w-full" style={{ minWidth: 360 }} viewBox={`0 0 ${w} ${h}`}>
        {/* Zone backgrounds */}
        {def.severityZones.map((zone, i) => {
          const top = yScale(Math.min(zone.max, def.maxScore));
          const bot = yScale(zone.min);
          const zoneH = bot - top;
          if (zoneH <= 0) return null;
          const fills: Record<string, string> = {
            "text-emerald-700": "rgb(16 185 129 / 0.06)",
            "text-green-600": "rgb(34 197 94 / 0.05)",
            "text-yellow-700": "rgb(234 179 8 / 0.06)",
            "text-orange-700": "rgb(249 115 22 / 0.08)",
            "text-red-600": "rgb(239 68 68 / 0.08)",
            "text-red-700": "rgb(220 38 38 / 0.1)",
            "text-red-800": "rgb(153 27 27 / 0.1)",
          };
          return (
            <g key={`zone-${i}`}>
              <rect x={pad.left} y={top} width={gw} height={zoneH} fill={fills[zone.color] ?? "rgb(0 0 0 / 0.02)"} />
              <text x={w - pad.right + 6} y={top + zoneH / 2} dominantBaseline="middle" fontSize="8" fill="#9ca3af">
                {zone.label}
              </text>
            </g>
          );
        })}

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r) => {
          const y = pad.top + gh * (1 - r);
          return (
            <g key={r}>
              <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="rgb(0 0 0 / 0.05)" strokeDasharray="3,3" />
              <text x={pad.left - 6} y={y} textAnchor="end" dominantBaseline="middle" fontSize="9" fill="#9ca3af">
                {Math.round(def.maxScore * r)}
              </text>
            </g>
          );
        })}

        {/* Line */}
        {dataPoints.length > 1 && (
          <polyline
            points={dataPoints.map((p, i) => `${xScale(i)},${yScale(p.score)}`).join(" ")}
            fill="none"
            stroke={def.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {dataPoints.map((p, i) => {
          const x = xScale(i);
          const y = yScale(p.score);
          const isHov = hoveredIdx === i;
          const isLast = i === dataPoints.length - 1;
          return (
            <g
              key={p.id}
              className="cursor-pointer"
              onMouseEnter={(e) => handleMouseEnter(i, e)}
              onMouseLeave={() => { setHoveredIdx(null); setTooltipPos(null); }}
            >
              {/* Hit area */}
              <circle cx={x} cy={y} r={16} fill="transparent" />
              {isHov && <circle cx={x} cy={y} r={14} fill={def.color} opacity={0.1} />}
              <circle cx={x} cy={y} r={isHov ? 6 : isLast ? 5 : 3.5} fill="white" stroke={def.color} strokeWidth={isHov || isLast ? 2.5 : 2} />
              <text x={x} y={y - 12} textAnchor="middle" fontSize="10" fontWeight={isHov || isLast ? "600" : "400"} fill={isHov || isLast ? def.color : "#6b7280"}>
                {Math.round(p.score)}
              </text>
              <text x={x} y={h - pad.bottom + 16} textAnchor="middle" fontSize="8" fill={isHov ? def.color : "#9ca3af"} fontWeight={isHov ? "600" : "400"}>
                {new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </text>
            </g>
          );
        })}

        {/* Axes */}
        <line x1={pad.left} y1={h - pad.bottom} x2={w - pad.right} y2={h - pad.bottom} stroke="rgb(0 0 0 / 0.1)" />
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={h - pad.bottom} stroke="rgb(0 0 0 / 0.1)" />
      </svg>

      {/* Blueprint-style tooltip */}
      {hovered && tooltipPos && (
        <div
          className="absolute z-40 pointer-events-none"
          style={{
            left: Math.min(tooltipPos.x + 16, w - 260),
            top: Math.max(tooltipPos.y - 60, 0),
          }}
        >
          <div className="w-60 rounded-xl border bg-white px-4 py-3 shadow-xl">
            <p className="text-[11px] text-gray-400 font-medium">
              {new Date(hovered.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: def.color }} />
              <span className="text-sm font-semibold text-gray-900">{def.shortTitle}</span>
            </div>
            {hoveredSeverity && (
              <p className={cn("mt-1 text-xs font-semibold", hoveredSeverity.color)}>
                {hoveredSeverity.label} ({hovered.score} out of {def.maxScore})
              </p>
            )}
            <div className="mt-2 flex items-center gap-3 text-[11px]">
              {changeSinceLast !== null && changeSinceLast !== 0 && (
                <span className={cn("font-semibold", changeSinceLast < 0 ? "text-emerald-600" : "text-red-500")}>
                  {changeSinceLast > 0 ? "↑" : "↓"} {Math.abs(changeSinceLast)} pts since last
                </span>
              )}
              {changeSinceLast === 0 && (
                <span className="text-gray-400 font-medium">No change since last</span>
              )}
            </div>
            {changeSinceBaseline !== null && changeSinceBaseline !== 0 && (
              <p className={cn("text-[11px] mt-0.5", changeSinceBaseline < 0 ? "text-emerald-600" : "text-red-500")}>
                {changeSinceBaseline > 0 ? "↑" : "↓"} {Math.abs(changeSinceBaseline)} pts since baseline
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Single Assessment Card ─────────────────────────────────────────

function AssessmentCard({
  assigned,
  def,
  onRemove,
}: {
  assigned: AssignedAssessment;
  def: AssessmentDefinition;
  onRemove: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [viewReportDp, setViewReportDp] = useState<AssessmentDataPoint | null>(null);
  const IconComponent = ICON_MAP[def.icon] ?? ClipboardList;

  const latest = assigned.dataPoints.length > 0 ? assigned.dataPoints[assigned.dataPoints.length - 1]! : null;
  const previous = assigned.dataPoints.length >= 2 ? assigned.dataPoints[assigned.dataPoints.length - 2]! : null;
  const severity = latest ? getSeverityForScore(def.severityZones, latest.score) : null;
  const changeSinceLast = latest && previous ? latest.score - previous.score : null;

  return (
    <div className="rounded-xl border bg-white overflow-hidden transition-shadow hover:shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50/80"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${def.color}15` }}>
          <IconComponent className="h-5 w-5" style={{ color: def.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-900">{def.title}</span>
            <span className="text-xs text-gray-400">{def.ageRange}</span>
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">{assigned.frequency}</span>
            {severity && (
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", severity.color, severity.bgColor)}>
                {severity.label}
              </span>
            )}
          </div>
          {latest ? (
            <div className="flex items-center gap-3 mt-1">
              <span className="text-lg font-bold" style={{ color: def.color }}>
                {Math.round(latest.score)}
              </span>
              <span className="text-xs text-gray-400">/ {def.maxScore}</span>
              {/* Mini gauge */}
              <div className="flex-1 max-w-[160px]">
                <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  {def.severityZones.map((zone, i) => {
                    const zoneWidth = ((zone.max - zone.min) / def.maxScore) * 100;
                    const zoneColors: Record<string, string> = {
                      "text-emerald-700": "bg-emerald-200", "text-green-600": "bg-green-200",
                      "text-yellow-700": "bg-yellow-200", "text-orange-700": "bg-orange-200",
                      "text-red-600": "bg-red-200", "text-red-700": "bg-red-300", "text-red-800": "bg-red-400",
                    };
                    return <div key={`${zone.label}-${i}`} className={cn("h-full", zoneColors[zone.color] ?? "bg-gray-200")} style={{ width: `${zoneWidth}%` }} />;
                  })}
                </div>
              </div>
              {changeSinceLast !== null && changeSinceLast !== 0 && (
                <span className={cn("text-[11px] font-semibold", changeSinceLast < 0 ? "text-emerald-600" : "text-red-500")}>
                  {changeSinceLast > 0 ? "↑" : "↓"}{Math.abs(Math.round(changeSinceLast))} since last
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-0.5">Assigned — awaiting first administration</p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Mini trend */}
          {assigned.dataPoints.length >= 2 && (() => {
            const pts = assigned.dataPoints;
            const tw = 70;
            const th = 24;
            const tpad = 2;
            const points = pts.map((p, i) => {
              const x = tpad + (i / (pts.length - 1)) * (tw - tpad * 2);
              const y = th - tpad - ((p.score / def.maxScore) * (th - tpad * 2));
              return `${x},${y}`;
            }).join(" ");
            return (
              <svg width={tw} height={th} className="shrink-0">
                <polyline points={points} fill="none" stroke={def.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            );
          })()}
          <span className="text-[10px] text-gray-400 font-medium">{assigned.dataPoints.length}</span>
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t px-5 py-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 max-w-md">{def.description}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Assigned: {assigned.assignedDate}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Next due: {assigned.nextDue}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 shrink-0">
                {def.severityZones.map((zone, i) => (
                  <span key={`${zone.label}-${i}`} className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", zone.color, zone.bgColor)}>
                    {zone.label}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(assigned.id); }}
                className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                title="Remove assessment"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Trend chart */}
          {assigned.dataPoints.length > 0 ? (
            <div className="rounded-lg border bg-gray-50/50 p-4">
              <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score Trend</h4>
              <TrendChart def={def} dataPoints={assigned.dataPoints} />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed py-6 text-center">
              <ClipboardList className="mx-auto h-7 w-7 text-gray-300" />
              <p className="mt-2 text-xs text-gray-500">No data yet — awaiting first administration</p>
            </div>
          )}

          {/* View Report button */}
          <button
            type="button"
            onClick={() => setViewReportDp(latest)}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <FileText className="h-4 w-4" />
            View Report — {def.title} Questions
          </button>

          {/* History table */}
          {assigned.dataPoints.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Assessment History</h4>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5">Score</th>
                      <th className="px-4 py-2.5">Severity</th>
                      <th className="px-4 py-2.5">Change</th>
                      <th className="px-4 py-2.5 text-right">Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[...assigned.dataPoints].reverse().map((dp, idx, arr) => {
                      const sev = getSeverityForScore(def.severityZones, dp.score);
                      const prev = idx < arr.length - 1 ? arr[idx + 1] : null;
                      const change = prev ? dp.score - prev.score : null;
                      const isLatest = idx === 0;
                      return (
                        <tr key={dp.id} className={cn("transition-colors hover:bg-gray-50", isLatest && "bg-blue-50/30")}>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1.5">
                              {isLatest && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />}
                              <span className={cn("text-gray-700", isLatest && "font-medium")}>
                                {new Date(dp.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="font-bold text-gray-900">{Math.round(dp.score)}</span>
                            <span className="text-gray-400 text-xs"> / {def.maxScore}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            {sev && (
                              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", sev.color, sev.bgColor)}>
                                {sev.label}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            {change !== null && change !== 0 ? (
                              <span className={cn("text-xs font-semibold", change < 0 ? "text-emerald-600" : "text-red-500")}>
                                {change > 0 ? "+" : ""}{Math.round(change)}
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400 uppercase tracking-wider">{change === 0 ? "No change" : "Baseline"}</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => setViewReportDp(dp)}
                              className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                              <FileText className="h-3 w-3" />
                              View Report
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Report Modal */}
      {viewReportDp !== undefined && viewReportDp !== null && (
        <ViewReportModal def={def} dataPoint={viewReportDp} onClose={() => setViewReportDp(null)} />
      )}
    </div>
  );
}

// ─── Main Assessment Manager Component ──────────────────────────────

export function AssessmentManager({ patientId }: { patientId: string }) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [assigned, setAssigned] = useState<AssignedAssessment[]>(() => {
    // Try to load from localStorage first
    const stored = loadProviderData(patientId);
    if (stored?.assessments && stored.assessments.length > 0) {
      return stored.assessments.map((sa) => {
        const def = ASSESSMENT_LIBRARY.find((d) => d.id === sa.definitionId);
        return {
          id: sa.id,
          definitionId: sa.definitionId,
          frequency: sa.frequency,
          assignedDate: sa.assignedDate,
          nextDue: sa.nextDue,
          status: sa.status,
          dataPoints: def ? generateMockDataPoints(def, 3) : [],
        };
      });
    }
    // Fall back to mock data
    const phq9Def = ASSESSMENT_LIBRARY.find((d) => d.id === "phq-9")!;
    const gad7Def = ASSESSMENT_LIBRARY.find((d) => d.id === "gad-7")!;
    const cssrsDef = ASSESSMENT_LIBRARY.find((d) => d.id === "cssrs")!;
    return [
      {
        id: "aa-1", definitionId: "phq-9", frequency: "Biweekly",
        assignedDate: "2026-01-10", nextDue: "2026-03-07", status: "active",
        dataPoints: generateMockDataPoints(phq9Def, 5),
      },
      {
        id: "aa-2", definitionId: "gad-7", frequency: "Monthly",
        assignedDate: "2026-01-10", nextDue: "2026-03-10", status: "active",
        dataPoints: generateMockDataPoints(gad7Def, 4),
      },
      {
        id: "aa-3", definitionId: "cssrs", frequency: "Monthly",
        assignedDate: "2026-01-15", nextDue: "2026-03-15", status: "active",
        dataPoints: generateMockDataPoints(cssrsDef, 3),
      },
    ];
  });

  // Persist assessments to localStorage whenever they change
  useEffect(() => {
    const existing = loadProviderData(patientId);
    const assessments: StoredAssessment[] = assigned.map((a) => {
      const def = ASSESSMENT_LIBRARY.find((d) => d.id === a.definitionId);
      return {
        id: a.id,
        definitionId: a.definitionId,
        title: def?.title ?? a.definitionId,
        shortTitle: def?.shortTitle ?? a.definitionId,
        frequency: a.frequency,
        assignedDate: a.assignedDate,
        nextDue: a.nextDue,
        status: a.status,
      };
    });
    const updatedData = {
      diagnoses: existing?.diagnoses ?? [],
      plans: existing?.plans ?? [],
      planExercises: existing?.planExercises ?? {},
      assessments,
    };
    saveProviderData(patientId, updatedData);
    // Also persist server-side so the student can see assigned assessments
    saveProviderDataServer(patientId, updatedData).catch(() => {
      // Server save failed — localStorage is the fallback
    });
  }, [assigned, patientId]);

  const assignedDefIds = new Set(assigned.map((a) => a.definitionId));

  function handleAssign(def: AssessmentDefinition, frequency: string) {
    const today = new Date().toISOString().split("T")[0]!;
    const nextDue = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!;
    setAssigned((prev) => [
      ...prev,
      {
        id: `aa-${Date.now()}`,
        definitionId: def.id,
        frequency,
        assignedDate: today,
        nextDue,
        status: "active",
        dataPoints: [],
      },
    ]);
  }

  function handleRemove(id: string) {
    setAssigned((prev) => prev.filter((a) => a.id !== id));
  }

  const activeAssessments = assigned.filter((a) => a.dataPoints.length > 0);
  const pendingAssessments = assigned.filter((a) => a.dataPoints.length === 0);

  return (
    <div className="space-y-6 font-dm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Patient Assessments</h3>
          <p className="mt-0.5 text-xs text-gray-400">
            {assigned.length} assessment{assigned.length !== 1 ? "s" : ""} assigned · {activeAssessments.length} with data
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowLibrary(true)}>
          <Plus className="h-3.5 w-3.5" />
          Assign Assessment
        </Button>
      </div>

      {/* Active assessments with data */}
      {activeAssessments.length > 0 && (
        <div className="space-y-3">
          {activeAssessments.map((a) => {
            const def = ASSESSMENT_LIBRARY.find((d) => d.id === a.definitionId);
            if (!def) return null;
            return <AssessmentCard key={a.id} assigned={a} def={def} onRemove={handleRemove} />;
          })}
        </div>
      )}

      {/* Pending assessments (no data yet) */}
      {pendingAssessments.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Awaiting First Administration</h4>
          <div className="space-y-2">
            {pendingAssessments.map((a) => {
              const def = ASSESSMENT_LIBRARY.find((d) => d.id === a.definitionId);
              if (!def) return null;
              const IconComponent = ICON_MAP[def.icon] ?? ClipboardList;
              return (
                <div key={a.id} className="flex items-center gap-3 rounded-xl border bg-white px-5 py-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${def.color}15` }}>
                    <IconComponent className="h-4 w-4" style={{ color: def.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">{def.title}</span>
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">{a.frequency}</span>
                      <span className="text-[10px] text-gray-400">{def.ageRange}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Assigned {a.assignedDate} · Next due {a.nextDue}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(a.id)}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    title="Remove"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {assigned.length === 0 && (
        <div className="rounded-xl border border-dashed bg-white p-8 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">No assessments assigned yet</p>
          <p className="mt-1 text-xs text-gray-400">Click &quot;Assign Assessment&quot; to browse the assessment library</p>
        </div>
      )}

      {/* Library modal */}
      {showLibrary && (
        <AssessmentLibraryModal
          assignedIds={assignedDefIds}
          onAssign={handleAssign}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </div>
  );
}
