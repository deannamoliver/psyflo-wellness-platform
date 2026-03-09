"use client";

import {
  AlertCircle,
  Download,
  Loader2,
  Mail,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "../core-ui/alert";
import { Button } from "../core-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../core-ui/card";
import { Input } from "../core-ui/input";
import { Label } from "../core-ui/label";
import { ScrollArea } from "../core-ui/scroll-area";
import { Switch } from "../core-ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../core-ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../core-ui/tabs";

type EmailFilterActions = {
  toggleStudentFiltering: (
    schoolId: string,
    enabled: boolean,
  ) => Promise<{ success: boolean }>;
  addEmail: (
    schoolId: string,
    email: string,
    role: "student" | "counselor",
  ) => Promise<{ success: boolean; email?: { id: string; email: string } }>;
  removeEmail: (
    emailId: string,
    schoolId: string,
  ) => Promise<{ success: boolean }>;
  bulkUpload: (
    schoolId: string,
    emails: string[],
    role: "student" | "counselor",
  ) => Promise<{
    success: boolean;
    inserted: number;
    invalid: string[];
    wrongDomain: string[];
    total: number;
  }>;
};

type UnifiedEmailFilterManagerProps = {
  schoolId: string;
  studentFilteringEnabled: boolean;
  studentEmails: Array<{ id: string; email: string }>;
  counselorEmails: Array<{ id: string; email: string }>;
  actions: EmailFilterActions;
};

function EmailListSection({
  userRole,
  emails,
  schoolId,
  actions,
  showToggle,
  filteringEnabled,
}: {
  userRole: "student" | "counselor";
  emails: Array<{ id: string; email: string }>;
  schoolId: string;
  actions: EmailFilterActions;
  showToggle: boolean;
  filteringEnabled?: boolean;
}) {
  const [localEmails, setLocalEmails] = useState(emails);
  const [newEmail, setNewEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isTogglingPending, startTogglingTransition] = useTransition();
  const [localFilteringEnabled, setLocalFilteringEnabled] =
    useState(filteringEnabled);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggle = (checked: boolean) => {
    if (!showToggle) return;

    startTogglingTransition(async () => {
      try {
        await actions.toggleStudentFiltering(schoolId, checked);
        setLocalFilteringEnabled(checked);
        toast.success(
          `Student email filtering ${checked ? "enabled" : "disabled"} successfully`,
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to toggle filtering",
        );
      }
    });
  };

  const handleAddEmail = () => {
    if (!newEmail.trim()) return;

    startTransition(async () => {
      try {
        const result = await actions.addEmail(
          schoolId,
          newEmail.trim(),
          userRole,
        );
        // Use the real database ID returned from the server
        if (result.email) {
          setLocalEmails([...localEmails, result.email]);
        }
        setNewEmail("");
        toast.success("Email added successfully");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to add email",
        );
      }
    });
  };

  const handleRemoveEmail = (emailId: string, email: string) => {
    startTransition(async () => {
      try {
        await actions.removeEmail(emailId, schoolId);
        setLocalEmails(localEmails.filter((e) => e.id !== emailId));
        toast.success(`Removed ${email}`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to remove email",
        );
      }
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/);
      const emailsToUpload = lines
        .map((line) => line.trim())
        .filter((line) => line?.includes("@"));

      startTransition(async () => {
        try {
          const result = await actions.bulkUpload(
            schoolId,
            emailsToUpload,
            userRole,
          );

          let description = `Successfully added ${result.inserted} out of ${result.total} emails.`;
          if (result.invalid.length > 0) {
            description += ` ${result.invalid.length} invalid email(s).`;
          }
          if (result.wrongDomain.length > 0) {
            description += ` ${result.wrongDomain.length} email(s) with wrong domain.`;
          }

          toast.success(description);

          // Refresh the page to show updated emails
          window.location.reload();
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Failed to upload emails",
          );
        }
      });
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = () => {
    const template = `email@example.com
another.email@example.com
third.email@example.com`;
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${userRole}_email_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const roleLabel = userRole === "student" ? "Student" : "Counselor";

  return (
    <div className="space-y-6">
      {/* Toggle Section (only for students) */}
      {showToggle && (
        <div className="flex items-center justify-between rounded-lg border-2 border-primary/20 bg-accent/30 p-4 transition-colors hover:bg-accent/40">
          <div className="space-y-0.5">
            <Label
              htmlFor={`${userRole}-email-filtering`}
              className="font-semibold text-base"
            >
              Enable {roleLabel} Email Filtering
            </Label>
            <div className="text-muted-foreground text-sm">
              When enabled, only emails in the allowed list below can create new{" "}
              {userRole} accounts. When disabled, anyone with your school&apos;s
              domain can sign up as a {userRole}. This does not affect existing
              users.
            </div>
          </div>
          <Switch
            id={`${userRole}-email-filtering`}
            checked={localFilteringEnabled}
            onCheckedChange={handleToggle}
            disabled={isTogglingPending}
          />
        </div>
      )}

      {/* Always-on notice for counselors */}
      {!showToggle && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Counselor signups always require pre-approval.</strong> Only
            emails in the list below can create new counselor accounts. This
            cannot be disabled.
          </AlertDescription>
        </Alert>
      )}

      {/* Warning Alert */}
      {showToggle && localFilteringEnabled && localEmails.length === 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {roleLabel} email filtering is enabled but no emails are allowed. No
            {userRole}s will be able to sign up until you add allowed emails.
          </AlertDescription>
        </Alert>
      )}

      {!showToggle && localEmails.length === 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No approved counselor emails. No one will be able to sign up as an
            counselor until you add allowed emails.
          </AlertDescription>
        </Alert>
      )}

      {/* Add Email Section */}
      <div className="space-y-2 rounded-lg border border-primary/30 border-dashed bg-muted/30 p-4">
        <Label htmlFor={`new-${userRole}-email`} className="font-semibold">
          Add {roleLabel} Email for New Signups
        </Label>
        <div className="flex gap-2">
          <Input
            id={`new-${userRole}-email`}
            type="email"
            placeholder={`${userRole}@school.edu`}
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddEmail();
              }
            }}
            disabled={isPending}
            className="border-primary/20 focus-visible:border-primary"
          />
          <Button
            onClick={handleAddEmail}
            disabled={!newEmail.trim() || isPending}
            className="gap-1"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add
          </Button>
        </div>
      </div>

      {/* Bulk Upload Section */}
      <div className="space-y-2">
        <Label>Bulk Upload</Label>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload CSV
          </Button>
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Upload a CSV or text file with one email per line
        </p>
      </div>

      {/* Emails List */}
      <div className="space-y-2">
        <Label>
          Pre-Approved {roleLabel} Emails for New Accounts ({localEmails.length}
          )
        </Label>
        {localEmails.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground text-sm">
              No pre-approved {userRole} emails yet. Add emails above to get
              started.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localEmails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-mono text-sm">
                        {email.email}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveEmail(email.id, email.email)
                          }
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}

export function UnifiedEmailFilterManager({
  schoolId,
  studentFilteringEnabled,
  studentEmails,
  counselorEmails,
  actions,
}: UnifiedEmailFilterManagerProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary-foreground">
            <Mail />
          </span>
          <div>
            <CardTitle>New User Signup Control</CardTitle>
            <CardDescription>
              Control which email addresses can create new student and counselor
              accounts at your school
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="counselors">Counselors</TabsTrigger>
          </TabsList>
          <TabsContent value="students" className="mt-6">
            <EmailListSection
              userRole="student"
              emails={studentEmails}
              schoolId={schoolId}
              actions={actions}
              showToggle={true}
              filteringEnabled={studentFilteringEnabled}
            />
          </TabsContent>
          <TabsContent value="counselors" className="mt-6">
            <EmailListSection
              userRole="counselor"
              emails={counselorEmails}
              schoolId={schoolId}
              actions={actions}
              showToggle={false}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
