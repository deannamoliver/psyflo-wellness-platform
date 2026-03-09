"use client";

import { useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ExerciseRouter } from "@/components/exercises/ExerciseRouter";

export default function ExercisePage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const exerciseId = params["exerciseId"] as string;
  const assignmentId = searchParams.get("assignment") ?? "";
  const patientId = searchParams.get("patient") ?? "";

  // TODO: Get clinicianId from auth context
  const clinicianId = "clinician-1";

  // Build back link - go to patient detail if we have patientId
  const backHref = patientId
    ? `/dashboard/counselor/rtm/${patientId}`
    : "/dashboard/counselor/rtm";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <div className="border-b bg-white px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center gap-4">
          <Link
            href={backHref}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patient
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-4xl p-6">
        <ExerciseRouter
          exerciseId={exerciseId}
          assignmentId={assignmentId}
          patientId={patientId}
          clinicianId={clinicianId}
          onComplete={(response) => {
            console.log("Exercise completed:", response);
            // TODO: Update assignment status if all required completions are done
          }}
        />
      </div>
    </div>
  );
}
