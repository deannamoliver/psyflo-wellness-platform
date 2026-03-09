"use client";

import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Download,
  Edit3,
  Plus,
  Save,
  Search,
  Stethoscope,
  Target,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { cn } from "@/lib/tailwind-utils";
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

// ─── Exercise / Intervention Library (Topic-Based) ──────────────────

type ExerciseTopic = {
  id: string;
  name: string;
  description: string;
};

type ExerciseCategory = {
  name: string;
  color: string;
  bg: string;
  topics: ExerciseTopic[];
};

const EXERCISE_CATEGORIES: ExerciseCategory[] = [
  {
    name: "Moods & Emotions", color: "text-rose-700", bg: "bg-rose-50",
    topics: [
      { id: "ex-1", name: "Anxiety & Panic", description: "Learn simple tools to calm yourself down fast, understand triggers, and feel more in control." },
      { id: "ex-2", name: "Stress & Burnout", description: "Spot warning signs before you crash, build a self-care routine, and protect your energy." },
      { id: "ex-3", name: "Sadness & Low Mood", description: "Learn healthy ways to work through sad feelings and find ways to lift yourself back up." },
      { id: "ex-4", name: "Anger & Calming Down", description: "Notice anger building, cool down before saying something you regret, and express frustration without blowing up." },
      { id: "ex-5", name: "Coping with Big Feelings", description: "Practice grounding techniques for when emotions feel too intense." },
      { id: "ex-6", name: "Understanding Emotions", description: "Expand beyond just 'good' or 'bad,' understand how emotions show up in your body." },
    ],
  },
  {
    name: "Self-Control, Impulses & Choices", color: "text-amber-700", bg: "bg-amber-50",
    topics: [
      { id: "ex-7", name: "Impulsivity & Decision-Making", description: "Learn to pause before you do something you'll regret." },
      { id: "ex-8", name: "Peer Pressure & Risky Choices", description: "Recognize pressure tactics, practice saying no, and choose friends who respect your boundaries." },
      { id: "ex-9", name: "Substance Use & Vaping", description: "Get real facts about substances and how they affect your brain." },
      { id: "ex-10", name: "Classroom Disruption & Getting in Trouble", description: "Figure out what's triggering you and build skills to stay in control during class." },
    ],
  },
  {
    name: "Conflict & Bullying", color: "text-orange-700", bg: "bg-orange-50",
    topics: [
      { id: "ex-11", name: "Conflict & Resolution", description: "Handle disagreements without it turning into a fight." },
      { id: "ex-12", name: "Bullying & Cyberbullying", description: "Learn safe ways to respond and strategies to protect yourself online and offline." },
      { id: "ex-13", name: "Standing Up for Yourself", description: "Learn the difference between being aggressive and being assertive." },
    ],
  },
  {
    name: "Focus & Productivity", color: "text-blue-700", bg: "bg-blue-50",
    topics: [
      { id: "ex-14", name: "Focus & Distractibility", description: "Identify what keeps pulling your attention away and find strategies that work for your brain." },
      { id: "ex-15", name: "Procrastination & Avoidance", description: "Understand why you avoid certain tasks and learn to start even when you don't feel like it." },
      { id: "ex-16", name: "Getting Organized & Study Skills", description: "Build routines for managing homework and discover study methods that work with your brain." },
      { id: "ex-17", name: "Problem Solving", description: "Break big problems into smaller pieces and build confidence that you can figure things out." },
    ],
  },
  {
    name: "Friends & Social", color: "text-pink-700", bg: "bg-pink-50",
    topics: [
      { id: "ex-18", name: "Friend Drama", description: "Navigate the messy parts of friendships without losing yourself." },
      { id: "ex-19", name: "Loneliness & Isolation", description: "Feel less alone and more connected to others." },
      { id: "ex-20", name: "Making Friends & Social Confidence", description: "Learn practical conversation skills and turn acquaintances into actual friends." },
      { id: "ex-21", name: "Social Media & Digital Wellness", description: "Take control of your phone instead of letting it control you." },
    ],
  },
  {
    name: "Communication", color: "text-cyan-700", bg: "bg-cyan-50",
    topics: [
      { id: "ex-22", name: "Speaking Up & Setting Boundaries", description: "Communicate your limits clearly and practice holding your ground." },
      { id: "ex-23", name: "Difficult Conversations & Expressing Feelings", description: "Have the hard talks instead of avoiding them." },
      { id: "ex-24", name: "Asking for Help", description: "Get comfortable reaching out before problems get bigger." },
      { id: "ex-25", name: "Active Listening", description: "Become someone others actually want to talk to." },
    ],
  },
  {
    name: "Identity & Self-Worth", color: "text-violet-700", bg: "bg-violet-50",
    topics: [
      { id: "ex-26", name: "Self-Esteem & Self-Talk", description: "Change the way you talk to yourself in your head." },
      { id: "ex-27", name: "Body Image", description: "Feel better about the body you're in." },
      { id: "ex-28", name: "Identity & Values", description: "Figure out who you really are beyond what others expect." },
      { id: "ex-29", name: "Cultural Identity & Stereotypes", description: "Take pride in your background while navigating a complicated world." },
      { id: "ex-30", name: "Self-Expression", description: "Find your own ways to show who you are." },
    ],
  },
  {
    name: "Repair & Accountability", color: "text-slate-700", bg: "bg-slate-50",
    topics: [
      { id: "ex-31", name: "Guilt & Shame", description: "Stop beating yourself up and start moving forward." },
      { id: "ex-32", name: "Apologizing & Making Amends", description: "Learn to say sorry in a way that actually means something." },
      { id: "ex-33", name: "Learning & Rebuilding Trust", description: "Fix relationships after you've broken trust." },
    ],
  },
  {
    name: "Goals & Growth", color: "text-emerald-700", bg: "bg-emerald-50",
    topics: [
      { id: "ex-34", name: "Finding Motivation & Bouncing Back", description: "Get back up when life knocks you down." },
      { id: "ex-35", name: "Setting Goals & Planning My Future", description: "Turn your dreams into actual plans." },
      { id: "ex-36", name: "Building Habits", description: "Make good behaviors stick without relying on willpower." },
      { id: "ex-37", name: "Growth Mindset", description: "Believe in your ability to improve and grow." },
      { id: "ex-38", name: "Purpose & Values", description: "Find direction and meaning in your life." },
    ],
  },
  {
    name: "Family & Home", color: "text-teal-700", bg: "bg-teal-50",
    topics: [
      { id: "ex-39", name: "Family Conflict", description: "Get along better with family even when it's hard." },
      { id: "ex-40", name: "Expectations & Feeling Misunderstood", description: "Handle family pressure without losing yourself." },
      { id: "ex-41", name: "Household Changes", description: "Adapt when things at home shift unexpectedly." },
      { id: "ex-42", name: "Financial Stress", description: "Cope when money problems affect your family." },
    ],
  },
  {
    name: "Relationships & Dating", color: "text-red-700", bg: "bg-red-50",
    topics: [
      { id: "ex-43", name: "Crushes, Rejection & Breakups", description: "Handle the intense emotions of romantic feelings." },
      { id: "ex-44", name: "Healthy vs. Unhealthy Relationships", description: "Spot green flags and red flags." },
      { id: "ex-45", name: "Boundaries & Consent", description: "Understand and practice consent in all your relationships." },
    ],
  },
  {
    name: "My Body, Health & Energy", color: "text-lime-700", bg: "bg-lime-50",
    topics: [
      { id: "ex-46", name: "Sleep, Energy & Rest", description: "Level up your sleep to feel better every day." },
      { id: "ex-47", name: "Eating & Food Struggles", description: "Build a healthier relationship with food." },
      { id: "ex-48", name: "Physical Health & Movement", description: "Find ways to move your body that actually feel good." },
    ],
  },
  {
    name: "Life Changes & Transitions", color: "text-indigo-700", bg: "bg-indigo-50",
    topics: [
      { id: "ex-49", name: "Grief & Loss", description: "Process the pain of losing someone or something important." },
      { id: "ex-50", name: "School Transitions", description: "Handle the stress of changing schools or moving up a grade." },
      { id: "ex-51", name: "Family Changes", description: "Adapt to big shifts like divorce, remarriage, or moves." },
      { id: "ex-52", name: "College & Future Anxiety", description: "Manage the pressure of figuring out what's next." },
    ],
  },
];

