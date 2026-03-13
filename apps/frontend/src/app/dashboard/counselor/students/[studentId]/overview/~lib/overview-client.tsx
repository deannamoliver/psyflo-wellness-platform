"use client";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Heart,
  LogIn,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Save,
  Shield,
  ShieldCheck,
  Smile,
  Target,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/tailwind-utils";
import {
  type PersonalInfoFormData,
  updateStudentPersonalInfo,
} from "./personal-info-actions";
import {
  type SafetyPlan,
  loadProviderData,
  saveProviderData,
} from "@/app/dashboard/~lib/provider-store";
import { saveProviderDataServer } from "@/app/dashboard/~lib/provider-data-actions";

// ─── Types ──────────────────────────────────────────────────────────

type PersonalInfo = {
  fullName: string;
  age: string | null;
  dob: string | null;
  gender: string | null;
  grade: string;
  pronouns: string | null;
  ethnicity: string | null;
  language: string | null;
  email: string;
  phone: string;
  homeAddress: string;
};

type EmergencyContact = {
  name: string;
  type: "school" | "home";
  tag: string | null;
  role: string;
  phone?: string;
  email?: string;
};

type RecentActivity = {
  id: string;
  type: "mood" | "conversation" | "assessment" | "login" | "exercise" | "screener" | "handoff" | "journal";
  title: string;
  subtitle: string;
  detail?: string;
};

type ScreeningResult = {
  name: string;
  score: number;
  max: number;
  severity: string;
  trend: "up" | "down" | "stable";
  change: number;
};

type AdherenceData = {
  exerciseCompletion: number;
  assessmentCompletion: number;
  sessionAttendance: number;
  overallAdherence: number;
};

type OverviewData = {
  studentId: string;
  personalInfo: PersonalInfo;
  emergencyContacts: EmergencyContact[];
  recentActivities: RecentActivity[];
  screeningResults: ScreeningResult[];
  adherence: AdherenceData;
};

// ─── Editable field keys (subset the counselor can update) ─────────

type EditableFields = {
  gender: string;
  grade: string;
  pronouns: string;
  ethnicity: string;
  language: string;
  email: string;
  phone: string;
  homeAddress: string;
};

const GENDER_OPTIONS = ["", "Male", "Female", "Non Binary", "Prefer Not To Answer"];
const PRONOUN_OPTIONS = ["", "He/Him", "She/Her", "They/Them", "Prefer Not To Answer"];
const LANGUAGE_OPTIONS = ["", "English", "Spanish", "French", "Chinese Simplified", "Arabic", "Haitian Creole", "Bengali", "Russian", "Urdu", "Vietnamese", "Portuguese"];
const ETHNICITY_OPTIONS = ["", "American Indian Or Alaska Native", "Asian", "Black Or African American", "Hispanic Or Latino", "Middle Eastern Or North African", "Native Hawaiian Or Pacific Islander", "White", "Prefer Not To Answer"];

// ─── Personal Info Popup ────────────────────────────────────────────

const CONTACT_TYPE_OPTIONS: EmergencyContact["type"][] = ["school", "home"];
const CONTACT_TAG_OPTIONS = ["", "Primary", "Backup #1", "Backup #2"];

const emptyContact = (): EmergencyContact => ({
  name: "", type: "home", tag: null, role: "", phone: "", email: "",
});

