import type { ChecklistConfig } from "@/lib/exercises/types";

export const organizationalSystemSetup: ChecklistConfig = {
  id: "f90-3-03",
  type: "checklist",
  title: "Organizational System Setup Guide",
  subtitle: "ADHD-friendly organization basics",
  description: "Step-by-step setup for a simple organizational system with ADHD-friendly recommendations.",
  estimatedMinutes: 15,
  completionMessage: "Your organizational system is set up! The key now is consistency — review weekly.",
  applicableCodes: ["F90"],
  requireAll: false,
  allowPartialSave: true,
  items: [
    {
      id: "capture-point",
      label: "Set up ONE capture point for all incoming tasks/ideas",
      helpText: "ADHD-friendly: Use your phone (always with you). One app, one note, one inbox. NOT multiple systems.",
    },
    {
      id: "capture-practice",
      label: "Practice capturing 3 items right now",
      helpText: "Add any tasks or ideas floating in your head to your capture point.",
    },
    {
      id: "calendar",
      label: "Set up a digital calendar with notifications",
      helpText: "ADHD-friendly: Google Calendar or similar with alerts. Set reminders 1 day before AND 1 hour before events.",
    },
    {
      id: "calendar-all-appointments",
      label: "Add all known appointments for the next 2 weeks",
      helpText: "Doctor visits, meetings, deadlines, social plans — if it has a time, it goes on the calendar.",
    },
    {
      id: "task-list",
      label: "Choose ONE simple task list tool",
      helpText: "ADHD-friendly: Keep it simple. Todoist, Things, or even a paper list. Avoid complex project management tools.",
    },
    {
      id: "task-list-brain-dump",
      label: "Do a brain dump into your task list",
      helpText: "Get everything out of your head and into your system.",
    },
    {
      id: "visible-reminders",
      label: "Set up visible reminders for important items",
      helpText: "ADHD-friendly: Sticky notes on bathroom mirror, phone home screen widget, whiteboard in workspace.",
    },
    {
      id: "weekly-review",
      label: "Schedule a weekly review time",
      helpText: "Pick a consistent day/time (e.g., Sunday evening). Add it to your calendar with a reminder.",
    },
    {
      id: "launch-pad",
      label: "Create a 'launch pad' by the door",
      helpText: "ADHD-friendly: A spot for keys, wallet, bag — everything you need when leaving. Check it before leaving.",
    },
    {
      id: "timer",
      label: "Get a visible timer for focus sessions",
      helpText: "Visual timers help with time blindness. Can be a physical timer, phone app, or browser extension.",
    },
    {
      id: "backup-alarms",
      label: "Set backup alarms for critical items",
      helpText: "ADHD-friendly: Don't trust yourself to remember. Set multiple alarms for important things.",
    },
    {
      id: "simplify",
      label: "Remove or archive any organizational tools you're not using",
      helpText: "Too many apps/systems = none get used. Simplify to the essentials.",
    },
  ],
};

export default organizationalSystemSetup;
