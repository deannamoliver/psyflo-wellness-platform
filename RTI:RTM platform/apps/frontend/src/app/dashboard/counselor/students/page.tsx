import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/lib/core-ui/skeleton";
import {
  PageContainer,
  PageContent,
  PageSubtitle,
  PageTitle,
} from "@/lib/extended-ui/page";
import { fetchAllStudents } from "./~lib/data";
import { StudentsClient } from "./~lib/students-client";

async function StudentsData() {
  const students = await fetchAllStudents();
  if (!students) notFound();
  return <StudentsClient students={students} />;
}

export default function StudentsPage() {
  return (
    <PageContainer>
      <PageContent className="space-y-6">
        <div>
          <PageTitle className="font-semibold">Patients</PageTitle>
          <PageSubtitle>
            Monitor patient engagement, clinical indicators, and treatment progress.
          </PageSubtitle>
        </div>
        <Suspense fallback={<Skeleton className="h-96 w-full bg-white/50" />}>
          <StudentsData />
        </Suspense>
      </PageContent>
    </PageContainer>
  );
}
