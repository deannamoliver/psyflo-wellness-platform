/**
 * Crisis resources message for immediate support
 */
export const CRISIS_RESOURCES_MESSAGE = `I want you to know that help is available right now:

🆘 **988 Suicide & Crisis Lifeline**
  • Call or text 988
  • Available 24/7
  • Free and confidential

💬 **Crisis Text Line**
  • Text HOME to 741741
  • Trained crisis counselors available

I've also notified your school counselor who will reach out to you soon. You're not alone in this.`;

/**
 * Follow-up message when student indicates past suicidal thoughts that have resolved
 * Used to explore what helped them get to a better place
 */
export const PAST_RESOLVED_FOLLOWUP =
  "I'm really glad to hear that things have gotten better for you. What helped you get to a place where it's not so hard these days?";

/**
 * Closing message after student shares what helped them recover
 * Acknowledges their resilience and keeps the door open for continued conversation
 */
export const PAST_RESOLVED_CLOSING =
  "Thank you for sharing that with me. It takes a lot of strength to work through hard times, and I'm glad you found what works for you.";

/**
 * Message for volatile/labile suicidality (feelings that come and go)
 * Acknowledges the pattern while ensuring support is available
 */
export const LABILE_ACKNOWLEDGMENT =
  "I hear that these feelings come and go for you. That can be really hard - not knowing when those thoughts might show up again. I want to make sure you have support during the tough times. Your school counselor will be reaching out to check in with you. In the meantime, I'm here if you want to keep talking.";

/**
 * Follow-up question to distinguish past_resolved from volatile
 * Asked when student indicates past suicidal thoughts to determine if they fluctuate
 */
export const LABILE_CHECK_QUESTION =
  "I'm glad things are better right now. Do these kinds of feelings tend to come and go for you, or was that more of a one-time thing?";

/**
 * CSSR (Columbia-Suicide Severity Rating Scale) Questions
 *
 * New structure: 7 sequential questions with branching at Q3
 * - Q1-Q5: Assess past month (now Q1-Q6)
 * - Q7: Lifetime behavioral assessment with 3-month follow-up
 *
 * Flow:
 * - Q1 → Q2 → Q3
 * - If Q3 = NO → Skip to Q7
 * - If Q3 = YES → Q4 → Q5 → Q6 → Q7
 * - If Q7 = YES → Q7 Follow-up (within past 3 months?)
 */
export const CSSR_QUESTIONS = {
  q1: {
    id: "q1",
    text: "Have you wished you could go to sleep and not wake up?",
    timeframe: "past_month",
    description: "Wish to sleep and not wake up",
  },
  q2: {
    id: "q2",
    text: "Have you wished you were dead?",
    timeframe: "past_month",
    description: "Wish to be dead",
  },
  q3: {
    id: "q3",
    text: "Have you actually had any thoughts of killing yourself?",
    timeframe: "past_month",
    description: "Thoughts of killing self - CRITICAL DECISION POINT",
  },
  q4: {
    id: "q4",
    text: "Have you been thinking about how you might do this?",
    timeframe: "past_month",
    description: "Method ideation",
    context:
      'E.g. "I thought about taking an overdose but I never made a specific plan as to when, where or how I would actually do it... and I would never go through with it."',
  },
  q5: {
    id: "q5",
    text: "Have you had these thoughts and had some intention of acting on them?",
    timeframe: "past_month",
    description: "Intent to act",
    context:
      'As opposed to "I have the thoughts but I definitely will not do anything about them."',
  },
  q6: {
    id: "q6",
    text: "Have you started to work out or worked out the details of how to kill yourself? Do you intend to carry out this plan?",
    timeframe: "past_month",
    description: "Plan with intent",
  },
  q7: {
    id: "q7",
    text: "Have you ever done anything, started to do anything, or prepared to do anything to end your life?",
    timeframe: "lifetime",
    description: "Lifetime suicidal behavior",
    context:
      "Examples: Collected pills, obtained a gun, gave away valuables, wrote a will or suicide note, took out pills but didn't swallow any, held a gun but changed your mind or it was grabbed from your hand, went to the roof but didn't jump; or actually took pills, tried to shoot yourself, cut yourself, tried to hang yourself, etc.",
  },
  q7Followup: {
    id: "q7Followup",
    text: "Was this within the past three months?",
    timeframe: "followup",
    description: "Recent behavioral assessment",
  },
};

/**
 * Type for CSSR question identifiers
 */
export type CSSRQuestionId =
  | "q1"
  | "q2"
  | "q3"
  | "q4"
  | "q5"
  | "q6"
  | "q7"
  | "q7Followup";

/**
 * Pattern types for ambiguous statements
 */
