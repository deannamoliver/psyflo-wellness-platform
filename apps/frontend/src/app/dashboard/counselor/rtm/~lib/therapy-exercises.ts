/**
 * Clinically Validated CBT & DBT Therapy Exercise Library
 *
 * All exercises are mapped to DSM-5 (APA, 2013) diagnostic categories and
 * grounded in peer-reviewed, evidence-based treatment protocols:
 *
 * CBT References:
 *   - Beck, A.T. (1979). Cognitive Therapy of Depression.
 *   - Burns, D.D. (1980). Feeling Good: The New Mood Therapy.
 *   - Hofmann, S.G. et al. (2012). The Efficacy of CBT: A Review of Meta-analyses. Cognitive Therapy and Research, 36(5), 427-440.
 *   - Butler, A.C. et al. (2006). The empirical status of CBT: A review of meta-analyses. Clinical Psychology Review, 26(1), 17-31.
 *
 * DBT References:
 *   - Linehan, M.M. (2015). DBT Skills Training Manual, 2nd Edition.
 *   - Linehan, M.M. et al. (2006). Two-year randomized controlled trial and follow-up of DBT vs therapy by experts. Archives of General Psychiatry, 63(7), 757-766.
 *   - DeCou, C.R. et al. (2019). Effectiveness of DBT for self-harm and suicidal behavior: A meta-analysis. Clinical Psychology Review, 73, 101785.
 *
 * DSM-5 Reference:
 *   - American Psychiatric Association. (2013). Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition (DSM-5). Arlington, VA: APA.
 *
 * Exercises are organized by therapy modality, skill domain, and DSM-5 diagnostic targets.
 * Only therapists/providers can assign exercises to patients.
 */

export type TherapyModality = "cbt" | "dbt";

export type CBTDomain =
  | "cognitive_restructuring"
  | "behavioral_activation"
  | "exposure"
  | "problem_solving"
  | "relaxation";

export type DBTDomain =
  | "mindfulness"
  | "distress_tolerance"
  | "emotion_regulation"
  | "interpersonal_effectiveness";

export type DSM5Target = {
  code: string;
  name: string;
};

export type TherapyExercise = {
  id: string;
  name: string;
  modality: TherapyModality;
  domain: CBTDomain | DBTDomain;
  domainLabel: string;
  description: string;
  instructions: string[];
  duration: string;
  frequency: string;
  evidenceBase: string;
  validationSource: string;
  dsm5Targets: DSM5Target[];
  clinicalIndications: string[];
  contraindications: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  targetCompletions: number;
};

export type AssignedExercise = TherapyExercise & {
  assignedAt: string;
  assignedBy: string;
  completionsThisPeriod: number;
  lastCompletedAt: string | null;
  patientNotes: string | null;
  status: "active" | "paused" | "completed";
};

// ─── Domain Labels ──────────────────────────────────────────────────

export const MODALITY_LABELS: Record<TherapyModality, string> = {
  cbt: "Cognitive Behavioral Therapy (CBT)",
  dbt: "Dialectical Behavior Therapy (DBT)",
};

export const DOMAIN_LABELS: Record<CBTDomain | DBTDomain, string> = {
  cognitive_restructuring: "Cognitive Restructuring",
  behavioral_activation: "Behavioral Activation",
  exposure: "Exposure Therapy",
  problem_solving: "Problem Solving",
  relaxation: "Relaxation Training",
  mindfulness: "Mindfulness",
  distress_tolerance: "Distress Tolerance",
  emotion_regulation: "Emotion Regulation",
  interpersonal_effectiveness: "Interpersonal Effectiveness",
};

export const MODALITY_COLORS: Record<TherapyModality, string> = {
  cbt: "bg-blue-100 text-blue-700",
  dbt: "bg-violet-100 text-violet-700",
};

export const DOMAIN_COLORS: Record<string, string> = {
  cognitive_restructuring: "bg-sky-50 text-sky-700 border-sky-200",
  behavioral_activation: "bg-amber-50 text-amber-700 border-amber-200",
  exposure: "bg-rose-50 text-rose-700 border-rose-200",
  problem_solving: "bg-emerald-50 text-emerald-700 border-emerald-200",
  relaxation: "bg-teal-50 text-teal-700 border-teal-200",
  mindfulness: "bg-purple-50 text-purple-700 border-purple-200",
  distress_tolerance: "bg-orange-50 text-orange-700 border-orange-200",
  emotion_regulation: "bg-pink-50 text-pink-700 border-pink-200",
  interpersonal_effectiveness: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-50 text-green-700",
  intermediate: "bg-amber-50 text-amber-700",
  advanced: "bg-red-50 text-red-700",
};

// ─── CBT Exercises (DSM-5 Aligned) ──────────────────────────────────

