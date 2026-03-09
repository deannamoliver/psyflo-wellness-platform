"use client";

import type { ReactNode } from "react";

export function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-gray-500 text-sm">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export function FormRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

export function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block font-medium text-gray-700 text-sm">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-gray-400 text-xs">{hint}</p>}
    </div>
  );
}
