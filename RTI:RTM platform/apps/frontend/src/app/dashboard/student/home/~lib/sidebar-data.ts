export const MOOD_NAMES = [
  "calm",
  "happy",
  "surprised",
  "sad",
  "angry",
  "afraid",
  "bad",
  "disgusted",
  "proud",
  "lonely",
] as const;

export type MoodName = (typeof MOOD_NAMES)[number];

/** Maps specificEmotion (from check-in) to the MoodName used for display SVGs. */
const SPECIFIC_EMOTION_TO_MOOD: Record<string, MoodName> = {
  joyful: "happy",
  hurt: "sad",
  excited: "surprised",
  mad: "angry",
  confident: "proud",
  worried: "afraid",
  peaceful: "calm",
  lonely: "lonely",
};

export const MOOD_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export type ExploreTopic = {
  id: number;
  title: string;
  icon: string;
  subcategories?: {
    id: number;
    title: string;
    description: string;
    icon: string;
    comingSoon?: boolean;
  }[];
};

export type TrendingTopic = {
  id: number;
  category: string;
  title: string;
  count: number;
  moods: [MoodName, MoodName];
};

export const EXPLORE_TOPICS: ExploreTopic[] = [
  {
    id: 1,
    title: "Moods & Emotions",
    icon: "/images/icons/01_moods_and_emotions.svg",
    subcategories: [
      {
        id: 101,
        title: "Anxiety & Panic",
        description:
          "Learn what anxiety feels like, what panic can look like, and ways to calm your body fast.",
        icon: "/images/icons/anxiety-panic.svg",
      },
      {
        id: 102,
        title: "Stress & Burnout",
        description: "Spot stress overload and reset before you feel drained, exhausted, or checked out.",
        icon: "/images/icons/stress-burnout.svg",
      },
      {
        id: 103,
        title: "Sadness & Low Mood",
        description: "Understand sadness, what can make it worse, and how to get support and feel better.",
        icon: "/images/icons/sadness-low-mood.svg",
      },
      {
        id: 104,
        title: "Anger & Calming Down",
        description: "Notice anger triggers and practice steps to cool down without blowing up.",
        icon: "/images/icons/anger-calming-down.svg",
      },
      {
        id: 105,
        title: "Coping with Big Feelings",
        description: "Build tools to handle intense emotions safely and get back to feeling steady.",
        icon: "/images/icons/coping-big-feelings.svg",
      },
      {
        id: 106,
        title: "Understanding Emotions",
        description: "Learn to name, recognize, and understand your emotions and why they happen.",
        icon: "/images/icons/understanding-emotions.svg",
      },
    ],
  },
  {
    id: 2,
    title: "Self-Control, Impulses, & Choices",
    icon: "/images/icons/02_self_control_impulses_choices.svg",
    subcategories: [
      {
        id: 204,
        title: "Classroom Disruption & Getting in Trouble",
        description:
          "Work on staying focused in class and repairing when things go wrong.",
        icon: "/images/icons/classroom-disruption.svg",
      },
      {
        id: 201,
        title: "Impulsivity, Urges, & Decision-Making",
        description: "Understand urges and impulses and build skills to pause and make better choices.",
        icon: "/images/icons/impulsivity-decision-making.svg",
      },
      {
        id: 202,
        title: "Peer Pressure & Risky Choices",
        description: "Navigate peer pressure and make choices that feel right for you.",
        icon: "/images/icons/peer-pressure.svg",
      },
      {
        id: 203,
        title: "Substance Use & Vaping",
        description: "Get clear on the risks and how to stay safe around substances and vaping.",
        icon: "/images/icons/substance-use.svg",
      },
    ],
  },
  {
    id: 3,
    title: "Focus & Productivity",
    icon: "/images/icons/03_focus_and_productivity.svg",
    subcategories: [
      {
        id: 301,
        title: "Focus & Distractibility",
        description: "Improve focus and manage distractions so you can get things done.",
        icon: "/images/icons/focus-distractibility.svg",
      },
      {
        id: 302,
        title: "Procrastination & Avoidance",
        description: "Understand why we put things off and how to start and keep going.",
        icon: "/images/icons/procrastination.svg",
      },
      {
        id: 303,
        title: "Getting Organized & Study Skills",
        description: "Build organization and study habits that work for you.",
        icon: "/images/icons/organization-study-skills.svg",
      },
      {
        id: 304,
        title: "Problem Solving",
        description: "Break down problems and find step-by-step ways to solve them.",
        icon: "/images/icons/problem-solving.svg",
      },
    ],
  },
  {
    id: 4,
    title: "Friends & Social",
    icon: "/images/icons/04_friends_and_social.svg",
    subcategories: [
      {
        id: 401,
        title: "Friend Drama",
        description: "Navigate arguments, fallouts, and drama with friends in healthier ways.",
        icon: "/images/icons/friend-drama.svg",
      },
      {
        id: 402,
        title: "Loneliness & Isolation",
        description: "Cope with feeling alone and find ways to connect and belong.",
        icon: "/images/icons/loneliness-isolation.svg",
      },
      {
        id: 403,
        title: "Making Friends & Social Confidence",
        description: "Build confidence to meet new people and deepen friendships.",
        icon: "/images/icons/making-friends.svg",
      },
      {
        id: 404,
        title: "Social Media & Digital Wellness",
        description: "Use social media in ways that support your mood and relationships.",
        icon: "/images/icons/social-media.svg",
      },
    ],
  },
  {
    id: 5,
    title: "Family & Home",
    icon: "/images/icons/05_family_and_home.svg",
    subcategories: [
      {
        id: 501,
        title: "Family Conflict",
        description: "Navigate arguments and tension at home in healthier ways.",
        icon: "/images/icons/family-conflict.svg",
      },
      {
        id: 502,
        title: "Expectations & Feeling Misunderstood",
        description: "Deal with family expectations and feeling like no one gets you.",
        icon: "/images/icons/expectations.svg",
      },
      {
        id: 503,
        title: "Household Changes",
        description: "Cope with big changes at home like moving, divorce, or new family members.",
        icon: "/images/icons/household-changes.svg",
      },
      {
        id: 504,
        title: "Financial Stress",
        description: "Handle stress about money and family finances.",
        icon: "/images/icons/financial-stress.svg",
      },
    ],
  },
  {
    id: 6,
    title: "Relationships & Dating",
    icon: "/images/icons/06_relationships_and_dating.svg",
    subcategories: [
      {
        id: 601,
        title: "Crushes, Rejection, & Breakups",
        description: "Handle crushes, rejection, and breakups in healthy ways.",
        icon: "/images/icons/crushes-rejection-breakups.svg",
      },
      {
        id: 602,
        title: "Healthy vs. Unhealthy Relationships",
        description: "Tell the difference between healthy and unhealthy relationships.",
        icon: "/images/icons/healthy-relationships.svg",
      },
      {
        id: 603,
        title: "Boundaries & Consent",
        description: "Set boundaries and understand consent in relationships.",
        icon: "/images/icons/boundaries-consent.svg",
      },
    ],
  },
  {
    id: 7,
    title: "Conflict & Bullying",
    icon: "/images/icons/07_conflict_and_bullying.svg",
    subcategories: [
      {
        id: 701,
        title: "Conflict, Fights, & Resolution",
        description: "Handle disagreements and fights in healthier ways and find resolution.",
        icon: "/images/icons/conflict-resolution.svg",
      },
      {
        id: 702,
        title: "Bullying & Cyberbullying",
        description: "Recognize bullying and cyberbullying and know what to do and who can help.",
        icon: "/images/icons/bullying-cyberbullying.svg",
      },
      {
        id: 703,
        title: "Standing Up for Yourself",
        description: "Build confidence to speak up and set boundaries when others cross the line.",
        icon: "/images/icons/standing-up.svg",
      },
    ],
  },
  {
    id: 8,
    title: "Identity & Self-Worth",
    icon: "/images/icons/08_identity_and_self_worth.svg",
    subcategories: [
      {
        id: 801,
        title: "Self-Esteem & Self-Talk",
        description: "Build a kinder inner voice and feel better about yourself.",
        icon: "/images/icons/self-esteem.svg",
      },
      {
        id: 802,
        title: "Body Image",
        description: "Feel more at peace with your body and handle pressure about how you look.",
        icon: "/images/icons/body-image.svg",
      },
      {
        id: 803,
        title: "Identity & Values",
        description: "Explore who you are and what matters most to you.",
        icon: "/images/icons/identity-values.svg",
      },
      {
        id: 804,
        title: "Cultural Identity & Stereotypes",
        description: "Honor your background and push back on stereotypes.",
        icon: "/images/icons/cultural-identity.svg",
      },
      {
        id: 805,
        title: "Self-Expression",
        description: "Express yourself in ways that feel true to you.",
        icon: "/images/icons/self-expression.svg",
      },
    ],
  },
  {
    id: 9,
    title: "My Body, Health & Energy",
    icon: "/images/icons/09_my_body_health_energy.svg",
    subcategories: [
      {
        id: 901,
        title: "Sleep, Energy, & Rest",
        description: "Understand your sleep and energy patterns and find ways to rest and recharge.",
        icon: "/images/icons/sleep-energy.svg",
      },
      {
        id: 902,
        title: "Eating & Food Struggles",
        description: "Navigate challenges with food, eating habits, and your relationship with meals.",
        icon: "/images/icons/eating-food.svg",
      },
      {
        id: 903,
        title: "Physical Health & Movement",
        description: "Take care of your body through movement, activity, and physical wellness.",
        icon: "/images/icons/physical-health.svg",
      },
    ],
  },
  {
    id: 10,
    title: "Life Changes & Transitions",
    icon: "/images/icons/10_life_changes_transitions.svg",
    subcategories: [
      {
        id: 1001,
        title: "Grief & Loss",
        description: "Process grief and loss at your own pace and find support along the way.",
        icon: "/images/icons/grief-loss.svg",
      },
      {
        id: 1002,
        title: "School Transitions",
        description: "Handle the stress of changing schools, new environments, and fresh starts.",
        icon: "/images/icons/school-transitions.svg",
      },
      {
        id: 1003,
        title: "Family Changes",
        description: "Cope with shifts in your family like divorce, moving, or new family dynamics.",
        icon: "/images/icons/family-changes.svg",
      },
      {
        id: 1004,
        title: "College & Future Anxiety",
        description: "Manage worries about college, career choices, and what comes next.",
        icon: "/images/icons/college-future-anxiety.svg",
      },
    ],
  },
  {
    id: 11,
    title: "How To Communicate",
    icon: "/images/icons/11_communication.svg",
    subcategories: [
      {
        id: 1101,
        title: "Speaking Up & Setting Boundaries",
        description: "Say what you need and set clear boundaries with others.",
        icon: "/images/icons/speaking-up-boundaries.svg",
      },
      {
        id: 1102,
        title: "Difficult Conversations & Expressing Feelings",
        description: "Have hard conversations and express your feelings in healthy ways.",
        icon: "/images/icons/difficult-conversations.svg",
      },
      {
        id: 1103,
        title: "Asking for Help",
        description: "Know when and how to ask for help from adults and peers.",
        icon: "/images/icons/asking-for-help.svg",
      },
      {
        id: 1104,
        title: "Active Listening",
        description: "Listen in a way that helps others feel heard and strengthens connection.",
        icon: "/images/icons/active-listening.svg",
      },
    ],
  },
  {
    id: 12,
    title: "Repair & Accountability",
    icon: "/images/icons/12_repair_and_accountability.svg",
    subcategories: [
      {
        id: 1201,
        title: "Guilt & Shame",
        description: "Handle guilt and shame in healthy ways without getting stuck.",
        icon: "/images/icons/guilt-shame.svg",
      },
      {
        id: 1202,
        title: "Apologizing & Making Amends",
        description: "Give a real apology and take steps to make things right.",
        icon: "/images/icons/apologizing.svg",
      },
      {
        id: 1203,
        title: "Learning & Rebuilding Trust",
        description: "Learn from mistakes and rebuild trust with others over time.",
        icon: "/images/icons/rebuilding-trust.svg",
      },
    ],
  },
  {
    id: 13,
    title: "Goals & Growth",
    icon: "/images/icons/13_goals_and_growth.svg",
    subcategories: [
      {
        id: 1301,
        title: "Finding Motivation & Bouncing Back",
        description: "Get motivated again and bounce back after setbacks.",
        icon: "/images/icons/motivation-resilience.svg",
      },
      {
        id: 1302,
        title: "Setting Goals & Planning My Future",
        description: "Set meaningful goals and plan steps toward your future.",
        icon: "/images/icons/setting-goals.svg",
      },
      {
        id: 1303,
        title: "Building Habits",
        description: "Create and stick to habits that support your goals.",
        icon: "/images/icons/building-habits.svg",
      },
      {
        id: 1304,
        title: "Growth Mindset",
        description: "See challenges as chances to learn and grow.",
        icon: "/images/icons/growth-mindset.svg",
      },
      {
        id: 1305,
        title: "Purpose & Values",
        description: "Connect your daily choices to what you care about most.",
        icon: "/images/icons/purpose-values.svg",
      },
    ],
  },
];

