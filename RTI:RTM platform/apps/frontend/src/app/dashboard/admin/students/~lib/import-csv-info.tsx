"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-gray-100 border-b last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 py-2 text-left font-medium text-gray-700 text-sm"
      >
        {open ? (
          <ChevronDown className="size-3.5" />
        ) : (
          <ChevronRight className="size-3.5" />
        )}
        {title}
      </button>
      {open && <div className="pb-3 pl-5.5">{children}</div>}
    </div>
  );
}

function Columns({ items }: { items: { name: string; desc: string }[] }) {
  return (
    <ul className="space-y-1 text-gray-600 text-xs">
      {items.map((item) => (
        <li key={item.name}>
          <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-800">
            {item.name}
          </code>{" "}
          &mdash; {item.desc}
        </li>
      ))}
    </ul>
  );
}

export function ImportCsvInfo() {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <p className="mb-2 font-medium text-blue-900 text-sm">
        CSV Format Reference
      </p>
      <p className="mb-3 text-blue-800 text-xs">
        Upload a CSV file with headers in the first row. Required columns are
        marked below.
      </p>
      <div className="space-y-0">
        <Section title="Required columns">
          <Columns
            items={[
              { name: "email", desc: "Unique; used for login" },
              { name: "first_name", desc: "Display name" },
              { name: "last_name", desc: "Display name" },
            ]}
          />
        </Section>

        <Section title="Optional - profile">
          <Columns
            items={[
              { name: "student_code", desc: "Patient ID (e.g. PAT-001)" },
              { name: "grade", desc: "0 = K, 1-12 = grades 1-12" },
              { name: "date_of_birth", desc: "YYYY-MM-DD" },
              {
                name: "gender",
                desc: "male | female | non_binary | prefer_not_to_answer",
              },
              {
                name: "pronouns",
                desc: "he/him | she/her | they/them | prefer_not_to_answer",
              },
              {
                name: "language",
                desc: "english | spanish | french | chinese_simplified | arabic | haitian_creole | bengali | russian | urdu | vietnamese | portuguese",
              },
              {
                name: "ethnicity",
                desc: "american_indian_or_alaska_native | asian | black_or_african_american | hispanic_or_latino | middle_eastern_or_north_african | native_hawaiian_or_pacific_islander | white | prefer_not_to_answer",
              },
              { name: "phone", desc: "Any string" },
              { name: "home_address", desc: "Free text" },
              { name: "internal_notes", desc: "Admin-only notes" },
            ]}
          />
        </Section>

        <Section title="Optional - lists (comma-separated)">
          <Columns
            items={[
              {
                name: "interests",
                desc: "gaming, sports, art, music, reading, fashion, social-media, movies, outdoors, tech, science, travel, chilling",
              },
              {
                name: "learning_styles",
                desc: "reading, watching-videos, listening-audio, taking-notes, hands-on, talking-through, interactive-tools",
              },
              {
                name: "goals",
                desc: "school-performance, making-friends, emotional-wellbeing, health-fitness, confidence, new-experiences, life-balance, something-else",
              },
            ]}
          />
        </Section>

        <Section title="Optional - emergency contacts">
          <p className="mb-1 text-gray-600 text-xs">
            Up to 3 contacts (primary, backup_1, backup_2). Each prefixed with
            the tag:
          </p>
          <Columns
            items={[
              {
                name: "primary_contact_name",
                desc: "Name of primary contact",
              },
              {
                name: "primary_contact_relation",
                desc: "e.g. mother, father",
              },
              {
                name: "primary_contact_primary_phone",
                desc: "Main phone",
              },
              {
                name: "primary_contact_secondary_phone",
                desc: "Alt phone",
              },
              { name: "primary_contact_primary_email", desc: "Main email" },
              {
                name: "primary_contact_secondary_email",
                desc: "Alt email",
              },
            ]}
          />
          <p className="mt-1 text-gray-500 text-xs">
            Same pattern for <code className="text-xs">backup_1_*</code> and{" "}
            <code className="text-xs">backup_2_*</code> prefixes.
          </p>
        </Section>

        <Section title="Optional - account">
          <Columns
            items={[
              {
                name: "account_status",
                desc: "active (default) | blocked | archived",
              },
            ]}
          />
        </Section>
      </div>
    </div>
  );
}
