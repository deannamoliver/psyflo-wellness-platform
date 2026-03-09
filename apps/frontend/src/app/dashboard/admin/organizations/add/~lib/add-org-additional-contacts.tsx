"use client";

import { Plus, Trash2, UserCircle } from "lucide-react";
import { Input } from "@/lib/core-ui/input";
import type { ContactInfo } from "./add-org-types";

type Props = {
  contacts: ContactInfo[];
  onUpdate: (index: number, field: keyof ContactInfo, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

const inputClass = "h-10 border-gray-200 bg-white font-dm";

export function AddOrgAdditionalContacts({
  contacts,
  onUpdate,
  onAdd,
  onRemove,
}: Props) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-gray-900 text-lg">
        Additional Contacts
      </h2>
      <p className="mt-1 text-gray-500 text-sm">
        Secondary administrative contacts and department heads
      </p>

      <div className="mt-4 border-gray-200 border-t" />

      <div className="mt-6 flex flex-col gap-4">
        {contacts.map((contact, index) => (
          <div
            key={contact.id}
            className="rounded-lg border border-gray-100 bg-gray-50/50 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-gray-200">
                  <UserCircle className="size-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    Contact #{index + 1}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Secondary contact person
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="shrink-0 p-2 text-gray-400 transition-colors hover:text-red-500"
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              <Input
                placeholder="Full name"
                value={contact.name}
                onChange={(e) => onUpdate(index, "name", e.target.value)}
                className={inputClass}
              />
              <Input
                placeholder="Title"
                value={contact.title}
                onChange={(e) => onUpdate(index, "title", e.target.value)}
                className={inputClass}
              />
              <Input
                placeholder="Email address"
                value={contact.email}
                onChange={(e) => onUpdate(index, "email", e.target.value)}
                className={inputClass}
              />
              <Input
                placeholder="Phone number"
                value={contact.phone}
                onChange={(e) => onUpdate(index, "phone", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 self-end rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50"
        >
          <Plus className="size-4" />
          Add Contact
        </button>
      </div>
    </section>
  );
}
