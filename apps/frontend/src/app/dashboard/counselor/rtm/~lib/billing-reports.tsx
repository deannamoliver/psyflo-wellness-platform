"use client";

import { format } from "date-fns";
import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileText,
  Mail,
  PenLine,
  Send,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/lib/core-ui/badge";
import { Button } from "@/lib/core-ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/lib/core-ui/dialog";
import { cn } from "@/lib/tailwind-utils";
import type { BillingReport } from "./mock-data";

const STATUS_CONFIG: Record<
  BillingReport["status"],
  { label: string; color: string; icon: React.ElementType }
> = {
  ready_for_review: {
    label: "Ready for Review",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Eye,
  },
  reviewed: {
    label: "Reviewed",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: FileCheck,
  },
  signed: {
    label: "Signed",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: PenLine,
  },
  submitted: {
    label: "Submitted",
    color: "bg-violet-50 text-violet-700 border-violet-200",
    icon: Send,
  },
};

function ReportStatusBadge({ status }: { status: BillingReport["status"] }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.color,
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

function ReportDetailModal({
  report,
  open,
  onOpenChange,
  onSign,
  onSubmit,
}: {
  report: BillingReport;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSign: (id: string) => void;
  onSubmit: (id: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-blue-600" />
            RTM Billing Report — {report.patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Report Header */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Billing Period: {format(new Date(report.periodStart), "MMM d")} –{" "}
                {format(new Date(report.periodEnd), "MMM d, yyyy")}
              </p>
              <p className="text-xs text-gray-500">
                Generated {format(new Date(report.generatedAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            <ReportStatusBadge status={report.status} />
          </div>

          {/* CPT Codes */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-900">
              CPT Codes
            </h4>
            <div className="flex flex-wrap gap-2">
              {report.cptCodes.map((code) => (
                <Badge
                  key={code}
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700"
                >
                  {code}
                </Badge>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              Estimated reimbursement:{" "}
              <span className="font-semibold text-gray-900">
                ${report.estimatedAmount.toFixed(2)}
              </span>
            </p>
          </div>

          {/* Evidence Summary */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-900">
              Evidence Summary
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <EvidenceItem
                label="Data Days Collected"
                value={`${report.evidence.dataDaysCollected} days`}
                met={report.evidence.dataDaysCollected >= 2}
              />
              <EvidenceItem
                label="Clinician Time Logged"
                value={`${report.evidence.clinicianMinutesLogged} min`}
                met={report.evidence.clinicianMinutesLogged >= 20}
              />
              <EvidenceItem
                label="Interactive Communications"
                value={`${report.evidence.interactiveCommunications}`}
                met={report.evidence.interactiveCommunications >= 1}
              />
              <EvidenceItem
                label="Device Setup"
                value={report.evidence.deviceSetupComplete ? "Complete" : "Incomplete"}
                met={report.evidence.deviceSetupComplete}
              />
              <EvidenceItem
                label="Treatment Plan"
                value={report.evidence.treatmentPlanActive ? "Active" : "None"}
                met={report.evidence.treatmentPlanActive}
              />
            </div>
          </div>

          {/* Signature & Timestamps */}
          {report.signedAt && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-emerald-700">
                <PenLine className="h-4 w-4" />
                <span className="font-medium">
                  Signed on {format(new Date(report.signedAt), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
            </div>
          )}
          {report.submittedAt && (
            <div className="rounded-lg border border-violet-200 bg-violet-50/50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-violet-700">
                <Send className="h-4 w-4" />
                <span className="font-medium">
                  Submitted on {format(new Date(report.submittedAt), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between border-t pt-4">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <div className="flex items-center gap-2">
              {(report.status === "ready_for_review" ||
                report.status === "reviewed") && (
                <Button
                  size="sm"
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => onSign(report.id)}
                >
                  <PenLine className="h-4 w-4" />
                  E-Sign Report
                </Button>
              )}
              {report.status === "signed" && (
                <Button
                  size="sm"
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={() => onSubmit(report.id)}
                >
                  <Send className="h-4 w-4" />
                  Submit to Biller
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EvidenceItem({
  label,
  value,
  met,
}: {
  label: string;
  value: string;
  met: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2">
      {met ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
      ) : (
        <Clock className="h-4 w-4 shrink-0 text-amber-400" />
      )}
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export function BillingReportsSection({
  reports: initialReports,
}: {
  reports: BillingReport[];
}) {
  const [reports, setReports] = useState(initialReports);
  const [selectedReport, setSelectedReport] = useState<BillingReport | null>(
    null,
  );

  const readyCount = reports.filter(
    (r) => r.status === "ready_for_review",
  ).length;
  const signedCount = reports.filter((r) => r.status === "signed").length;
  const submittedCount = reports.filter((r) => r.status === "submitted").length;

  function handleSign(id: string) {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "signed" as const, signedAt: new Date().toISOString() }
          : r,
      ),
    );
    setSelectedReport((prev) =>
      prev?.id === id
        ? { ...prev, status: "signed", signedAt: new Date().toISOString() }
        : prev,
    );
  }

  function handleSubmit(id: string) {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "submitted" as const, submittedAt: new Date().toISOString() }
          : r,
      ),
    );
    setSelectedReport((prev) =>
      prev?.id === id
        ? { ...prev, status: "submitted", submittedAt: new Date().toISOString() }
        : prev,
    );
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Billing Reports
            </h3>
            <p className="text-xs text-gray-500">
              Auto-generated when CPT code thresholds are met
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {readyCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              <Mail className="h-3 w-3" />
              {readyCount} ready for review
            </span>
          )}
          <span className="text-xs text-gray-400">
            {signedCount} signed · {submittedCount} submitted
          </span>
        </div>
      </div>

      {/* Reports Table */}
      {reports.length === 0 ? (
        <div className="rounded-xl border bg-white px-6 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">
            No billing reports yet
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Reports are auto-generated when patients meet CPT code requirements
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Patient
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Period
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  CPT Codes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="transition-colors hover:bg-gray-50/50"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">
                      {report.patientName}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-500">
                      {format(new Date(report.periodStart), "MMM d")} –{" "}
                      {format(new Date(report.periodEnd), "MMM d")}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {report.cptCodes.map((code) => (
                        <span
                          key={code}
                          className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-gray-900">
                      ${report.estimatedAmount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ReportStatusBadge status={report.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 px-2 text-xs text-blue-600 hover:text-blue-700"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye className="h-3 w-3" />
                        Review
                      </Button>
                      {(report.status === "ready_for_review" ||
                        report.status === "reviewed") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 px-2 text-xs text-emerald-600 hover:text-emerald-700"
                          onClick={() => handleSign(report.id)}
                        >
                          <PenLine className="h-3 w-3" />
                          Sign
                        </Button>
                      )}
                      {report.status === "signed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 px-2 text-xs text-violet-600 hover:text-violet-700"
                          onClick={() => handleSubmit(report.id)}
                        >
                          <Send className="h-3 w-3" />
                          Submit
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          open={!!selectedReport}
          onOpenChange={(open) => !open && setSelectedReport(null)}
          onSign={handleSign}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