type AssignedExerciseItem = {
  id: string;
  topicId: string;
  topicName: string;
  categoryName: string;
  frequency: string;
  assignedDate: string;
  deadline: string;
  status: "active" | "completed" | "deactivated";
  completedDate: string | null;
  lastActivity: string | null;
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
  onClose,
}: {
  onAssign: (topic: ExerciseTopic, categoryName: string, frequency: string) => void;
  assignedTopicIds: Set<string>;
  onClose: () => void;
}) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [assigningTopic, setAssigningTopic] = useState<{ topic: ExerciseTopic; categoryName: string } | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState("3x / week");

  const filteredCategories = EXERCISE_CATEGORIES.map((cat) => ({
    ...cat,
    topics: cat.topics.filter((t) => {
      if (assignedTopicIds.has(t.id)) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q);
    }),
  })).filter((cat) => cat.topics.length > 0);

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

        <div className="border-b px-6 py-3">
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
            <ClipboardList className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercises by topic or category..."
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
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-semibold", cat.color)}>{cat.name}</span>
                      <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-gray-500">{cat.topics.length}</span>
                    </div>
                    {expandedCategory === cat.name ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </button>
                  {expandedCategory === cat.name && (
                    <div className="space-y-1 p-2">
                      {cat.topics.map((topic) => (
                        <div key={topic.id} className="rounded-lg p-3 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 pr-3">
                              <p className="text-sm font-medium text-gray-900">{topic.name}</p>
                              <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{topic.description}</p>
                            </div>
                            <Button size="sm" variant="outline" className="shrink-0 gap-1 text-xs" onClick={() => { setAssigningTopic({ topic, categoryName: cat.name }); setSelectedFrequency("3x / week"); }}>
                              <Plus className="h-3 w-3" />
                              Assign
                            </Button>
                          </div>
                          {assigningTopic?.topic.id === topic.id && (
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
                                    onAssign(topic, cat.name, selectedFrequency);
                                    setAssigningTopic(null);
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                  Confirm Assignment
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs text-gray-500"
                                  onClick={() => setAssigningTopic(null)}
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
  onEditPlan,
  onUpdateExercises,
  allAssignedTopicIds,
}: {
  planData: PlanWithExercises;
  onEditPlan: (plan: TreatmentPlan) => void;
  onUpdateExercises: (planId: string, exercises: AssignedExerciseItem[]) => void;
  allAssignedTopicIds: Set<string>;
}) {
  const { plan, exercises } = planData;
  const [expanded, setExpanded] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);

  const activeCount = exercises.filter((e) => e.status === "active").length;
  const completedCount = exercises.filter((e) => e.status === "completed").length;
  const nonDeactivated = exercises.filter((e) => e.status !== "deactivated");
  const done = nonDeactivated.filter((e) => e.status === "completed").length;
  const pct = nonDeactivated.length > 0 ? Math.round((done / nonDeactivated.length) * 100) : 0;

  function handleAssignExercise(topic: ExerciseTopic, categoryName: string, frequency: string) {
    const today = new Date().toISOString().split("T")[0]!;
    const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!;
    onUpdateExercises(plan.id, [
      ...exercises,
      { id: `ae-${Date.now()}`, topicId: topic.id, topicName: topic.name, categoryName, frequency, assignedDate: today, deadline, status: "active", completedDate: null, lastActivity: null },
    ]);
  }

  function handleToggleStatus(id: string) {
    onUpdateExercises(plan.id, exercises.map((e) => e.id === id ? { ...e, status: e.status === "deactivated" ? "active" : "deactivated" } : e));
  }

  function handleRemoveExercise(id: string) {
    onUpdateExercises(plan.id, exercises.filter((e) => e.id !== id));
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
              <p className="text-sm font-semibold text-gray-900 truncate">{plan.title}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[10px] text-gray-400">Started {plan.startDate}</span>
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
            {/* Plan details + modify button */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex gap-4 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Started: {plan.startDate}</span>
                  {plan.reviewDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Review: {plan.reviewDate}</span>}
                </div>
                {plan.goals.length > 0 && (
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
                )}
                {plan.notes && (
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="text-xs font-semibold text-blue-700">Clinical Notes</p>
                    <p className="mt-1 text-xs text-blue-600">{plan.notes}</p>
                  </div>
                )}
              </div>
              <Button size="sm" variant="outline" className="shrink-0 gap-1.5 ml-4" onClick={() => onEditPlan(plan)}>
                <Edit3 className="h-3.5 w-3.5" />
                Modify Plan
              </Button>
            </div>

            {/* Plan Completion bar */}
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

            {/* Assigned Exercises */}
            <div className="border-t pt-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Assigned Exercises</p>
                  <p className="mt-0.5 text-[10px] text-gray-400">
                    {activeCount} active · {completedCount} completed · {exercises.length} total
                  </p>
                </div>
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
                        <th className="px-4 py-2.5">Frequency</th>
                        <th className="px-4 py-2.5">Assigned</th>
                        <th className="px-4 py-2.5">Deadline</th>
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
                          <td className="px-4 py-3 text-gray-600">{ex.frequency}</td>
                          <td className="px-4 py-3 text-gray-600">{ex.assignedDate}</td>
                          <td className="px-4 py-3 text-gray-600">{ex.deadline}</td>
                          <td className="px-4 py-3">
                            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", STATUS_COLORS[ex.status] ?? "bg-gray-100 text-gray-600")}>{ex.status}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
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
          </div>
        )}
      </div>

      {showLibrary && (
        <InterventionLibraryModal
          onAssign={handleAssignExercise}
          assignedTopicIds={allAssignedTopicIds}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </>
  );
}

// ─── Treatment Plans Tab ────────────────────────────────────────────

function TreatmentPlansTab({
  plans,
  planExercises,
  diagnoses,
  onEditPlan,
  onAddPlan,
  onUpdateExercises,
  onAddDiagnosis,
  onRemoveDiagnosis,
}: {
  plans: TreatmentPlan[];
  planExercises: Record<string, AssignedExerciseItem[]>;
  diagnoses: ICD10Diagnosis[];
  onEditPlan: (plan: TreatmentPlan) => void;
  onAddPlan: () => void;
  onUpdateExercises: (planId: string, exercises: AssignedExerciseItem[]) => void;
  onAddDiagnosis: (d: ICD10Diagnosis) => void;
  onRemoveDiagnosis: (code: string) => void;
}) {
  const allAssignedTopicIds = new Set(
    Object.values(planExercises)
      .flat()
      .filter((e) => e.status !== "deactivated")
      .map((e) => e.topicId),
  );

  return (
    <div className="space-y-6">
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
              onEditPlan={onEditPlan}
              onUpdateExercises={onUpdateExercises}
              allAssignedTopicIds={allAssignedTopicIds}
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

  // Multiple treatment plans
  const [plans, setPlans] = useState<TreatmentPlan[]>(() => {
    if (stored?.plans && stored.plans.length > 0) {
      return stored.plans.map((p) => ({ ...p, activities: [] }));
    }
    if (!initialPatient.treatmentPlan) return [];
    return [initialPatient.treatmentPlan];
  });

  // Exercises keyed by plan ID
  const [planExercises, setPlanExercises] = useState<Record<string, AssignedExerciseItem[]>>(() => {
    if (stored?.planExercises && Object.keys(stored.planExercises).length > 0) {
      return stored.planExercises;
    }
    if (!initialPatient.treatmentPlan) return {};
    return {
      [initialPatient.treatmentPlan.id]: [
        { id: "ae-1", topicId: "ex-1", topicName: "Anxiety & Panic", categoryName: "Moods & Emotions", frequency: "3x / week", assignedDate: "2026-02-01", deadline: "2026-03-01", status: "active", completedDate: null, lastActivity: "2026-02-20" },
        { id: "ae-2", topicId: "ex-5", topicName: "Coping with Big Feelings", categoryName: "Moods & Emotions", frequency: "Daily", assignedDate: "2026-02-01", deadline: "2026-03-01", status: "completed", completedDate: "2026-02-18", lastActivity: "2026-02-18" },
        { id: "ae-3", topicId: "ex-14", topicName: "Focus & Distractibility", categoryName: "Focus & Productivity", frequency: "2x / week", assignedDate: "2026-02-10", deadline: "2026-03-10", status: "active", completedDate: null, lastActivity: "2026-02-19" },
      ],
    };
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

  const handleAddPlan = () => {
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
      <TreatmentPlansTab
        plans={plans}
        planExercises={planExercises}
        diagnoses={diagnoses}
        onEditPlan={handleEditPlan}
        onAddPlan={handleAddPlan}
        onUpdateExercises={handleUpdateExercises}
        onAddDiagnosis={handleAddDiagnosis}
        onRemoveDiagnosis={handleRemoveDiagnosis}
      />

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
