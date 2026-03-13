"use client";

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Download,
  Edit3,
  Eye,
  Loader2,
  Play,
  Plus,
  Save,
  Search,
  Sparkles,
  Stethoscope,
  Target,
  TrendingDown,
  TrendingUp,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { cn } from "@/lib/tailwind-utils";
import { getAvailableCodePrefixes } from "@/data/treatmentPlanTemplates";
import {
  type RTMPatient,
  type TreatmentPlan,
} from "./mock-data";
import {
  loadProviderData,
  saveProviderData,
  type ProviderData,
} from "@/app/dashboard/~lib/provider-store";
import { saveProviderDataServer } from "@/app/dashboard/~lib/provider-data-actions";
import { ExerciseRouter } from "@/components/exercises/ExerciseRouter";

// ─── ICD-10 Mental Health Diagnosis Codes ────────────────────────────

type ICD10Diagnosis = { code: string; description: string };

const ICD10_MENTAL_HEALTH_CODES: ICD10Diagnosis[] = [
  // Mood (Affective) Disorders — F30-F39
  { code: "F31.0", description: "Bipolar disorder, current episode hypomanic" },
  { code: "F31.10", description: "Bipolar disorder, current episode manic, without psychotic features, unspecified" },
  { code: "F31.11", description: "Bipolar disorder, current episode manic, without psychotic features, mild" },
  { code: "F31.12", description: "Bipolar disorder, current episode manic, without psychotic features, moderate" },
  { code: "F31.13", description: "Bipolar disorder, current episode manic, without psychotic features, severe" },
  { code: "F31.2", description: "Bipolar disorder, current episode manic severe with psychotic features" },
  { code: "F31.30", description: "Bipolar disorder, current episode depressed, mild or moderate, unspecified" },
  { code: "F31.31", description: "Bipolar disorder, current episode depressed, mild" },
  { code: "F31.32", description: "Bipolar disorder, current episode depressed, moderate" },
  { code: "F31.4", description: "Bipolar disorder, current episode depressed, severe, without psychotic features" },
  { code: "F31.5", description: "Bipolar disorder, current episode depressed, severe, with psychotic features" },
  { code: "F31.81", description: "Bipolar II disorder" },
  { code: "F32.0", description: "Major depressive disorder, single episode, mild" },
  { code: "F32.1", description: "Major depressive disorder, single episode, moderate" },
  { code: "F32.2", description: "Major depressive disorder, single episode, severe without psychotic features" },
  { code: "F32.3", description: "Major depressive disorder, single episode, severe with psychotic features" },
  { code: "F32.9", description: "Major depressive disorder, single episode, unspecified" },
  { code: "F33.0", description: "Major depressive disorder, recurrent, mild" },
  { code: "F33.1", description: "Major depressive disorder, recurrent, moderate" },
  { code: "F33.2", description: "Major depressive disorder, recurrent severe without psychotic features" },
  { code: "F33.3", description: "Major depressive disorder, recurrent, severe with psychotic symptoms" },
  { code: "F33.9", description: "Major depressive disorder, recurrent, unspecified" },
  { code: "F34.1", description: "Dysthymic disorder (Persistent depressive disorder)" },
  // Anxiety Disorders — F40-F48
  { code: "F40.10", description: "Social anxiety disorder (social phobia), unspecified" },
  { code: "F40.11", description: "Social anxiety disorder (social phobia), generalized" },
  { code: "F40.8", description: "Other phobic anxiety disorders" },
  { code: "F41.0", description: "Panic disorder without agoraphobia" },
  { code: "F41.1", description: "Generalized anxiety disorder" },
  { code: "F41.8", description: "Other specified anxiety disorders (mixed anxiety)" },
  { code: "F41.9", description: "Anxiety disorder, unspecified" },
  { code: "F42.2", description: "Mixed obsessional thoughts and acts (OCD)" },
  { code: "F42.9", description: "Obsessive-compulsive disorder, unspecified" },
  { code: "F43.0", description: "Acute stress reaction" },
  { code: "F43.10", description: "Post-traumatic stress disorder, unspecified" },
  { code: "F43.11", description: "Post-traumatic stress disorder, acute" },
  { code: "F43.12", description: "Post-traumatic stress disorder, chronic" },
  { code: "F43.20", description: "Adjustment disorder, unspecified" },
  { code: "F43.21", description: "Adjustment disorder with depressed mood" },
  { code: "F43.22", description: "Adjustment disorder with anxiety" },
  { code: "F43.23", description: "Adjustment disorder with mixed anxiety and depressed mood" },
  { code: "F43.24", description: "Adjustment disorder with disturbance of conduct" },
  { code: "F43.25", description: "Adjustment disorder with mixed disturbance of emotions and conduct" },
  { code: "F44.9", description: "Dissociative and conversion disorder, unspecified" },
  { code: "F45.1", description: "Undifferentiated somatoform disorder" },
  // Eating Disorders — F50
  { code: "F50.00", description: "Anorexia nervosa, unspecified" },
  { code: "F50.01", description: "Anorexia nervosa, restricting type" },
  { code: "F50.02", description: "Anorexia nervosa, binge eating/purging type" },
  { code: "F50.2", description: "Bulimia nervosa" },
  { code: "F50.81", description: "Binge eating disorder" },
  { code: "F50.9", description: "Eating disorder, unspecified" },
  // Sleep Disorders — F51
  { code: "F51.01", description: "Primary insomnia" },
  { code: "F51.02", description: "Adjustment insomnia" },
  { code: "F51.09", description: "Other insomnia not due to a substance or known physiological condition" },
  // ADHD — F90
  { code: "F90.0", description: "ADHD, predominantly inattentive type" },
  { code: "F90.1", description: "ADHD, predominantly hyperactive-impulsive type" },
  { code: "F90.2", description: "ADHD, combined type" },
  { code: "F90.9", description: "ADHD, unspecified type" },
  // Conduct / Behavioral — F91-F98
  { code: "F91.1", description: "Conduct disorder, childhood-onset type" },
  { code: "F91.2", description: "Conduct disorder, adolescent-onset type" },
  { code: "F91.3", description: "Oppositional defiant disorder" },
  { code: "F91.9", description: "Conduct disorder, unspecified" },
  { code: "F93.0", description: "Separation anxiety disorder of childhood" },
  { code: "F94.0", description: "Selective mutism" },
  { code: "F95.2", description: "Tourette's disorder" },
  // Personality Disorders — F60
  { code: "F60.0", description: "Paranoid personality disorder" },
  { code: "F60.1", description: "Schizoid personality disorder" },
  { code: "F60.2", description: "Antisocial personality disorder" },
  { code: "F60.3", description: "Borderline personality disorder" },
  { code: "F60.4", description: "Histrionic personality disorder" },
  { code: "F60.5", description: "Obsessive-compulsive personality disorder" },
  { code: "F60.6", description: "Avoidant personality disorder" },
  { code: "F60.7", description: "Dependent personality disorder" },
  { code: "F60.81", description: "Narcissistic personality disorder" },
  // Substance Use — F10-F19 (select)
  { code: "F10.10", description: "Alcohol use disorder, mild (alcohol abuse)" },
  { code: "F10.20", description: "Alcohol use disorder, moderate/severe (alcohol dependence)" },
  { code: "F12.10", description: "Cannabis use disorder, mild" },
  { code: "F12.20", description: "Cannabis use disorder, moderate/severe" },
  { code: "F19.10", description: "Other psychoactive substance abuse, uncomplicated" },
  { code: "F19.20", description: "Other psychoactive substance dependence, uncomplicated" },
  // Psychotic Disorders — F20-F29
  { code: "F20.9", description: "Schizophrenia, unspecified" },
  { code: "F25.0", description: "Schizoaffective disorder, bipolar type" },
  { code: "F25.1", description: "Schizoaffective disorder, depressive type" },
  // Other
  { code: "F48.1", description: "Depersonalization-derealization disorder" },
  { code: "F63.0", description: "Pathological gambling" },
  { code: "F63.3", description: "Trichotillomania (hair-pulling disorder)" },
  { code: "F98.5", description: "Stuttering (childhood-onset fluency disorder)" },
  { code: "R45.89", description: "Other symptoms and signs involving emotional state" },
  { code: "Z03.89", description: "Encounter for observation for other suspected diseases and conditions ruled out" },
];

// ─── PDF Export Helper ──────────────────────────────────────────────

function handlePrintReport(containerRef: React.RefObject<HTMLDivElement | null>, patientName: string) {
  if (!containerRef.current) return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Patient Report — ${patientName}</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2/dist/tailwind.min.css" rel="stylesheet">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; color: #111; padding: 0.5in; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>${containerRef.current.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 500);
}

// ─── Intervention Library ────────────────────────────────────────────

type InterventionType = "checklist" | "tracker" | "exercise" | "worksheet" | "psychoed";

type InterventionItem = {
  id: string;
  name: string;
  description: string;
  type: InterventionType;
  mvpScope: string[];        // bullet points describing MVP implementation
  applicableCodes: string[]; // ICD-10 prefixes this applies to, e.g. ["F32", "F33", "F41"]
};

type InterventionCategory = {
  name: string;
  codePrefix: string;        // e.g. "F32" — links to treatmentPlanTemplates
  color: string;
  bg: string;
  goalGroup: string;         // which treatment goal this group supports
  interventions: InterventionItem[];
};

const INTERVENTION_TYPE_LABELS: Record<InterventionType, { label: string; color: string; bg: string }> = {
  checklist: { label: "Checklist", color: "text-teal-700", bg: "bg-teal-50" },
  tracker:   { label: "Tracker",   color: "text-orange-700", bg: "bg-orange-50" },
  exercise:  { label: "Exercise",  color: "text-slate-700", bg: "bg-slate-100" },
  worksheet: { label: "Worksheet", color: "text-amber-700", bg: "bg-amber-50" },
  psychoed:  { label: "Psychoed",  color: "text-violet-700", bg: "bg-violet-50" },
};