const CBT_EXERCISES: TherapyExercise[] = [
  {
    id: "cbt-01",
    name: "Thought Record",
    modality: "cbt",
    domain: "cognitive_restructuring",
    domainLabel: "Cognitive Restructuring",
    description:
      "Identify and challenge automatic negative thoughts using a structured 7-column thought record. Targets core cognitive distortions maintaining depressive and anxious symptomatology per Beck's cognitive model.",
    instructions: [
      "Describe the situation that triggered the negative emotion",
      "Identify the automatic thought(s) that came to mind",
      "Rate the intensity of each emotion (0-100%)",
      "List the cognitive distortions present (e.g., all-or-nothing thinking, catastrophizing, overgeneralization)",
      "Write a balanced, evidence-based alternative thought",
      "Re-rate the intensity of each emotion after cognitive reframing",
      "Note what adaptive action you will take based on the balanced thought",
    ],
    duration: "15-20 min",
    frequency: "Daily or when distressed",
    evidenceBase: "Beck, A.T. (1979). Cognitive Therapy of Depression; Burns, D.D. (1980). Feeling Good: The New Mood Therapy",
    validationSource: "Hofmann et al. (2012) meta-analysis: CBT demonstrated large effect sizes (d=0.73) for depression; Butler et al. (2006): strong empirical support across 16 meta-analyses",
    dsm5Targets: [
      { code: "F32", name: "Major Depressive Disorder" },
      { code: "F33", name: "Major Depressive Disorder, Recurrent" },
      { code: "F41.1", name: "Generalized Anxiety Disorder" },
      { code: "F41.0", name: "Panic Disorder" },
    ],
    clinicalIndications: [
      "Persistent negative automatic thoughts",
      "Cognitive distortions maintaining depressed or anxious mood",
      "Rumination patterns",
      "Low self-esteem with negative self-schema",
    ],
    contraindications: [
      "Active psychosis with impaired reality testing",
      "Severe cognitive impairment preventing abstract reasoning",
      "Acute suicidal crisis (stabilize first)",
    ],
    difficulty: "intermediate",
    targetCompletions: 20,
  },
  {
    id: "cbt-02",
    name: "Behavioral Experiment",
    modality: "cbt",
    domain: "cognitive_restructuring",
    domainLabel: "Cognitive Restructuring",
    description:
      "Test the validity of a negative belief by designing a real-world experiment to gather disconfirming evidence. Directly targets safety behaviors and avoidance patterns per DSM-5 anxiety disorder criteria.",
    instructions: [
      "Identify a specific negative prediction or core belief to test",
      "Rate how strongly you believe it (0-100%)",
      "Design a simple, safe experiment to test the belief",
      "Predict what you think will happen and how you will cope",
      "Carry out the experiment",
      "Record what actually happened — gather objective evidence",
      "Compare the prediction with the outcome and re-rate the belief strength",
    ],
    duration: "Varies",
    frequency: "1-2x per week",
    evidenceBase: "Bennett-Levy, J. et al. (2004). Oxford Guide to Behavioural Experiments in Cognitive Therapy",
    validationSource: "McManus et al. (2012): behavioral experiments produced significantly greater belief change than thought records alone (d=0.85); Rouf et al. (2004): core component of effective CBT protocols",
    dsm5Targets: [
      { code: "F40.10", name: "Social Anxiety Disorder" },
      { code: "F41.0", name: "Panic Disorder" },
      { code: "F40.2", name: "Specific Phobia" },
      { code: "F41.1", name: "Generalized Anxiety Disorder" },
    ],
    clinicalIndications: [
      "Safety behaviors maintaining anxiety",
      "Avoidance patterns preventing disconfirmation of feared outcomes",
      "Overestimation of threat probability",
      "Catastrophic misinterpretation of bodily sensations (panic)",
    ],
    contraindications: [
      "Experiments involving genuine physical danger",
      "Patient lacks capacity for informed consent to the experiment",
      "Active substance intoxication",
    ],
    difficulty: "intermediate",
    targetCompletions: 8,
  },
  {
    id: "cbt-03",
    name: "Behavioral Activation Schedule",
    modality: "cbt",
    domain: "behavioral_activation",
    domainLabel: "Behavioral Activation",
    description:
      "Schedule pleasurable and mastery activities to counteract behavioral withdrawal and anhedonia — core features of Major Depressive Disorder (DSM-5 Criterion A2: diminished interest/pleasure).",
    instructions: [
      "List 5 activities that give you pleasure or a sense of accomplishment",
      "Rate each activity for predicted pleasure (0-10) and mastery (0-10)",
      "Schedule at least one activity per day for the coming week",
      "After completing each activity, rate actual pleasure and mastery",
      "Compare predicted vs. actual ratings — notice the 'depression filter'",
      "Identify patterns: which activities most effectively counter low mood?",
    ],
    duration: "10 min planning, varies for activities",
    frequency: "Daily",
    evidenceBase: "Martell, C.R., Dimidjian, S. & Herman-Dunn, R. (2010). Behavioral Activation for Depression: A Clinician's Guide",
    validationSource: "Dimidjian et al. (2006) JCCP: BA was comparable to antidepressant medication and superior to CBT for severely depressed patients; Cuijpers et al. (2007) meta-analysis: BA effect size d=0.87",
    dsm5Targets: [
      { code: "F32", name: "Major Depressive Disorder" },
      { code: "F33", name: "Major Depressive Disorder, Recurrent" },
      { code: "F34.1", name: "Persistent Depressive Disorder (Dysthymia)" },
    ],
    clinicalIndications: [
      "Anhedonia and loss of interest (DSM-5 MDD Criterion A2)",
      "Psychomotor retardation and behavioral withdrawal",
      "Activity avoidance maintaining depressive cycle",
      "Social isolation secondary to depression",
    ],
    contraindications: [
      "Manic episode (may exacerbate activation)",
      "Activities should not involve substance use",
    ],
    difficulty: "beginner",
    targetCompletions: 28,
  },
  {
    id: "cbt-04",
    name: "Cognitive Distortion Identification",
    modality: "cbt",
    domain: "cognitive_restructuring",
    domainLabel: "Cognitive Restructuring",
    description:
      "Learn to recognize the 15 common cognitive distortions (Beck, 1979; Burns, 1980) that maintain negative mood states across depressive and anxiety disorders.",
    instructions: [
      "Review the cognitive distortions: all-or-nothing thinking, overgeneralization, mental filter, disqualifying the positive, jumping to conclusions (mind reading, fortune telling), magnification/minimization, emotional reasoning, should statements, labeling, personalization, catastrophizing, control fallacies, fallacy of fairness, blaming, always being right",
      "Throughout the day, notice when a negative thought arises",
      "Write down the thought and identify which distortion(s) apply",
      "Practice labeling the distortion without self-judgment (defusion)",
      "Over time, identify your most frequent distortion patterns",
    ],
    duration: "5-10 min",
    frequency: "Daily",
    evidenceBase: "Burns, D.D. (1980). Feeling Good: The New Mood Therapy; Beck, A.T. (1979). Cognitive Therapy of Depression",
    validationSource: "Dozois et al. (2009): cognitive distortion identification is a key mechanism of change in CBT; Quilty et al. (2014): reduction in cognitive distortions mediates symptom improvement",
    dsm5Targets: [
      { code: "F32", name: "Major Depressive Disorder" },
      { code: "F41.1", name: "Generalized Anxiety Disorder" },
      { code: "F40.10", name: "Social Anxiety Disorder" },
      { code: "F34.1", name: "Persistent Depressive Disorder (Dysthymia)" },
    ],
    clinicalIndications: [
      "Pervasive negative thinking patterns",
      "Difficulty distinguishing thoughts from facts",
      "Cognitive rigidity maintaining mood disorders",
      "Early-stage CBT psychoeducation",
    ],
    contraindications: [
      "Active psychosis (delusions are not cognitive distortions)",
      "Severe intellectual disability",
    ],
    difficulty: "beginner",
    targetCompletions: 30,
  },
  {
    id: "cbt-05",
    name: "Graded Exposure Hierarchy",
    modality: "cbt",
    domain: "exposure",
    domainLabel: "Exposure Therapy",
    description:
      "Build a fear hierarchy and systematically approach feared situations using graduated exposure with response prevention. Gold-standard intervention for DSM-5 anxiety disorders and OCD.",
    instructions: [
      "Identify the feared situation, object, or obsession",
      "List 10 related situations ranging from mildly to extremely anxiety-provoking",
      "Rate each situation using SUDS (Subjective Units of Distress Scale, 0-100)",
      "Begin with the lowest-rated item on the hierarchy",
      "Expose yourself to the situation until anxiety decreases by at least 50% (habituation)",
      "Record your SUDS before, during (peak), and after each exposure",
      "Move to the next item only when the current one no longer causes significant distress",
      "Do NOT engage in safety behaviors or rituals during exposure",
    ],
    duration: "30-60 min per session",
    frequency: "2-3x per week",
    evidenceBase: "Foa, E.B. & Kozak, M.J. (1986). Emotional Processing of Fear: Exposure to Corrective Information. Psychological Bulletin, 99(1), 20-35",
    validationSource: "Olatunji et al. (2010) meta-analysis: exposure therapy effect sizes d=1.13-1.56 for specific phobias; Abramowitz et al. (2019): ERP is first-line treatment for OCD with 60-80% response rates",
    dsm5Targets: [
      { code: "F40.2", name: "Specific Phobia" },
      { code: "F40.10", name: "Social Anxiety Disorder" },
      { code: "F41.0", name: "Panic Disorder" },
      { code: "F42", name: "Obsessive-Compulsive Disorder" },
      { code: "F43.10", name: "Posttraumatic Stress Disorder" },
    ],
    clinicalIndications: [
      "Phobic avoidance of specific situations or objects",
      "Safety behaviors maintaining anxiety disorders",
      "Compulsive rituals in OCD (exposure with response prevention)",
      "Trauma-related avoidance (with clinical supervision)",
    ],
    contraindications: [
      "Must be conducted under therapist supervision for PTSD and OCD",
      "Active suicidal ideation with plan (stabilize first)",
      "Uncontrolled substance use disorder",
      "Dissociative episodes during exposure (requires modified protocol)",
    ],
    difficulty: "advanced",
    targetCompletions: 12,
  },
  {
    id: "cbt-06",
    name: "Problem-Solving Therapy Worksheet",
    modality: "cbt",
    domain: "problem_solving",
    domainLabel: "Problem Solving",
    description:
      "Use structured problem-solving therapy (PST) steps to address specific life problems contributing to depressive symptoms. Targets hopelessness and perceived helplessness per DSM-5 MDD criteria.",
    instructions: [
      "Define the problem clearly and specifically (who, what, when, where)",
      "Brainstorm at least 5 possible solutions without judging them",
      "Evaluate each solution: list pros and cons for each",
      "Select the best solution (or combination of solutions)",
      "Create a step-by-step action plan with specific timeline",
      "Implement the plan",
      "Review the outcome and adjust the approach if needed",
    ],
    duration: "20-30 min",
    frequency: "As needed",
    evidenceBase: "D'Zurilla, T.J. & Nezu, A.M. (2007). Problem-Solving Therapy: A Positive Approach to Clinical Intervention, 3rd Edition",
    validationSource: "Cuijpers et al. (2018) meta-analysis: PST effect size d=0.67 for depression; Bell & D'Zurilla (2009): PST effective across age groups and clinical populations",
    dsm5Targets: [
      { code: "F32", name: "Major Depressive Disorder" },
      { code: "F43.2", name: "Adjustment Disorders" },
      { code: "F41.1", name: "Generalized Anxiety Disorder" },
    ],
    clinicalIndications: [
      "Hopelessness and perceived helplessness",
      "Difficulty generating solutions to life problems",
      "Impulsive or avoidant problem-solving style",
      "Adjustment difficulties following life stressors",
    ],
    contraindications: [
      "Problems that are genuinely unsolvable (use acceptance-based strategies instead)",
      "Acute crisis requiring immediate safety planning",
    ],
    difficulty: "intermediate",
    targetCompletions: 8,
  },
  {
    id: "cbt-07",
    name: "Progressive Muscle Relaxation (Jacobson)",
    modality: "cbt",
    domain: "relaxation",
    domainLabel: "Relaxation Training",
    description:
      "Systematically tense and release 16 muscle groups to reduce physiological hyperarousal — a core feature of DSM-5 Generalized Anxiety Disorder (Criterion C: muscle tension) and Panic Disorder.",
    instructions: [
      "Find a quiet, comfortable place and close your eyes",
      "Start with your feet — tense the muscles for 5-7 seconds",
      "Release the tension and notice the contrast for 15-20 seconds",
      "Move upward: calves, thighs, abdomen, chest, hands, arms, shoulders, neck, face",
      "For each group: tense (inhale) → hold → release (exhale) → notice the relaxation",
      "After completing all 16 groups, take 2-3 minutes to enjoy full-body relaxation",
      "Practice daily at the same time to build the relaxation response",
    ],
    duration: "15-20 min",
    frequency: "Daily",
    evidenceBase: "Jacobson, E. (1938). Progressive Relaxation; Bernstein, D.A. & Borkovec, T.D. (1973). Progressive Relaxation Training",
    validationSource: "Manzoni et al. (2008) meta-analysis: relaxation training effect size d=0.57 for anxiety; Conrad & Roth (2007): PMR significantly reduces cortisol levels and self-reported anxiety",
    dsm5Targets: [
      { code: "F41.1", name: "Generalized Anxiety Disorder" },
      { code: "F41.0", name: "Panic Disorder" },
      { code: "G47.0", name: "Insomnia Disorder" },
      { code: "F43.10", name: "Posttraumatic Stress Disorder" },
    ],
    clinicalIndications: [
      "Chronic muscle tension (GAD Criterion C5)",
      "Physiological hyperarousal and restlessness",
      "Sleep-onset insomnia related to somatic tension",
      "Autonomic arousal in panic disorder",
    ],
    contraindications: [
      "Acute musculoskeletal injury (modify affected muscle groups)",
      "Paradoxical anxiety from relaxation (relaxation-induced anxiety)",
      "Seizure disorders (consult physician first)",
    ],
    difficulty: "beginner",
    targetCompletions: 30,
  },
  {
    id: "cbt-08",
    name: "Stimulus Control for Worry",
    modality: "cbt",
    domain: "cognitive_restructuring",
    domainLabel: "Cognitive Restructuring",
    description:
      "Contain excessive worry to a designated 15-minute daily window. Directly targets DSM-5 GAD Criterion A (excessive anxiety and worry occurring more days than not for at least 6 months).",
    instructions: [
      "Choose a specific 15-minute worry window each day (not near bedtime)",
      "When a worry arises outside this window, write it down briefly and postpone it",
      "Tell yourself: 'I will address this during my designated worry time'",
      "During the designated time, review your worry list systematically",
      "For each worry: Is it solvable? If yes, problem-solve. If no, practice acceptance",
      "When the 15 minutes end, stop and transition to a pleasant activity",
    ],
    duration: "15 min",
    frequency: "Daily",
    evidenceBase: "Borkovec, T.D. et al. (1983). Stimulus control applications to the treatment of worry; Wells, A. (1997). Cognitive Therapy of Anxiety Disorders",
    validationSource: "McGowan & Behar (2013): stimulus control for worry significantly reduces GAD symptoms; Borkovec & Costello (1993) RCT: applied relaxation + stimulus control superior to non-directive therapy",
    dsm5Targets: [
      { code: "F41.1", name: "Generalized Anxiety Disorder" },
      { code: "F41.8", name: "Other Specified Anxiety Disorder" },
    ],
    clinicalIndications: [
      "Excessive, uncontrollable worry (GAD Criterion A-B)",
      "Worry that is pervasive and interferes with daily functioning",
      "Difficulty 'turning off' worry at bedtime",
      "Generalized worry not limited to a specific phobic stimulus",
    ],
    contraindications: [
      "Obsessive-compulsive disorder (worry time may reinforce obsessions)",
      "Acute PTSD with intrusive re-experiencing (requires trauma-focused protocol)",
    ],
    difficulty: "beginner",
    targetCompletions: 30,
  },
];

