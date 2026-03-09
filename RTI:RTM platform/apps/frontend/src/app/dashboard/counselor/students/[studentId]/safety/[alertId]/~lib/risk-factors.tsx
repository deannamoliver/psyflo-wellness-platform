import { Badge } from "@/lib/core-ui/badge";

type CssrItem = {
  question: string;
  description: string;
  answer: boolean;
};

const cssrQuestions: { question: string; description: string }[] = [
  {
    question: "1. Wish to be Dead",
    description:
      "Have you wished you were dead or wished you could go to sleep and not wake up?",
  },
  {
    question: "2. Suicidal Thoughts",
    description: "Have you actually had any thoughts of killing yourself?",
  },
  {
    question: "3. Thoughts of Method",
    description: "Have you been thinking about how you might do this?",
  },
  {
    question: "4. Suicidal Intent",
    description:
      "Have you had these thoughts and had some intention of acting on them?",
  },
  {
    question: "5. Plan and Intent",
    description:
      "Have you started to work out or worked out the details of how to kill yourself? Do you intend to carry out this plan?",
  },
  {
    question: "6. Attempt",
    description:
      "Have you ever done anything, started to do anything, or prepared to do anything to end your life?",
  },
];

function RiskFactorItem({ item }: { item: CssrItem }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-900 text-sm">{item.question}:</p>
        <p className="mt-0.5 text-gray-500 text-xs leading-relaxed">
          &quot;{item.description}&quot;
        </p>
      </div>
      <Badge
        className={`shrink-0 rounded px-2 py-0.5 font-semibold text-xs ${
          item.answer ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"
        }`}
      >
        {item.answer ? "Yes" : "No"}
      </Badge>
    </div>
  );
}

export function RiskFactors({
  cssrState,
}: {
  cssrState: Record<string, boolean> | null;
}) {
  const items: CssrItem[] = cssrQuestions.map((q, idx) => ({
    ...q,
    answer: cssrState ? (cssrState[`q${idx + 1}`] ?? false) : false,
  }));

  return (
    <div className="border-gray-200 border-l bg-red-50/20 p-6">
      <div className="mb-4 pb-3">
        <h3 className="font-bold text-gray-900 text-sm">Risk Factors</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <RiskFactorItem key={item.question} item={item} />
        ))}
      </div>
    </div>
  );
}