const INTERVENTION_CATEGORIES: InterventionCategory[] = [
  // ════════════════════════════════════════════════════
  // F32 — Depressive Episode
  // ════════════════════════════════════════════════════
  {
    name: "Depression: Symptom Reduction",
    codePrefix: "F32",
    color: "text-blue-700",
    bg: "bg-blue-50",
    goalGroup: "Reduce depressive symptoms — PHQ-9 by 50%",
    interventions: [
      {
        id: "f32-1-01",
        name: "Weekly PHQ-9 Self-Check",
        description: "Interactive PHQ-9 with auto-scoring, trend graph, and clinician alert for scores ≥20 or SI item >0.",
        type: "tracker",
        mvpScope: ["Auto-scored PHQ-9 questionnaire", "Line graph showing score over time", "Interpretation text after each completion", "Clinician alert for critical thresholds"],
        applicableCodes: ["F32", "F33"],
      },
      {
        id: "f32-1-02",
        name: "Thought Record",
        description: "Guided 5-column CBT thought record: Situation → Automatic Thought → Emotion → Evidence For/Against → Balanced Thought.",
        type: "exercise",
        mvpScope: ["5-column guided form with pre-populated examples", "Emotion intensity rating 0–10", "Saves entries for clinician review", "Common depression distortions reference"],
        applicableCodes: ["F32", "F33", "F41"],
      },
      {
        id: "f32-1-03",
        name: "Understanding Depression",
        description: "Micro-module covering what depression is, neurobiological basics, and the CBT triangle.",
        type: "psychoed",
        mvpScope: ["Brief educational content on depression", "Interactive CBT triangle — user identifies most active corner", "Normalization and stigma-reduction messaging"],
        applicableCodes: ["F32", "F33"],
      },
    ],
  },
  {
    name: "Depression: Daily Functioning",
    codePrefix: "F32",
    color: "text-blue-700",
    bg: "bg-blue-50",
    goalGroup: "Improve daily functioning — resume activities 5 days/week",
    interventions: [
      {
        id: "f32-2-01",
        name: "Daily Activity Log",
        description: "Behavioral Activation log: record activities with Mastery (0–10) and Pleasure (0–10) ratings.",
        type: "tracker",
        mvpScope: ["Daily activity list with M/P ratings", "Weekly summary with activity count and averages", "Pattern surfacing for low-mastery/high-pleasure days"],
        applicableCodes: ["F32", "F33"],
      },
      {
        id: "f32-2-02",
        name: "Activity Scheduling Planner",
        description: "Weekly calendar for scheduling 1–2 intentional activities per day across self-care, social, productive, and pleasurable categories.",
        type: "worksheet",
        mvpScope: ["Weekly calendar view", "Activity categories: self-care, social, productive, pleasurable", "End-of-day check-off with mood rating (1–5)", "Printable version"],
        applicableCodes: ["F32", "F33"],
      },
      {
        id: "f32-2-03",
        name: "Values-Based Activity Brainstorm",
        description: "Identify 3–5 personal values and brainstorm small aligned activities to build a personalized activity menu.",
        type: "exercise",
        mvpScope: ["Values selection from curated list", "Brainstorm 2–3 activities per value", "Output: personalized activity menu"],
        applicableCodes: ["F32", "F33"],
      },
    ],
  },
  {
    name: "Depression: Sleep",
    codePrefix: "F32",
    color: "text-blue-700",
    bg: "bg-blue-50",
    goalGroup: "Establish healthy sleep patterns — 7–8 hrs, efficiency >85%",
    interventions: [
      {
        id: "f32-3-01",
        name: "Sleep Hygiene Checklist",
        description: "Interactive sleep hygiene checklist with personalized bedtime/wake fields. One-time completion, revisitable.",
        type: "checklist",
        mvpScope: ["Checkbox format with all evidence-based sleep hygiene items", "Personalized bedtime/wake time fields", "One-time completion; accessible as reference"],
        applicableCodes: ["F32", "F33", "F51"],
      },
      {
        id: "f32-3-02",
        name: "Sleep Diary",
        description: "Nightly log with auto-calculated sleep efficiency % and weekly trend visualization.",
        type: "tracker",
        mvpScope: ["Log: bedtime, wake time, time to fall asleep, night wakings, quality (1–5)", "Auto-calculate sleep efficiency %", "Weekly trend line", "Data usable for stimulus control recommendations"],
        applicableCodes: ["F32", "F33", "F51"],
      },
      {
        id: "f32-3-03",
        name: "Wind-Down Routine Builder",
        description: "Build a personalized 30–60 min pre-sleep routine from evidence-based activities.",
        type: "exercise",
        mvpScope: ["Select from: reading, stretching, breathing, journaling, etc.", "Build custom wind-down sequence", "Optional nightly reminder + check-in"],
        applicableCodes: ["F32", "F33", "F51"],
      },
    ],
  },
  {
    name: "Depression: Pleasurable Activities",
    codePrefix: "F32",
    color: "text-blue-700",
    bg: "bg-blue-50",
    goalGroup: "Increase pleasurable activities — ≥3/week",
    interventions: [
      {
        id: "f32-4-01",
        name: "Pleasant Events Tracker",
        description: "Weekly log of pleasurable activities with mood before/after and progress toward 3/week goal.",
        type: "tracker",
        mvpScope: ["Record activities with mood pre/post (1–10)", "Running count toward 3/week goal", "Visual progress indicator", "Mood-activity correlation surfacing"],
        applicableCodes: ["F32", "F33"],
      },
      {
        id: "f32-4-02",
        name: "Pleasant Activities Inventory",
        description: "Curated list of 50+ low-barrier activities organized by category. Rate interest and feasibility to build a personal top-10 list.",
        type: "worksheet",
        mvpScope: ["50+ activities across: social, physical, creative, nature, sensory, achievement", "Rate interest + feasibility", "Generates personal top-10 list"],
        applicableCodes: ["F32", "F33"],
      },
    ],
  },

  // ════════════════════════════════════════════════════
  // F33 — Recurrent Depressive Disorder
  // ════════════════════════════════════════════════════
  {
    name: "Recurrent Depression: Remission",
    codePrefix: "F33",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    goalGroup: "Achieve symptom remission — PHQ-9 <5",
    interventions: [
      {
        id: "f33-1-01",
        name: "Rumination Interruption Practice",
        description: "MBCT-informed exercise to notice rumination, label it, and redirect using breathing, grounding, or movement.",
        type: "exercise",
        mvpScope: ["Step 1: Label the thought pattern", "Step 2: Choose redirect (breathing space, grounding, movement)", "Step 3: Log trigger + which redirect helped"],
        applicableCodes: ["F33"],
      },
      {
        id: "f33-1-02",
        name: "3-Minute Breathing Space",
        description: "MBCT core practice: Acknowledge → Gather → Expand. Guided text walkthrough, logs frequency.",
        type: "exercise",
        mvpScope: ["Guided 3-step breathing space", "Step 1: Acknowledge, Step 2: Gather, Step 3: Expand", "Logs frequency of use"],
        applicableCodes: ["F33", "F32"],
      },
    ],
  },
  {
    name: "Recurrent Depression: Relapse Prevention",
    codePrefix: "F33",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    goalGroup: "Develop relapse prevention skills",
    interventions: [
      {
        id: "f33-2-01",
        name: "My Early Warning Signs Map",
        description: "Traffic light system mapping warning signs across thoughts, emotions, behaviors, physical sensations, and social patterns.",
        type: "worksheet",
        mvpScope: ["Guided identification across 5 domains", "Green → Yellow → Red traffic light system", "Document what to notice + what to do at each level", "Generates printable wallet card summary"],
        applicableCodes: ["F33"],
      },
      {
        id: "f33-2-02",
        name: "Personal Relapse Prevention Plan",
        description: "Comprehensive template covering triggers, warning signs, protective factors, coping actions, and support contacts.",
        type: "worksheet",
        mvpScope: ["Sections: triggers, warning signs, protective factors, coping actions, support contacts, professional contacts", "Collaborative completion over 2–3 sessions", "Stored and accessible anytime"],
        applicableCodes: ["F33"],
      },
      {
        id: "f33-2-03",
        name: "Weekly Wellness Check-In",
        description: "Brief weekly self-assessment across sleep, appetite, energy, social engagement, mood, and motivation with color-coded output.",
        type: "checklist",
        mvpScope: ["Rate: sleep, appetite, energy, social engagement, mood, motivation", "Color-coded zones: green/yellow/red", "Optional clinician notification for multiple yellow/red"],
        applicableCodes: ["F33"],
      },
    ],
  },
  {
    name: "Recurrent Depression: Coping & Maintenance",
    codePrefix: "F33",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    goalGroup: "Build sustainable coping strategies and maintenance routine",
    interventions: [
      {
        id: "f33-3-01",
        name: "Coping Skills Library",
        description: "Curated library of 10–15 evidence-based strategies across cognitive, behavioral, somatic, social, and mindfulness categories.",
        type: "psychoed",
        mvpScope: ["10–15 strategies with descriptions", "Categories: cognitive, behavioral, somatic, social, mindfulness", "User marks tried + rates effectiveness (1–5)", "Builds personalized coping toolkit"],
        applicableCodes: ["F33", "F32"],
      },
      {
        id: "f33-3-02",
        name: "Coping Skills Practice Log",
        description: "Daily prompt to log coping skill use, triggers, and effectiveness toward 5-skill mastery goal.",
        type: "tracker",
        mvpScope: ["Daily prompt: Did you use a coping skill today?", "Log: which skill, trigger, effectiveness rating", "Weekly summary: skill variety, most-used, average effectiveness", "Progress toward 5-skill mastery"],
        applicableCodes: ["F33", "F32"],
      },
      {
        id: "f33-4-01",
        name: "Protective Factors Habit Tracker",
        description: "Daily tracking of exercise, social connection, sleep hygiene, mindfulness, and medication adherence with streak counter.",
        type: "tracker",
        mvpScope: ["Daily yes/no for key protective behaviors", "Streak counter and weekly consistency %", "4-week streak visualization", "Milestone acknowledgments at 1, 2, 3, 4 weeks"],
        applicableCodes: ["F33"],
      },
      {
        id: "f33-4-02",
        name: "My Maintenance Blueprint",
        description: "Template for daily non-negotiables, weekly commitments, and monthly check-ins. Reviewed quarterly with clinician.",
        type: "worksheet",
        mvpScope: ["Sections: what keeps me well, what puts me at risk, who supports me", "Daily non-negotiables, weekly commitments, monthly check-ins", "Quarterly clinician review"],
        applicableCodes: ["F33"],
      },
    ],
  },

  // ════════════════════════════════════════════════════
  // F41 — Anxiety Disorders
  // ════════════════════════════════════════════════════
  {
    name: "Anxiety: Symptom Reduction",
    codePrefix: "F41",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    goalGroup: "Reduce anxiety symptoms — GAD-7 by 50%",
    interventions: [
      {
        id: "f41-1-01",
        name: "Weekly GAD-7 Self-Check",
        description: "Interactive GAD-7 with auto-scoring, trend graph, and alert logic for scores ≥15.",
        type: "tracker",
        mvpScope: ["Auto-scored GAD-7 questionnaire", "Score trend graph", "Interpretation guidance", "Clinician alert for scores ≥15"],
        applicableCodes: ["F41"],
      },
      {
        id: "f41-1-02",
        name: "Anxious Thought Challenge",
        description: "Cognitive restructuring: identify anxious prediction → rate belief → examine evidence → generate alternative → re-rate.",
        type: "exercise",
        mvpScope: ["Guided 5-step cognitive restructuring form", "Common anxiety distortions reference", "Belief rating 0–100% pre and post", "Saves entries for session review"],
        applicableCodes: ["F41", "F43"],
      },
      {
        id: "f41-1-03",
        name: "Understanding Your Anxiety",
        description: "Micro-module on fight-flight-freeze, the anxiety cycle, and difference between anxiety and danger.",
        type: "psychoed",
        mvpScope: ["Content: fight-flight-freeze, anxiety cycle, anxiety vs. danger", "Interactive: map personal anxiety cycle (trigger → thought → body → behavior → consequence)", "Normalizing messaging"],
        applicableCodes: ["F41"],
      },
    ],
  },
  {
    name: "Anxiety: Avoidance & Exposure",
    codePrefix: "F41",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    goalGroup: "Decrease avoidance — engage in 3+ avoided situations",
    interventions: [
      {
        id: "f41-2-01",
        name: "Exposure Hierarchy Builder",
        description: "Guided construction of fear/avoidance hierarchy with SUDS ratings, auto-sorted into low/medium/high tiers.",
        type: "worksheet",
        mvpScope: ["List avoided situations + rate anxiety (SUDS 0–100)", "Auto-sort into low/medium/high tiers", "Clinician review and adjustment in session"],
        applicableCodes: ["F41"],
      },
      {
        id: "f41-2-02",
        name: "Exposure Practice Log",
        description: "Per-exposure entry tracking situation, pre/post anxiety, duration, and what was learned.",
        type: "tracker",
        mvpScope: ["Entry: situation, pre-anxiety (0–10), duration, post-anxiety (0–10), what I learned", "Cumulative exposure count and habituation curves", "Links to hierarchy for progress visualization"],
        applicableCodes: ["F41"],
      },
      {
        id: "f41-2-03",
        name: "Approach vs. Avoidance Decision Tool",
        description: "Guided pros/cons analysis with short-term relief vs. long-term cost framing when facing avoided situations.",
        type: "exercise",
        mvpScope: ["Guided pros/cons of approaching vs. avoiding", "Short-term relief vs. long-term cost framing", "Commitment statement and planned coping strategy"],
        applicableCodes: ["F41"],
      },
    ],
  },
  {
    name: "Anxiety: Management Skills",
    codePrefix: "F41",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    goalGroup: "Develop anxiety management — reduce arousal within 5 min",
    interventions: [
      {
        id: "f41-3-01",
        name: "Diaphragmatic Breathing Guide",
        description: "Step-by-step guided breathing with visual pacer and pre/post anxiety rating.",
        type: "exercise",
        mvpScope: ["Guided 4-7-8 or box breathing", "Visual pacer (expandable circle/bar)", "Pre/post anxiety rating (1–10)", "Session counter"],
        applicableCodes: ["F41", "F32", "F33", "F43", "R45"],
      },
      {
        id: "f41-3-02",
        name: "Progressive Muscle Relaxation",
        description: "Guided 7-muscle-group PMR sequence with tense/release timing and pre/post tension rating.",
        type: "exercise",
        mvpScope: ["Guided full-body PMR (7 groups)", "Tense 5 sec → Release 10 sec per group", "Pre/post tension rating", "Abbreviated 4-group version for maintenance"],
        applicableCodes: ["F41", "F32", "F43", "R45"],
      },
      {
        id: "f41-3-03",
        name: "5-4-3-2-1 Grounding",
        description: "Sensory grounding for acute anxiety: 5 seen, 4 heard, 3 touched, 2 smelled, 1 tasted.",
        type: "exercise",
        mvpScope: ["Simple tap-through interface", "5 senses guided prompts", "Designed for in-the-moment use"],
        applicableCodes: ["F41", "F43", "R45"],
      },
    ],
  },
  {
    name: "Anxiety: Worry Reduction",
    codePrefix: "F41",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    goalGroup: "Reduce worry frequency by 75%",
    interventions: [
      {
        id: "f41-4-01",
        name: "Worry Time Scheduler",
        description: "Set a daily 15–30 min worry window. Log worries throughout the day and review during the scheduled time.",
        type: "exercise",
        mvpScope: ["Set daily worry window (15–30 min)", "Throughout day: log worry briefly and postpone", "During worry time: review logged worries, decide relevance", "Tracks worry count over time"],
        applicableCodes: ["F41"],
      },
      {
        id: "f41-4-02",
        name: "Worry Decision Tree",
        description: "Guided decision: Is this controllable? If yes → problem-solving steps. If no → acceptance strategies.",
        type: "worksheet",
        mvpScope: ["Decision: controllable vs. uncontrollable worry", "Controllable path: define problem, brainstorm, pick action, do it", "Uncontrollable path: acceptance, mindfulness, compassionate self-talk", "Printable for between-session use"],
        applicableCodes: ["F41"],
      },
      {
        id: "f41-4-03",
        name: "Daily Worry Log",
        description: "Brief daily entries tracking worry episodes, intensity, and themes to identify hot spots.",
        type: "tracker",
        mvpScope: ["Daily: number of episodes, average intensity (1–10), primary themes", "Weekly summary with trends", "Identifies worry hot spots (time of day, triggers)"],
        applicableCodes: ["F41"],
      },
    ],
  },

  // ════════════════════════════════════════════════════
  // F43 — Stress Reactions & Adjustment Disorders
  // ════════════════════════════════════════════════════
  {
    name: "Trauma/Adjustment: Processing",
    codePrefix: "F43",
    color: "text-rose-700",
    bg: "bg-rose-50",
    goalGroup: "Process traumatic/stressful event — decrease distress by 50%",
    interventions: [
      {
        id: "f43-1-01",
        name: "Weekly Distress Thermometer",
        description: "Simple 0–10 distress rating with context note. Optional periodic PCL-5 administration.",
        type: "tracker",
        mvpScope: ["0–10 distress rating with brief context", "Optional PCL-5 every 4 weeks", "Trend visualization over treatment"],
        applicableCodes: ["F43"],
      },
      {
        id: "f43-1-02",
        name: "Impact Statement",
        description: "CPT-informed writing exercise: how the event affected beliefs about self, others, and the world.",
        type: "worksheet",
        mvpScope: ["Guided prompts for safety, trust, power/control, esteem, intimacy", "Completed early in treatment", "Revisited later to track belief shifts", "Clinician-reviewed in session"],
        applicableCodes: ["F43"],
      },
      {
        id: "f43-1-03",
        name: "Understanding Stress & Trauma Responses",
        description: "Micro-module on normal stress responses, window of tolerance, and why symptoms are adaptive.",
        type: "psychoed",
        mvpScope: ["Content: normal stress responses, window of tolerance", "Interactive: identify hyper/hypo-arousal placement", "Emphasizes responses are adaptive, not broken"],
        applicableCodes: ["F43"],
      },
    ],
  },
  {
    name: "Trauma/Adjustment: Intrusive Symptoms",
    codePrefix: "F43",
    color: "text-rose-700",
    bg: "bg-rose-50",
    goalGroup: "Reduce intrusive symptoms to <2/week",
    interventions: [
      {
        id: "f43-2-01",
        name: "Grounding Toolkit",
        description: "Collection of grounding exercises for dissociation/flashback management. User selects favorites.",
        type: "exercise",
        mvpScope: ["Multiple techniques: 5-4-3-2-1, cold water, strong scent, feet-on-floor", "User selects and practices favorites", "Quick-access in-the-moment format", "Tracks which techniques are most effective"],
        applicableCodes: ["F43", "R45"],
      },
      {
        id: "f43-2-02",
        name: "Intrusion Log",
        description: "Brief per-event log tracking trigger, intensity, duration, and coping used.",
        type: "tracker",
        mvpScope: ["Per-event: trigger (if known), intensity (1–10), duration, coping used", "Weekly frequency count with trend", "Helps clinician identify patterns"],
        applicableCodes: ["F43"],
      },
      {
        id: "f43-2-03",
        name: "Containment Visualization",
        description: "Guided imagery: mentally place distressing material in a container for use between trauma processing sessions.",
        type: "exercise",
        mvpScope: ["Steps: visualize container → place material → secure → return to present", "For use between trauma processing sessions", "Brief guided text walkthrough"],
        applicableCodes: ["F43"],
      },
    ],
  },
  {
    name: "Trauma/Adjustment: Functioning & Coping",
    codePrefix: "F43",
    color: "text-rose-700",
    bg: "bg-rose-50",
    goalGroup: "Restore functioning and develop adaptive coping",
    interventions: [
      {
        id: "f43-3-01",
        name: "Functioning Self-Assessment",
        description: "Rate current functioning across work/school, relationships, self-care, hobbies, sleep, appetite vs. pre-stressor levels.",
        type: "worksheet",
        mvpScope: ["Rate domains: work/school, relationships, self-care, hobbies, sleep, appetite", "Compare to pre-stressor levels", "Re-administered periodically to track recovery"],
        applicableCodes: ["F43"],
      },
      {
        id: "f43-3-02",
        name: "Gradual Re-Engagement Planner",
        description: "Set small re-engagement steps for domains with reduced functioning. Similar to exposure hierarchy.",
        type: "worksheet",
        mvpScope: ["Identify domains with reduced functioning", "Set small achievable re-engagement steps", "Weekly check-in on progress"],
        applicableCodes: ["F43"],
      },
      {
        id: "f43-4-01",
        name: "Safety & Coping Plan",
        description: "Structured plan template: warning signs, internal coping, social contacts, professional contacts, environmental safety.",
        type: "worksheet",
        mvpScope: ["Structured sections: warning signs, internal coping, social contacts, professional contacts", "Focuses on everyday stress coping", "Printable and always accessible"],
        applicableCodes: ["F43", "R45"],
      },
      {
        id: "f43-4-02",
        name: "Stress Inoculation: Coping Rehearsal",
        description: "SIT-informed mental rehearsal: visualize stressful situation → identify coping → mentally practice → rate confidence.",
        type: "exercise",
        mvpScope: ["Guided mental rehearsal of upcoming stressor", "Identify and mentally practice coping strategies", "Rate confidence pre/post", "Repeat for different scenarios"],
        applicableCodes: ["F43"],
      },
    ],
  },

  // ════════════════════════════════════════════════════
  // F90 — ADHD
  // ════════════════════════════════════════════════════
  {
    name: "ADHD: Attention & Focus",
    codePrefix: "F90",
    color: "text-amber-700",
    bg: "bg-amber-50",
    goalGroup: "Improve attention — 30+ min sustained focus",
    interventions: [
      {
        id: "f90-1-01",
        name: "Focus Session Timer",
        description: "Pomodoro-style structured work intervals starting at 15 min, building to 30+. Tracks total focused time.",
        type: "exercise",
        mvpScope: ["Focus intervals: start 15 min, build to 30+", "Rate focus quality (1–5) per block", "5-min breaks between intervals", "Track total focused time per day/week"],
        applicableCodes: ["F90"],
      },
      {
        id: "f90-1-02",
        name: "Focus Environment Audit",
        description: "Checklist of common distractors with mitigation strategies. One-time setup exercise.",
        type: "checklist",
        mvpScope: ["Checklist: phone, notifications, noise, clutter, open tabs, etc.", "Identify top 3 distractors + select mitigation for each", "One-time setup; revisitable"],
        applicableCodes: ["F90"],
      },
      {
        id: "f90-1-03",
        name: "Understanding ADHD & Your Brain",
        description: "Micro-module on executive function, dopamine and attention, and why willpower isn't the issue.",
        type: "psychoed",
        mvpScope: ["Content: executive function basics, dopamine and attention", "Interactive: identify personal ADHD patterns", "De-stigmatizing, strengths-acknowledging framing"],
        applicableCodes: ["F90"],
      },
    ],
  },
  {
    name: "ADHD: Impulse Control",
    codePrefix: "F90",
    color: "text-amber-700",
    bg: "bg-amber-50",
    goalGroup: "Reduce impulsive behaviors by 75%",
    interventions: [
      {
        id: "f90-2-01",
        name: "Pause-Plan-Proceed Protocol",
        description: "Guided decision-making tool: Pause (notice urge) → Plan (consequences? alternatives?) → Proceed (choose intentionally).",
        type: "exercise",
        mvpScope: ["3-step guided protocol for high-impulse moments", "Log when used + outcome", "Builds automatic pause habit"],
        applicableCodes: ["F90"],
      },
      {
        id: "f90-2-02",
        name: "Impulse Incident Log",
        description: "Brief self-monitoring log: what happened, trigger, consequence, could I have paused?",
        type: "tracker",
        mvpScope: ["Entry: what happened, trigger, consequence, could I have paused?", "Weekly count with trend", "Clinician uses patterns to target specific domains"],
        applicableCodes: ["F90"],
      },
    ],
  },
  {
    name: "ADHD: Organization",
    codePrefix: "F90",
    color: "text-amber-700",
    bg: "bg-amber-50",
    goalGroup: "Develop organizational systems — 80%+ consistency",
    interventions: [
      {
        id: "f90-3-01",
        name: "Brain Dump to Action Plan",
        description: "Step 1: brain dump everything. Step 2: categorize (urgent, important, can wait, delegate, discard). Step 3: top 3 for today.",
        type: "worksheet",
        mvpScope: ["Unstructured brain dump field", "Categorize: urgent, important, can wait, delegate, discard", "Top 3 priorities for today", "Repeatable daily or as-needed"],
        applicableCodes: ["F90"],
      },
      {
        id: "f90-3-02",
        name: "Routine Consistency Tracker",
        description: "Customizable morning and evening routine checklists with consistency % and streak indicator.",
        type: "tracker",
        mvpScope: ["Morning and evening routine checklists (user-customizable)", "Daily check-off with consistency % over time", "Visual streak indicator", "Start small: 3–5 items, expand over weeks"],
        applicableCodes: ["F90"],
      },
      {
        id: "f90-3-03",
        name: "Organizational System Setup Guide",
        description: "Step-by-step guide to setting up a simple organizational system with ADHD-friendly recommendations.",
        type: "checklist",
        mvpScope: ["Covers: single capture point, calendar blocking, task list, weekly review", "ADHD-friendly: external cues, visible reminders, low-friction tools", "One-time setup exercise"],
        applicableCodes: ["F90"],
      },
    ],
  },
  {
    name: "ADHD: Task Completion",
    codePrefix: "F90",
    color: "text-amber-700",
    bg: "bg-amber-50",
    goalGroup: "Improve task completion — 90%+ on time",
    interventions: [
      {
        id: "f90-4-01",
        name: "Task Breakdown Tool",
        description: "Chunk large tasks into sub-steps with estimated time, deadline, and first action. Addresses task initiation paralysis.",
        type: "exercise",
        mvpScope: ["Input large task/project", "Guided chunking into sub-steps", "Per sub-step: estimated time, deadline, first action", "Addresses task initiation paralysis"],
        applicableCodes: ["F90"],
      },
      {
        id: "f90-4-02",
        name: "Deadline & Completion Log",
        description: "Track tasks, deadlines, completion dates, and on-time percentage toward 90% goal.",
        type: "tracker",
        mvpScope: ["Log: task, deadline, completion date, on-time (yes/no)", "Running on-time percentage", "Weekly reflection: what helped/hindered"],
        applicableCodes: ["F90"],
      },
      {
        id: "f90-4-03",
        name: "Accommodations Needs Assessment",
        description: "Self-assessment of work/school environment with talking points for requesting accommodations.",
        type: "worksheet",
        mvpScope: ["Guided self-assessment of environment", "Identify areas where accommodations help", "Generates talking points for requesting", "Reference list of common ADHD accommodations"],
        applicableCodes: ["F90"],
      },
    ],
  },

  // ════════════════════════════════════════════════════
  // R45 — Symptoms Involving Emotional State
  // ════════════════════════════════════════════════════
  {
    name: "Emotional State: Assessment",
    codePrefix: "R45",
    color: "text-purple-700",
    bg: "bg-purple-50",
    goalGroup: "Clarify diagnostic picture within 2–4 sessions",
    interventions: [
      {
        id: "r45-1-01",
        name: "Personal History & Symptom Timeline",
        description: "Guided autobiography focusing on mental health milestones, symptom onset, and previous treatment.",
        type: "worksheet",
        mvpScope: ["Timeline: significant life events, symptom onset/changes, previous treatment", "Completed before or between early sessions", "Clinician-reviewed"],
        applicableCodes: ["R45"],
      },
      {
        id: "r45-1-02",
        name: "Daily Mood & Symptom Snapshot",
        description: "Brief daily log across mood, anxiety, energy, sleep quality, appetite, and notable symptoms for differential diagnosis.",
        type: "tracker",
        mvpScope: ["Daily: mood (1–10), anxiety (1–10), energy (1–10), sleep quality, appetite, symptoms", "Free-text context field", "2–4 weeks of data supports differential diagnosis"],
        applicableCodes: ["R45"],
      },
    ],
  },
  {
    name: "Emotional State: Distress Reduction",
    codePrefix: "R45",
    color: "text-purple-700",
    bg: "bg-purple-50",
    goalGroup: "Reduce emotional distress by ≥3 points on 0–10 scale",
    interventions: [
      {
        id: "r45-2-01",
        name: "Distress Tolerance Toolkit",
        description: "DBT-informed collection: TIPP, ACCEPTS, self-soothe with senses. User tries each and builds personal toolkit.",
        type: "exercise",
        mvpScope: ["Brief distress tolerance skills: TIPP, ACCEPTS, self-soothe", "User tries each, rates helpfulness", "Builds personalized go-to toolkit"],
        applicableCodes: ["R45"],
      },
      {
        id: "r45-2-02",
        name: "Self-Compassion Break",
        description: "3-step exercise (Kristin Neff model): acknowledge suffering → common humanity → self-kindness.",
        type: "exercise",
        mvpScope: ["Step 1: Acknowledge suffering", "Step 2: Common humanity", "Step 3: Self-kindness statement", "Brief, repeatable for moments of emotional pain"],
        applicableCodes: ["R45", "F32", "F33"],
      },
    ],
  },
  {
    name: "Emotional State: Regulation & Triggers",
    codePrefix: "R45",
    color: "text-purple-700",
    bg: "bg-purple-50",
    goalGroup: "Develop 4+ regulation strategies and identify triggers",
    interventions: [
      {
        id: "r45-3-01",
        name: "Emotions 101",
        description: "Micro-module on what emotions are, their function, primary vs. secondary emotions. Includes emotion wheel exploration.",
        type: "psychoed",
        mvpScope: ["Content: what emotions are, function, primary vs. secondary", "Interactive emotion wheel exploration", "User identifies most frequent emotional states", "Normalizes full emotional spectrum"],
        applicableCodes: ["R45"],
      },
      {
        id: "r45-3-02",
        name: "Name It to Tame It",
        description: "Affect labeling exercise: describe experience → select granular emotion → rate intensity. Based on research showing naming reduces amygdala activation.",
        type: "exercise",
        mvpScope: ["Describe current experience", "Select from granular emotion vocabulary", "Rate intensity", "Repeatable daily micro-exercise"],
        applicableCodes: ["R45"],
      },
      {
        id: "r45-3-03",
        name: "Emotion-Action Urge Surfing",
        description: "DBT-informed: identify emotion, note action urge, identify opposite action. Check the facts and choose effective behavior.",
        type: "worksheet",
        mvpScope: ["Identify emotion and action urge", "Identify opposite action", "Guided check-the-facts prompts", "Saves entries for clinician pattern review"],
        applicableCodes: ["R45"],
      },
      {
        id: "r45-4-01",
        name: "Mood-Behavior Diary",
        description: "3x daily check-in tracking situation, emotion, intensity, behavior, outcome. After 2 weeks, guided review to identify themes.",
        type: "tracker",
        mvpScope: ["3x daily: situation, emotion, intensity, behavior, outcome", "After 2 weeks: guided theme review", "Output: top triggers, emotional patterns, behavioral responses"],
        applicableCodes: ["R45"],
      },
      {
        id: "r45-4-02",
        name: "Trigger Map",
        description: "Visual functional analysis: Trigger → Thought → Emotion → Body Sensation → Behavior → Consequence. Identify intervention points.",
        type: "worksheet",
        mvpScope: ["Map chain: Trigger → Thought → Emotion → Body → Behavior → Consequence", "Identify intervention points in the chain", "Foundation for targeted skill-building"],
        applicableCodes: ["R45"],
      },
    ],
  },

  // ════════════════════════════════════════════════════
  // Cross-Diagnostic
  // ════════════════════════════════════════════════════
  {
    name: "Cross-Diagnostic: Universal Tools",
    codePrefix: "CROSS",
    color: "text-gray-700",
    bg: "bg-gray-50",
    goalGroup: "Reusable exercises applicable across all treatment plans",
    interventions: [
      {
        id: "cross-01",
        name: "Medication Adherence Tracker",
        description: "Daily yes/no check-in per medication with side effects notes and streak tracking.",
        type: "tracker",
        mvpScope: ["Daily yes/no per medication", "Notes field for side effects", "Streak tracking"],
        applicableCodes: ["F32", "F33", "F41", "F43", "F90", "R45"],
      },
      {
        id: "cross-02",
        name: "Session Prep Sheet",
        description: "Pre-session template: what happened this week, what I want to discuss, homework review, questions for clinician.",
        type: "worksheet",
        mvpScope: ["Sections: this week, discussion topics, homework review, questions", "Maximizes session efficiency", "Completable before each session"],
        applicableCodes: ["F32", "F33", "F41", "F43", "F90", "R45"],
      },
      {
        id: "cross-03",
        name: "Between-Session Check-In",
        description: "Mid-week brief prompt with mood rating, homework progress, and urgent-flag option.",
        type: "worksheet",
        mvpScope: ["Mood rating, homework progress, anything urgent", "Optional clinician notification for flagged responses"],
        applicableCodes: ["F32", "F33", "F41", "F43", "F90", "R45"],
      },
    ],
  },
];