/** Returns true if every subcategory in a topic is coming soon (or has no subcategories). */
export function isTopicFullyComingSoon(topic: ExploreTopic): boolean {
  if (!topic.subcategories || topic.subcategories.length === 0) return true;
  return topic.subcategories.every((sub) => sub.comingSoon);
}

export function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function getWeekLabel(offset: number): string {
  if (offset === 0) return "This week";
  if (offset === 1) return "Last week";
  return `${offset} weeks ago`;
}

export function normalizeEmotionToMoodName(
  universalEmotion: string | null,
  specificEmotion?: string | null,
): MoodName | null {
  if (specificEmotion) {
    const mapped = SPECIFIC_EMOTION_TO_MOOD[specificEmotion.toLowerCase()];
    if (mapped) return mapped;
  }
  if (!universalEmotion) return null;
  const lower = universalEmotion.toLowerCase() as MoodName;
  return MOOD_NAMES.includes(lower) ? lower : null;
}

/** @deprecated Use normalizeEmotionToMoodName instead */
export function normalizeUniversalEmotionToMoodName(
  emotion: string | null,
): MoodName | null {
  return normalizeEmotionToMoodName(emotion);
}

function getRandomInt(min: number, max: number): number {
  const floorMin = Math.ceil(min);
  const floorMax = Math.floor(max);
  return Math.floor(Math.random() * (floorMax - floorMin + 1)) + floorMin;
}

