"use client";

import { ChevronDownIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/lib/core-ui/button";
import { Card, CardContent, CardHeader } from "@/lib/core-ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/lib/core-ui/dropdown-menu";
import { Input } from "@/lib/core-ui/input";
import { Label } from "@/lib/core-ui/label";
import { H3, Muted } from "@/lib/core-ui/typography";
import { titleCase } from "@/lib/string-utils";
import {
  type PersonalInfoFormData,
  updateStudentPersonalInfo,
} from "./personal-info-actions";
import {
  ETHNICITY_OPTIONS,
  GENDER_OPTIONS,
  LANGUAGE_OPTIONS,
  PRONOUN_OPTIONS,
} from "./personal-info-options";

const DROPDOWN_CONTENT_CLASS =
  "bg-white font-dm [&_[data-slot=dropdown-menu-radio-item]]:[--item-text:rgb(17,24,39)] [&_[data-slot=dropdown-menu-radio-item]]:[color:var(--item-text)] [&_[data-slot=dropdown-menu-radio-item]]:focus:[color:var(--item-text)] [&_[data-slot=dropdown-menu-radio-item]]:hover:[color:var(--item-text)] [&_[data-slot=dropdown-menu-radio-item]]:pl-9 [&_[data-slot=dropdown-menu-radio-item]]:pr-4 [&_[data-slot=dropdown-menu-radio-item]]:py-3 [&_[data-slot=dropdown-menu-radio-item]]:focus:bg-secondary [&_[data-slot=dropdown-menu-radio-item]]:hover:bg-secondary/80";

function ViewField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 font-dm">
      <Muted className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
        {label}
      </Muted>
      <span className="text-gray-900 text-sm">{value ?? "-"}</span>
    </div>
  );
}

