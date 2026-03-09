"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/lib/core-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/lib/core-ui/dialog";
import { Input } from "@/lib/core-ui/input";
import { Label } from "@/lib/core-ui/label";
import {
  addSchoolDomainAction,
  createSchoolAction,
  removeSchoolDomainAction,
  updateSchoolAction,
} from "../../actions";

type SchoolFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school?: {
    id: string;
    name: string;
    address: string | null;
    email: string | null;
    domains: Array<{ id: string; domain: string }>;
  };
  onSuccess: () => void;
};

export function SchoolForm({
  open,
  onOpenChange,
  school,
  onSuccess,
}: SchoolFormProps) {
  const isEditing = !!school;
  const [isPending, startTransition] = useTransition();
  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const [newDomain, setNewDomain] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    domain: "",
  });

  // Update form data when school prop changes
  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name || "",
        address: school.address || "",
        email: school.email || "",
        domain: school.domains[0]?.domain || "",
      });
    } else {
      // Reset form when creating new school
      setFormData({
        name: "",
        address: "",
        email: "",
        domain: "",
      });
    }
  }, [school]);

  const handleAddDomain = () => {
    if (!school?.id) return;

    // Validation
    if (!newDomain.trim()) {
      toast.error("Please enter a domain");
      return;
    }

    if (!newDomain.includes(".")) {
      toast.error("Please enter a valid domain (e.g., school.edu)");
      return;
    }

    setIsAddingDomain(true);
    startTransition(async () => {
      try {
        await addSchoolDomainAction(school.id, newDomain.trim());
        toast.success("Domain added successfully");
        setNewDomain("");
        onSuccess();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to add domain",
        );
      } finally {
        setIsAddingDomain(false);
      }
    });
  };

  const handleRemoveDomain = (domainId: string) => {
    if (!school?.id) return;

    startTransition(async () => {
      try {
        await removeSchoolDomainAction(domainId);
        toast.success("Domain removed successfully");
        onSuccess();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to remove domain",
        );
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name.trim() ||
      !formData.address.trim() ||
      !formData.email.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!isEditing && !formData.domain.trim()) {
      toast.error("Domain is required");
      return;
    }

    // Email validation
    if (!formData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Domain validation (only for creation)
    if (!isEditing && !formData.domain.includes(".")) {
      toast.error("Please enter a valid domain (e.g., school.edu)");
      return;
    }

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateSchoolAction(school.id, {
            name: formData.name.trim(),
            address: formData.address.trim(),
            email: formData.email.trim(),
          });
          toast.success("School updated successfully");
        } else {
          await createSchoolAction({
            name: formData.name.trim(),
            address: formData.address.trim(),
            email: formData.email.trim(),
            domain: formData.domain.trim(),
          });
          toast.success("School created successfully");
        }
        onSuccess();
        onOpenChange(false);
        // Reset form
        setFormData({ name: "", address: "", email: "", domain: "" });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save school",
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit School" : "Add New School"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update school information. Note: domain cannot be changed."
              : "Create a new school. All fields are required."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                School Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., University of California"
                disabled={isPending}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">
                Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="e.g., 123 College Ave, City, State 12345"
                disabled={isPending}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">
                Contact Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="e.g., contact@school.edu"
                disabled={isPending}
                required
              />
            </div>

            {!isEditing ? (
              <div className="grid gap-2">
                <Label htmlFor="domain">
                  Email Domain <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="domain"
                  value={formData.domain}
                  onChange={(e) =>
                    setFormData({ ...formData, domain: e.target.value })
                  }
                  placeholder="e.g., school.edu"
                  disabled={isPending}
                  required
                />
              </div>
            ) : (
              <div className="grid gap-2">
                <Label>Email Domains</Label>
                <div className="space-y-2">
                  {school?.domains.map((domain) => (
                    <div
                      key={domain.id}
                      className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2"
                    >
                      <span className="font-mono text-sm">{domain.domain}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDomain(domain.id)}
                        disabled={
                          isPending ||
                          isAddingDomain ||
                          (school?.domains.length ?? 0) <= 1
                        }
                        title={
                          (school?.domains.length ?? 0) <= 1
                            ? "Cannot remove the last domain"
                            : "Remove domain"
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add new domain (e.g., school.edu)"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddDomain();
                        }
                      }}
                      disabled={isPending || isAddingDomain}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAddDomain}
                      disabled={
                        isPending || isAddingDomain || !newDomain.trim()
                      }
                    >
                      {isAddingDomain ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Students and counselors can sign up with emails from any of
                    these domains
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update School"
              ) : (
                "Create School"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