function PersonalInfoPopup({
  info,
  contacts,
  onClose,
  onSave,
  saving,
}: {
  info: PersonalInfo;
  contacts: EmergencyContact[];
  onClose: () => void;
  onSave?: (updated: EditableFields, updatedContacts: EmergencyContact[]) => void;
  saving?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EditableFields>({
    gender: info.gender ?? "",
    grade: info.grade ?? "",
    pronouns: info.pronouns ?? "",
    ethnicity: info.ethnicity ?? "",
    language: info.language ?? "",
    email: info.email ?? "",
    phone: info.phone ?? "",
    homeAddress: info.homeAddress ?? "",
  });
  const [contactsDraft, setContactsDraft] = useState<EmergencyContact[]>(contacts);

  const handleCancel = useCallback(() => {
    setDraft({
      gender: info.gender ?? "",
      grade: info.grade ?? "",
      pronouns: info.pronouns ?? "",
      ethnicity: info.ethnicity ?? "",
      language: info.language ?? "",
      email: info.email ?? "",
      phone: info.phone ?? "",
      homeAddress: info.homeAddress ?? "",
    });
    setContactsDraft(contacts);
    setEditing(false);
  }, [info, contacts]);

  const handleSave = useCallback(() => {
    onSave?.(draft, contactsDraft);
    setEditing(false);
  }, [draft, contactsDraft, onSave]);

  const setField = (key: keyof EditableFields, value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const updateContact = (idx: number, patch: Partial<EmergencyContact>) =>
    setContactsDraft((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));

  const removeContact = (idx: number) =>
    setContactsDraft((prev) => prev.filter((_, i) => i !== idx));

  const addContact = () =>
    setContactsDraft((prev) => [...prev, emptyContact()]);

  // Fields config
  const fields: { label: string; value: string | null; key?: keyof EditableFields; options?: string[] }[] = [
    { label: "Full Name", value: info.fullName },
    { label: "Age", value: info.age },
    { label: "DOB", value: info.dob },
    { label: "Gender", value: editing ? draft.gender : info.gender, key: "gender", options: GENDER_OPTIONS },
    { label: "Grade", value: editing ? draft.grade : (info.grade || null), key: "grade" },
    { label: "Pronouns", value: editing ? draft.pronouns : info.pronouns, key: "pronouns", options: PRONOUN_OPTIONS },
    { label: "Race/Ethnicity", value: editing ? draft.ethnicity : info.ethnicity, key: "ethnicity", options: ETHNICITY_OPTIONS },
    { label: "Home Language", value: editing ? draft.language : info.language, key: "language", options: LANGUAGE_OPTIONS },
    { label: "Email", value: editing ? draft.email : (info.email || null), key: "email" },
    { label: "Phone", value: editing ? draft.phone : (info.phone || null), key: "phone" },
    { label: "Address", value: editing ? draft.homeAddress : (info.homeAddress || null), key: "homeAddress" },
  ];

  const inputCls = "w-full rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-sm text-gray-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400";

  const visibleContacts = editing ? contactsDraft : contacts;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md rounded-2xl border bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-5 py-3.5">
          <h3 className="text-sm font-semibold text-gray-900">Patient Details</h3>
          <div className="flex items-center gap-1">
            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            )}
            <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4 space-y-5">
          {/* Personal */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Personal Information</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {fields.map((f) => (
                <div key={f.label}>
                  <p className="text-[10px] font-medium text-gray-400 uppercase">{f.label}</p>
                  {editing && f.key ? (
                    f.options ? (
                      <select
                        value={draft[f.key]}
                        onChange={(e) => setField(f.key!, e.target.value)}
                        className={cn(inputCls, "mt-0.5")}
                      >
                        {f.options.map((opt) => (
                          <option key={opt} value={opt}>{opt || "—"}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={draft[f.key]}
                        onChange={(e) => setField(f.key!, e.target.value)}
                        className={cn(inputCls, "mt-0.5")}
                      />
                    )
                  ) : (
                    <p className="text-sm text-gray-900">{f.value ?? "—"}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Save / Cancel bar */}
          {editing && (
            <div className="flex items-center justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                <Check className="h-3 w-3" />
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}

          {/* Emergency Contacts */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Emergency Contacts</p>
              {editing && (
                <button
                  type="button"
                  onClick={addContact}
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium text-blue-600 transition-colors hover:bg-blue-50"
                >
                  <Plus className="h-3 w-3" />
                  Add Contact
                </button>
              )}
            </div>

            {visibleContacts.length === 0 && !editing && (
              <p className="text-xs text-gray-400">No emergency contacts on file.</p>
            )}

            <div className="space-y-2">
              {visibleContacts.map((c, idx) =>
                editing ? (
                  <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase text-gray-400">Contact {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeContact(idx)}
                        className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-red-500 transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">Name</p>
                        <input type="text" value={c.name} onChange={(e) => updateContact(idx, { name: e.target.value })} className={inputCls} placeholder="Full name" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">Role / Relation</p>
                        <input type="text" value={c.role} onChange={(e) => updateContact(idx, { role: e.target.value })} className={inputCls} placeholder="e.g. Mother" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">Type</p>
                        <select value={c.type} onChange={(e) => updateContact(idx, { type: e.target.value as EmergencyContact["type"] })} className={inputCls}>
                          {CONTACT_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t === "school" ? "Clinic" : "Home"}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">Priority</p>
                        <select value={c.tag ?? ""} onChange={(e) => updateContact(idx, { tag: e.target.value || null })} className={inputCls}>
                          {CONTACT_TAG_OPTIONS.map((t) => <option key={t} value={t}>{t || "—"}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">Phone</p>
                        <input type="tel" value={c.phone ?? ""} onChange={(e) => updateContact(idx, { phone: e.target.value })} className={inputCls} placeholder="(555) 000-0000" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">Email</p>
                        <input type="email" value={c.email ?? ""} onChange={(e) => updateContact(idx, { email: e.target.value })} className={inputCls} placeholder="email@example.com" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={idx} className="rounded-lg border border-gray-100 p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                      <span className={cn(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                        c.type === "school" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700",
                      )}>
                        {c.type === "school" ? "Clinic" : "Home"}
                      </span>
                      {c.tag && (
                        <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
                          {c.tag}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{c.role}</p>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-gray-600">
                      {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
                      {c.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>}
                    </div>
                  </div>
                ),
              )}
            </div>

            {editing && contactsDraft.length === 0 && (
              <p className="mt-2 text-center text-xs text-gray-400">No contacts yet. Click "Add Contact" above.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Safety Plan Card Component ──────────────────────────────────────

const emptySafetyPlan: SafetyPlan = {
  warningSignsInternal: [],
  warningSignsExternal: [],
  copingStrategies: [],
  distractions: [],
  supportPeople: [],
  professionalContacts: [],
  safeEnvironment: "",
  reasonsToLive: [],
  lastUpdated: "",
};

function SafetyPlanCard({ studentId }: { studentId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [safetyPlan, setSafetyPlan] = useState<SafetyPlan>(() => {
    const stored = loadProviderData(studentId);
    return stored?.safetyPlan ?? emptySafetyPlan;
  });
  const [draft, setDraft] = useState<SafetyPlan>(safetyPlan);

  const hasPlan = safetyPlan.lastUpdated !== "";

  const handleSave = () => {
    const updated = { ...draft, lastUpdated: new Date().toISOString() };
    setSafetyPlan(updated);
    setEditing(false);
    // Persist
    const stored = loadProviderData(studentId);
    saveProviderData(studentId, { ...stored, safetyPlan: updated });
    saveProviderDataServer(studentId, { ...stored, safetyPlan: updated }).catch(() => {});
  };

  const handleCancel = () => {
    setDraft(safetyPlan);
    setEditing(false);
  };

  const updateListField = (field: keyof SafetyPlan, index: number, value: string) => {
    setDraft((prev) => {
      const arr = [...(prev[field] as string[])];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const addListItem = (field: keyof SafetyPlan) => {
    setDraft((prev) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), ""],
    }));
  };

  const removeListItem = (field: keyof SafetyPlan, index: number) => {
    setDraft((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  const updateContactField = (
    field: "supportPeople" | "professionalContacts",
    index: number,
    key: string,
    value: string
  ) => {
    setDraft((prev) => {
      const arr = [...prev[field]];
      arr[index] = { ...arr[index], [key]: value };
      return { ...prev, [field]: arr };
    });
  };

  const addContact = (field: "supportPeople" | "professionalContacts") => {
    setDraft((prev) => ({
      ...prev,
      [field]: [...prev[field], field === "supportPeople" ? { name: "", phone: "" } : { name: "", phone: "", role: "" }],
    }));
  };

  const removeContact = (field: "supportPeople" | "professionalContacts", index: number) => {
    setDraft((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const inputCls = "w-full rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400";

  const renderListSection = (
    title: string,
    field: keyof SafetyPlan,
    placeholder: string,
    icon: React.ReactNode
  ) => {
    const items = (editing ? draft[field] : safetyPlan[field]) as string[];
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-xs font-semibold text-gray-700">{title}</span>
        </div>
        {editing ? (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateListField(field, i, e.target.value)}
                  placeholder={placeholder}
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => removeListItem(field, i)}
                  className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem(field)}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>
        ) : items.length > 0 ? (
          <ul className="space-y-1">
            {items.map((item, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-400 italic">Not documented</p>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-xl border bg-white">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-red-500" />
          <h4 className="text-xs font-semibold text-gray-900">Safety Plan</h4>
          {hasPlan && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              Active
            </span>
          )}
          {!hasPlan && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
              Not Created
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasPlan && !expanded && (
            <span className="text-[10px] text-gray-400">
              Updated {new Date(safetyPlan.lastUpdated).toLocaleDateString()}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t px-4 py-4">
          {!editing && (
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => { setDraft(safetyPlan); setEditing(true); }}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
              >
                <Pencil className="h-3 w-3" />
                {hasPlan ? "Edit" : "Create Safety Plan"}
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {/* Warning Signs */}
            <div className="space-y-4">
              {renderListSection(
                "Warning Signs (Internal)",
                "warningSignsInternal",
                "e.g., Feeling hopeless, racing thoughts",
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              )}
              {renderListSection(
                "Warning Signs (External)",
                "warningSignsExternal",
                "e.g., Isolating from friends, not sleeping",
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              )}
            </div>

            {/* Coping & Distractions */}
            <div className="space-y-4">
              {renderListSection(
                "Coping Strategies",
                "copingStrategies",
                "e.g., Deep breathing, going for a walk",
                <Heart className="h-3.5 w-3.5 text-pink-500" />
              )}
              {renderListSection(
                "Distractions",
                "distractions",
                "e.g., Watching a movie, calling a friend",
                <Smile className="h-3.5 w-3.5 text-emerald-500" />
              )}
            </div>

            {/* Support People */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-semibold text-gray-700">Support People</span>
              </div>
              {editing ? (
                <div className="space-y-2">
                  {draft.supportPeople.map((person, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={person.name}
                        onChange={(e) => updateContactField("supportPeople", i, "name", e.target.value)}
                        placeholder="Name"
                        className={cn(inputCls, "flex-1")}
                      />
                      <input
                        type="tel"
                        value={person.phone}
                        onChange={(e) => updateContactField("supportPeople", i, "phone", e.target.value)}
                        placeholder="Phone"
                        className={cn(inputCls, "w-32")}
                      />
                      <button
                        type="button"
                        onClick={() => removeContact("supportPeople", i)}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addContact("supportPeople")}
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-3 w-3" />
                    Add Person
                  </button>
                </div>
              ) : safetyPlan.supportPeople.length > 0 ? (
                <div className="space-y-1">
                  {safetyPlan.supportPeople.map((person, i) => (
                    <div key={i} className="text-sm text-gray-600">
                      <span className="font-medium">{person.name}</span>
                      {person.phone && <span className="text-gray-400"> — {person.phone}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Not documented</p>
              )}
            </div>

            {/* Professional Contacts */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-3.5 w-3.5 text-violet-500" />
                <span className="text-xs font-semibold text-gray-700">Professional Contacts</span>
              </div>
              {editing ? (
                <div className="space-y-2">
                  {draft.professionalContacts.map((contact, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => updateContactField("professionalContacts", i, "name", e.target.value)}
                        placeholder="Name"
                        className={cn(inputCls, "flex-1")}
                      />
                      <input
                        type="text"
                        value={contact.role}
                        onChange={(e) => updateContactField("professionalContacts", i, "role", e.target.value)}
                        placeholder="Role"
                        className={cn(inputCls, "w-24")}
                      />
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => updateContactField("professionalContacts", i, "phone", e.target.value)}
                        placeholder="Phone"
                        className={cn(inputCls, "w-28")}
                      />
                      <button
                        type="button"
                        onClick={() => removeContact("professionalContacts", i)}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addContact("professionalContacts")}
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-3 w-3" />
                    Add Contact
                  </button>
                </div>
              ) : safetyPlan.professionalContacts.length > 0 ? (
                <div className="space-y-1">
                  {safetyPlan.professionalContacts.map((contact, i) => (
                    <div key={i} className="text-sm text-gray-600">
                      <span className="font-medium">{contact.name}</span>
                      {contact.role && <span className="text-gray-500"> ({contact.role})</span>}
                      {contact.phone && <span className="text-gray-400"> — {contact.phone}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Not documented</p>
              )}
            </div>

            {/* Safe Environment */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-3.5 w-3.5 text-teal-500" />
                <span className="text-xs font-semibold text-gray-700">Making Environment Safe</span>
              </div>
              {editing ? (
                <textarea
                  value={draft.safeEnvironment}
                  onChange={(e) => setDraft((prev) => ({ ...prev, safeEnvironment: e.target.value }))}
                  placeholder="Steps to make the environment safer..."
                  rows={2}
                  className={inputCls}
                />
              ) : safetyPlan.safeEnvironment ? (
                <p className="text-sm text-gray-600">{safetyPlan.safeEnvironment}</p>
              ) : (
                <p className="text-xs text-gray-400 italic">Not documented</p>
              )}
            </div>

            {/* Reasons to Live */}
            <div>
              {renderListSection(
                "Reasons to Live",
                "reasonsToLive",
                "e.g., Family, future goals, pets",
                <Heart className="h-3.5 w-3.5 text-red-500" />
              )}
            </div>
          </div>

          {/* Save/Cancel buttons */}
          {editing && (
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                <Save className="h-3 w-3" />
                Save Safety Plan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Overview Component ────────────────────────────────────────

export function OverviewClient({
  studentId,
  personalInfo: initialInfo,
  emergencyContacts: initialContacts,
  recentActivities,
  screeningResults: _screeningResults,
  adherence,
}: OverviewData) {
  const router = useRouter();
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [personalInfo, setPersonalInfo] = useState(initialInfo);
  const [emergencyContacts, setEmergencyContacts] = useState(initialContacts);
  const [saving, setSaving] = useState(false);

  const handleSaveInfo = useCallback(async (updated: EditableFields, updatedContacts: EmergencyContact[]) => {
    setSaving(true);
    // Build form data matching the server action's expected shape
    const nameParts = personalInfo.fullName.split(" ");
    const formData: PersonalInfoFormData = {
      firstName: nameParts[0] ?? "",
      lastName: nameParts.slice(1).join(" ") ?? "",
      email: updated.email,
      phone: updated.phone,
      grade: updated.grade,
      dateOfBirth: "", // preserved from server, not editable in popup
      gender: updated.gender.toLowerCase().replace(/ /g, "_"),
      ethnicity: updated.ethnicity.toLowerCase().replace(/ /g, "_"),
      pronouns: updated.pronouns.toLowerCase().replace(/ /g, "_"),
      language: updated.language.toLowerCase().replace(/ /g, "_"),
      homeAddress: updated.homeAddress,
    };
    const result = await updateStudentPersonalInfo(studentId, formData);
    setSaving(false);
    if (result.ok) {
      setPersonalInfo((prev) => ({
        ...prev,
        gender: updated.gender || null,
        grade: updated.grade,
        pronouns: updated.pronouns || null,
        ethnicity: updated.ethnicity || null,
        language: updated.language || null,
        email: updated.email,
        phone: updated.phone,
        homeAddress: updated.homeAddress,
      }));
      setEmergencyContacts(updatedContacts);
      router.refresh();
    }
  }, [studentId, personalInfo.fullName, router]);

  // Mock action items with full content like previous design
  const actionItems = [
    { 
      id: "ai-1", 
      title: "Follow up on medication adherence", 
      description: "Patient mentioned difficulty remembering to take medication.",
      type: "follow_up" as const,
      priority: "high" as const, 
      status: "pending" as const,
      dueDate: "Mar 12, 2026",
    },
    { 
      id: "ai-2", 
      title: "Complete treatment plan update", 
      description: "Update treatment goals based on recent progress.",
      type: "documentation" as const,
      priority: "medium" as const, 
      status: "pending" as const,
      dueDate: "Mar 15, 2026",
    },
    { 
      id: "ai-3", 
      title: "Contact parent/guardian", 
      description: "Schedule call to discuss patient's progress.",
      type: "outreach" as const,
      priority: "medium" as const, 
      status: "pending" as const,
      dueDate: "Mar 14, 2026",
    },
  ];

  const typeConfig = {
    follow_up: { icon: Phone, label: "Follow Up", bg: "bg-blue-50", text: "text-blue-700" },
    documentation: { icon: BarChart3, label: "Documentation", bg: "bg-violet-50", text: "text-violet-700" },
    outreach: { icon: MessageCircle, label: "Outreach", bg: "bg-emerald-50", text: "text-emerald-700" },
    review: { icon: Activity, label: "Review", bg: "bg-amber-50", text: "text-amber-700" },
  };

  const priorityConfig = {
    high: { label: "High", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
    medium: { label: "Medium", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    low: { label: "Low", bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  };

  const pendingCount = actionItems.filter(i => i.status === "pending").length;

  return (
    <div className="space-y-4 font-dm">
      {/* Row 1: Action Items + Recent Activity side by side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Action Items Card */}
        <div className="rounded-xl border bg-white">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-red-500" />
              <h4 className="text-xs font-semibold text-gray-900">Action Items</h4>
            </div>
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">{pendingCount} pending</span>
          </div>
          <div className="divide-y max-h-[280px] overflow-y-auto">
            {actionItems.map((item) => {
              const tConfig = typeConfig[item.type];
              const pConfig = priorityConfig[item.priority];
              const TypeIcon = tConfig.icon;
              return (
                <div key={item.id} className="px-4 py-3 hover:bg-gray-50/50">
                  <div className="flex items-start gap-3">
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", tConfig.bg)}>
                      <TypeIcon className={cn("h-4 w-4", tConfig.text)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-medium text-gray-900">{item.title}</h4>
                        <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-medium", tConfig.bg, tConfig.text)}>
                          {tConfig.label}
                        </span>
                        <span className={cn("flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium", pConfig.bg, pConfig.text)}>
                          <span className={cn("h-1 w-1 rounded-full", pConfig.dot)} />
                          {pConfig.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-gray-500 line-clamp-1">{item.description}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <Activity className="h-2.5 w-2.5" />
                          Due: {item.dueDate}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 rounded-md border border-gray-200 px-2 py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border bg-white">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <Activity className="h-4 w-4 text-gray-500" />
            <h4 className="text-xs font-semibold text-gray-900">Recent Activity</h4>
            <span className="ml-auto text-[10px] text-gray-400">{recentActivities.length} events</span>
          </div>
          {recentActivities.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-gray-400">No recent activities</div>
          ) : (
            <div className="divide-y max-h-[200px] overflow-y-auto">
              {recentActivities.slice(0, 6).map((act) => (
                <div key={act.id} className="flex items-center gap-3 px-4 py-2">
                  <div className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    act.type === "mood" ? "bg-emerald-50" :
                    act.type === "conversation" ? "bg-blue-50" :
                    act.type === "assessment" || act.type === "screener" ? "bg-violet-50" :
                    act.type === "login" ? "bg-gray-100" :
                    act.type === "exercise" ? "bg-amber-50" :
                    act.type === "handoff" ? "bg-red-50" :
                    act.type === "journal" ? "bg-indigo-50" :
                    "bg-gray-50",
                  )}>
                    {act.type === "mood" && <Smile className="h-3 w-3 text-emerald-600" />}
                    {act.type === "conversation" && <MessageCircle className="h-3 w-3 text-blue-600" />}
                    {(act.type === "assessment" || act.type === "screener") && <BarChart3 className="h-3 w-3 text-violet-600" />}
                    {act.type === "login" && <LogIn className="h-3 w-3 text-gray-500" />}
                    {act.type === "exercise" && <Dumbbell className="h-3 w-3 text-amber-600" />}
                    {act.type === "handoff" && <ShieldCheck className="h-3 w-3 text-red-500" />}
                    {act.type === "journal" && <Heart className="h-3 w-3 text-indigo-600" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-700 truncate">{act.title}</p>
                    <p className="text-[10px] text-gray-400">{act.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Billing Progress + Treatment Adherence */}
      <div className="grid grid-cols-2 gap-4">
        {/* Billing Period Progress */}
        <div className="rounded-xl border bg-white">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <Target className="h-4 w-4 text-emerald-500" />
            <h4 className="text-xs font-semibold text-gray-900">Billing Period Progress</h4>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Monitoring Days (98977)</span>
                <span className="text-xs font-bold text-blue-600">14/16 days</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: "87.5%" }} />
              </div>
              <p className="mt-1 text-[10px] text-emerald-600 font-medium">On track for 98977</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Care Management (98980)</span>
                <span className="text-xs font-bold text-emerald-600">32 min</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: "100%" }} />
              </div>
              <p className="mt-1 text-[10px] text-emerald-600 font-medium">✓ Eligible for 98980</p>
            </div>
          </div>
        </div>

        {/* Treatment Adherence */}
        <div className="rounded-xl border bg-white">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <Target className="h-4 w-4 text-blue-500" />
            <h4 className="text-xs font-semibold text-gray-900">Treatment Adherence</h4>
          </div>
          <div className="px-4 py-3 space-y-3">
            {[
              { label: "Exercise Completion", value: adherence.exerciseCompletion, color: "bg-blue-500" },
              { label: "Assessment Completion", value: adherence.assessmentCompletion, color: "bg-violet-500" },
              { label: "Check-in Completion", value: adherence.sessionAttendance, color: "bg-emerald-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">{item.label}</span>
                  <span className="text-xs font-bold text-gray-900">{item.value}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className={cn("h-full rounded-full transition-all", item.color)} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Safety Plan */}
      <SafetyPlanCard studentId={studentId} />

      {/* Popup */}
      {showInfoPopup && (
        <PersonalInfoPopup
          info={personalInfo}
          contacts={emergencyContacts}
          onClose={() => setShowInfoPopup(false)}
          onSave={handleSaveInfo}
          saving={saving}
        />
      )}
    </div>
  );
}
