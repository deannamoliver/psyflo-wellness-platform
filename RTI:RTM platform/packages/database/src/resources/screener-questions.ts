import type { screenerSubtypeEnum, screenerTypeEnum } from "../schema/screener";

export type QuestionOption = {
  code: string;
  text: string;
  score: number;
};

export type ScreenerQuestion = {
  code: string;
  weight: number;
  text: string;
  options: QuestionOption[];
};

export type ScreenerQuestionSet = {
  part: number;
  minAge: number;
  maxAge: number;
  type: (typeof screenerTypeEnum.enumValues)[number];
  subtype: (typeof screenerSubtypeEnum.enumValues)[number];
  multiplier: number;
  questions: ScreenerQuestion[];
};

export const screenerQuestionSets: ScreenerQuestionSet[] = [
  // WCSD-SECA Day 2: Self-Awareness: Self-Concept
  {
    part: 2,
    minAge: 0,
    maxAge: 999,
    type: "sel",
    subtype: "sel_self_awareness_self_concept",
    multiplier: 1,
    questions: [
      {
        code: "SEL_SA_SC_1",
        weight: 1,
        text: "Knowing what my strengths are.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SA_SC_2",
        weight: 1,
        text: "Knowing how to get better at things that are hard for me to do at school.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SA_SC_3",
        weight: 1,
        text: "Knowing when I am wrong about something.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SA_SC_4",
        weight: 1,
        text: "Knowing when I can't control something.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
    ],
  },

  // WCSD-SECA Day 2: Self-Awareness: Emotion Knowledge
  {
    part: 2,
    minAge: 0,
    maxAge: 999,
    type: "sel",
    subtype: "sel_self_awareness_emotion_knowledge",
    multiplier: 1,
    questions: [
      {
        code: "SEL_SA_EK_1",
        weight: 1,
        text: "Knowing when my feelings are making it hard for me to focus.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SA_EK_2",
        weight: 1,
        text: "Knowing the emotions I feel.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SA_EK_3",
        weight: 1,
        text: "Knowing ways to make myself feel better when I'm sad.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SA_EK_4",
        weight: 1,
        text: "Noticing what my body does when I am nervous.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SA_EK_5",
        weight: 1,
        text: "Knowing when my mood affects how I treat others.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SA_EK_6",
        weight: 1,
        text: "Knowing ways I calm myself down.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
    ],
  },

  // WCSD-SECA Day 3: Social Awareness
  {
    part: 3,
    minAge: 0,
    maxAge: 999,
    type: "sel",
    subtype: "sel_social_awareness",
    multiplier: 1,
    questions: [
      {
        code: "SEL_SOC_1",
        weight: 1,
        text: "Learning from people with different opinions than me.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SOC_2",
        weight: 1,
        text: "Knowing what people may be feeling by the look on their face.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SOC_3",
        weight: 1,
        text: "Knowing when someone needs help.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SOC_4",
        weight: 1,
        text: "Knowing how to get help when I'm having trouble with a classmate.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SOC_5",
        weight: 1,
        text: "Knowing how my actions impact my classmates.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
    ],
  },

  // WCSD-SECA Day 3: Self-Management: Emotion Regulation
  {
    part: 3,
    minAge: 0,
    maxAge: 999,
    type: "sel",
    subtype: "sel_self_management_emotion_regulation",
    multiplier: 1,
    questions: [
      {
        code: "SEL_SM_ER_1",
        weight: 1,
        text: "Getting through something even when I feel frustrated.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SM_ER_2",
        weight: 1,
        text: "Being patient even when I am really excited.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SM_ER_3",
        weight: 1,
        text: "Staying calm when I feel stressed.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SM_ER_4",
        weight: 1,
        text: "Working on things even when I don't like them.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
    ],
  },

  // WCSD-SECA Day 4: Self-Management: Goal Management
  {
    part: 4,
    minAge: 0,
    maxAge: 999,
    type: "sel",
    subtype: "sel_self_management_goal_management",
    multiplier: 1,
    questions: [
      {
        code: "SEL_SM_GM_1",
        weight: 1,
        text: "Finishing tasks even if they are hard for me.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SM_GM_2",
        weight: 1,
        text: "Setting goals for myself.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SM_GM_3",
        weight: 1,
        text: "Reaching goals that I set for myself.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SM_GM_4",
        weight: 1,
        text: "Thinking through the steps it will take to reach my goal.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
    ],
  },

  // WCSD-SECA Day 4: Self-Management: School Work
  {
    part: 4,
    minAge: 0,
    maxAge: 999,
    type: "sel",
    subtype: "sel_self_management_school_work",
    multiplier: 1,
    questions: [
      {
        code: "SEL_SM_SW_1",
        weight: 1,
        text: "Doing my schoolwork even when I do not feel like it.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SM_SW_2",
        weight: 1,
        text: "Being prepared for tests.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SM_SW_3",
        weight: 1,
        text: "Working on assignments even when they are hard.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SM_SW_4",
        weight: 1,
        text: "Planning ahead so I can turn a project in on time.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SM_SW_5",
        weight: 1,
        text: "Finishing my schoolwork without reminders.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_SM_SW_6",
        weight: 1,
        text: "Staying focused in class even when there are distractions.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
    ],
  },

  // WCSD-SECA Day 5: Relationship Skills
  {
    part: 5,
    minAge: 0,
    maxAge: 999,
    type: "sel",
    subtype: "sel_relationship_skills",
    multiplier: 1,
    questions: [
      {
        code: "SEL_REL_1",
        weight: 1,
        text: "Respecting a classmate's opinions during a disagreement.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_REL_2",
        weight: 1,
        text: "Getting along with my classmates.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_REL_3",
        weight: 1,
        text: "Sharing what I am feeling with others.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_REL_4",
        weight: 1,
        text: "Talking to an adult when I have problems at school.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_REL_5",
        weight: 1,
        text: "Being welcoming to someone I don't usually eat lunch with.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_REL_6",
        weight: 1,
        text: "Getting along with my teachers.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
    ],
  },

  // WCSD-SECA Day 5: Responsible Decision-Making
  {
    part: 5,
    minAge: 0,
    maxAge: 999,
    type: "sel",
    subtype: "sel_responsible_decision_making",
    multiplier: 1,
    questions: [
      {
        code: "SEL_RDM_1",
        weight: 1,
        text: "Thinking about what might happen before making a decision.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_RDM_2",
        weight: 1,
        text: "Knowing what is right or wrong.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_RDM_3",
        weight: 1,
        text: "Thinking of different ways to solve a problem.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_RDM_4",
        weight: 1,
        text: 'Saying "no" to a friend who wants to break the rules.',
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
      {
        code: "SEL_RDM_5",
        weight: 1,
        text: "Helping to make my school a better place.",
        options: [
          { code: "1", text: "Very Difficult", score: 1 },
          { code: "2", text: "Difficult", score: 2 },
          { code: "3", text: "Easy", score: 3 },
          { code: "4", text: "Very Easy", score: 4 },
        ],
      },
    ],
  },

  // PHQ-A for ages 11-17
  {
    part: 1,
    minAge: 11,
    maxAge: 17,
    type: "phq_a",
    subtype: "phq_a",
    multiplier: 1,
    questions: [
      {
        code: "PHQA_1",
        weight: 1,
        text: "Feeling down, depressed, irritable, or hopeless?",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "PHQA_2",
        weight: 1,
        text: "Little interest or pleasure in doing things?",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "PHQA_3",
        weight: 1,
        text: "Trouble falling asleep, staying asleep, or sleeping too much?",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "PHQA_4",
        weight: 1,
        text: "Poor appetite, weight loss, or overeating?",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "PHQA_5",
        weight: 1,
        text: "Feeling tired, or having little energy?",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "PHQA_6",
        weight: 1,
        text: "Feeling bad about yourself—or feeling that you are a failure, or that you have let yourself or your family down?",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "PHQA_7",
        weight: 1,
        text: "Trouble concentrating on things like school work, reading, or watching TV?",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "PHQA_8",
        weight: 1,
        text: "Moving or speaking so slowly that other people could have noticed? Or the opposite—being so fidgety or restless that you were moving around a lot more than usual?",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "PHQA_9",
        weight: 1,
        text: "Thoughts that you would be better off dead, or of hurting yourself in some way?",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
    ],
  },

  // PHQ-9 for ages 18+
  {
    part: 1,
    minAge: 18,
    maxAge: 999,
    type: "phq_9",
    subtype: "phq_9",
    multiplier: 1,
    questions: [
      {
        code: "PHQ9_1",
        weight: 1,
        text: "Little interest or pleasure in doing things.",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "PHQ9_2",
        weight: 1,
        text: "Feeling down, depressed, or hopeless.",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "PHQ9_3",
        weight: 1,
        text: "Trouble falling asleep, staying asleep, or sleeping too much",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "PHQ9_4",
        weight: 1,
        text: "Feeling tired or having little energy.",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "PHQ9_5",
        weight: 1,
        text: "Poor appetite or overeating.",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "PHQ9_6",
        weight: 1,
        text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down.",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "PHQ9_7",
        weight: 1,
        text: "Trouble concentrating on things, such as reading the newspaper or watching television.",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "PHQ9_8",
        weight: 1,
        text: "Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual.",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "PHQ9_9",
        weight: 1,
        text: "Thoughts that you would be better off dead, or of hurting yourself in some way.",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
    ],
  },

  // GAD-Child for ages 11-17
  {
    part: 1,
    minAge: 11,
    maxAge: 17,
    type: "gad_child",
    subtype: "gad_child",
    multiplier: 1,
    questions: [
      {
        code: "GADC_1",
        weight: 1,
        text: "felt moments of sudden terror, fear, or fright",
        options: [
          { code: "0", text: "Never", score: 0 },
          { code: "1", text: "Occasionally", score: 1 },
          { code: "2", text: "Half of the time", score: 2 },
          { code: "3", text: "Most of the time", score: 3 },
          { code: "4", text: "All of the time", score: 4 },
        ],
      },
      {
        code: "GADC_2",
        weight: 1,
        text: "felt anxious, worried, or nervous",
        options: [
          { code: "0", text: "Never", score: 0 },
          { code: "1", text: "Occasionally", score: 1 },
          { code: "2", text: "Half of the time", score: 2 },
          { code: "3", text: "Most of the time", score: 3 },
          { code: "4", text: "All of the time", score: 4 },
        ],
      },
      {
        code: "GADC_3",
        weight: 1,
        text: "had thoughts of bad things happening, such as family tragedy, ill health, loss of a job, or accidents",
        options: [
          { code: "0", text: "Never", score: 0 },
          { code: "1", text: "Occasionally", score: 1 },
          { code: "2", text: "Half of the time", score: 2 },
          { code: "3", text: "Most of the time", score: 3 },
          { code: "4", text: "All of the time", score: 4 },
        ],
      },
      {
        code: "GADC_4",
        weight: 1,
        text: "felt a racing heart, sweaty, trouble breathing, faint, or shaky",
        options: [
          { code: "0", text: "Never", score: 0 },
          { code: "1", text: "Occasionally", score: 1 },
          { code: "2", text: "Half of the time", score: 2 },
          { code: "3", text: "Most of the time", score: 3 },
          { code: "4", text: "All of the time", score: 4 },
        ],
      },
      {
        code: "GADC_5",
        weight: 1,
        text: "felt tense muscles, felt on edge or restless, or had trouble relaxing or trouble sleeping",
        options: [
          { code: "0", text: "Never", score: 0 },
          { code: "1", text: "Occasionally", score: 1 },
          { code: "2", text: "Half of the time", score: 2 },
          { code: "3", text: "Most of the time", score: 3 },
          { code: "4", text: "All of the time", score: 4 },
        ],
      },
      {
        code: "GADC_6",
        weight: 1,
        text: "avoided, or did not approach or enter, situations about which I worry",
        options: [
          { code: "0", text: "Never", score: 0 },
          { code: "1", text: "Occasionally", score: 1 },
          { code: "2", text: "Half of the time", score: 2 },
          { code: "3", text: "Most of the time", score: 3 },
          { code: "4", text: "All of the time", score: 4 },
        ],
      },
      {
        code: "GADC_7",
        weight: 1,
        text: "left situations early or participated only minimally due to worries",
        options: [
          { code: "0", text: "Never", score: 0 },
          { code: "1", text: "Occasionally", score: 1 },
          { code: "2", text: "Half of the time", score: 2 },
          { code: "3", text: "Most of the time", score: 3 },
          { code: "4", text: "All of the time", score: 4 },
        ],
      },
      {
        code: "GADC_8",
        weight: 1,
        text: "spent lots of time making decisions, putting off making decisions, or preparing for situations, due to worries",
        options: [
          { code: "0", text: "Never", score: 0 },
          { code: "1", text: "Occasionally", score: 1 },
          { code: "2", text: "Half of the time", score: 2 },
          { code: "3", text: "Most of the time", score: 3 },
          { code: "4", text: "All of the time", score: 4 },
        ],
      },
      {
        code: "GADC_9",
        weight: 1,
        text: "sought reassurance from others due to worries",
        options: [
          { code: "0", text: "Never", score: 0 },
          { code: "1", text: "Occasionally", score: 1 },
          { code: "2", text: "Half of the time", score: 2 },
          { code: "3", text: "Most of the time", score: 3 },
          { code: "4", text: "All of the time", score: 4 },
        ],
      },
      {
        code: "GADC_10",
        weight: 1,
        text: "needed help to cope with anxiety (e.g., alcohol or medication, superstitious objects, or other people)",
        options: [
          { code: "0", text: "Never", score: 0 },
          { code: "1", text: "Occasionally", score: 1 },
          { code: "2", text: "Half of the time", score: 2 },
          { code: "3", text: "Most of the time", score: 3 },
          { code: "4", text: "All of the time", score: 4 },
        ],
      },
    ],
  },

  // GAD-7 for ages 18+
  {
    part: 1,
    minAge: 18,
    maxAge: 999,
    type: "gad_7",
    subtype: "gad_7",
    multiplier: 1,
    questions: [
      {
        code: "GAD7_1",
        weight: 1,
        text: "Feeling nervous, anxious, or on edge.",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "GAD7_2",
        weight: 1,
        text: "Not being able to stop or control worrying.",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "GAD7_3",
        weight: 1,
        text: "Worrying too much about different things.",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "GAD7_4",
        weight: 1,
        text: "Trouble relaxing.",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "GAD7_5",
        weight: 1,
        text: "Being so restless that it is hard to sit still.",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "GAD7_6",
        weight: 1,
        text: "Becoming easily annoyed or irritable.",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
      {
        code: "GAD7_7",
        weight: 1,
        text: "Feeling afraid as if something awful might happen.",
        options: [
          { code: "0", text: "Not at all", score: 0 },
          { code: "1", text: "Several days", score: 1 },
          { code: "2", text: "More than half the days", score: 2 },
          { code: "3", text: "Nearly every day", score: 3 },
        ],
      },
    ],
  },
];
