import type { WorksheetConfig } from "@/lib/exercises/types";

export const pleasantActivitiesInventory: WorksheetConfig = {
  id: "f32-4-02",
  type: "worksheet",
  title: "Pleasant Activities Inventory",
  subtitle: "Build your personal activity menu",
  description: "Explore 50+ low-barrier pleasant activities, rate your interest and feasibility, and create your personalized top-10 list.",
  estimatedMinutes: 20,
  completionMessage: "You now have a personalized menu of pleasant activities to draw from!",
  applicableCodes: ["F32", "F33"],
  printable: true,
  sections: [
    {
      id: "header-intro",
      type: "header",
      content: "Pleasant Activities Inventory",
      level: 1,
    },
    {
      id: "instructions",
      type: "text-field",
      label: "Instructions",
      placeholder: "Rate each activity: Interest (1-5) and Feasibility (1-5). Focus on activities you could realistically do this week.",
      multiline: false,
    },
    {
      id: "header-social",
      type: "header",
      content: "Social Activities",
      level: 2,
    },
    {
      id: "social-activities",
      type: "table",
      label: "Rate your interest and feasibility for each",
      columns: [
        { id: "activity", header: "Activity", type: "text", width: "50%" },
        { id: "interest", header: "Interest (1-5)", type: "likert", width: "25%" },
        { id: "feasibility", header: "Feasibility (1-5)", type: "likert", width: "25%" },
      ],
      minRows: 8,
      maxRows: 8,
    },
    {
      id: "header-physical",
      type: "header",
      content: "Physical Activities",
      level: 2,
    },
    {
      id: "physical-activities",
      type: "table",
      columns: [
        { id: "activity", header: "Activity", type: "text", width: "50%" },
        { id: "interest", header: "Interest (1-5)", type: "likert", width: "25%" },
        { id: "feasibility", header: "Feasibility (1-5)", type: "likert", width: "25%" },
      ],
      minRows: 8,
      maxRows: 8,
    },
    {
      id: "header-creative",
      type: "header",
      content: "Creative Activities",
      level: 2,
    },
    {
      id: "creative-activities",
      type: "table",
      columns: [
        { id: "activity", header: "Activity", type: "text", width: "50%" },
        { id: "interest", header: "Interest (1-5)", type: "likert", width: "25%" },
        { id: "feasibility", header: "Feasibility (1-5)", type: "likert", width: "25%" },
      ],
      minRows: 8,
      maxRows: 8,
    },
    {
      id: "header-nature",
      type: "header",
      content: "Nature & Outdoors",
      level: 2,
    },
    {
      id: "nature-activities",
      type: "table",
      columns: [
        { id: "activity", header: "Activity", type: "text", width: "50%" },
        { id: "interest", header: "Interest (1-5)", type: "likert", width: "25%" },
        { id: "feasibility", header: "Feasibility (1-5)", type: "likert", width: "25%" },
      ],
      minRows: 8,
      maxRows: 8,
    },
    {
      id: "header-sensory",
      type: "header",
      content: "Sensory & Relaxation",
      level: 2,
    },
    {
      id: "sensory-activities",
      type: "table",
      columns: [
        { id: "activity", header: "Activity", type: "text", width: "50%" },
        { id: "interest", header: "Interest (1-5)", type: "likert", width: "25%" },
        { id: "feasibility", header: "Feasibility (1-5)", type: "likert", width: "25%" },
      ],
      minRows: 8,
      maxRows: 8,
    },
    {
      id: "header-achievement",
      type: "header",
      content: "Achievement Activities",
      level: 2,
    },
    {
      id: "achievement-activities",
      type: "table",
      columns: [
        { id: "activity", header: "Activity", type: "text", width: "50%" },
        { id: "interest", header: "Interest (1-5)", type: "likert", width: "25%" },
        { id: "feasibility", header: "Feasibility (1-5)", type: "likert", width: "25%" },
      ],
      minRows: 8,
      maxRows: 8,
    },
    {
      id: "header-top10",
      type: "header",
      content: "Your Personal Top 10",
      level: 2,
    },
    {
      id: "top-10",
      type: "table",
      label: "List your top 10 activities (highest combined interest + feasibility scores)",
      columns: [
        { id: "rank", header: "#", type: "number", width: "10%" },
        { id: "activity", header: "Activity", type: "text", width: "60%" },
        { id: "when", header: "When could you do this?", type: "text", width: "30%" },
      ],
      minRows: 10,
      maxRows: 10,
    },
    {
      id: "first-activity",
      type: "text-field",
      label: "Which activity will you try first this week?",
      required: true,
    },
  ],
};

export default pleasantActivitiesInventory;
