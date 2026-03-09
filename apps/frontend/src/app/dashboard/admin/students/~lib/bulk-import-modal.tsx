"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/lib/core-ui/dialog";
import { type ParseResult, parseCsv } from "./import-csv-parser";
import { ConfirmStep, ResultStep, UploadStep } from "./import-modal-steps";
import {
  fetchAllSchools,
  type ImportResult,
  importStudents,
} from "./import-students-action";

type Step = "upload" | "confirm" | "result";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BulkImportModal({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>("upload");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [schoolId, setSchoolId] = useState("");
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (open) {
      fetchAllSchools().then(setSchools);
    }
  }, [open]);

  function handleReset() {
    setStep("upload");
    setParseResult(null);
    setSchoolId("");
    setImportResult(null);
    setFileName("");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = parseCsv(text);
      setParseResult(result);
      if (result.rows.length > 0) setStep("confirm");
    };
    reader.readAsText(file);
  }

  function handleImport() {
    if (!parseResult || !schoolId) return;
    startTransition(async () => {
      const result = await importStudents(parseResult.rows, schoolId);
      setImportResult(result);
      setStep("result");
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) handleReset();
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto bg-white font-dm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Upload className="size-5 text-blue-600" />
            </div>
            <DialogTitle className="font-semibold text-gray-900 text-lg">
              Bulk Import Clients
            </DialogTitle>
          </div>
        </DialogHeader>

        {step === "upload" && (
          <UploadStep
            parseResult={parseResult}
            fileName={fileName}
            onFileChange={handleFileChange}
          />
        )}

        {step === "confirm" && parseResult && (
          <ConfirmStep
            parseResult={parseResult}
            schools={schools}
            schoolId={schoolId}
            onSchoolChange={setSchoolId}
            isPending={isPending}
            onBack={() => setStep("upload")}
            onImport={handleImport}
          />
        )}

        {step === "result" && importResult && (
          <ResultStep
            result={importResult}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