// ─── DBT Exercises (DSM-5 Aligned) ──────────────────────────────────

const DBT_EXERCISES: TherapyExercise[] = [
  {
    id: "dbt-01",
    name: "Wise Mind Meditation",
    modality: "dbt",
    domain: "mindfulness",
    domainLabel: "Mindfulness",
    description:
      "Access your Wise Mind — the synthesis of Emotion Mind and Reasonable Mind. Core DBT mindfulness skill targeting emotional dysregulation in Borderline Personality Disorder (DSM-5) and transdiagnostic emotion regulation deficits.",
    instructions: [
      "Sit comfortably and close your eyes",
      "Take 3 deep breaths, exhaling slowly",
      "Imagine walking down a spiral staircase, going deeper with each step",
      "At the bottom, you find a calm, clear pool — this is your Wise Mind",
      "Ask yourself: 'What does my Wise Mind know about this situation?'",
      "Sit with whatever answer arises without judging it",
      "When ready, slowly walk back up the staircase and open your eyes",
      "Journal what your Wise Mind communicated",
    ],
    duration: "10-15 min",
    frequency: "Daily",
    evidenceBase: "Linehan, M.M. (2015). DBT Skills Training Manual, 2nd Edition. New York: Guilford Press",
    validationSource: "Linehan et al. (2006) Archives of General Psychiatry: DBT reduced suicidal behavior by 50% vs. treatment by experts; Neacsiu et al. (2014): mindfulness skills use mediated reductions in depression and anxiety",
    dsm5Targets: [
      { code: "F60.3", name: "Borderline Personality Disorder" },
      { code: "F32", name: "Major Depressive Disorder" },
      { code: "F41.1", name: "Generalized Anxiety Disorder" },
      { code: "F43.10", name: "Posttraumatic Stress Disorder" },
    ],
    clinicalIndications: [
      "Emotional dysregulation and mood instability",
      "Difficulty integrating emotional and rational decision-making",
      "Impulsive behavior driven by Emotion Mind",
      "Emotional detachment or over-intellectualization (Reasonable Mind)",
    ],
    contraindications: [
      "Active psychotic episode with disorganized thinking",
      "Severe dissociative states (may worsen with eyes-closed meditation)",
    ],
    difficulty: "beginner",
    targetCompletions: 30,
  },
  {
    id: "dbt-02",
    name: "TIPP Skills (Crisis Survival)",
    modality: "dbt",
    domain: "distress_tolerance",
    domainLabel: "Distress Tolerance",
    description:
      "Use Temperature, Intense exercise, Paced breathing, and Progressive relaxation to rapidly reduce acute emotional arousal. Targets the physiological component of emotional crises in BPD and acute stress responses.",
    instructions: [
      "T — Temperature: Hold ice cubes, splash cold water on your face, or take a cold shower for 30 seconds (activates dive reflex, reduces heart rate)",
      "I — Intense Exercise: Do 10-15 minutes of vigorous exercise (jumping jacks, running in place, push-ups) to metabolize stress hormones",
      "P — Paced Breathing: Breathe in for 4 counts, out for 6-8 counts. Exhale must be longer than inhale to activate parasympathetic nervous system",
      "P — Progressive (Paired) Muscle Relaxation: Tense each muscle group while breathing in, relax while breathing out",
      "Use whichever combination works best in the moment",
      "Rate your distress before (0-10) and after (0-10) using TIPP",
    ],
    duration: "5-20 min",
    frequency: "As needed during crisis",
    evidenceBase: "Linehan, M.M. (2015). DBT Skills Training Manual, 2nd Edition; Koons, C.R. et al. (2001). Efficacy of DBT in women veterans with BPD. Behavior Therapy, 32(2), 371-390",
    validationSource: "DeCou et al. (2019) meta-analysis: DBT distress tolerance skills significantly reduce self-harm (OR=0.54); Linehan et al. (2015): TIPP is the recommended first-line crisis intervention in standard DBT protocol",
    dsm5Targets: [
      { code: "F60.3", name: "Borderline Personality Disorder" },
      { code: "F43.0", name: "Acute Stress Disorder" },
      { code: "F41.0", name: "Panic Disorder" },
      { code: "X71-X83", name: "Non-Suicidal Self-Injury (proposed DSM-5 Section III)" },
    ],
    clinicalIndications: [
      "Acute emotional crisis with urge to self-harm",
      "Panic attacks with physiological hyperarousal",
      "Intense emotional arousal exceeding window of tolerance",
      "Suicidal urges requiring immediate distress reduction",
    ],
    contraindications: [
      "Cold temperature contraindicated in Raynaud's disease or cardiac arrhythmia",
      "Intense exercise contraindicated with uncontrolled cardiac conditions",
      "Not a substitute for emergency services in imminent danger",
    ],
    difficulty: "beginner",
    targetCompletions: 12,
  },
  {
    id: "dbt-03",
    name: "Opposite Action",
    modality: "dbt",
    domain: "emotion_regulation",
    domainLabel: "Emotion Regulation",
    description:
      "When an emotion is unjustified by the facts or acting on it would be ineffective, act opposite to the emotion's action urge. Based on the behavioral theory that emotions are maintained by their associated action tendencies.",
    instructions: [
      "Identify the emotion you are experiencing (e.g., anger, shame, fear, sadness, guilt)",
      "Identify the action urge (anger → attack/withdraw; fear → avoid/escape; sadness → isolate; shame → hide; guilt → excessive apologizing)",
      "Check the facts: Is the emotion justified by the actual situation? Is acting on the urge effective?",
      "If the emotion is NOT justified or NOT effective, choose the opposite action",
      "For fear: approach what you're avoiding. For anger: be gentle/kind. For sadness: get active and engage. For shame: share with someone safe. For guilt: repeat the behavior (if not harmful)",
      "Act opposite ALL THE WAY — body posture, facial expression, tone of voice, behavior",
      "Repeat the opposite action until the emotion shifts (may take multiple exposures)",
    ],
    duration: "Varies",
    frequency: "As needed",
    evidenceBase: "Linehan, M.M. (2015). DBT Skills Training Manual, 2nd Edition; Rizvi, S.L. & Ritschel, L.A. (2014). Mastering the Art of Chain Analysis in DBT",
    validationSource: "Neacsiu et al. (2010): opposite action skill use predicted reductions in depression (d=0.62) and anxiety; Linehan et al. (2015): core mechanism of change in DBT emotion regulation module",
    dsm5Targets: [
      { code: "F60.3", name: "Borderline Personality Disorder" },
      { code: "F32", name: "Major Depressive Disorder" },
      { code: "F40.10", name: "Social Anxiety Disorder" },
      { code: "F40.2", name: "Specific Phobia" },
    ],
    clinicalIndications: [
      "Emotion-driven avoidance behaviors",
      "Shame and guilt maintaining social withdrawal",
      "Anger dysregulation with aggressive action urges",
      "Depressive withdrawal and behavioral inactivation",
    ],
    contraindications: [
      "Justified emotions (e.g., fear in genuinely dangerous situations)",
      "Guilt about genuinely harmful behavior (use repair, not opposite action)",
      "Active psychosis affecting emotion identification",
    ],
    difficulty: "intermediate",
    targetCompletions: 15,
  },
  {
    id: "dbt-04",
    name: "DEAR MAN (Assertiveness)",
    modality: "dbt",
    domain: "interpersonal_effectiveness",
    domainLabel: "Interpersonal Effectiveness",
    description:
      "Use the DEAR MAN acronym to make effective requests or say no while maintaining self-respect and the relationship. Targets interpersonal dysfunction — a core feature of BPD (DSM-5 Criterion 2: unstable relationships) and social anxiety.",
    instructions: [
      "D — Describe: State the facts of the situation objectively, without judgments",
      "E — Express: Share your feelings using 'I' statements ('I feel ___ when ___')",
      "A — Assert: Clearly state what you want or need (be specific)",
      "R — Reinforce: Explain the positive effects of getting what you need (for both parties)",
      "M — Mindful: Stay focused on your goal; use 'broken record' technique if sidetracked",
      "A — Appear confident: Use a confident tone, make eye contact, stand/sit upright",
      "N — Negotiate: Be willing to give to get; offer alternative solutions",
      "Practice by writing out a DEAR MAN script before a difficult conversation",
    ],
    duration: "15-20 min (practice), varies (real situation)",
    frequency: "2-3x per week",
    evidenceBase: "Linehan, M.M. (2015). DBT Skills Training Manual, 2nd Edition. New York: Guilford Press",
    validationSource: "Linehan et al. (2015): interpersonal effectiveness skills are one of four core DBT modules with demonstrated efficacy; Neacsiu et al. (2014): IE skill use predicted improved social functioning",
    dsm5Targets: [
      { code: "F60.3", name: "Borderline Personality Disorder" },
      { code: "F40.10", name: "Social Anxiety Disorder" },
      { code: "F60.7", name: "Dependent Personality Disorder" },
    ],
    clinicalIndications: [
      "Difficulty asserting needs in relationships",
      "Pattern of unstable, intense relationships (BPD Criterion 2)",
      "Social anxiety with avoidance of confrontation",
      "People-pleasing patterns at expense of self-respect",
    ],
    contraindications: [
      "Situations involving domestic violence (safety planning takes priority)",
      "Assertiveness with actively psychotic individuals",
    ],
    difficulty: "intermediate",
    targetCompletions: 12,
  },
  {
    id: "dbt-05",
    name: "Radical Acceptance Practice",
    modality: "dbt",
    domain: "distress_tolerance",
    domainLabel: "Distress Tolerance",
    description:
      "Practice fully accepting reality as it is — without approval, resignation, or judgment — to reduce suffering caused by fighting unchangeable reality. Integrates Zen Buddhist principles with behavioral science.",
    instructions: [
      "Identify something you are struggling to accept (a loss, a diagnosis, a relationship ending)",
      "Notice the thoughts and body sensations that arise when you think about it",
      "Remind yourself: 'This is the reality right now. Fighting it only adds suffering on top of pain'",
      "Practice a half-smile and willing hands (palms up, fingers relaxed) — body posture influences emotion",
      "Repeat a coping statement: 'I can accept this moment as it is, even though I don't like it'",
      "If your mind wanders to non-acceptance, gently notice and return to acceptance",
      "Journal about what you noticed during the practice — what shifted?",
    ],
    duration: "10-15 min",
    frequency: "Daily",
    evidenceBase: "Linehan, M.M. (2015). DBT Skills Training Manual, 2nd Edition; Hayes, S.C. et al. (1999). Acceptance and Commitment Therapy",
    validationSource: "Berking et al. (2009): acceptance-based skills predicted treatment outcome in DBT; Gratz & Gunderson (2006): distress tolerance is a key deficit in BPD and a primary treatment target",
    dsm5Targets: [
      { code: "F60.3", name: "Borderline Personality Disorder" },
      { code: "F43.10", name: "Posttraumatic Stress Disorder" },
      { code: "F43.2", name: "Adjustment Disorders" },
      { code: "F34.1", name: "Persistent Depressive Disorder (Dysthymia)" },
    ],
    clinicalIndications: [
      "Chronic suffering from fighting unchangeable reality",
      "Grief and loss processing",
      "Trauma-related non-acceptance and bitterness",
      "Chronic pain acceptance",
    ],
    contraindications: [
      "Should not be used to accept ongoing abuse (safety planning needed)",
      "Not appropriate when the situation CAN be changed (use problem-solving instead)",
      "Acute trauma within 72 hours (allow natural processing first)",
    ],
    difficulty: "advanced",
    targetCompletions: 20,
  },
  {
    id: "dbt-06",
    name: "Emotion Surfing (Observe & Describe)",
    modality: "dbt",
    domain: "mindfulness",
    domainLabel: "Mindfulness",
    description:
      "Observe emotions as waves that rise, peak, and fall — without acting on them or suppressing them. Builds the core DBT mindfulness skills of Observe and Describe, targeting experiential avoidance across DSM-5 disorders.",
    instructions: [
      "When you notice a strong emotion, pause and step back mentally",
      "Name the emotion non-judgmentally: 'I notice I am feeling ___'",
      "Observe where you feel it in your body (chest tightness, stomach knot, throat constriction)",
      "Rate its intensity (0-10)",
      "Imagine the emotion as a wave — watch it rise without reacting",
      "Breathe steadily and let the wave peak naturally",
      "Notice as the intensity naturally decreases (emotions typically peak in 60-90 seconds)",
      "Re-rate the intensity and note how long the wave lasted",
    ],
    duration: "5-10 min",
    frequency: "As needed, practice daily",
    evidenceBase: "Linehan, M.M. (2015). DBT Skills Training Manual — Mindfulness Skills; Kabat-Zinn, J. (1990). Full Catastrophe Living: Using the Wisdom of Your Body and Mind to Face Stress, Pain, and Illness",
    validationSource: "Arch & Craske (2006): mindful emotion observation reduces emotional reactivity; Khoury et al. (2013) meta-analysis: mindfulness-based interventions effect size d=0.53 for anxiety, d=0.59 for depression",
    dsm5Targets: [
      { code: "F60.3", name: "Borderline Personality Disorder" },
      { code: "F41.1", name: "Generalized Anxiety Disorder" },
      { code: "F32", name: "Major Depressive Disorder" },
      { code: "F41.0", name: "Panic Disorder" },
    ],
    clinicalIndications: [
      "Emotional reactivity and impulsive responses to emotions",
      "Experiential avoidance (suppressing or escaping emotions)",
      "Alexithymia (difficulty identifying and describing emotions)",
      "Panic symptoms driven by fear of emotional sensations",
    ],
    contraindications: [
      "Severe dissociative episodes (may worsen with internal focus)",
      "Active substance intoxication",
      "Acute flashbacks in PTSD (use grounding techniques first)",
    ],
    difficulty: "beginner",
    targetCompletions: 30,
  },
  {
    id: "dbt-07",
    name: "ABC PLEASE (Vulnerability Reduction)",
    modality: "dbt",
    domain: "emotion_regulation",
    domainLabel: "Emotion Regulation",
    description:
      "Reduce emotional vulnerability by Accumulating positives, Building mastery, Coping ahead, and maintaining Physical health (PLEASE). Targets the biological and behavioral vulnerability factors that lower the threshold for emotional dysregulation.",
    instructions: [
      "A — Accumulate Positives: Do one pleasant activity today (short-term) and work toward one meaningful life goal (long-term)",
      "B — Build Mastery: Do one thing that gives you a sense of competence or achievement, even if small",
      "C — Cope Ahead: Identify an upcoming difficult situation and mentally rehearse coping with it effectively using specific skills",
      "PL — Treat PhysicaL Illness: Address any health concerns; take medications as prescribed",
      "E — Balance Eating: Eat regular, balanced meals; avoid skipping meals",
      "A — Avoid mood-Altering substances (alcohol, recreational drugs, excessive caffeine)",
      "S — Balance Sleep: Maintain consistent sleep/wake schedule (7-9 hours)",
      "E — Get Exercise: At least 20 minutes of moderate physical activity daily",
      "Track which elements you completed each day on your diary card",
    ],
    duration: "Ongoing throughout the day",
    frequency: "Daily",
    evidenceBase: "Linehan, M.M. (2015). DBT Skills Training Manual, 2nd Edition. New York: Guilford Press",
    validationSource: "Neacsiu et al. (2010): DBT emotion regulation skill use predicted significant reductions in depression and anxiety; Linehan et al. (2015): ABC PLEASE addresses biological vulnerability factors maintaining emotional dysregulation",
    dsm5Targets: [
      { code: "F60.3", name: "Borderline Personality Disorder" },
      { code: "F32", name: "Major Depressive Disorder" },
      { code: "F31", name: "Bipolar Disorder" },
      { code: "F10-F19", name: "Substance-Related and Addictive Disorders" },
    ],
    clinicalIndications: [
      "Emotional vulnerability due to poor self-care",
      "Sleep disruption exacerbating mood instability",
      "Substance use increasing emotional dysregulation",
      "Lack of positive experiences contributing to hopelessness",
    ],
    contraindications: [
      "Exercise component: consult physician for cardiac or orthopedic conditions",
      "Eating component: coordinate with treatment team for active eating disorders",
    ],
    difficulty: "beginner",
    targetCompletions: 28,
  },
  {
    id: "dbt-08",
    name: "Interpersonal Effectiveness Diary Card",
    modality: "dbt",
    domain: "interpersonal_effectiveness",
    domainLabel: "Interpersonal Effectiveness",
    description:
      "Track daily interpersonal interactions, skills used, and effectiveness ratings. Builds self-monitoring capacity for relationship patterns — targeting DSM-5 BPD Criterion 2 (unstable relationships) and social functioning deficits.",
    instructions: [
      "At the end of each day, identify one significant interpersonal interaction",
      "Describe the situation briefly and objectively",
      "Note which skill you used (DEAR MAN, GIVE, FAST) or wish you had used",
      "Rate your objective effectiveness: Did you get what you wanted? (0-5)",
      "Rate relationship effectiveness: Is the relationship intact or improved? (0-5)",
      "Rate self-respect effectiveness: Do you feel good about how you handled it? (0-5)",
      "Identify one specific thing you would do differently next time",
    ],
    duration: "10 min",
    frequency: "Daily",
    evidenceBase: "Linehan, M.M. (2015). DBT Skills Training Manual, 2nd Edition. New York: Guilford Press",
    validationSource: "Linehan et al. (2006): diary card completion is associated with better DBT outcomes; Harned et al. (2008): self-monitoring of interpersonal patterns is a key mechanism of change",
    dsm5Targets: [
      { code: "F60.3", name: "Borderline Personality Disorder" },
      { code: "F40.10", name: "Social Anxiety Disorder" },
      { code: "F60.7", name: "Dependent Personality Disorder" },
      { code: "F43.2", name: "Adjustment Disorders" },
    ],
    clinicalIndications: [
      "Pattern of unstable, intense interpersonal relationships",
      "Difficulty balancing own needs with relationship maintenance",
      "Poor self-monitoring of interpersonal behavior",
      "Social skills deficits contributing to isolation",
    ],
    contraindications: [
      "Active domestic violence situation (safety planning takes priority over skill tracking)",
      "Severe cognitive impairment preventing self-monitoring",
    ],
    difficulty: "intermediate",
    targetCompletions: 28,
  },
];