function pickTwoDistinctMoods(): [MoodName, MoodName] {
  const firstIndex = getRandomInt(0, MOOD_NAMES.length - 1);
  let secondIndex = getRandomInt(0, MOOD_NAMES.length - 1);
  if (secondIndex === firstIndex) {
    secondIndex = (secondIndex + 1) % MOOD_NAMES.length;
  }
  return [MOOD_NAMES[firstIndex]!, MOOD_NAMES[secondIndex]!];
}

/** Deterministic list for SSR/hydration; same output on server and client. */
export function getDeterministicTrendingTopics(): TrendingTopic[] {
  const allPairs: { category: string; title: string }[] = [];

  for (const topic of EXPLORE_TOPICS) {
    if (topic.subcategories && topic.subcategories.length > 0) {
      for (const sub of topic.subcategories) {
        allPairs.push({ category: topic.title, title: sub.title });
      }
    } else {
      allPairs.push({ category: topic.title, title: topic.title });
    }
  }

  const selectedPairs = allPairs.slice(0, 3);
  const counts = [150, 100, 50];
  const defaultMoods: [MoodName, MoodName] = ["calm", "happy"];

  return selectedPairs.map((pair, index) => ({
    id: index + 1,
    category: pair.category,
    title: pair.title,
    count: counts[index] ?? 50,
    moods: defaultMoods,
  }));
}

export function generateTrendingTopics(): TrendingTopic[] {
  const allPairs: { category: string; title: string }[] = [];

  for (const topic of EXPLORE_TOPICS) {
    if (topic.subcategories && topic.subcategories.length > 0) {
      for (const sub of topic.subcategories) {
        allPairs.push({ category: topic.title, title: sub.title });
      }
    } else {
      allPairs.push({ category: topic.title, title: topic.title });
    }
  }

  const shuffledPairs = [...allPairs].sort(() => Math.random() - 0.5);
  const selectedPairs = shuffledPairs.slice(0, 3);
  const counts = Array.from({ length: 3 }, () => getRandomInt(25, 200)).sort(
    (a, b) => b - a,
  );

  return selectedPairs.map((pair, index) => ({
    id: index + 1,
    category: pair.category,
    title: pair.title,
    count: counts[index] ?? getRandomInt(25, 200),
    moods: pickTwoDistinctMoods(),
  }));
}

export function getFireIconCount(count: number): number {
  if (count > 150) return 3;
  if (count > 100) return 2;
  if (count > 50) return 1;
  return 0;
}
