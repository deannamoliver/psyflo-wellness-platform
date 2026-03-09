export const selSkills = [
  // Cognitive
  "attention_control",
  "working_memory",
  "planning",
  "inhibitory_control",
  "cognitive_flexibility",
  "critical_thinking",

  // Emotion
  "emotion_knowledge_expression",
  "emotion_behavior_regulation",
  "empathy_perspective_taking",

  // Social
  "understanding_social_cues",
  "conflict_resolution_social_problem_solving",
  "prosocial_cooperative_behavior_teamwork",
  "prosocial_cooperative_behavior_friendship",

  // Values
  "ethical_values_doing_right",
  "performance_values",
  "intellectual_values",
  "civic_values",
  "ethical_values_responsibility",

  // Perspectives
  "optimism",
  "gratitude",
  "openness",
  "enthusiasm_zest",

  // Identity
  "self_knowledge",
  "purpose",
  "self_efficacy_growth_mindset",
  "self_esteem",
] as const;

export type SELSkill = (typeof selSkills)[number];

export const questionCodeToSkillMap: Record<string, SELSkill> = {
  "SEL.C1.E": "attention_control",
  "SEL.C1.M": "attention_control",
  "SEL.C1.H": "attention_control",

  "SEL.C2.E": "working_memory",
  "SEL.C2.M": "working_memory",
  "SEL.C2.H": "working_memory",

  "SEL.C3.E": "planning",
  "SEL.C3.M": "planning",
  "SEL.C3.H": "planning",

  "SEL.C4.E": "inhibitory_control",
  "SEL.C4.M": "inhibitory_control",
  "SEL.C4.H": "inhibitory_control",

  "SEL.C5.E": "cognitive_flexibility",
  "SEL.C5": "cognitive_flexibility",
  "SEL.C5.H": "cognitive_flexibility",

  "SEL.C6.E": "critical_thinking",
  "SEL.C6.M": "critical_thinking",
  "SEL.C6.H": "critical_thinking",

  "SEL.E1.E": "emotion_knowledge_expression",
  "SEL.E1.M": "emotion_knowledge_expression",
  "SEL.E1.H": "emotion_knowledge_expression",

  "SEL.E2.E": "emotion_behavior_regulation",
  "SEL.E2.M": "emotion_behavior_regulation",
  "SEL.E2.H": "emotion_behavior_regulation",

  "SEL.E3.E": "empathy_perspective_taking",
  "SEL.E3.M": "empathy_perspective_taking",
  "SEL.E3.H": "empathy_perspective_taking",

  "SEL.S1.E": "understanding_social_cues",
  "SEL.S1.M": "understanding_social_cues",
  "SEL.S1.H": "understanding_social_cues",

  "SEL.S2.E": "conflict_resolution_social_problem_solving",
  "SEL.S2.M": "conflict_resolution_social_problem_solving",
  "SEL.S2.H": "conflict_resolution_social_problem_solving",

  "SEL.S3.M": "prosocial_cooperative_behavior_teamwork",
  "SEL.S3.H": "prosocial_cooperative_behavior_teamwork",

  "SEL.S4.E": "prosocial_cooperative_behavior_friendship",
  "SEL.S4.M": "prosocial_cooperative_behavior_friendship",
  "SEL.S4.H": "prosocial_cooperative_behavior_friendship",

  "SEL.V1.E": "ethical_values_doing_right",
  "SEL.V1.M": "ethical_values_doing_right",
  "SEL.V1.H": "ethical_values_doing_right",

  "SEL.V2.E": "performance_values",
  "SEL.V2.M": "performance_values",
  "SEL.V2.H": "performance_values",

  "SEL.V3.E": "intellectual_values",
  "SEL.V3.M": "intellectual_values",
  "SEL.V3.H": "intellectual_values",

  "SEL.V4.E": "civic_values",
  "SEL.V4.M": "civic_values",
  "SEL.V4.H": "civic_values",

  "SEL.V5.E": "ethical_values_responsibility",
  "SEL.V5.M": "ethical_values_responsibility",
  "SEL.V5.H": "ethical_values_responsibility",

  "SEL.P1.E": "optimism",
  "SEL.P1.M": "optimism",
  "SEL.P1.H": "optimism",

  "SEL.P2.E": "gratitude",
  "SEL.P2.M": "gratitude",
  "SEL.P2.H": "gratitude",

  "SEL.P3.E": "openness",
  "SEL.P3.M": "openness",
  "SEL.P3.H": "openness",

  "SEL.P4.E": "enthusiasm_zest",
  "SEL.P4.M": "enthusiasm_zest",
  "SEL.P4.H": "enthusiasm_zest",

  "SEL.I1.E": "self_knowledge",
  "SEL.I1.M": "self_knowledge",
  "SEL.I1.H": "self_knowledge",

  "SEL.I2.E": "purpose",
  "SEL.I2.M": "purpose",
  "SEL.I2.H": "purpose",

  "SEL.I3.E": "self_efficacy_growth_mindset",
  "SEL.I3.M": "self_efficacy_growth_mindset",
  "SEL.I3.H": "self_efficacy_growth_mindset",

  "SEL.I4.E": "self_esteem",
  "SEL.I4.M": "self_esteem",
  "SEL.I4.H": "self_esteem",
};

