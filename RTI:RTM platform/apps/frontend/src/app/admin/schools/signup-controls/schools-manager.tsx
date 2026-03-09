"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import { adminGetEmailFilterSettings } from "@/lib/email-filtering/actions";
import {
  adminAddEmail,
  adminBulkUpload,
  adminRemoveEmail,
  adminToggleStudentFiltering,
} from "@/lib/email-filtering/admin-actions";
import { UnifiedEmailFilterManager } from "@/lib/email-filtering/unified-email-filter-manager";

type School = {
  id: string;
  name: string;
};

export function SchoolsManager({ schools }: { schools: School[] }) {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(
    schools[0]?.id ?? "",
  );
  const [studentSettings, setStudentSettings] = useState<{
    studentFilteringEnabled: boolean;
    emails: Array<{ id: string; email: string }>;
  } | null>(null);
  const [counselorSettings, setCounselorSettings] = useState<{
    studentFilteringEnabled: boolean;
    emails: Array<{ id: string; email: string }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadSettings = useCallback(async (schoolId: string) => {
    if (!schoolId) return;

    setIsLoading(true);
    try {
      const [studentData, counselorData] = await Promise.all([
        adminGetEmailFilterSettings(schoolId, "student"),
        adminGetEmailFilterSettings(schoolId, "counselor"),
      ]);
      setStudentSettings(studentData);
      setCounselorSettings(counselorData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSchoolId) {
      loadSettings(selectedSchoolId);
    }
  }, [selectedSchoolId, loadSettings]);

  const handleSchoolChange = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="font-medium text-sm">Select School</label>
        <Select value={selectedSchoolId} onValueChange={handleSchoolChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a school" />
          </SelectTrigger>
          <SelectContent>
            {schools.map((school) => (
              <SelectItem key={school.id} value={school.id}>
                {school.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      )}

      {!isLoading &&
        studentSettings &&
        counselorSettings &&
        selectedSchoolId && (
          <UnifiedEmailFilterManager
            key={selectedSchoolId}
            schoolId={selectedSchoolId}
            studentFilteringEnabled={studentSettings.studentFilteringEnabled}
            studentEmails={studentSettings.emails}
            counselorEmails={counselorSettings.emails}
            actions={{
              toggleStudentFiltering: adminToggleStudentFiltering,
              addEmail: adminAddEmail,
              removeEmail: adminRemoveEmail,
              bulkUpload: adminBulkUpload,
            }}
          />
        )}
    </div>
  );
}