// ─── Quick CBT Exercises (Gamified, Patient Self-Service) ────────────

const QUICK_CBT_EXERCISES: TherapyExercise[] = [
  {
    id: "cbt-quick-thought-flip",
    name: "Thought Flip",
    modality: "cbt",
    domain: "cognitive_restructuring",
    domainLabel: "Cognitive Restructuring",
    description:
      "Quick, gamified cognitive restructuring exercise. Patient selects a negative automatic thought from common patterns and chooses a more balanced reframe. Tap-only interaction, under 60 seconds.",
    instructions: [
      "Patient selects a stuck negative thought from a 2×2 grid",
      "Patient picks a healthier reframe from 3 options",
      "Completion screen reinforces the skill with XP reward",
    ],
    duration: "< 1 min",
    frequency: "Daily or as needed",
    evidenceBase: "Beck, A.T. (1979). Cognitive Therapy of Depression — identifying and reframing automatic negative thoughts",
    validationSource: "Core CBT technique; simplified for adolescent engagement per Hofmann et al. (2012) meta-analysis showing large effect sizes for cognitive restructuring",
    dsm5Targets: [
      { code: "F32", name: "Major Depressive Disorder" },
      { code: "F33", name: "Major Depressive Disorder, Recurrent" },
      { code: "F41.1", name: "Generalized Anxiety Disorder" },
    ],
    clinicalIndications: [
      "Negative automatic thoughts",
      "Low motivation for longer exercises",
      "Early-stage CBT skill building",
      "Adolescent patients (ages 13-18)",
    ],
    contraindications: [
      "Active psychosis with impaired reality testing",
      "Acute suicidal crisis (stabilize first)",
    ],
    difficulty: "beginner",
    targetCompletions: 30,
  },
  {
    id: "cbt-quick-mood-boost",
    name: "Mood Boost",
    modality: "cbt",
    domain: "behavioral_activation",
    domainLabel: "Behavioral Activation",
    description:
      "Quick behavioral activation exercise. Patient selects a small positive activity and predicts how it might help their mood. Builds awareness of the activity-mood connection. Tap-only, under 60 seconds.",
    instructions: [
      "Patient picks a small doable activity from a 3×3 grid",
      "Patient predicts how the activity might help (calm, boost, connection)",
      "Completion screen encourages follow-through with XP reward",
    ],
    duration: "< 1 min",
    frequency: "Daily or as needed",
    evidenceBase: "Lewinsohn, P.M. (1974). Behavioral approach to depression — scheduling small positive activities to break avoidance-depression cycle",
    validationSource: "Behavioral activation demonstrated comparable efficacy to full CBT per Dimidjian et al. (2006); micro-activation approach adapted for adolescent engagement",
    dsm5Targets: [
      { code: "F32", name: "Major Depressive Disorder" },
      { code: "F33", name: "Major Depressive Disorder, Recurrent" },
      { code: "F43.2", name: "Adjustment Disorders" },
    ],
    clinicalIndications: [
      "Behavioral withdrawal and avoidance",
      "Low motivation and energy",
      "Early-stage behavioral activation",
      "Adolescent patients (ages 13-18)",
    ],
    contraindications: [
      "None significant for this brief intervention",
    ],
    difficulty: "beginner",
    targetCompletions: 30,
  },
];

