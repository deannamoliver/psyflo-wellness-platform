import Link from "next/link";

const TOOLBOX_ITEMS = [
  {
    href: "/dashboard/student/toolbox/cbt-exercises",
    emoji: "\u{1F9E0}",
    title: "Quick Exercises",
    description: "Tap-through CBT activities",
    bg: "bg-violet-50",
  },
  {
    href: "/dashboard/student/toolbox/breathing",
    emoji: "\u{1FAC1}",
    title: "Breathing",
    description: "Guided breathing exercises",
    bg: "bg-teal-50",
  },
  {
    href: "/dashboard/student/toolbox/journaling",
    emoji: "\u270F\uFE0F",
    title: "Journaling",
    description: "Write it out",
    bg: "bg-amber-50",
  },
  {
    href: "/dashboard/student/toolbox/meditation",
    emoji: "\u{1E4C7}",
    title: "Meditation",
    description: "Guided meditation",
    bg: "bg-indigo-50",
  },
];

export default function ToolboxPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-lg px-4 py-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Toolbox</h1>
          <p className="mt-1 text-xs text-gray-400">Tools to help you feel better.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {TOOLBOX_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bg}`}>
                <span className="text-2xl">{item.emoji}</span>
              </div>
              <p className="text-sm font-bold text-gray-900">{item.title}</p>
              <p className="text-[11px] text-gray-400 text-center">{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