export type PatternType =
  | "finality"
  | "place"
  | "firearms"
  | "medication"
  | "chemicals"
  | "ligature"
  | "isolation_living"
  | "lethal_access_work"
  | "social_isolation"
  | "relationship_loss"
  | "financial_stress"
  | "bereavement"
  | "legal_issues"
  | "chronic_illness"
  | "suicide_exposure"
  | "trauma_anniversary"
  | "identity_crisis"
  | "substance_use"
  | "protective_loss";

/**
 * Clarification question templates for ambiguous patterns
 */
export const CLARIFICATION_PATTERNS: Record<
  PatternType,
  {
    description: string;
    questionA: (extracted: string) => string;
    questionB: string;
    questionC: string;
  }
> = {
  finality: {
    description:
      "Finality themes suggesting end or last time (e.g., 'last trip', 'won't be around')",
    questionA: (statement: string) =>
      `You mentioned ${statement || "something about this being your last or final time"}. What do you mean by that?`,
    questionB:
      "When you think about things being 'final' or 'the last time,' do thoughts about not wanting to be alive ever come up?",
    questionC:
      "Have you thought about ending your life, or made any plans to do so?",
  },

  place: {
    description: "Place-related references (heights, water, bridges, etc.)",
    questionA: (place: string) =>
      `You mentioned ${place} - can you tell me more about what that place means to you or why you've been thinking about it lately?`,
    questionB:
      "When you think about going there, do thoughts about harming yourself ever come up?",
    questionC:
      "Have you thought about going there with the intention of ending your life, or made any plans to do so?",
  },

  firearms: {
    description: "Recent access to firearms, ammunition, or blades",
    questionA: (item: string) =>
      `You mentioned having ${item}. How did you come across it, and what do you usually use it for?`,
    questionB:
      "When you think about having it, do any thoughts about hurting yourself or someone else ever come up?",
    questionC: "Have you thought about using it to try to hurt yourself?",
  },

  medication: {
    description: "Stockpiling medications (OTC or prescription)",
    questionA: (detail: string) =>
      `You mentioned having some extra medicine around${detail ? `-- ${detail}` : ""}. What's been going on with that?`,
    questionB:
      "Do you ever take more than the amount you're supposed to, or think about what would happen if you did?",
    questionC:
      "Have you thought about taking a lot of pills to try to hurt yourself?",
  },

  chemicals: {
    description: "Access to chemicals, pesticides, or toxins",
    questionA: (substance: string) =>
      `You mentioned being around ${substance}. What's that like for you?`,
    questionB:
      "Have you ever thought about using those in a way that could be dangerous to you?",
    questionC:
      "Have you ever made a plan to use those chemicals to hurt yourself?",
  },

  ligature: {
    description: "Access to ropes, cords, belts, or similar ligatures",
    questionA: (item: string) =>
      `You talked about finding ${item}. What do you usually use them for?`,
    questionB:
      "When you see them, do you ever think about hurting yourself with them?",
    questionC:
      "Have you thought about trying to use a rope or cord to hurt yourself?",
  },

  isolation_living: {
    description: "Change in living arrangements increasing isolation",
    questionA: (situation: string) =>
      `How has it been for you since you started living ${situation || "in your new environment"}?`,
    questionB:
      "When you're by yourself a lot, do tough thoughts or urges to hurt yourself come up more often?",
    questionC:
      "Have you thought about trying to hurt yourself now that you have more time alone?",
  },

  lethal_access_work: {
    description: "Work/volunteer with access to lethal materials",
    questionA: (context: string) =>
      `You mentioned working/volunteering where you have access to ${context || "certain tools or materials"}. What's it like having to use those?`,
    questionB:
      "Do you ever think about those things in a way that could be harmful to you?",
    questionC:
      "Have you thought about using what you have at work/volunteering to hurt yourself?",
  },

  social_isolation: {
    description: "Marked increase in isolation from friends, family, supports",
    questionA: (detail: string) =>
      `You mentioned that you've been spending more time by yourself${detail ? ` - ${detail}` : ""}. What's that been like for you?`,
    questionB:
      "When you're alone a lot, do hard or upsetting thoughts come up more often?",
    questionC:
      "When you're by yourself, have you ever thought about hurting yourself?",
  },

  relationship_loss: {
    description: "Breakup, divorce, or loss of significant relationship",
    questionA: (detail: string) =>
      `You mentioned ${detail || "some changes in your relationships"}. That can be really tough. How have things felt for you since that happened?`,
    questionB:
      "Has it made you feel like you don't want to be here, or like it's too hard to keep going?",
    questionC:
      "Have you thought about hurting yourself because of what happened?",
  },

  financial_stress: {
    description: "Parent job loss, financial ruin, or eviction",
    questionA: (detail: string) =>
      `It sounds like there's been a lot of stress ${detail ? `related to ${detail}` : "on your family"} at home. How has that been affecting you?`,
    questionB:
      "Do you ever feel like it's too much, or that you wish you could escape from it all?",
    questionC:
      "Have you thought about hurting yourself because of these stressors?",
  },

  bereavement: {
    description: "Recent bereavement (especially suicide bereavement)",
    questionA: (detail: string) =>
      `Losing someone close can really come as a shock${detail ? ` - ${detail}` : ""}. What has it been like for you since they passed?`,
    questionB:
      "Do you ever feel like you'd want to be with them, even if that meant not being here?",
    questionC: "Have you thought about hurting yourself since their death?",
  },

  legal_issues: {
    description: "Pending legal problems, arrests, or court dates",
    questionA: (detail: string) =>
      `Having legal stuff going on${detail ? ` - ${detail}` : ""} can feel really heavy. How has it been weighing on you?`,
    questionB:
      "Do you ever feel like you can't handle it or wish you didn't have to go through it?",
    questionC:
      "Have you thought about hurting yourself because of these stressors?",
  },

  chronic_illness: {
    description: "Student or caregiver with chronic illness",
    questionA: (detail: string) =>
      `Dealing with ongoing health stuff${detail ? ` - ${detail}` : ""} can be exhausting. What's that like for you (or your family)?`,
    questionB:
      "Do you ever feel like it's too much to handle or makes you not want to keep going?",
    questionC:
      "Have you thought about hurting yourself because of the illness or pain?",
  },

  suicide_exposure: {
    description: "Exposure to suicide in media or personal network",
    questionA: (detail: string) =>
      `You mentioned hearing about someone who died by suicide${detail ? ` - ${detail}` : ""}. How did that affect you?`,
    questionB:
      "When you think about their death, does it make you wonder about hurting yourself?",
    questionC:
      "Have you thought about hurting yourself after learning about their suicide?",
  },

  trauma_anniversary: {
    description: "Anniversary of a traumatic event",
    questionA: (detail: string) =>
      `You mentioned a recent anniversary ${detail || "of a traumatic event"}. Grief often comes in waves and can revisit us long after. How have you been feeling about all of this?`,
    questionB:
      "Do those memories ever make you feel like you can't keep going?",
    questionC:
      "Have you thought about hurting yourself around this time of the year?",
  },

  identity_crisis: {
    description:
      "Identity-related crises (gender, sexuality, cultural rejection)",
    questionA: (detail: string) =>
      `It sounds like you've been dealing with some challenges around how people see or accept you${detail ? ` - ${detail}` : ""}. What's that been like?`,
    questionB:
      "Do those feelings ever make you wish you didn't have to deal with life?",
    questionC:
      "Have you thought about hurting yourself because of feeling rejected or not accepted?",
  },

  substance_use: {
    description: "Increased use of alcohol or substances",
    questionA: (substance: string) =>
      `You mentioned using ${substance || "alcohol or substances"} more lately. What might have led to more use?`,
    questionB: "Do you ever use it to push away painful thoughts or feelings?",
    questionC:
      "Have you thought about hurting yourself when you're drinking or using?",
  },

  protective_loss: {
    description: "Sudden loss of protective factors",
    questionA: (detail: string) =>
      `It seems like you've had some big changes with people in your life${detail ? ` - ${detail}` : ""}. How's that been for you?`,
    questionB:
      "Does being without that support ever make you feel like you don't want to keep going?",
    questionC:
      "Have you thought about hurting yourself since losing this part of your support?",
  },
};

/**
 * Risk indicators for pattern detection
 */
export const RISK_INDICATORS = {
  direct: [
    "I want to kill myself",
    "I am planning to end my life",
    "I want to die",
    "I'm going to kill myself",
    "I should just die",
  ],

  indirect: {
    finality: [
      "I won't be around to see that",
      "This is my last",
      "final goodbye",
      "won't be here",
    ],
    hopelessness: [
      "Nothing's going to change",
      "It's not worth it anymore",
      "no point",
      "give up",
    ],
    burden: [
      "Everyone would be better off without me",
      "I'm just a burden",
      "waste of space",
    ],
    escape: [
      "I just want it all to stop",
      "sleep forever",
      "make it end",
      "want to disappear",
    ],
    death_curiosity: [
      "wonder what it's like to not exist",
      "curious about death",
      "what happens when you die",
    ],
  },

  ambiguous: {
    places: [
      "bridge",
      "roof",
      "cliff",
      "tall building",
      "parking garage",
      "train tracks",
      "subway platform",
    ],
    means: [
      "gun",
      "knife",
      "rope",
      "pills",
      "medication",
      "chemicals",
      "pesticide",
    ],
  },
};