export function PersonalInfoClient({
  studentId,
  initialData,
}: {
  studentId: string;
  initialData: PersonalInfoFormData & { fullName: string };
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PersonalInfoFormData>({
    firstName: initialData.firstName,
    lastName: initialData.lastName,
    email: initialData.email,
    grade: initialData.grade,
    dateOfBirth: initialData.dateOfBirth,
    gender: initialData.gender,
    ethnicity: initialData.ethnicity,
    pronouns: initialData.pronouns,
    language: initialData.language,
    homeAddress: initialData.homeAddress,
  });

  const fullName =
    [form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(" ") ||
    "-";
  const preferredName = form.firstName.trim() || "-";
  const ageDisplay = form.dateOfBirth.trim()
    ? (() => {
        const d = new Date(form.dateOfBirth);
        if (isNaN(d.getTime())) return null;
        const age = Math.floor(
          (Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
        );
        return `${age} years old`;
      })()
    : null;
  const dobDisplay = form.dateOfBirth.trim()
    ? (() => {
        const d = new Date(form.dateOfBirth);
        return isNaN(d.getTime())
          ? form.dateOfBirth
          : d.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            });
      })()
    : null;
  const genderDisplay = form.gender
    ? titleCase(form.gender, { delimiter: "_" })
    : null;
  const ethnicityDisplay = form.ethnicity
    ? titleCase(form.ethnicity, { delimiter: "_" })
    : null;
  const pronounsDisplay = form.pronouns
    ? titleCase(form.pronouns, { delimiter: "_" })
    : null;
  const languageDisplay = form.language
    ? titleCase(form.language, { delimiter: "_" })
    : null;

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    const result = await updateStudentPersonalInfo(studentId, form);
    setSaving(false);
    if (result.ok) {
      setIsEditing(false);
      router.refresh();
    } else {
      setError(result.error ?? "Failed to save");
    }
  };

  const handleCancel = () => {
    setForm({
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      email: initialData.email,
      grade: initialData.grade,
      dateOfBirth: initialData.dateOfBirth,
      gender: initialData.gender,
      ethnicity: initialData.ethnicity,
      pronouns: initialData.pronouns,
      language: initialData.language,
      homeAddress: initialData.homeAddress,
    });
    setError(null);
    setIsEditing(false);
  };

  return (
    <Card className="w-full gap-4 bg-white py-6 shadow-sm">
      <CardHeader className="flex items-center justify-between px-8 pt-0">
        <H3 className="font-dm font-semibold text-lg">Personal Information</H3>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="font-dm font-medium text-primary text-sm hover:text-primary/80"
          >
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={saving}
              className="border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-primary font-medium text-primary-foreground hover:bg-primary/90"
            >
              {saving && <Loader2 className="h-4 w-4 shrink-0 animate-spin" />}
              Save
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-5 px-8 pb-0">
        {error && (
          <p className="font-dm text-red-600 text-sm" role="alert">
            {error}
          </p>
        )}
        {!isEditing ? (
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <ViewField label="Full Name" value={fullName} />
            <ViewField label="Preferred Name" value={preferredName} />
            <ViewField label="Age" value={dobDisplay ? ageDisplay : null} />
            <ViewField label="Date of Birth" value={dobDisplay} />
            <ViewField label="Gender" value={genderDisplay} />
            <ViewField label="Race/Ethnicity" value={ethnicityDisplay} />
            <ViewField label="Pronouns" value={pronounsDisplay} />
            <ViewField label="Home Language" value={languageDisplay} />
            <ViewField
              label="Email Address"
              value={form.email.trim() || null}
            />
            <ViewField
              label="Home Address"
              value={form.homeAddress.trim() || null}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-8 gap-y-5 font-dm">
            <div className="flex flex-col gap-1.5">
              <Label className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
                First Name
              </Label>
              <Input
                value={form.firstName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, firstName: e.target.value }))
                }
                className="h-9 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Last Name
              </Label>
              <Input
                value={form.lastName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, lastName: e.target.value }))
                }
                className="h-9 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Email Address
              </Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                className="h-9 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Age
              </Label>
              <Input
                type="text"
                value={ageDisplay ?? "-"}
                disabled
                className="h-9 text-sm bg-gray-50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Date of Birth
              </Label>
              <Input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dateOfBirth: e.target.value }))
                }
                className="h-9 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Gender
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-between gap-2 border-gray-200 bg-white font-dm font-normal text-gray-700 hover:bg-gray-50 hover:text-gray-700"
                  >
                    {form.gender
                      ? (GENDER_OPTIONS.find((o) => o.value === form.gender)
                          ?.label ?? "-")
                      : "-"}
                    <ChevronDownIcon className="size-4 shrink-0 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className={DROPDOWN_CONTENT_CLASS}
                >
                  <DropdownMenuRadioGroup
                    value={form.gender || "__none__"}
                    onValueChange={(v) =>
                      setForm((p) => ({
                        ...p,
                        gender: v === "__none__" ? "" : v,
                      }))
                    }
                  >
                    <DropdownMenuRadioItem
                      value="__none__"
                      className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                    >
                      -
                    </DropdownMenuRadioItem>
                    {GENDER_OPTIONS.map((opt) => (
                      <DropdownMenuRadioItem
                        key={opt.value}
                        value={opt.value}
                        className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                      >
                        {opt.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Race/Ethnicity
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-between gap-2 border-gray-200 bg-white font-dm font-normal text-gray-700 hover:bg-gray-50 hover:text-gray-700"
                  >
                    {form.ethnicity
                      ? (ETHNICITY_OPTIONS.find(
                          (o) => o.value === form.ethnicity,
                        )?.label ?? "-")
                      : "-"}
                    <ChevronDownIcon className="size-4 shrink-0 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className={DROPDOWN_CONTENT_CLASS}
                >
                  <DropdownMenuRadioGroup
                    value={form.ethnicity || "__none__"}
                    onValueChange={(v) =>
                      setForm((p) => ({
                        ...p,
                        ethnicity: v === "__none__" ? "" : v,
                      }))
                    }
                  >
                    <DropdownMenuRadioItem
                      value="__none__"
                      className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                    >
                      -
                    </DropdownMenuRadioItem>
                    {ETHNICITY_OPTIONS.map((opt) => (
                      <DropdownMenuRadioItem
                        key={opt.value}
                        value={opt.value}
                        className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                      >
                        {opt.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Pronouns
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-between gap-2 border-gray-200 bg-white font-dm font-normal text-gray-700 hover:bg-gray-50 hover:text-gray-700"
                  >
                    {form.pronouns
                      ? (PRONOUN_OPTIONS.find((o) => o.value === form.pronouns)
                          ?.label ?? "-")
                      : "-"}
                    <ChevronDownIcon className="size-4 shrink-0 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className={DROPDOWN_CONTENT_CLASS}
                >
                  <DropdownMenuRadioGroup
                    value={form.pronouns || "__none__"}
                    onValueChange={(v) =>
                      setForm((p) => ({
                        ...p,
                        pronouns: v === "__none__" ? "" : v,
                      }))
                    }
                  >
                    <DropdownMenuRadioItem
                      value="__none__"
                      className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                    >
                      -
                    </DropdownMenuRadioItem>
                    {PRONOUN_OPTIONS.map((opt) => (
                      <DropdownMenuRadioItem
                        key={opt.value}
                        value={opt.value}
                        className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                      >
                        {opt.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Home Language
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-between gap-2 border-gray-200 bg-white font-dm font-normal text-gray-700 hover:bg-gray-50 hover:text-gray-700"
                  >
                    {form.language
                      ? (LANGUAGE_OPTIONS.find((o) => o.value === form.language)
                          ?.label ?? "-")
                      : "-"}
                    <ChevronDownIcon className="size-4 shrink-0 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className={DROPDOWN_CONTENT_CLASS}
                >
                  <DropdownMenuRadioGroup
                    value={form.language || "__none__"}
                    onValueChange={(v) =>
                      setForm((p) => ({
                        ...p,
                        language: v === "__none__" ? "" : v,
                      }))
                    }
                  >
                    <DropdownMenuRadioItem
                      value="__none__"
                      className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                    >
                      -
                    </DropdownMenuRadioItem>
                    {LANGUAGE_OPTIONS.map((opt) => (
                      <DropdownMenuRadioItem
                        key={opt.value}
                        value={opt.value}
                        className="text-gray-900 hover:text-gray-900 focus:text-gray-900"
                      >
                        {opt.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Home Address
              </Label>
              <Input
                value={form.homeAddress}
                onChange={(e) =>
                  setForm((p) => ({ ...p, homeAddress: e.target.value }))
                }
                placeholder="Enter home address"
                className="h-9 text-sm"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
