import type {
  specificEmotionEnum,
  universalEmotionEnum,
} from "@feelwell/database";

export type UniversalEmotion = (typeof universalEmotionEnum.enumValues)[number];
export type SpecificEmotion = (typeof specificEmotionEnum.enumValues)[number];

export const emotionConfigs: Array<{
  id: UniversalEmotion;
  name: string;
  color: string;
}> = [
  { id: "happy", name: "Happy", color: "#FDCB3780" },
  { id: "sad", name: "Sad", color: "#3B82F080" },
  { id: "afraid", name: "Afraid", color: "#A855F780" },
  { id: "angry", name: "Angry", color: "#EF444480" },
  { id: "bad", name: "Bad", color: "#DC5A9B80" },
  { id: "disgusted", name: "Disgusted", color: "#10B98180" },
  { id: "surprised", name: "Surprised", color: "#F59E4280" },
];

export const universalToSpecificEmotion: Record<
  UniversalEmotion,
  Array<{ id: SpecificEmotion; label: string }>
> = {
  happy: [
    { id: "playful", label: "Playful" },
    { id: "joyful", label: "Joyful" },
    { id: "curious", label: "Curious" },
    { id: "confident", label: "Confident" },
    { id: "valued", label: "Valued" },
    { id: "creative", label: "Creative" },
    { id: "peaceful", label: "Peaceful" },
    { id: "hopeful", label: "Hopeful" },
  ],
  sad: [
    { id: "lonely", label: "Lonely" },
    { id: "left_out", label: "Left Out" },
    { id: "guilty", label: "Guilty" },
    { id: "embarrassed", label: "Embarrassed" },
    { id: "empty", label: "Empty" },
    { id: "hurt", label: "Hurt" },
    { id: "let_down", label: "Let Down" },
  ],
  disgusted: [
    { id: "grossed_out", label: "Grossed Out" },
    { id: "horrified", label: "Horrified" },
    { id: "disapproving", label: "Disapproving" },
    { id: "disappointed", label: "Disappointed" },
    { id: "offended", label: "Offended" },
  ],
  angry: [
    { id: "disrespected", label: "Disrespected" },
    { id: "holding_a_grudge", label: "Holding A Grudge" },
    { id: "mad", label: "Mad" },
    { id: "jealous", label: "Jealous" },
    { id: "aggressive", label: "Aggressive" },
    { id: "frustrated", label: "Frustrated" },
    { id: "annoyed", label: "Annoyed" },
  ],
  afraid: [
    { id: "scared", label: "Scared" },
    { id: "nervous", label: "Nervous" },
    { id: "worried", label: "Worried" },
    { id: "insecure", label: "Insecure" },
    { id: "powerless", label: "Powerless" },
    { id: "threatened", label: "Threatened" },
  ],
  bad: [
    { id: "blah", label: "Blah" },
    { id: "tired", label: "Tired" },
    { id: "stressed", label: "Stressed" },
    { id: "bored", label: "Bored" },
    { id: "overwhelmed", label: "Overwhelmed" },
    { id: "distracted", label: "Distracted" },
    { id: "excluded", label: "Excluded" },
  ],
  surprised: [
    { id: "excited", label: "Excited" },
    { id: "shocked", label: "Shocked" },
    { id: "amazed", label: "Amazed" },
    { id: "confused", label: "Confused" },
    { id: "startled", label: "Startled" },
    { id: "anxious", label: "Anxious" },
  ],
};
