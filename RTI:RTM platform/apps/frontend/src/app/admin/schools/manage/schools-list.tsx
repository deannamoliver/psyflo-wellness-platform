"use client";

import { Building2, Edit, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/lib/core-ui/alert-dialog";
import { Button } from "@/lib/core-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/lib/core-ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/core-ui/table";
import { deleteSchoolAction } from "../../actions";
import { SchoolForm } from "./school-form";

type School = {
  id: string;
  name: string;
  address: string | null;
  email: string | null;
  createdAt: Date;
  domains: Array<{ id: string; domain: string }>;
};

type SchoolsListProps = {
  schools: School[];
};

export function SchoolsList({ schools: initialSchools }: SchoolsListProps) {
  const [schools, setSchools] = useState(initialSchools);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | undefined>();
  const [deletingSchoolId, setDeletingSchoolId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEdit = (school: School) => {
    setEditingSchool(school);
    setIsFormOpen(true);
  };

  const handleDelete = (schoolId: string) => {
    startTransition(async () => {
      try {
        await deleteSchoolAction(schoolId);
        setSchools(schools.filter((s) => s.id !== schoolId));
        toast.success("School deleted successfully");
        setDeletingSchoolId(null);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete school",
        );
      }
    });
  };

  const handleSuccess = () => {
    // Refresh the page to get updated data
    window.location.reload();
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSchool(undefined);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary-foreground">
                <Building2 />
              </span>
              <div>
                <CardTitle>Manage Schools</CardTitle>
                <CardDescription>
                  Create and manage schools in the system
                </CardDescription>
              </div>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add School
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {schools.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 font-semibold text-lg">No schools yet</p>
              <p className="mb-4 text-muted-foreground text-sm">
                Get started by creating your first school
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add School
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">
                        {school.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {school.domains.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {school.domains.map((domain) => (
                              <span key={domain.id}>{domain.domain}</span>
                            ))}
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {school.email || "N/A"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">
                        {school.address || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(school.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(school)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingSchoolId(school.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <SchoolForm
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        school={editingSchool}
        onSuccess={handleSuccess}
      />

      <AlertDialog
        open={!!deletingSchoolId}
        onOpenChange={(open) => !open && setDeletingSchoolId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft delete the school and its associated domain. This
              action cannot be undone. Users associated with this school will
              not be deleted but may lose access to school-specific features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingSchoolId && handleDelete(deletingSchoolId)}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete School"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