type AssignedExerciseItem = {
  id: string;
  topicId: string;          // maps to InterventionItem.id (also the exerciseId in registry)
  topicName: string;        // maps to InterventionItem.name
  categoryName: string;     // maps to InterventionCategory.name
  interventionType?: InterventionType; // "checklist" | "tracker" | "exercise" | "worksheet" | "psychoed" — optional for backwards compat
  frequency: string;
  assignedDate: string;
  deadline: string;
  status: "active" | "completed" | "deactivated";
  completedDate: string | null;
  lastActivity: string | null;
  responseCount?: number;   // number of completed responses
  latestScore?: number;     // for trackers: latest score (e.g., PHQ-9 total)
  scoreTrend?: "up" | "down" | "stable"; // score trend direction
};

const FREQUENCY_OPTIONS = [
  "One Time",
  "Daily",
  "2x / week",
  "3x / week",
  "4x / week",
  "5x / week",
  "Weekly",
  "Biweekly",
  "Monthly",
];

function InterventionLibraryModal({
  onAssign,
  assignedTopicIds,
  diagnoses,
  onClose,
}: {
  onAssign: (intervention: InterventionItem, categoryName: string, frequency: string) => void;
  assignedTopicIds: Set<string>;
  diagnoses: ICD10Diagnosis[];
  onClose: () => void;
}) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [assigningIntervention, setAssigningIntervention] = useState<{ intervention: InterventionItem; categoryName: string } | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState("3x / week");
  const [diagnosisFilter, setDiagnosisFilter] = useState<string | null>(null);
  const [symptomFilter, setSymptomFilter] = useState<string | null>(null);

  // Symptom categories for browsing
  const SYMPTOM_FILTERS = [
    { id: "depression", label: "Depression", codes: ["F32", "F33"] },
    { id: "anxiety", label: "Anxiety", codes: ["F41", "F40"] },
    { id: "sleep", label: "Sleep Issues", codes: ["F51"] },
    { id: "stress", label: "Stress/Coping", codes: ["F43"] },
    { id: "social", label: "Social Skills", codes: ["CROSS"] },
  ];

  // Extract unique code prefixes from patient's diagnoses (e.g., F32.1 -> F32)
  const diagnosisPrefixes = Array.from(
    new Set(diagnoses.map((d) => d.code.split(".")[0]?.toUpperCase() ?? ""))
  ).filter(Boolean).sort();

  // Get symptom codes for filtering
  const activeSymptomCodes = symptomFilter 
    ? SYMPTOM_FILTERS.find(s => s.id === symptomFilter)?.codes ?? []
    : [];

  const filteredCategories = INTERVENTION_CATEGORIES.map((cat) => ({
    ...cat,
    interventions: cat.interventions.filter((item) => {
      if (assignedTopicIds.has(item.id)) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        cat.name.toLowerCase().includes(q) ||
        cat.codePrefix.toLowerCase().includes(q) ||
        cat.goalGroup.toLowerCase().includes(q)
      );
    }),
  }))
    .filter((cat) => cat.interventions.length > 0)
    .filter((cat) => {
      // Apply diagnosis filter if active
      if (diagnosisFilter) {
        return cat.codePrefix === diagnosisFilter || cat.codePrefix === "CROSS";
      }
      // Apply symptom filter if active
      if (symptomFilter && activeSymptomCodes.length > 0) {
        return activeSymptomCodes.includes(cat.codePrefix) || cat.codePrefix === "CROSS";
      }
      return true;
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="relative mx-4 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">Intervention Library</h2>
            <p className="text-sm text-gray-500">Select exercises to assign to the treatment plan</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b px-6 py-3 space-y-3">
          {/* Browse by Symptom */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-500">Browse by symptom:</span>
            <button
              type="button"
              onClick={() => { setSymptomFilter(null); setDiagnosisFilter(null); }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                !symptomFilter && !diagnosisFilter
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              All
            </button>
            {SYMPTOM_FILTERS.map((symptom) => (
              <button
                key={symptom.id}
                type="button"
                onClick={() => { setSymptomFilter(symptom.id); setDiagnosisFilter(null); }}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  symptomFilter === symptom.id
                    ? "bg-violet-600 text-white"
                    : "bg-violet-50 text-violet-700 hover:bg-violet-100"
                )}
              >
                {symptom.label}
              </button>
            ))}
          </div>

          {/* Diagnosis Filter Pills (if patient has diagnoses) */}
          {diagnosisPrefixes.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-gray-500">Patient diagnoses:</span>
              {diagnosisPrefixes.map((prefix) => (
                <button
                  key={prefix}
                  type="button"
                  onClick={() => { setDiagnosisFilter(prefix); setSymptomFilter(null); }}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium font-mono transition-colors",
                    diagnosisFilter === prefix
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  )}
                >
                  {prefix}
                </button>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
            <ClipboardList className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code (F32, F41), or goal..."
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredCategories.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No matching exercises found.</p>
          ) : (
            <div className="space-y-2">
              {filteredCategories.map((cat) => (
                <div key={cat.name} className="rounded-lg border">
                  <button
                    type="button"
                    onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}
                    className={cn("flex w-full items-center justify-between rounded-t-lg px-4 py-3 text-left transition-colors", cat.bg)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-semibold", cat.color)}>{cat.name}</span>
                        {cat.codePrefix && (
                          <span className="rounded bg-white/60 px-1.5 py-0.5 text-[10px] font-mono font-bold text-gray-600">{cat.codePrefix}</span>
                        )}
                        <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-gray-500">{cat.interventions.length}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-gray-600 truncate">{cat.goalGroup}</p>
                    </div>
                    {expandedCategory === cat.name ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
                  </button>
                  {expandedCategory === cat.name && (
                    <div className="space-y-1 p-2">
                      {cat.interventions.map((item) => (
                        <div key={item.id} className="rounded-lg p-3 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 pr-3">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", INTERVENTION_TYPE_LABELS[item.type].bg, INTERVENTION_TYPE_LABELS[item.type].color)}>
                                  {INTERVENTION_TYPE_LABELS[item.type].label}
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{item.description}</p>
                            </div>
                            <Button size="sm" variant="outline" className="shrink-0 gap-1 text-xs" onClick={() => { setAssigningIntervention({ intervention: item, categoryName: cat.name }); setSelectedFrequency("3x / week"); }}>
                              <Plus className="h-3 w-3" />
                              Assign
                            </Button>
                          </div>
                          {assigningIntervention?.intervention.id === item.id && (
                            <div className="mt-2 ml-0 rounded-lg border border-blue-200 bg-blue-50/50 p-3">
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
                                    onAssign(item, cat.name, selectedFrequency);
                                    setAssigningIntervention(null);
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                  Confirm Assignment
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs text-gray-500"
                                  onClick={() => setAssigningIntervention(null)}
                                >
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

// ─── Generate Treatment Plan Dialog ──────────────────────────────────

type GenerateStep = "select-diagnosis" | "select-goals" | "creating";

type TemplateGoal = {
  id: string;
  description: string;
  measurableObjective: string;
  targetTimeframe: string;
  targetDate: string;
};

type TemplateData = {
  id: string;
  templateName: string;
  frequency: string;
  estimatedDuration: string;
  planData: {
    goals: TemplateGoal[];
    suggestedInterventions: string[];
    clinicianNotes: string;
  };
};

function GeneratePlanDialog({
  diagnoses,
  studentId,
  clinicianId,
  onClose,
  onPlanGenerated,
}: {
  diagnoses: ICD10Diagnosis[];
  studentId: string;
  clinicianId: string;
  onClose: () => void;
  onPlanGenerated: (plan: TreatmentPlan) => void;
}) {
  const [step, setStep] = useState<GenerateStep>("select-diagnosis");
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<ICD10Diagnosis | null>(
    diagnoses.length === 1 ? diagnoses[0] ?? null : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const availablePrefixes = getAvailableCodePrefixes();

  // Template data from API
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);

  // Goal selection state - all goals selected by default
  const [selectedGoalIds, setSelectedGoalIds] = useState<Set<string>>(new Set());
  const [customGoals, setCustomGoals] = useState<TemplateGoal[]>([]);
  const [newGoalText, setNewGoalText] = useState("");

  const hasTemplate = (code: string) => {
    return availablePrefixes.some((prefix) => code.toUpperCase().startsWith(prefix.toUpperCase()));
  };

  // Step 1: Fetch template goals
  const handleFetchTemplate = async () => {
    if (!selectedDiagnosis) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/treatment-plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          diagnosisCode: selectedDiagnosis.code,
          diagnosisLabel: selectedDiagnosis.description,
          clinicianId,
        }),
      });

      const data = await response.json();

      if (response.status === 404) {
        setError(`No template available for ${selectedDiagnosis.code}. Please create a plan manually.`);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError(data.error || "Failed to fetch template");
        setLoading(false);
        return;
      }

      // Store template data and pre-select all goals
      setTemplateData(data.plan);
      const allGoalIds = new Set<string>(data.plan.planData.goals.map((g: TemplateGoal) => g.id));
      setSelectedGoalIds(allGoalIds);
      setStep("select-goals");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle goal selection
  const toggleGoal = (goalId: string) => {
    setSelectedGoalIds((prev) => {
      const next = new Set(prev);
      if (next.has(goalId)) {
        next.delete(goalId);
      } else {
        next.add(goalId);
      }
      return next;
    });
  };

  // Add custom goal
  const handleAddCustomGoal = () => {
    if (!newGoalText.trim()) return;
    const customGoal: TemplateGoal = {
      id: `custom-${Date.now()}`,
      description: newGoalText.trim(),
      measurableObjective: "",
      targetTimeframe: "8-12 weeks",
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!,
    };
    setCustomGoals((prev) => [...prev, customGoal]);
    setSelectedGoalIds((prev) => new Set([...prev, customGoal.id]));
    setNewGoalText("");
  };

  // Remove custom goal
  const removeCustomGoal = (goalId: string) => {
    setCustomGoals((prev) => prev.filter((g) => g.id !== goalId));
    setSelectedGoalIds((prev) => {
      const next = new Set(prev);
      next.delete(goalId);
      return next;
    });
  };

  // Step 2: Confirm and create plan with selected goals
  const handleConfirmPlan = () => {
    if (!templateData || !selectedDiagnosis) return;

    setStep("creating");

    // Combine template goals and custom goals, filter by selection
    const allGoals = [...templateData.planData.goals, ...customGoals];
    const selectedGoals = allGoals.filter((g) => selectedGoalIds.has(g.id));

    const generatedPlan: TreatmentPlan = {
      id: templateData.id,
      title: templateData.templateName,
      goals: selectedGoals.map((g) => g.description),
      startDate: new Date().toISOString().split("T")[0]!,
      reviewDate: selectedGoals[0]?.targetDate ?? "",
      notes: templateData.planData.clinicianNotes ?? "",
      activities: [],
      diagnosisCode: selectedDiagnosis.code,
      diagnosisLabel: selectedDiagnosis.description,
      richGoals: selectedGoals.map((g) => ({
        id: g.id,
        description: g.description,
        measurableObjective: g.measurableObjective,
        targetTimeframe: g.targetTimeframe,
        targetDate: g.targetDate,
      })),
      interventions: templateData.planData.suggestedInterventions ?? [],
      frequency: templateData.frequency ?? "",
      estimatedDuration: templateData.estimatedDuration ?? "",
      status: "active",
    };

    onPlanGenerated(generatedPlan);
    onClose();
  };

  // All available goals for the selection UI
  const allAvailableGoals = templateData ? [...templateData.planData.goals, ...customGoals] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="mb-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {step === "select-diagnosis" && "Generate Treatment Plan"}
              {step === "select-goals" && "Select Treatment Goals"}
              {step === "creating" && "Creating Plan..."}
            </h2>
          </div>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Step 1: Select Diagnosis */}
          {step === "select-diagnosis" && (
            <>
              {diagnoses.length === 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">No diagnoses selected</p>
                      <p className="mt-1 text-xs text-amber-700">
                        Please add a diagnosis in the Mental Health Diagnosis section above before generating a treatment plan.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-sm text-gray-600">
                    Select a diagnosis to generate suggested treatment goals.
                  </p>

                  <div className="space-y-2 mb-4">
                    {diagnoses.map((d) => {
                      const templateAvailable = hasTemplate(d.code);
                      return (
                        <button
                          key={d.code}
                          type="button"
                          onClick={() => setSelectedDiagnosis(d)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                            selectedDiagnosis?.code === d.code
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          <div className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full border-2",
                            selectedDiagnosis?.code === d.code
                              ? "border-blue-600 bg-blue-600"
                              : "border-gray-300"
                          )}>
                            {selectedDiagnosis?.code === d.code && (
                              <div className="h-2 w-2 rounded-full bg-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-gray-900">{d.code}</span>
                              {templateAvailable ? (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                                  Template Available
                                </span>
                              ) : (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                                  Manual Only
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-gray-600 truncate">{d.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Step 2: Select Goals */}
          {step === "select-goals" && templateData && (
            <>
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">
                  {selectedDiagnosis?.code}
                </span>
                <span className="text-sm text-gray-600">{templateData.templateName}</span>
              </div>

              <p className="mb-3 text-sm text-gray-600">
                AI has suggested the following goals. <span className="font-medium">Select or deselect</span> to customize, or add your own.
              </p>

              <div className="space-y-2 mb-4">
                {allAvailableGoals.map((goal) => {
                  const isSelected = selectedGoalIds.has(goal.id);
                  const isCustom = goal.id.startsWith("custom-");
                  return (
                    <div
                      key={goal.id}
                      className={cn(
                        "rounded-lg border p-3 transition-colors",
                        isSelected ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleGoal(goal.id)}
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                            isSelected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-300 bg-white"
                          )}
                        >
                          {isSelected && (
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm", isSelected ? "text-gray-900" : "text-gray-500")}>
                            {goal.description}
                          </p>
                          {goal.measurableObjective && (
                            <p className="mt-1 text-xs text-gray-500">
                              <span className="font-medium">Objective:</span> {goal.measurableObjective}
                            </p>
                          )}
                          <div className="mt-1 flex gap-2">
                            <span className="text-[10px] text-gray-400">{goal.targetTimeframe}</span>
                            {isCustom && (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                                Custom
                              </span>
                            )}
                          </div>
                        </div>
                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => removeCustomGoal(goal.id)}
                            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add custom goal */}
              <div className="rounded-lg border border-dashed border-gray-300 p-3">
                <p className="mb-2 text-xs font-medium text-gray-600">Add Custom Goal</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGoalText}
                    onChange={(e) => setNewGoalText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCustomGoal()}
                    placeholder="Enter a custom treatment goal..."
                    className="flex-1 rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <Button size="sm" onClick={handleAddCustomGoal} disabled={!newGoalText.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-400">
                {selectedGoalIds.size} goal{selectedGoalIds.size !== 1 ? "s" : ""} selected
              </p>
            </>
          )}

          {/* Step 3: Creating */}
          {step === "creating" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="mt-3 text-sm text-gray-600">Creating your treatment plan...</p>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="mt-6 flex justify-end gap-3 shrink-0 border-t pt-4">
          {step === "select-diagnosis" && (
            <>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              {diagnoses.length > 0 && (
                <Button
                  onClick={handleFetchTemplate}
                  disabled={!selectedDiagnosis || loading}
                  className="gap-1.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Get Suggested Goals
                    </>
                  )}
                </Button>
              )}
            </>
          )}

          {step === "select-goals" && (
            <>
              <Button variant="outline" onClick={() => setStep("select-diagnosis")}>
                Back
              </Button>
              <Button
                onClick={handleConfirmPlan}
                disabled={selectedGoalIds.size === 0}
                className="gap-1.5"
              >
                <Target className="h-4 w-4" />
                Create Plan ({selectedGoalIds.size} goals)
              </Button>
            </>
          )}
        </div>

        {step === "select-diagnosis" && diagnoses.length > 0 && (
          <p className="mt-4 text-center text-xs text-gray-400">
            Or{" "}
            <button
              type="button"
              onClick={onClose}
              className="text-blue-600 hover:underline"
            >
              create a plan manually
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Diagnosis Multi-Select Dropdown ─────────────────────────────────

function DiagnosisSelector({
  selectedDiagnoses,
  onAdd,
  onRemove,
}: {
  selectedDiagnoses: ICD10Diagnosis[];
  onAdd: (d: ICD10Diagnosis) => void;
  onRemove: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCodes = new Set(selectedDiagnoses.map((d) => d.code));
  const filtered = ICD10_MENTAL_HEALTH_CODES.filter((d) => {
    if (selectedCodes.has(d.code)) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return d.code.toLowerCase().includes(q) || d.description.toLowerCase().includes(q);
  });

  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Mental Health Diagnosis
        </h3>
        <div className="relative" ref={dropdownRef}>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setOpen(!open)}>
            <Plus className="h-3 w-3" />
            Add Diagnosis
          </Button>
          {open && (
            <div className="absolute right-0 top-full z-50 mt-1 w-96 rounded-xl border bg-white shadow-xl">
              <div className="border-b px-3 py-2.5">
                <div className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5">
                  <Search className="h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by ICD-10 code or description..."
                    className="flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs text-gray-400">No matching diagnoses found</p>
                ) : (
                  filtered.slice(0, 50).map((d) => (
                    <button
                      key={d.code}
                      type="button"
                      onClick={() => { onAdd(d); setSearch(""); }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-blue-50"
                    >
                      <span className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-blue-700">{d.code}</span>
                      <span className="min-w-0 truncate text-xs text-gray-700">{d.description}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedDiagnoses.length === 0 ? (
        <div className="flex items-center gap-3 rounded-lg border border-dashed p-4">
          <Stethoscope className="h-5 w-5 text-gray-300" />
          <p className="text-sm text-gray-400">No diagnoses added yet. Click &quot;Add Diagnosis&quot; to begin.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {selectedDiagnoses.map((d) => (
            <div key={d.code} className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 py-1.5 pl-3 pr-1.5">
              <span className="font-mono text-sm font-bold text-blue-700">{d.code}</span>
              <span className="text-xs text-blue-600">{d.description}</span>
              <button type="button" onClick={() => onRemove(d.code)} className="ml-1 rounded p-0.5 text-blue-400 hover:bg-blue-100 hover:text-blue-700">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Single Treatment Plan Card (collapsible) ────────────────────────

type PlanWithExercises = {
  plan: TreatmentPlan;
  exercises: AssignedExerciseItem[];
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  completed: "bg-blue-50 text-blue-700",
  deactivated: "bg-gray-100 text-gray-400",
};

function TreatmentPlanCard({
  planData,
  patientId: _patientId,
  onEditPlan,
  onDeletePlan,
  onUpdateExercises,
  allAssignedTopicIds,
  diagnoses,
  onSelectExercise,
}: {
  planData: PlanWithExercises;
  patientId: string;
  onEditPlan: (plan: TreatmentPlan) => void;
  onDeletePlan: (planId: string) => void;
  onUpdateExercises: (planId: string, exercises: AssignedExerciseItem[]) => void;
  allAssignedTopicIds: Set<string>;
  diagnoses: ICD10Diagnosis[];
  onSelectExercise?: (exercise: AssignedExerciseItem, mode: "preview" | "launch") => void;
}) {
  const { plan, exercises } = planData;
  const [expanded, setExpanded] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"notes" | "exercises">("exercises");

  // Local editable state
  const [editTitle, setEditTitle] = useState(plan.title);
  const [editNotes, setEditNotes] = useState(plan.notes);
  const [editFrequency, setEditFrequency] = useState(plan.frequency ?? "");
  const [editDuration, setEditDuration] = useState(plan.estimatedDuration ?? "");
  const [editGoals, setEditGoals] = useState(plan.richGoals ?? []);
  const [editInterventions, setEditInterventions] = useState(plan.interventions ?? []);

  const activeCount = exercises.filter((e) => e.status === "active").length;
  const completedCount = exercises.filter((e) => e.status === "completed").length;
  const nonDeactivated = exercises.filter((e) => e.status !== "deactivated");
  const done = nonDeactivated.filter((e) => e.status === "completed").length;
  const pct = nonDeactivated.length > 0 ? Math.round((done / nonDeactivated.length) * 100) : 0;

  const hasRichData = plan.richGoals && plan.richGoals.length > 0;

  function handleAssignIntervention(intervention: InterventionItem, categoryName: string, frequency: string) {
    const today = new Date().toISOString().split("T")[0]!;
    const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!;
    onUpdateExercises(plan.id, [
      ...exercises,
      { id: `ae-${Date.now()}`, topicId: intervention.id, topicName: intervention.name, categoryName, interventionType: intervention.type, frequency, assignedDate: today, deadline, status: "active", completedDate: null, lastActivity: null },
    ]);
  }

  function handleToggleStatus(id: string) {
    onUpdateExercises(plan.id, exercises.map((e) => e.id === id ? { ...e, status: e.status === "deactivated" ? "active" : "deactivated" } : e));
  }

  function handleRemoveExercise(id: string) {
    onUpdateExercises(plan.id, exercises.filter((e) => e.id !== id));
  }

  function handleSaveEdits() {
    onEditPlan({
      ...plan,
      title: editTitle,
      notes: editNotes,
      frequency: editFrequency,
      estimatedDuration: editDuration,
      richGoals: editGoals,
      goals: editGoals.map((g) => g.description),
      interventions: editInterventions,
    });
    setIsEditing(false);
  }

  function handleCancelEdits() {
    setEditTitle(plan.title);
    setEditNotes(plan.notes);
    setEditFrequency(plan.frequency ?? "");
    setEditDuration(plan.estimatedDuration ?? "");
    setEditGoals(plan.richGoals ?? []);
    setEditInterventions(plan.interventions ?? []);
    setIsEditing(false);
  }

  function updateGoal(index: number, field: keyof typeof editGoals[0], value: string) {
    setEditGoals((prev) => prev.map((g, i) => i === index ? { ...g, [field]: value } : g));
  }

  function removeGoal(index: number) {
    setEditGoals((prev) => prev.filter((_, i) => i !== index));
  }

  function addGoal() {
    setEditGoals((prev) => [...prev, { id: `goal-${Date.now()}`, description: "", measurableObjective: "", targetTimeframe: "", targetDate: "" }]);
  }

  function removeIntervention(index: number) {
    setEditInterventions((prev) => prev.filter((_, i) => i !== index));
  }

  function addIntervention() {
    setEditInterventions((prev) => [...prev, ""]);
  }

  function updateIntervention(index: number, value: string) {
    setEditInterventions((prev) => prev.map((v, i) => i === index ? value : v));
  }

  function handleStatusChange(newStatus: "active" | "completed" | "discontinued") {
    onEditPlan({ ...plan, status: newStatus });
  }

  function handleAddNote() {
    if (!newNote.trim()) return;
    const timestamp = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const updatedNotes = plan.notes
      ? `${plan.notes}\n\n[${timestamp}] ${newNote.trim()}`
      : `[${timestamp}] ${newNote.trim()}`;
    onEditPlan({ ...plan, notes: updatedNotes });
    setNewNote("");
    setShowAddNote(false);
  }

  return (
    <>
      <div className="rounded-xl border bg-white overflow-hidden">
        {/* Collapsible header */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50/50"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900 truncate">{plan.title}</p>
                {plan.diagnosisCode && (
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                    {plan.diagnosisCode}
                  </span>
                )}
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                  (plan.status ?? "active") === "active" && "bg-emerald-100 text-emerald-700",
                  plan.status === "completed" && "bg-blue-100 text-blue-700",
                  plan.status === "discontinued" && "bg-gray-100 text-gray-500"
                )}>
                  {(plan.status ?? "active").charAt(0).toUpperCase() + (plan.status ?? "active").slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[10px] text-gray-400">Started {plan.startDate}</span>
                {plan.frequency && <span className="text-[10px] text-gray-400">{plan.frequency}</span>}
                {exercises.length > 0 && (
                  <span className="text-[10px] text-gray-400">{activeCount} active · {completedCount} done</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {exercises.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                  <div className={cn("h-full rounded-full", pct === 100 ? "bg-emerald-500" : "bg-blue-500")} style={{ width: `${pct}%` }} />
                </div>
                <span className={cn("text-[10px] font-bold", pct === 100 ? "text-emerald-600" : "text-blue-600")}>{pct}%</span>
              </div>
            )}
            {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </div>
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="border-t px-5 py-4 space-y-4">
            {/* Header row with edit/save buttons */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Diagnosis label */}
                {plan.diagnosisLabel && (
                  <p className="text-xs text-gray-500 mb-2">{plan.diagnosisLabel}</p>
                )}
                {/* Meta info */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Started: {plan.startDate}</span>
                  {plan.reviewDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Review: {plan.reviewDate}</span>}
                  {!isEditing && plan.frequency && <span className="flex items-center gap-1">Frequency: {plan.frequency}</span>}
                  {!isEditing && plan.estimatedDuration && <span className="flex items-center gap-1">Duration: {plan.estimatedDuration}</span>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0 ml-4">
                {isEditing ? (
                  <>
                    <Button size="sm" variant="outline" onClick={handleCancelEdits}>Cancel</Button>
                    <Button size="sm" className="gap-1.5" onClick={handleSaveEdits}>
                      <Save className="h-3.5 w-3.5" />
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setIsEditing(true)}>
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowAddNote(true)}>
                      <Plus className="h-3.5 w-3.5" />
                      Add Note
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setShowDeleteConfirm(true)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Status change buttons */}
            {!isEditing && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Status:</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleStatusChange("active")}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors",
                      (plan.status ?? "active") === "active"
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                    )}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange("completed")}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors",
                      plan.status === "completed"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                    )}
                  >
                    Completed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange("discontinued")}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors",
                      plan.status === "discontinued"
                        ? "bg-gray-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    Discontinued
                  </button>
                </div>
              </div>
            )}

            {/* Quick Add Note */}
            {showAddNote && !isEditing && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="mb-2 text-xs font-semibold text-blue-700">Add Clinical Note</p>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={2}
                  placeholder="Add a progress note, observation, or update..."
                  className="w-full rounded border border-blue-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                    Save Note
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setShowAddNote(false); setNewNote(""); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Editable frequency/duration */}
            {isEditing && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Session Frequency</label>
                  <input
                    type="text"
                    value={editFrequency}
                    onChange={(e) => setEditFrequency(e.target.value)}
                    placeholder="e.g., Weekly sessions"
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Estimated Duration</label>
                  <input
                    type="text"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    placeholder="e.g., 12-16 weeks"
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Goals section - rich or simple */}
            {hasRichData && !isEditing ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Treatment Goals</p>
                {plan.richGoals?.map((goal) => (
                  <div key={goal.id} className="rounded-lg border bg-gray-50 p-3">
                    <div className="flex items-start gap-2">
                      <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{goal.description}</p>
                        <p className="mt-1 text-xs text-gray-600">
                          <span className="font-medium">Objective:</span> {goal.measurableObjective}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-3 text-[10px] text-gray-500">
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700">
                            Timeframe: {goal.targetTimeframe}
                          </span>
                          {goal.targetDate && (
                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700">
                              Target: {goal.targetDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Treatment Goals</p>
                  <button type="button" onClick={addGoal} className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
                    <Plus className="h-3 w-3" />Add Goal
                  </button>
                </div>
                {editGoals.map((goal, i) => (
                  <div key={goal.id} className="rounded-lg border bg-gray-50 p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={goal.description}
                          onChange={(e) => updateGoal(i, "description", e.target.value)}
                          placeholder="Goal description"
                          className="w-full rounded border px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={goal.measurableObjective}
                          onChange={(e) => updateGoal(i, "measurableObjective", e.target.value)}
                          placeholder="Measurable objective"
                          className="w-full rounded border px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={goal.targetTimeframe}
                            onChange={(e) => updateGoal(i, "targetTimeframe", e.target.value)}
                            placeholder="Timeframe (e.g., 8-12 weeks)"
                            className="rounded border px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                          />
                          <input
                            type="date"
                            value={goal.targetDate ?? ""}
                            onChange={(e) => updateGoal(i, "targetDate", e.target.value)}
                            className="rounded border px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <button type="button" onClick={() => removeGoal(i)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : plan.goals.length > 0 ? (
              <div className="mb-3">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Goals</p>
                <ul className="space-y-1">
                  {plan.goals.map((goal, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <Target className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Interventions section */}
            {!isEditing && plan.interventions && plan.interventions.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Suggested Interventions</p>
                <div className="flex flex-wrap gap-1.5">
                  {plan.interventions.map((intervention, i) => (
                    <span key={i} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-800">
                      {intervention}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {isEditing && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Interventions</p>
                  <button type="button" onClick={addIntervention} className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
                    <Plus className="h-3 w-3" />Add
                  </button>
                </div>
                <div className="space-y-2">
                  {editInterventions.map((intervention, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={intervention}
                        onChange={(e) => updateIntervention(i, e.target.value)}
                        placeholder="Intervention name"
                        className="flex-1 rounded border px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      />
                      <button type="button" onClick={() => removeIntervention(i)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Horizontal Tab Toggle */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("notes")}
                  className={cn(
                    "flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                    activeTab === "notes" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Clinical Notes
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("exercises")}
                  className={cn(
                    "flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                    activeTab === "exercises" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Exercises ({exercises.length})
                </button>
              </div>

              {/* Clinical Notes Tab */}
              {activeTab === "notes" && (
                <div className="space-y-3">
                  {!showAddNote && (
                    <div className="flex justify-end">
                      <button type="button" onClick={() => setShowAddNote(true)} className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
                        <Plus className="h-3 w-3" />
                        Add Note
                      </button>
                    </div>
                  )}
                  {showAddNote && (
                    <div className="rounded-lg border bg-blue-50 p-3 space-y-2">
                      <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={3} placeholder="Add a clinical note..." className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400" autoFocus />
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => { setShowAddNote(false); setNewNote(""); }} className="rounded px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
                        <button type="button" onClick={handleAddNote} className="rounded bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700">Save Note</button>
                      </div>
                    </div>
                  )}
                  {plan.notes ? (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {plan.notes.split(/\n\n(?=\[)/).reverse().map((note, i) => {
                        const match = note.match(/^\[([^\]]+)\]\s*([\s\S]*)/);
                        const date = match?.[1] ?? "";
                        const content = match?.[2] ?? note;
                        return (
                          <div key={i} className="rounded-lg border bg-gray-50 p-3">
                            {date && <p className="text-[10px] font-medium text-gray-400 mb-1">{date}</p>}
                            <p className="text-xs text-gray-700 whitespace-pre-wrap">{content}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No clinical notes yet</p>
                  )}
                </div>
              )}

              {/* Exercises Tab */}
              {activeTab === "exercises" && (
                <div className="space-y-3">
                  {exercises.length > 0 && (
                    <div className="rounded-lg border bg-gray-50 p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-semibold text-gray-600">Plan Completion</p>
                        <span className={cn("text-xs font-bold", pct === 100 ? "text-emerald-600" : "text-blue-600")}>{pct}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div className={cn("h-full rounded-full transition-all", pct === 100 ? "bg-emerald-500" : "bg-blue-500")} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-1 text-[10px] text-gray-400">{done} of {nonDeactivated.length} exercises completed</p>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setShowLibrary(true)}>
                      <Plus className="h-3 w-3" />
                      Assign Exercise
                    </Button>
                  </div>
                  {exercises.length === 0 ? (
                    <div className="rounded-lg border border-dashed py-5 text-center">
                      <ClipboardList className="mx-auto h-7 w-7 text-gray-300" />
                      <p className="mt-2 text-xs text-gray-500">No exercises assigned yet</p>
                      <Button size="sm" className="mt-2 gap-1.5 text-xs" onClick={() => setShowLibrary(true)}>
                        <Plus className="h-3 w-3" />
                        Browse Intervention Library
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-lg border">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            <th className="px-4 py-2.5">Exercise</th>
                            <th className="px-4 py-2.5">Type</th>
                            <th className="px-4 py-2.5">Progress</th>
                            <th className="px-4 py-2.5">Frequency</th>
                            <th className="px-4 py-2.5">Status</th>
                            <th className="px-4 py-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {exercises.map((ex) => (
                            <tr key={ex.id} className={cn("transition-colors hover:bg-gray-50", ex.status === "deactivated" ? "opacity-50" : "")}>
                              <td className="px-4 py-3">
                                <p className={cn("font-medium", ex.status === "deactivated" ? "text-gray-400 line-through" : "text-gray-900")}>{ex.topicName}</p>
                                <p className="text-xs text-gray-500">{ex.categoryName}</p>
                              </td>
                              <td className="px-4 py-3">
                                {ex.interventionType ? (
                                  <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", INTERVENTION_TYPE_LABELS[ex.interventionType].bg, INTERVENTION_TYPE_LABELS[ex.interventionType].color)}>
                                    {INTERVENTION_TYPE_LABELS[ex.interventionType].label}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-gray-600">{ex.responseCount ?? 0} responses</span>
                                  {ex.latestScore !== undefined && (
                                    <span className="flex items-center gap-0.5 text-xs font-medium text-gray-700">
                                      · {ex.latestScore}
                                      {ex.scoreTrend === "up" && <TrendingUp className="h-3 w-3 text-red-500" />}
                                      {ex.scoreTrend === "down" && <TrendingDown className="h-3 w-3 text-emerald-500" />}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{ex.frequency}</td>
                              <td className="px-4 py-3">
                                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", STATUS_COLORS[ex.status] ?? "bg-gray-100 text-gray-600")}>{ex.status}</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {ex.status !== "deactivated" && (
                                    <button
                                      type="button"
                                      onClick={() => onSelectExercise?.(ex, "launch")}
                                      className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700 transition-colors hover:bg-blue-100"
                                      title="Launch Exercise"
                                    >
                                      <Play className="h-3 w-3" />
                                      Launch
                                    </button>
                                  )}
                                  {(ex.responseCount ?? 0) > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => onSelectExercise?.(ex, "preview")}
                                      className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-600 transition-colors hover:bg-gray-200"
                                      title="View Responses"
                                    >
                                      <Eye className="h-3 w-3" />
                                      Review
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStatus(ex.id)}
                                    className={cn("rounded px-2 py-1 text-[10px] font-medium transition-colors", ex.status === "deactivated" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}
                                    title={ex.status === "deactivated" ? "Reactivate" : "Deactivate"}
                                  >
                                    {ex.status === "deactivated" ? "Activate" : "Deactivate"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveExercise(ex.id)}
                                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                    title="Remove"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showLibrary && (
        <InterventionLibraryModal
          onAssign={handleAssignIntervention}
          assignedTopicIds={allAssignedTopicIds}
          diagnoses={diagnoses}
          onClose={() => setShowLibrary(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Treatment Plan</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="mb-6 text-sm text-gray-600">
              Are you sure you want to delete <span className="font-semibold">{plan.title}</span>? All associated data will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  onDeletePlan(plan.id);
                  setShowDeleteConfirm(false);
                }}
              >
                Delete Plan
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Treatment Plans Tab ────────────────────────────────────────────

function TreatmentPlansTab({
  plans,
  planExercises,
  patientId,
  diagnoses,
  onEditPlan,
  onDeletePlan,
  onAddPlan,
  onUpdateExercises,
  onAddDiagnosis,
  onRemoveDiagnosis,
  onSelectExercise,
}: {
  plans: TreatmentPlan[];
  planExercises: Record<string, AssignedExerciseItem[]>;
  patientId: string;
  diagnoses: ICD10Diagnosis[];
  onEditPlan: (plan: TreatmentPlan) => void;
  onDeletePlan: (planId: string) => void;
  onAddPlan: () => void;
  onUpdateExercises: (planId: string, exercises: AssignedExerciseItem[]) => void;
  onAddDiagnosis: (d: ICD10Diagnosis) => void;
  onRemoveDiagnosis: (code: string) => void;
  onSelectExercise?: (exercise: AssignedExerciseItem, mode: "preview" | "launch") => void;
}) {
  const allAssignedTopicIds = new Set(
    Object.values(planExercises)
      .flat()
      .filter((e) => e.status !== "deactivated")
      .map((e) => e.topicId),
  );

  const [reasonForEnrollment, setReasonForEnrollment] = useState(() => {
    const stored = loadProviderData(patientId);
    return stored?.reasonForEnrollment ?? "";
  });
  const [editingReason, setEditingReason] = useState(false);
  const [reasonDraft, setReasonDraft] = useState(reasonForEnrollment);

  const handleSaveReason = () => {
    setReasonForEnrollment(reasonDraft);
    setEditingReason(false);
    // Persist to storage
    const stored = loadProviderData(patientId);
    saveProviderData(patientId, { ...stored, reasonForEnrollment: reasonDraft });
    saveProviderDataServer(patientId, { ...stored, reasonForEnrollment: reasonDraft }).catch(() => {});
  };

  return (
    <div className="space-y-6">
      {/* Reason for Enrollment Card */}
      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-violet-600" />
            <h4 className="text-sm font-semibold text-gray-900">Reason for Enrollment</h4>
          </div>
          {!editingReason && (
            <button
              type="button"
              onClick={() => { setReasonDraft(reasonForEnrollment); setEditingReason(true); }}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
            >
              <Edit3 className="h-3 w-3" />
              Edit
            </button>
          )}
        </div>
        <div className="px-4 py-3">
          {editingReason ? (
            <div className="space-y-3">
              <textarea
                value={reasonDraft}
                onChange={(e) => setReasonDraft(e.target.value)}
                placeholder="Enter the reason for RTM enrollment (e.g., presenting symptoms, referral source, treatment goals)..."
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingReason(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveReason}
                  className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                >
                  <Save className="h-3 w-3" />
                  Save
                </button>
              </div>
            </div>
          ) : reasonForEnrollment ? (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{reasonForEnrollment}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">No reason for enrollment documented. Click Edit to add.</p>
          )}
        </div>
      </div>

      {/* Diagnosis Multi-Select */}
      <DiagnosisSelector
        selectedDiagnoses={diagnoses}
        onAdd={onAddDiagnosis}
        onRemove={onRemoveDiagnosis}
      />

      {/* Treatment Plans header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Treatment Plans</h3>
          <p className="mt-0.5 text-xs text-gray-400">{plans.length} plan{plans.length !== 1 ? "s" : ""} created</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={onAddPlan}>
          <Plus className="h-3.5 w-3.5" />
          Add Treatment Plan
        </Button>
      </div>

      {/* Plan cards */}
      {plans.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white p-8 text-center">
          <Target className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">No treatment plans created yet</p>
          <p className="mt-1 text-xs text-gray-400">Click &quot;Add Treatment Plan&quot; above to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <TreatmentPlanCard
              key={plan.id}
              planData={{ plan, exercises: planExercises[plan.id] ?? [] }}
              patientId={patientId}
              onEditPlan={onEditPlan}
              onDeletePlan={onDeletePlan}
              onUpdateExercises={onUpdateExercises}
              allAssignedTopicIds={allAssignedTopicIds}
              diagnoses={diagnoses}
              onSelectExercise={onSelectExercise}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Treatment Plan Editor Modal ────────────────────────────────────

function TreatmentPlanEditor({
  plan,
  onClose,
  onSave,
}: {
  plan: TreatmentPlan | null;
  onClose: () => void;
  onSave: (plan: TreatmentPlan) => void;
}) {
  const [title, setTitle] = useState(plan?.title ?? "");
  const [goals, setGoals] = useState<string[]>(plan?.goals ?? [""]);
  const [notes, setNotes] = useState(plan?.notes ?? "");
  const [reviewDate, setReviewDate] = useState(plan?.reviewDate ?? "");

  const handleSave = () => {
    onSave({
      id: plan?.id ?? `tp-new-${Date.now()}`,
      title,
      goals: goals.filter((g) => g.trim()),
      startDate: plan?.startDate ?? new Date().toISOString().split("T")[0]!,
      reviewDate,
      notes,
      activities: plan?.activities ?? [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {plan ? "Edit Treatment Plan" : "Create Treatment Plan"}
          </h2>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Plan Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Anxiety Management Plan" className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Treatment Goals</label>
            {goals.map((goal, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input type="text" value={goal} onChange={(e) => { const ng = [...goals]; ng[i] = e.target.value; setGoals(ng); }} placeholder={`Goal ${i + 1}`} className="flex-1 rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                {goals.length > 1 && (
                  <button onClick={() => setGoals(goals.filter((_, idx) => idx !== i))} className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => setGoals([...goals, ""])} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
              <Plus className="h-3.5 w-3.5" />
              Add Goal
            </button>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Review Date</label>
            <input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Clinical Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Add clinical notes, observations, or plan adjustments..." className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="gap-1.5"><Save className="h-4 w-4" />Save Plan</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Helper: resolve initial diagnoses from patient.diagnosis string ─

function getInitialDiagnoses(diagnosis: string): ICD10Diagnosis[] {
  const match = ICD10_MENTAL_HEALTH_CODES.find((d) =>
    diagnosis.toLowerCase().includes(d.description.toLowerCase().slice(0, 20)) ||
    d.description.toLowerCase().includes(diagnosis.toLowerCase().slice(0, 20)),
  );
  if (match) return [match];
  // Default to "Under Assessment"
  return [{ code: "R45.89", description: "Other symptoms and signs involving emotional state" }];
}

// ─── Main Patient Detail Component ──────────────────────────────────

export default function PatientDetail({
  patient: initialPatient,
  showHeader = true,
}: {
  patient: RTMPatient;
  showHeader?: boolean;
}) {
  const [patient] = useState(initialPatient);
  const reportRef = useRef<HTMLDivElement>(null);

  // Load persisted data from localStorage (fall back to mock data)
  const stored = loadProviderData(initialPatient.id);

  // Diagnoses state (multi-select)
  const [diagnoses, setDiagnoses] = useState<ICD10Diagnosis[]>(() => {
    if (stored?.diagnoses && stored.diagnoses.length > 0) return stored.diagnoses;
    return getInitialDiagnoses(initialPatient.diagnosis);
  });

  // Default treatment plan if none exists
  const defaultPlan: TreatmentPlan = {
    id: "tp-default",
    title: "Initial Treatment Plan",
    goals: ["Complete initial assessment", "Establish baseline measures"],
    startDate: "2026-02-01",
    reviewDate: "2026-03-01",
    notes: "",
    activities: [],
  };

  // Multiple treatment plans
  const [plans, setPlans] = useState<TreatmentPlan[]>(() => {
    if (stored?.plans && stored.plans.length > 0) {
      return stored.plans.map((p) => ({ ...p, activities: [] }));
    }
    if (initialPatient.treatmentPlan) {
      return [initialPatient.treatmentPlan];
    }
    // Always return at least one default plan
    return [defaultPlan];
  });

  // Default exercises to show for any treatment plan
  const defaultExercises: AssignedExerciseItem[] = [
    { id: "ae-1", topicId: "f32-1-01", topicName: "Weekly PHQ-9 Self-Check", categoryName: "Depression: Symptom Reduction", interventionType: "tracker" as InterventionType, frequency: "Weekly", assignedDate: "2026-02-01", deadline: "2026-03-01", status: "active", completedDate: null, lastActivity: "2026-02-20" },
    { id: "ae-2", topicId: "f32-1-02", topicName: "Thought Record", categoryName: "Depression: Symptom Reduction", interventionType: "exercise" as InterventionType, frequency: "3x / week", assignedDate: "2026-02-01", deadline: "2026-03-01", status: "completed", completedDate: "2026-02-18", lastActivity: "2026-02-18" },
    { id: "ae-3", topicId: "f32-2-01", topicName: "Daily Activity Log", categoryName: "Depression: Daily Functioning", interventionType: "tracker" as InterventionType, frequency: "Daily", assignedDate: "2026-02-10", deadline: "2026-03-10", status: "active", completedDate: null, lastActivity: "2026-02-19" },
  ];

  // Exercises keyed by plan ID
  const [planExercises, setPlanExercises] = useState<Record<string, AssignedExerciseItem[]>>(() => {
    // Check if stored data has actual exercises (not just empty arrays)
    if (stored?.planExercises) {
      const hasExercises = Object.values(stored.planExercises).some(arr => arr && arr.length > 0);
      if (hasExercises) {
        return stored.planExercises;
      }
    }
    // Initialize with default exercises for each plan
    const result: Record<string, AssignedExerciseItem[]> = {};
    let plansToUse: { id: string }[] = [];
    
    if (stored?.plans && stored.plans.length > 0) {
      plansToUse = stored.plans;
    } else if (initialPatient.treatmentPlan) {
      plansToUse = [initialPatient.treatmentPlan];
    } else {
      plansToUse = [defaultPlan];
    }
    
    plansToUse.forEach((p) => {
      result[p.id] = defaultExercises.map((ex, i) => ({ ...ex, id: `${p.id}-ex-${i}` }));
    });
    return result;
  });

  // Persist to localStorage AND server whenever data changes
  useEffect(() => {
    const data: ProviderData = {
      diagnoses,
      plans: plans.map(({ id, title, goals, startDate, reviewDate, notes }) => ({ id, title, goals, startDate, reviewDate, notes })),
      planExercises,
      assessments: loadProviderData(patient.id)?.assessments ?? [],
    };
    saveProviderData(patient.id, data);
    // Also persist server-side so the student can see it
    saveProviderDataServer(patient.id, data).catch(() => {
      // Server save failed — localStorage is the fallback
    });
  }, [diagnoses, plans, planExercises, patient.id]);

  // Plan editor modal state
  const [editingPlan, setEditingPlan] = useState<TreatmentPlan | null>(null);
  const [showPlanEditor, setShowPlanEditor] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  // Exercise preview panel state
  const [selectedExercise, setSelectedExercise] = useState<{ exercise: AssignedExerciseItem; mode: "preview" | "launch" } | null>(null);

  const handleAddPlan = () => {
    // Show generate dialog first to let user choose between auto-generate or manual
    setShowGenerateDialog(true);
  };

  const handleOpenManualEditor = () => {
    setShowGenerateDialog(false);
    setEditingPlan(null);
    setShowPlanEditor(true);
  };

  const handleEditPlan = (plan: TreatmentPlan) => {
    setEditingPlan(plan);
    setShowPlanEditor(true);
  };

  const handleSavePlan = (plan: TreatmentPlan) => {
    setPlans((prev) => {
      const idx = prev.findIndex((p) => p.id === plan.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = plan;
        return updated;
      }
      return [...prev, plan];
    });
  };

  const handleDeletePlan = (planId: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    setPlanExercises((prev) => {
      const updated = { ...prev };
      delete updated[planId];
      return updated;
    });
  };

  const handleUpdateExercises = (planId: string, exercises: AssignedExerciseItem[]) => {
    setPlanExercises((prev) => ({ ...prev, [planId]: exercises }));
  };

  const handleAddDiagnosis = (d: ICD10Diagnosis) => {
    setDiagnoses((prev) => {
      if (prev.some((existing) => existing.code === d.code)) return prev;
      return [...prev, d];
    });
  };

  const handleRemoveDiagnosis = (code: string) => {
    setDiagnoses((prev) => prev.filter((d) => d.code !== code));
  };

  return (
    <div className="space-y-6" ref={reportRef}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/counselor/rtm" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{patient.name}</h1>
              <p className="text-sm text-gray-500">
                {diagnoses.length > 0 ? diagnoses.map((d) => d.code).join(", ") : patient.diagnosis}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Enrolled: {patient.enrolledDate}</span>
              <span>·</span>
              <span className={cn("rounded-full px-2 py-0.5 font-medium", patient.status === "active" ? "bg-emerald-50 text-emerald-700" : patient.status === "paused" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700")}>{patient.status}</span>
            </div>
            <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700" onClick={() => handlePrintReport(reportRef, patient.name)}>
              <Download className="h-3.5 w-3.5" />
              Generate Download Report
            </Button>
          </div>
        </div>
      )}

      {/* Treatment Plans Content */}
      <div className="flex gap-4">
        <div className={selectedExercise ? "flex-1" : "w-full"}>
          <TreatmentPlansTab
            plans={plans}
            planExercises={planExercises}
            patientId={patient.id}
            diagnoses={diagnoses}
            onEditPlan={handleEditPlan}
            onDeletePlan={handleDeletePlan}
            onAddPlan={handleAddPlan}
            onUpdateExercises={handleUpdateExercises}
            onAddDiagnosis={handleAddDiagnosis}
            onRemoveDiagnosis={handleRemoveDiagnosis}
            onSelectExercise={(exercise, mode) => setSelectedExercise({ exercise, mode })}
          />
        </div>

        {/* Exercise Preview Panel */}
        {selectedExercise && (
          <div className="w-[400px] shrink-0 rounded-xl border bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b px-4 py-3 bg-gray-50">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {selectedExercise.mode === "launch" ? "Launch Exercise" : "Exercise Responses"}
                </h3>
                <p className="text-xs text-gray-500">{selectedExercise.exercise.topicName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExercise(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              {selectedExercise.mode === "launch" ? (
                <ExerciseRouter
                  exerciseId={selectedExercise.exercise.topicId}
                  assignmentId={selectedExercise.exercise.id}
                  patientId={patient.id}
                  clinicianId="clinician-1"
                  onComplete={(response) => {
                    console.log("Exercise completed:", response);
                    setSelectedExercise(null);
                  }}
                />
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-sm font-medium text-gray-900">{selectedExercise.exercise.topicName}</p>
                    <p className="text-xs text-gray-500">{selectedExercise.exercise.categoryName}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      <span>{selectedExercise.exercise.responseCount ?? 0} responses</span>
                      {selectedExercise.exercise.latestScore !== undefined && (
                        <span>Latest score: {selectedExercise.exercise.latestScore}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Response History</p>
                    <div className="space-y-2">
                      {[
                        { date: "Mar 8, 2026", score: 12, notes: "Patient reported improved mood. Continuing with current strategies." },
                        { date: "Mar 5, 2026", score: 14, notes: "Some anxiety about upcoming exam. Discussed coping techniques." },
                        { date: "Mar 1, 2026", score: 16, notes: "Initial assessment. Baseline established." },
                      ].map((response, i) => (
                        <div key={i} className="rounded-lg border p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-900">{response.date}</span>
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                              Score: {response.score}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">{response.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Generate Plan Dialog */}
      {showGenerateDialog && (
        <GeneratePlanDialog
          diagnoses={diagnoses}
          studentId={patient.id}
          clinicianId={patient.id} // TODO: Replace with actual clinician ID from auth context
          onClose={handleOpenManualEditor}
          onPlanGenerated={handleSavePlan}
        />
      )}

      {/* Plan Editor Modal */}
      {showPlanEditor && (
        <TreatmentPlanEditor
          plan={editingPlan}
          onClose={() => setShowPlanEditor(false)}
          onSave={handleSavePlan}
        />
      )}
    </div>
  );
}
