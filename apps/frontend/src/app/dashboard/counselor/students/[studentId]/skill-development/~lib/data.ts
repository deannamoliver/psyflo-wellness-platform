export type Domain = {
  id: string;
  name: string;
  description: string;
  skills: {
    id: string;
    name: string;
    description: string;
    status: "locked" | "in-progress" | "completed";
    progress: number;
    completedDate?: Date;
  }[];
};

export function getCurrentDomain() {
  return {
    name: "Emotion",
    description:
      "Skills that help recognize, express, and control emotions as well as understand and empathize with others.",
    skills: [
      {
        id: "1",
        name: "Emotion Knowledge & Expression",
        description: "Recognizing and naming emotions in self and others",
        status: "completed",
        progress: 100,
        completedDate: new Date(),
      },
      {
        id: "2",
        name: "Emotion & Behavior Regulation",
        description:
          "Managing emotions and behaviors in challenging situations",
        status: "in-progress",
        progress: 50,
      },
      {
        id: "3",
        name: "Empathy & Perspective Taking",
        description: "Understanding others' emotions and viewpoints",
        status: "locked",
        progress: 0,
      },
    ],
  };
}
