"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDownIcon,
  Loader2,
  Upload,
} from "lucide-react";
import { Button } from "@/lib/core-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/lib/core-ui/dropdown-menu";
import { ImportCsvInfo } from "./import-csv-info";
import type { ParseResult } from "./import-csv-parser";
import type { ImportResult } from "./import-students-action";

export function UploadStep({
  parseResult,
  fileName,
  onFileChange,
}: {
  parseResult: ParseResult | null;
  fileName: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <ImportCsvInfo />
      <div className="flex flex-col gap-2">
        <label className="font-medium text-gray-700 text-sm">
          Upload CSV File
        </label>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-gray-300 border-dashed bg-gray-50 p-6 transition-colors hover:border-blue-400 hover:bg-blue-50">
          <Upload className="mb-2 size-8 text-gray-400" />
          <span className="font-medium text-gray-600 text-sm">
            {fileName || "Click to select a CSV file"}
          </span>
          <span className="mt-1 text-gray-400 text-xs">
            Only .csv files are accepted
          </span>
          <input
            type="file"
            accept=".csv"
            onChange={onFileChange}
            className="hidden"
          />
        </label>
      </div>
      {parseResult &&
        parseResult.errors.length > 0 &&
        parseResult.rows.length === 0 && (
          <ErrorSummary errors={parseResult.errors} />
        )}
    </div>
  );
}

export function ConfirmStep({
  parseResult,
  schools,
  schoolId,
  onSchoolChange,
  isPending,
  onBack,
  onImport,
}: {
  parseResult: ParseResult;
  schools: { id: string; name: string }[];
  schoolId: string;
  onSchoolChange: (v: string) => void;
  isPending: boolean;
  onBack: () => void;
  onImport: () => void;
}) {
  const selectedLabel =
    schools.find((s) => s.id === schoolId)?.name ?? "Select a school";

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="font-medium text-green-800 text-sm">
          {parseResult.rows.length} student
          {parseResult.rows.length !== 1 ? "s" : ""} ready to import
        </p>
        {parseResult.errors.length > 0 && (
          <p className="mt-1 text-amber-700 text-xs">
            {parseResult.errors.length} row
            {parseResult.errors.length !== 1 ? "s" : ""} skipped due to errors
          </p>
        )}
      </div>

      {parseResult.errors.length > 0 && (
        <ErrorSummary errors={parseResult.errors} />
      )}

      <div className="flex flex-col gap-1.5">
        <label className="font-medium text-gray-700 text-sm">
          Assign to School <span className="text-red-500">*</span>
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 w-full justify-between gap-2 border-gray-200 bg-white font-dm font-normal text-gray-700 hover:bg-gray-50 hover:text-gray-700"
            >
              <span className={schoolId ? "text-gray-900" : "text-gray-400"}>
                {selectedLabel}
              </span>
              <ChevronDownIcon className="size-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="max-h-60 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto bg-white font-dm [&_[data-slot=dropdown-menu-radio-item]]:py-2.5 [&_[data-slot=dropdown-menu-radio-item]]:pr-4 [&_[data-slot=dropdown-menu-radio-item]]:pl-9 [&_[data-slot=dropdown-menu-radio-item]]:text-gray-900 [&_[data-slot=dropdown-menu-radio-item]]:focus:bg-secondary"
          >
            <DropdownMenuRadioGroup
              value={schoolId}
              onValueChange={onSchoolChange}
            >
              {schools.map((s) => (
                <DropdownMenuRadioItem key={s.id} value={s.id}>
                  {s.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-end gap-3 border-gray-200 border-t pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isPending}
          className="border-gray-200 bg-white font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-700"
        >
          Back
        </Button>
        <Button
          onClick={onImport}
          disabled={!schoolId || isPending}
          className="gap-2 bg-blue-600 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          {isPending
            ? `Importing ${parseResult.rows.length} students...`
            : `Import ${parseResult.rows.length} Student${parseResult.rows.length !== 1 ? "s" : ""}`}
        </Button>
      </div>
    </div>
  );
}

export function ResultStep({
  result,
  onClose,
}: {
  result: ImportResult;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
        <CheckCircle2 className="size-5 text-green-600" />
        <p className="font-medium text-green-800 text-sm">
          {result.created} student{result.created !== 1 ? "s" : ""} imported
          successfully
        </p>
      </div>
      {result.failed.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="mb-2 font-medium text-red-800 text-sm">
            {result.failed.length} failed:
          </p>
          <ul className="max-h-32 space-y-1 overflow-y-auto text-red-700 text-xs">
            {result.failed.map((f) => (
              <li key={f.email}>
                <strong>{f.email}</strong>: {f.error}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex justify-end border-gray-200 border-t pt-4">
        <Button
          onClick={onClose}
          className="bg-gray-900 font-medium text-white hover:bg-gray-800"
        >
          Done
        </Button>
      </div>
    </div>
  );
}

function ErrorSummary({
  errors,
}: {
  errors: { row: number; field: string; message: string }[];
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <AlertCircle className="size-4 text-red-600" />
        <p className="font-medium text-red-800 text-sm">Validation errors</p>
      </div>
      <ul className="max-h-32 space-y-1 overflow-y-auto text-red-700 text-xs">
        {errors.slice(0, 20).map((e, i) => (
          <li key={`${e.row}-${e.field}-${i}`}>
            Row {e.row}, <strong>{e.field}</strong>: {e.message}
          </li>
        ))}
        {errors.length > 20 && (
          <li className="text-red-500">...and {errors.length - 20} more</li>
        )}
      </ul>
    </div>
  );
}
