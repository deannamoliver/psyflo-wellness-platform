/**
 * Treatment Plan Templates mapped to ICD-10 code prefixes
 * This file contains clinically appropriate treatment plan templates for common diagnoses.
 * Templates are version-controlled here; generated plans per student are stored in the database.
 */

export interface TreatmentGoal {
  id: string;
  description: string;
  measurableObjective: string;
  targetTimeframe: string;
}

export interface TreatmentPlanTemplate {
  codePrefix: string;
  codePrefixDescription: string;
  templateName: string;
  goals: TreatmentGoal[];
  suggestedInterventions: string[];
  recommendedSessionFrequency: string;
  estimatedDuration: string;
  clinicianNotes: string;
}

export const treatmentPlanTemplates: TreatmentPlanTemplate[] = [
  // F32 - Depressive Episode
  {
    codePrefix: "F32",
    codePrefixDescription: "Depressive Episode",
    templateName: "Major Depressive Episode Treatment Plan",
    goals: [
      {
        id: "f32-goal-1",
        description: "Reduce depressive symptoms",
        measurableObjective: "Decrease PHQ-9 score by 50% from baseline",
        targetTimeframe: "8-12 weeks",
      },
      {
        id: "f32-goal-2",
        description: "Improve daily functioning",
        measurableObjective: "Resume daily activities (work/school attendance, self-care) at least 5 days per week",
        targetTimeframe: "6-8 weeks",
      },
      {
        id: "f32-goal-3",
        description: "Establish healthy sleep patterns",
        measurableObjective: "Achieve 7-8 hours of sleep per night with sleep efficiency >85%",
        targetTimeframe: "4-6 weeks",
      },
      {
        id: "f32-goal-4",
        description: "Increase engagement in pleasurable activities",
        measurableObjective: "Participate in at least 3 enjoyable activities per week",
        targetTimeframe: "4-6 weeks",
      },
    ],
    suggestedInterventions: [
      "Cognitive Behavioral Therapy (CBT) for depression",
      "Behavioral Activation (BA)",
      "Mindfulness-Based Cognitive Therapy (MBCT)",
      "Psychoeducation on depression",
      "Sleep hygiene education",
      "Activity scheduling and monitoring",
      "Cognitive restructuring for negative thought patterns",
      "Medication management consultation if indicated",
    ],
    recommendedSessionFrequency: "Weekly sessions",
    estimatedDuration: "12-16 weeks",
    clinicianNotes: "Monitor for suicidal ideation at each session using C-SSRS or similar. Consider referral for psychiatric evaluation if symptoms are severe or not responding to therapy within 4-6 weeks. Coordinate care with prescriber if medication is involved.",
  },

  // F33 - Recurrent Depressive Disorder
  {
    codePrefix: "F33",
    codePrefixDescription: "Recurrent Depressive Disorder",
    templateName: "Recurrent Depression Management Plan",
    goals: [
      {
        id: "f33-goal-1",
        description: "Achieve symptom remission",
        measurableObjective: "Reduce PHQ-9 score to <5 (remission threshold)",
        targetTimeframe: "12-16 weeks",
      },
      {
        id: "f33-goal-2",
        description: "Develop relapse prevention skills",
        measurableObjective: "Create and practice personalized relapse prevention plan with identified early warning signs",
        targetTimeframe: "8-12 weeks",
      },
      {
        id: "f33-goal-3",
        description: "Build sustainable coping strategies",
        measurableObjective: "Demonstrate use of at least 5 evidence-based coping skills independently",
        targetTimeframe: "10-14 weeks",
      },
      {
        id: "f33-goal-4",
        description: "Establish maintenance routine",
        measurableObjective: "Maintain consistent engagement in protective activities (exercise, social connection, sleep hygiene) for 4+ consecutive weeks",
        targetTimeframe: "12-16 weeks",
      },
    ],
    suggestedInterventions: [
      "Cognitive Behavioral Therapy (CBT) for depression",
      "Mindfulness-Based Cognitive Therapy (MBCT) - especially indicated for recurrent depression",
      "Behavioral Activation (BA)",
      "Relapse prevention planning",
      "Interpersonal Therapy (IPT)",
      "Lifestyle medicine interventions (exercise, nutrition, sleep)",
      "Maintenance phase therapy planning",
      "Medication management coordination",
    ],
    recommendedSessionFrequency: "Weekly initially, transitioning to biweekly during maintenance",
    estimatedDuration: "16-24 weeks acute phase, followed by maintenance phase",
    clinicianNotes: "Given recurrent nature, emphasize MBCT which has strong evidence for preventing relapse. Plan for longer-term maintenance therapy. Coordinate closely with prescriber regarding medication continuation. Document previous episode history and treatment response.",
  },

  // F41 - Other Anxiety Disorders
  {
    codePrefix: "F41",
    codePrefixDescription: "Other Anxiety Disorders (GAD, Panic, Mixed)",
    templateName: "Anxiety Disorder Treatment Plan",
    goals: [
      {
        id: "f41-goal-1",
        description: "Reduce anxiety symptoms",
        measurableObjective: "Decrease GAD-7 score by 50% from baseline",
        targetTimeframe: "8-12 weeks",
      },
      {
        id: "f41-goal-2",
        description: "Decrease avoidance behaviors",
        measurableObjective: "Successfully engage in 3+ previously avoided situations using coping skills",
        targetTimeframe: "6-10 weeks",
      },
      {
        id: "f41-goal-3",
        description: "Develop anxiety management skills",
        measurableObjective: "Demonstrate proficiency in relaxation techniques (reduce physiological arousal within 5 minutes of practice)",
        targetTimeframe: "4-6 weeks",
      },
      {
        id: "f41-goal-4",
        description: "Reduce worry frequency and intensity",
        measurableObjective: "Decrease daily worry episodes from baseline by 75%",
        targetTimeframe: "10-12 weeks",
      },
    ],
    suggestedInterventions: [
      "Cognitive Behavioral Therapy (CBT) for anxiety",
      "Exposure therapy (graduated exposure hierarchy)",
      "Relaxation training (progressive muscle relaxation, diaphragmatic breathing)",
      "Cognitive restructuring for anxious thoughts",
      "Worry time and worry postponement techniques",
      "Interoceptive exposure (for panic symptoms)",
      "Mindfulness and acceptance-based strategies",
      "Psychoeducation on anxiety and the fight-flight response",
    ],
    recommendedSessionFrequency: "Weekly sessions",
    estimatedDuration: "12-16 weeks",
    clinicianNotes: "Create exposure hierarchy early in treatment. For panic disorder, include interoceptive exposures. Monitor for comorbid depression. Consider benzodiazepine taper coordination if applicable.",
  },

  // F43 - Reaction to Severe Stress and Adjustment Disorders
  {
    codePrefix: "F43",
    codePrefixDescription: "Stress Reactions and Adjustment Disorders",
    templateName: "Trauma and Adjustment Disorder Treatment Plan",
    goals: [
      {
        id: "f43-goal-1",
        description: "Process traumatic or stressful event",
        measurableObjective: "Decrease PCL-5 or IES-R score by 50% from baseline (for trauma); or decrease reported distress level from baseline by 50%",
        targetTimeframe: "8-16 weeks",
      },
      {
        id: "f43-goal-2",
        description: "Reduce intrusive symptoms",
        measurableObjective: "Decrease frequency of intrusive thoughts/memories to <2 per week",
        targetTimeframe: "8-12 weeks",
      },
      {
        id: "f43-goal-3",
        description: "Restore daily functioning",
        measurableObjective: "Return to pre-stressor level of functioning in work/school and relationships",
        targetTimeframe: "8-12 weeks",
      },
      {
        id: "f43-goal-4",
        description: "Develop adaptive coping",
        measurableObjective: "Identify and regularly use 4+ healthy coping strategies for stress management",
        targetTimeframe: "6-8 weeks",
      },
    ],
    suggestedInterventions: [
      "Trauma-Focused CBT (TF-CBT)",
      "Cognitive Processing Therapy (CPT)",
      "Prolonged Exposure (PE) therapy",
      "EMDR (Eye Movement Desensitization and Reprocessing)",
      "Supportive counseling and validation",
      "Grounding techniques for dissociation/flashbacks",
      "Stress inoculation training",
      "Problem-solving therapy for adjustment issues",
      "Safety planning if indicated",
    ],
    recommendedSessionFrequency: "Weekly sessions (may increase to twice weekly for intensive trauma processing)",
    estimatedDuration: "12-20 weeks depending on severity and trauma complexity",
    clinicianNotes: "Assess for PTSD criteria if trauma-related. Ensure adequate stabilization before trauma processing. Screen for dissociation. For adjustment disorders, focus on problem-solving and adaptation to stressor. Consider cultural factors in trauma response.",
  },

  // F90 - Attention-Deficit Hyperactivity Disorders
  {
    codePrefix: "F90",
    codePrefixDescription: "Attention-Deficit Hyperactivity Disorders (ADHD)",
    templateName: "ADHD Management Plan",
    goals: [
      {
        id: "f90-goal-1",
        description: "Improve attention and focus",
        measurableObjective: "Increase sustained attention on tasks to 30+ minutes using learned strategies",
        targetTimeframe: "8-12 weeks",
      },
      {
        id: "f90-goal-2",
        description: "Reduce impulsive behaviors",
        measurableObjective: "Decrease impulsive decision-making incidents by 75% as reported in self-monitoring log",
        targetTimeframe: "10-14 weeks",
      },
      {
        id: "f90-goal-3",
        description: "Develop organizational systems",
        measurableObjective: "Implement and maintain organizational system (planner, reminders, routines) with 80%+ consistency",
        targetTimeframe: "6-10 weeks",
      },
      {
        id: "f90-goal-4",
        description: "Improve academic/occupational functioning",
        measurableObjective: "Meet deadlines and complete assignments/tasks on time 90%+ of the time",
        targetTimeframe: "12-16 weeks",
      },
    ],
    suggestedInterventions: [
      "Psychoeducation on ADHD",
      "Cognitive Behavioral Therapy adapted for ADHD",
      "Executive function coaching",
      "Organizational skills training",
      "Time management strategies",
      "Behavioral strategies (self-monitoring, reward systems)",
      "Environmental modifications consultation",
      "Mindfulness training for attention",
      "Medication management coordination",
      "Academic/workplace accommodations consultation",
    ],
    recommendedSessionFrequency: "Weekly to biweekly sessions",
    estimatedDuration: "12-20 weeks for skill building, with optional maintenance",
    clinicianNotes: "Coordinate with prescriber if medication is part of treatment plan. Consider comorbid conditions (anxiety, depression common). May benefit from involving family/partner in treatment. Assess for learning disabilities if academic struggles persist.",
  },

  // R45 - Symptoms and Signs Involving Emotional State
  {
    codePrefix: "R45",
    codePrefixDescription: "Symptoms Involving Emotional State",
    templateName: "Emotional Regulation and Support Plan",
    goals: [
      {
        id: "r45-goal-1",
        description: "Clarify diagnostic picture",
        measurableObjective: "Complete comprehensive assessment to identify underlying conditions within 2-4 sessions",
        targetTimeframe: "2-4 weeks",
      },
      {
        id: "r45-goal-2",
        description: "Reduce emotional distress",
        measurableObjective: "Decrease self-reported emotional distress (0-10 scale) by at least 3 points",
        targetTimeframe: "6-8 weeks",
      },
      {
        id: "r45-goal-3",
        description: "Develop emotional regulation skills",
        measurableObjective: "Learn and apply 4+ emotion regulation strategies independently",
        targetTimeframe: "6-10 weeks",
      },
      {
        id: "r45-goal-4",
        description: "Identify triggers and patterns",
        measurableObjective: "Complete mood/behavior log identifying at least 5 triggering situations and associated patterns",
        targetTimeframe: "3-5 weeks",
      },
    ],
    suggestedInterventions: [
      "Comprehensive diagnostic assessment",
      "Supportive psychotherapy",
      "Emotion regulation skills training (DBT-informed)",
      "Psychoeducation on emotions and emotional health",
      "Mood and behavior monitoring/logging",
      "Distress tolerance skills",
      "Interpersonal effectiveness skills",
      "Referral for medical evaluation if somatic symptoms present",
      "Collaborative care coordination",
    ],
    recommendedSessionFrequency: "Weekly sessions during assessment and initial treatment",
    estimatedDuration: "8-12 weeks initial phase; duration may extend based on diagnostic clarification",
    clinicianNotes: "R45 codes indicate symptom-level presentation requiring further assessment. Prioritize diagnostic clarity early in treatment. Rule out medical causes for emotional symptoms. Update diagnosis code once clearer picture emerges. Consider screening tools (PHQ-9, GAD-7, PCL-5) to guide diagnosis.",
  },
];

