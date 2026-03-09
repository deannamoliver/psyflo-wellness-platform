"use client";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  ChevronRight,
  Clock,
  Check,
  Dumbbell,
  Heart,
  LogIn,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Smile,
  Target,
  Trash2,
  TrendingDown,
  User,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/tailwind-utils";
import {
  type PersonalInfoFormData,
  updateStudentPersonalInfo,
} from "./personal-info-actions";

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

type SentimentData = {
  overall: string;
  positive: number;
  neutral: number;
  negative: number;
  recentMoods: string[];
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
  stats: { alerts: number; checkIns: number; conversations: number; supportHours: number };
  recentActivities: RecentActivity[];
  screeningResults: ScreeningResult[];
  sentiment: SentimentData;
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

// ─── Mini Stat ──────────────────────────────────────────────────────

function MiniStat({ icon: Icon, label, value, color, bg }: { icon: typeof Activity; label: string; value: number | string; color: string; bg: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3">
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", bg)}>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}


// ─── Main Overview Component ────────────────────────────────────────

export function OverviewClient({
  studentId,
  personalInfo: initialInfo,
  emergencyContacts: initialContacts,
  stats,
  recentActivities,
  screeningResults,
  sentiment,
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
        homeAddress: updated.homeAddress,
      }));
      setEmergencyContacts(updatedContacts);
      router.refresh();
    }
  }, [studentId, personalInfo.fullName, router]);

  return (
    <div className="space-y-4 font-dm">
      {/* Row 1: Patient banner + stats */}
      <div className="flex items-stretch gap-4">
        {/* Patient Banner */}
        <button
          type="button"
          onClick={() => setShowInfoPopup(true)}
          className="flex items-center gap-3 rounded-xl border bg-white px-5 py-3.5 text-left transition-all hover:border-blue-200 hover:shadow-sm group min-w-[260px]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{personalInfo.fullName}</p>
            <p className="text-[11px] text-gray-400">
              {[personalInfo.age, personalInfo.gender, personalInfo.grade ? `Grade ${personalInfo.grade}` : null].filter(Boolean).join(" · ")}
            </p>
          </div>
          <ChevronRight className="ml-auto h-4 w-4 text-gray-300 transition-colors group-hover:text-blue-500" />
        </button>

        {/* Compact stats */}
        <div className="grid flex-1 grid-cols-4 gap-3">
          <MiniStat icon={AlertTriangle} label="Safety Alerts" value={stats.alerts} color="text-red-500" bg="bg-red-50" />
          <MiniStat icon={Smile} label="Check-ins" value={stats.checkIns} color="text-emerald-500" bg="bg-emerald-50" />
          <MiniStat icon={MessageCircle} label="Conversations" value={stats.conversations} color="text-blue-500" bg="bg-blue-50" />
          <MiniStat icon={Clock} label="Support Hours" value={stats.supportHours} color="text-violet-500" bg="bg-violet-50" />
        </div>
      </div>

      {/* Row 2: 3-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Screening Results */}
        <div className="rounded-xl border bg-white">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <BarChart3 className="h-4 w-4 text-violet-500" />
            <h4 className="text-xs font-semibold text-gray-900">Screening Results</h4>
          </div>
          <div className="px-4 py-3 space-y-3">
            {screeningResults.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-700">{s.name}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={cn("h-full rounded-full", s.severity === "No Risk" ? "bg-emerald-400" : s.severity === "Mild" ? "bg-amber-400" : s.severity === "Moderate" ? "bg-orange-400" : "bg-red-400")}
                        style={{ width: `${(s.score / s.max) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400">{s.score}/{s.max}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                    s.severity === "No Risk" ? "bg-emerald-50 text-emerald-700" : s.severity === "Mild" ? "bg-amber-50 text-amber-700" : s.severity === "Moderate" ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-700",
                  )}>
                    {s.severity}
                  </span>
                  {s.trend === "down" && <TrendingDown className="h-3 w-3 text-emerald-500" />}
                  {s.trend === "stable" && <span className="text-[10px] text-gray-400">—</span>}
                </div>
              </div>
            ))}
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
              { label: "Session Attendance", value: adherence.sessionAttendance, color: "bg-emerald-500" },
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
            <div className="mt-1 flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
              <span className="text-xs font-medium text-blue-700">Overall Adherence</span>
              <span className="text-sm font-bold text-blue-700">{adherence.overallAdherence}%</span>
            </div>
          </div>
        </div>

        {/* Sentiment Summary */}
        <div className="rounded-xl border bg-white">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <Heart className="h-4 w-4 text-pink-500" />
            <h4 className="text-xs font-semibold text-gray-900">Sentiment Summary</h4>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-center gap-2">
              <Smile className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-semibold text-gray-900">{sentiment.overall}</span>
            </div>
            {/* Sentiment bar */}
            <div className="flex h-3 w-full overflow-hidden rounded-full">
              <div className="bg-emerald-400" style={{ width: `${sentiment.positive}%` }} />
              <div className="bg-gray-300" style={{ width: `${sentiment.neutral}%` }} />
              <div className="bg-red-400" style={{ width: `${sentiment.negative}%` }} />
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-emerald-600">Positive {sentiment.positive}%</span>
              <span className="text-gray-500">Neutral {sentiment.neutral}%</span>
              <span className="text-red-500">Negative {sentiment.negative}%</span>
            </div>
            <div>
              <p className="mb-1.5 text-[10px] font-medium text-gray-400 uppercase">Recent Moods</p>
              <div className="flex flex-wrap gap-1.5">
                {sentiment.recentMoods.map((m) => (
                  <span key={m} className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600 border border-gray-100">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activity Audit Log */}
      <div className="rounded-xl border bg-white">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Activity className="h-4 w-4 text-gray-500" />
          <h4 className="text-xs font-semibold text-gray-900">Recent Activity</h4>
          <span className="ml-auto text-[10px] text-gray-400">{recentActivities.length} events</span>
        </div>
        {recentActivities.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-gray-400">No recent activities</div>
        ) : (
          <div className="divide-y">
            {recentActivities.slice(0, 10).map((act) => (
              <div key={act.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  act.type === "mood" ? "bg-emerald-50" :
                  act.type === "conversation" ? "bg-blue-50" :
                  act.type === "assessment" || act.type === "screener" ? "bg-violet-50" :
                  act.type === "login" ? "bg-gray-100" :
                  act.type === "exercise" ? "bg-amber-50" :
                  act.type === "handoff" ? "bg-red-50" :
                  act.type === "journal" ? "bg-indigo-50" :
                  "bg-gray-50",
                )}>
                  {act.type === "mood" && <Smile className="h-3.5 w-3.5 text-emerald-600" />}
                  {act.type === "conversation" && <MessageCircle className="h-3.5 w-3.5 text-blue-600" />}
                  {(act.type === "assessment" || act.type === "screener") && <BarChart3 className="h-3.5 w-3.5 text-violet-600" />}
                  {act.type === "login" && <LogIn className="h-3.5 w-3.5 text-gray-500" />}
                  {act.type === "exercise" && <Dumbbell className="h-3.5 w-3.5 text-amber-600" />}
                  {act.type === "handoff" && <ShieldCheck className="h-3.5 w-3.5 text-red-500" />}
                  {act.type === "journal" && <Heart className="h-3.5 w-3.5 text-indigo-600" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-gray-700 truncate">{act.title}</p>
                    <span className={cn(
                      "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                      act.type === "mood" ? "bg-emerald-50 text-emerald-700" :
                      act.type === "conversation" ? "bg-blue-50 text-blue-700" :
                      act.type === "assessment" || act.type === "screener" ? "bg-violet-50 text-violet-700" :
                      act.type === "login" ? "bg-gray-100 text-gray-600" :
                      act.type === "exercise" ? "bg-amber-50 text-amber-700" :
                      act.type === "handoff" ? "bg-red-50 text-red-700" :
                      act.type === "journal" ? "bg-indigo-50 text-indigo-700" :
                      "bg-gray-50 text-gray-600",
                    )}>
                      {act.type === "mood" ? "Check-in" :
                       act.type === "conversation" ? "Chat" :
                       act.type === "assessment" || act.type === "screener" ? "Screener" :
                       act.type === "login" ? "Login" :
                       act.type === "exercise" ? "Exercise" :
                       act.type === "handoff" ? "Handoff" :
                       act.type === "journal" ? "Journal" :
                       act.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-gray-400">{act.subtitle}</p>
                    {act.detail && <p className="text-[10px] text-gray-500 font-medium">{act.detail}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