export const selDomainToSkillsMap: Record<string, SELSkill[]> = {
  cognitive: [
    "attention_control",
    "working_memory",
    "planning",
    "inhibitory_control",
    "cognitive_flexibility",
    "critical_thinking",
  ],
  emotion: [
    "emotion_knowledge_expression",
    "emotion_behavior_regulation",
    "empathy_perspective_taking",
  ],
  social: [
    "understanding_social_cues",
    "conflict_resolution_social_problem_solving",
    "prosocial_cooperative_behavior_teamwork",
    "prosocial_cooperative_behavior_friendship",
  ],
  values: [
    "ethical_values_doing_right",
    "performance_values",
    "intellectual_values",
    "civic_values",
    "ethical_values_responsibility",
  ],
  perspective: ["optimism", "gratitude", "openness", "enthusiasm_zest"],
  identity: [
    "self_knowledge",
    "purpose",
    "self_efficacy_growth_mindset",
    "self_esteem",
  ],
};

export const skillToNameMap: Record<string, string> = {
  attention_control: "Attention Control",
  working_memory: "Working Memory",
  planning: "Planning",
  inhibitory_control: "Inhibitory Control",
  cognitive_flexibility: "Cognitive Flexibility",
  critical_thinking: "Critical Thinking",

  emotion_knowledge_expression: "Emotion Knowledge & Expression",
  emotion_behavior_regulation: "Emotion & Behavior Regulation",
  empathy_perspective_taking: "Empathy & Perspective-taking",

  understanding_social_cues: "Understanding Social Cues",
  conflict_resolution_social_problem_solving:
    "Conflict Resolution & Social Problem-solving",
  prosocial_cooperative_behavior_teamwork:
    "Prosocial & Cooperative Behavior (Teamwork)",
  prosocial_cooperative_behavior_friendship:
    "Prosocial & Cooperative Behavior (Friendship)",

  ethical_values_doing_right: "Ethical Values (Doing Right)",
  performance_values: "Performance Values",
  intellectual_values: "Intellectual Values",
  civic_values: "Civic Values",
  ethical_values_responsibility: "Ethical Values (Responsibility)",

  optimism: "Optimism",
  gratitude: "Gratitude",
  openness: "Openness",
  enthusiasm_zest: "Enthusiasm/Zest",

  self_knowledge: "Self-knowledge",
  purpose: "Purpose",
  self_efficacy_growth_mindset: "Self-efficacy & Growth Mindset",
  self_esteem: "Self-esteem",
};