/**
 * Retrieves treatment plan templates matching the given ICD-10 code via prefix matching.
 * For example, "F32.1" will match the "F32" template.
 *
 * @param icdCode - The ICD-10 diagnosis code (e.g., "F32.1", "F41.0", "R45.89")
 * @returns Array of matching TreatmentPlanTemplate objects, or empty array if no match
 */
export function getTemplatesForDiagnosis(icdCode: string): TreatmentPlanTemplate[] {
  if (!icdCode || typeof icdCode !== "string") {
    return [];
  }

  const normalizedCode = icdCode.toUpperCase().trim();

  return treatmentPlanTemplates.filter((template) => {
    const prefix = template.codePrefix.toUpperCase();
    return normalizedCode.startsWith(prefix);
  });
}

/**
 * Gets all available template code prefixes
 * @returns Array of code prefix strings
 */
export function getAvailableCodePrefixes(): string[] {
  return treatmentPlanTemplates.map((t) => t.codePrefix);
}

/**
 * Gets a template by its exact code prefix
 * @param prefix - The exact code prefix (e.g., "F32")
 * @returns The matching template or undefined
 */
export function getTemplateByPrefix(prefix: string): TreatmentPlanTemplate | undefined {
  const normalizedPrefix = prefix.toUpperCase().trim();
  return treatmentPlanTemplates.find((t) => t.codePrefix.toUpperCase() === normalizedPrefix);
}
