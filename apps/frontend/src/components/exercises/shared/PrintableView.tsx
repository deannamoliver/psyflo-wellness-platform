"use client";

import { Printer } from "lucide-react";
import { Button } from "@/lib/core-ui/button";
import { cn } from "@/lib/tailwind-utils";

export interface PrintableViewProps {
  children: React.ReactNode;
  title?: string;
  showPrintButton?: boolean;
  className?: string;
}

export function PrintableView({
  children,
  title,
  showPrintButton = true,
  className,
}: PrintableViewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          /* Hide non-printable elements */
          .no-print,
          nav,
          header,
          footer,
          aside,
          button:not(.print-include) {
            display: none !important;
          }

          /* Reset body styles */
          body {
            background: white !important;
            color: black !important;
            font-size: 12pt !important;
            line-height: 1.5 !important;
          }

          /* Printable area styles */
          .printable-content {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0.5in !important;
            box-shadow: none !important;
            border: none !important;
          }

          /* Ensure text is black */
          .printable-content * {
            color: black !important;
          }

          /* Page breaks */
          .page-break {
            page-break-before: always;
          }

          .avoid-break {
            page-break-inside: avoid;
          }

          /* Table styles for print */
          table {
            border-collapse: collapse !important;
          }

          th,
          td {
            border: 1px solid #ccc !important;
            padding: 8px !important;
          }

          /* Remove backgrounds */
          * {
            background: white !important;
          }
        }
      `}</style>

      <div className={cn("relative", className)}>
        {/* Print button */}
        {showPrintButton && (
          <div className="no-print mb-4 flex items-center justify-between">
            {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        )}

        {/* Printable content */}
        <div className="printable-content rounded-lg border bg-white p-6 shadow-sm">
          {children}
        </div>
      </div>
    </>
  );
}
