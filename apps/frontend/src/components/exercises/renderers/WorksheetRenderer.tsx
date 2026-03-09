"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";
import { Button } from "@/lib/core-ui/button";
import { LikertScale } from "../shared/LikertScale";
import { PrintableView } from "../shared/PrintableView";
import type { WorksheetConfig, WorksheetSection, TableColumn } from "@/lib/exercises/types";

// ─── Types ───────────────────────────────────────────────────────────

export interface WorksheetRendererProps {
  config: WorksheetConfig;
  initialValues?: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
  readOnly?: boolean;
}

// ─── Section Renderers ───────────────────────────────────────────────

function HeaderSectionRenderer({ section }: { section: WorksheetSection }) {
  if (section.type !== "header") return null;
  const level = section.level ?? 2;
  const sizeClasses: Record<number, string> = {
    1: "text-2xl font-bold",
    2: "text-xl font-semibold",
    3: "text-lg font-medium",
  };
  const className = cn(sizeClasses[level] ?? sizeClasses[2], "text-gray-900");
  
  if (level === 1) return <h1 className={className}>{section.content}</h1>;
  if (level === 3) return <h3 className={className}>{section.content}</h3>;
  return <h2 className={className}>{section.content}</h2>;
}

function TextFieldSectionRenderer({
  section,
  value,
  onChange,
  disabled,
}: {
  section: WorksheetSection;
  value: string | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  if (section.type !== "text-field") return null;
  return (
    <div className="space-y-2">
      {section.label && (
        <label className="block text-sm font-medium text-gray-700">
          {section.label}
          {section.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {section.multiline ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={section.placeholder}
          rows={4}
          className={cn(
            "w-full rounded-lg border px-4 py-3 text-sm resize-none",
            "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
            disabled && "bg-gray-100 cursor-not-allowed"
          )}
        />
      ) : (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={section.placeholder}
          className={cn(
            "w-full rounded-lg border px-4 py-3 text-sm",
            "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
            disabled && "bg-gray-100 cursor-not-allowed"
          )}
        />
      )}
    </div>
  );
}

function TableSectionRenderer({
  section,
  value,
  onChange,
  disabled,
}: {
  section: WorksheetSection;
  value: Record<string, unknown>[] | undefined;
  onChange: (value: Record<string, unknown>[]) => void;
  disabled?: boolean;
}) {
  if (section.type !== "table") return null;
  
  const rows = value ?? Array.from({ length: section.minRows ?? 1 }, () => ({}));

  const handleCellChange = (rowIndex: number, columnId: string, cellValue: unknown) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [columnId]: cellValue };
    onChange(newRows);
  };

  const handleAddRow = () => {
    if (section.maxRows && rows.length >= section.maxRows) return;
    onChange([...rows, {}]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length <= (section.minRows ?? 1)) return;
    onChange(rows.filter((_, i) => i !== index));
  };

  const renderCell = (column: TableColumn, rowIndex: number, cellValue: unknown) => {
    const baseClasses = cn(
      "w-full rounded border px-2 py-1.5 text-sm",
      "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200",
      disabled && "bg-gray-100 cursor-not-allowed"
    );

    switch (column.type) {
      case "number":
        return (
          <input
            type="number"
            value={(cellValue as number) ?? ""}
            onChange={(e) => handleCellChange(rowIndex, column.id, e.target.value === "" ? "" : Number(e.target.value))}
            disabled={disabled}
            className={baseClasses}
          />
        );
      case "select":
        return (
          <select
            value={(cellValue as string) ?? ""}
            onChange={(e) => handleCellChange(rowIndex, column.id, e.target.value)}
            disabled={disabled}
            className={baseClasses}
          >
            <option value="">Select...</option>
            {column.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case "likert":
        return (
          <LikertScale
            min={0}
            max={10}
            value={typeof cellValue === "number" ? cellValue : undefined}
            onChange={(v) => handleCellChange(rowIndex, column.id, v)}
            disabled={disabled}
            size="sm"
          />
        );
      default:
        return (
          <input
            type="text"
            value={(cellValue as string) ?? ""}
            onChange={(e) => handleCellChange(rowIndex, column.id, e.target.value)}
            disabled={disabled}
            className={baseClasses}
          />
        );
    }
  };

  return (
    <div className="space-y-3">
      {section.label && (
        <label className="block text-sm font-medium text-gray-700">{section.label}</label>
      )}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              {section.columns.map((col) => (
                <th
                  key={col.id}
                  className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
              {!disabled && <th className="w-10 px-2 py-2" />}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white">
                {section.columns.map((col) => (
                  <td key={col.id} className="px-3 py-2">
                    {renderCell(col, rowIndex, (row as Record<string, unknown>)[col.id])}
                  </td>
                ))}
                {!disabled && (
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(rowIndex)}
                      disabled={rows.length <= (section.minRows ?? 1)}
                      className={cn(
                        "rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500",
                        rows.length <= (section.minRows ?? 1) && "opacity-30 cursor-not-allowed"
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!disabled && (!section.maxRows || rows.length < section.maxRows) && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          className="gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          {section.addRowLabel ?? "Add Row"}
        </Button>
      )}
    </div>
  );
}

function RatingRowSectionRenderer({
  section,
  value,
  onChange,
  disabled,
}: {
  section: WorksheetSection;
  value: Record<string, number> | undefined;
  onChange: (value: Record<string, number>) => void;
  disabled?: boolean;
}) {
  if (section.type !== "rating-row") return null;
  const ratings = value ?? {};

  const handleRatingChange = (itemId: string, rating: number) => {
    onChange({ ...ratings, [itemId]: rating });
  };

  return (
    <div className="space-y-4">
      {section.label && (
        <label className="block text-sm font-medium text-gray-700">{section.label}</label>
      )}
      <div className="space-y-3">
        {section.items.map((item) => (
          <div key={item.id} className="rounded-lg border p-4 bg-white">
            <p className="text-sm font-medium text-gray-900 mb-3">{item.label}</p>
            <LikertScale
              min={section.min}
              max={section.max}
              value={ratings[item.id]}
              onChange={(v) => handleRatingChange(item.id, v)}
              minLabel={section.minLabel}
              maxLabel={section.maxLabel}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function BeforeAfterSectionRenderer({
  section,
  value,
  onChange,
  disabled,
}: {
  section: WorksheetSection;
  value: { before?: string | number; after?: string | number } | undefined;
  onChange: (value: { before?: string | number; after?: string | number }) => void;
  disabled?: boolean;
}) {
  if (section.type !== "before-after") return null;
  const data = value ?? {};

  const hasRatingScale = !!section.ratingScale;

  return (
    <div className="space-y-4">
      {section.label && (
        <label className="block text-sm font-medium text-gray-700">{section.label}</label>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-4 bg-white">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            {section.beforeLabel ?? "Before"}
          </p>
          {hasRatingScale ? (
            <LikertScale
              min={section.ratingScale!.min}
              max={section.ratingScale!.max}
              value={typeof data.before === "number" ? data.before : undefined}
              onChange={(v) => onChange({ ...data, before: v })}
              minLabel={section.ratingScale!.minLabel}
              maxLabel={section.ratingScale!.maxLabel}
              disabled={disabled}
            />
          ) : (
            <textarea
              value={(data.before as string) ?? ""}
              onChange={(e) => onChange({ ...data, before: e.target.value })}
              disabled={disabled}
              rows={3}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm resize-none",
                "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
                disabled && "bg-gray-100 cursor-not-allowed"
              )}
            />
          )}
        </div>
        <div className="rounded-lg border p-4 bg-white">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            {section.afterLabel ?? "After"}
          </p>
          {hasRatingScale ? (
            <LikertScale
              min={section.ratingScale!.min}
              max={section.ratingScale!.max}
              value={typeof data.after === "number" ? data.after : undefined}
              onChange={(v) => onChange({ ...data, after: v })}
              minLabel={section.ratingScale!.minLabel}
              maxLabel={section.ratingScale!.maxLabel}
              disabled={disabled}
            />
          ) : (
            <textarea
              value={(data.after as string) ?? ""}
              onChange={(e) => onChange({ ...data, after: e.target.value })}
              disabled={disabled}
              rows={3}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm resize-none",
                "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
                disabled && "bg-gray-100 cursor-not-allowed"
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────

export function WorksheetRenderer({
  config,
  initialValues,
  onChange,
  readOnly = false,
}: WorksheetRendererProps) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues ?? {});

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange(values);
    }
  }, [values, onChange]);

  const handleSectionChange = (sectionId: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [sectionId]: value }));
  };

  const renderSection = (section: WorksheetSection) => {
    switch (section.type) {
      case "header":
        return <HeaderSectionRenderer key={section.id} section={section} />;
      case "text-field":
        return (
          <TextFieldSectionRenderer
            key={section.id}
            section={section}
            value={values[section.id] as string | undefined}
            onChange={(v) => handleSectionChange(section.id, v)}
            disabled={readOnly}
          />
        );
      case "table":
        return (
          <TableSectionRenderer
            key={section.id}
            section={section}
            value={values[section.id] as Record<string, unknown>[] | undefined}
            onChange={(v) => handleSectionChange(section.id, v)}
            disabled={readOnly}
          />
        );
      case "rating-row":
        return (
          <RatingRowSectionRenderer
            key={section.id}
            section={section}
            value={values[section.id] as Record<string, number> | undefined}
            onChange={(v) => handleSectionChange(section.id, v)}
            disabled={readOnly}
          />
        );
      case "before-after":
        return (
          <BeforeAfterSectionRenderer
            key={section.id}
            section={section}
            value={values[section.id] as { before?: string | number; after?: string | number } | undefined}
            onChange={(v) => handleSectionChange(section.id, v)}
            disabled={readOnly}
          />
        );
      default:
        return null;
    }
  };

  const content = (
    <div className="space-y-6">
      {config.sections.map(renderSection)}
    </div>
  );

  if (config.printable) {
    return (
      <PrintableView title={config.title}>
        {content}
      </PrintableView>
    );
  }

  return content;
}