// ─── Full Library ───────────────────────────────────────────────────

export const THERAPY_EXERCISE_LIBRARY: TherapyExercise[] = [
  ...CBT_EXERCISES,
  ...DBT_EXERCISES,
  ...QUICK_CBT_EXERCISES,
];

// ─── Mock Assigned Exercises (for demo) ─────────────────────────────

export function getMockAssignedExercises(patientName: string): AssignedExercise[] {
  const assignments: Record<string, string[]> = {
    "Sarah Mitchell": ["cbt-01", "cbt-04", "dbt-01", "dbt-06"],
    "James Rodriguez": ["cbt-03", "cbt-07", "dbt-02", "dbt-07"],
    "Emily Chen": ["cbt-05", "cbt-08", "dbt-03", "dbt-05"],
    "Marcus Johnson": ["cbt-01", "cbt-06", "dbt-04", "dbt-08"],
    "Aisha Patel": ["cbt-02", "cbt-04", "dbt-01", "dbt-03"],
  };

  const exerciseIds = assignments[patientName] ?? ["cbt-01", "dbt-01"];

  const results: AssignedExercise[] = [];
  for (const id of exerciseIds) {
    const exercise = THERAPY_EXERCISE_LIBRARY.find((e) => e.id === id);
    if (!exercise) continue;
    const completions = Math.floor(Math.random() * exercise.targetCompletions * 0.7);
    results.push({
      ...exercise,
      assignedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      assignedBy: "Dr. Provider",
      completionsThisPeriod: completions,
      lastCompletedAt:
        completions > 0
          ? new Date(Date.now() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000).toISOString()
          : null,
      patientNotes: null,
      status: "active",
    });
  }
  return results;
}
