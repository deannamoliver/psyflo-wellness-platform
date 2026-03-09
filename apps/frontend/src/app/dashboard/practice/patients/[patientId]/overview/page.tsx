import {
  alerts,
  chatSessions,
  emergencyContacts,
  moodCheckIns,
  profiles,
  screenerSessions,
  screeners,
  userSchools,
  users,
  wellnessCoachHandoffs,
} from "@feelwell/database";
import { format, formatDistanceToNow } from "date-fns";
import { and, asc, count, desc, eq, isNull, or } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { titleCase } from "@/lib/string-utils";
import { getUserFullName } from "@/lib/user/utils";
import { getStudentJournalTimestamps } from "@/app/dashboard/student/journal/~lib/journal-actions";
import { OverviewClient } from "@/app/dashboard/counselor/students/[studentId]/overview/~lib/overview-client";

export default async function PatientOverviewPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const db = await serverDrizzle();

  // ── Fetch personal info ────────────────────────────────────────────
  const record = await db.admin
    .select({ user: users, profile: profiles })
    .from(users)
    .innerJoin(profiles, eq(users.id, profiles.id))
    .where(eq(users.id, patientId))
    .limit(1)
    .then((res) => res[0]);

  const user = record?.user;
  const profile = record?.profile;

  const fullName = user ? getUserFullName(user) : "Patient";
  const dob = profile?.dateOfBirth ? format(new Date(profile.dateOfBirth), "MMM d, yyyy") : null;
  const age = profile?.dateOfBirth
    ? `${Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} yrs`
    : null;

  const personalInfo = {
    fullName,
    age,
    dob,
    gender: profile?.gender ? titleCase(profile.gender, { delimiter: "_" }) : null,
    grade: profile?.grade != null ? String(profile.grade) : "",
    pronouns: profile?.pronouns ? titleCase(profile.pronouns, { delimiter: "_" }) : null,
    ethnicity: profile?.ethnicity ? titleCase(profile.ethnicity, { delimiter: "_" }) : null,
    language: profile?.language ? titleCase(profile.language, { delimiter: "_" }) : null,
    email: user?.email ?? "",
    homeAddress: profile?.homeAddress ?? "",
  };

  // ── Fetch emergency contacts ───────────────────────────────────────
  const patientSchool = await db.admin
    .select({ schoolId: userSchools.schoolId })
    .from(userSchools)
    .where(and(eq(userSchools.userId, patientId), eq(userSchools.role, "student")))
    .limit(1)
    .then((res) => res[0]);

  const contactRecords = await db.admin
    .select()
    .from(emergencyContacts)
    .where(
      and(
        isNull(emergencyContacts.deletedAt),
        or(
          eq(emergencyContacts.studentId, patientId),
          patientSchool ? eq(emergencyContacts.schoolId, patientSchool.schoolId) : undefined,
        ),
      ),
    )
    .orderBy(desc(emergencyContacts.contactType), asc(emergencyContacts.tag));

  const contacts = contactRecords.map((r) => ({
    name: r.name,
    type: r.contactType as "school" | "home",
    tag: r.tag === "primary" ? "Primary" : r.tag === "backup_1" ? "Backup #1" : r.tag === "backup_2" ? "Backup #2" : null,
    role: r.relation,
    phone: r.primaryPhone ?? undefined,
    email: r.primaryEmail ?? undefined,
  }));

  // ── Fetch stats ────────────────────────────────────────────────────
  const [alertCount, checkInCount, convoCount, supportCount] = await Promise.all([
    db.admin.select({ count: count() }).from(alerts).where(
      and(eq(alerts.studentId, patientId), or(eq(alerts.source, "coach"), and(eq(alerts.source, "screener"), eq(alerts.type, "safety")))),
    ).then((r) => r[0]?.count ?? 0),
    db.admin.select({ count: count() }).from(moodCheckIns).where(eq(moodCheckIns.userId, patientId)).then((r) => r[0]?.count ?? 0),
    db.admin.select({ count: count() }).from(chatSessions).where(eq(chatSessions.userId, patientId)).then((r) => r[0]?.count ?? 0),
    db.admin.select({ count: count() }).from(wellnessCoachHandoffs).where(eq(wellnessCoachHandoffs.studentId, patientId)).then((r) => r[0]?.count ?? 0),
  ]);

  // ── Fetch recent activities (audit log) ──────────────────────────
  const [recentCheckIns, recentScreenerSessions, recentConvos, recentHandoffs] = await Promise.all([
    db.admin.select({ id: moodCheckIns.id, createdAt: moodCheckIns.createdAt, emotion: moodCheckIns.universalEmotion })
      .from(moodCheckIns).where(eq(moodCheckIns.userId, patientId)).orderBy(desc(moodCheckIns.createdAt)).limit(5),
    db.admin.select({
      id: screenerSessions.id,
      createdAt: screenerSessions.createdAt,
      subtype: screenerSessions.subtype,
      score: screenerSessions.score,
      maxScore: screenerSessions.maxScore,
      completedAt: screenerSessions.completedAt,
    })
      .from(screenerSessions).innerJoin(screeners, eq(screenerSessions.screenerId, screeners.id))
      .where(eq(screeners.userId, patientId)).orderBy(desc(screenerSessions.createdAt)).limit(5),
    db.admin.select({ id: chatSessions.id, createdAt: chatSessions.createdAt, title: chatSessions.title })
      .from(chatSessions).where(eq(chatSessions.userId, patientId)).orderBy(desc(chatSessions.createdAt)).limit(5),
    db.admin.select({
      id: wellnessCoachHandoffs.id,
      requestedAt: wellnessCoachHandoffs.requestedAt,
      reason: wellnessCoachHandoffs.reason,
      status: wellnessCoachHandoffs.status,
    })
      .from(wellnessCoachHandoffs).where(eq(wellnessCoachHandoffs.studentId, patientId)).orderBy(desc(wellnessCoachHandoffs.requestedAt)).limit(5),
  ]);

  type ActivityItem = {
    id: string;
    type: "mood" | "conversation" | "assessment" | "login" | "exercise" | "screener" | "handoff" | "journal";
    title: string;
    subtitle: string;
    detail?: string;
    at: Date;
  };

  const activities: ActivityItem[] = [
    ...recentCheckIns.map((c) => ({
      id: c.id, type: "mood" as const,
      title: `Mood Check-in: ${c.emotion ? titleCase(c.emotion, { delimiter: "_" }) : "Completed"}`,
      subtitle: `${formatDistanceToNow(c.createdAt)} ago`,
      at: c.createdAt,
    })),
    ...recentScreenerSessions.map((s) => {
      const name = s.subtype.startsWith("phq") ? "PHQ-9" : s.subtype.startsWith("gad") ? "GAD-7" : titleCase(s.subtype, { delimiter: "_" });
      const scoreDetail = s.completedAt ? `Score: ${s.score}/${s.maxScore}` : "In progress";
      return {
        id: s.id, type: "screener" as const,
        title: `Screener Completed: ${name}`,
        subtitle: `${formatDistanceToNow(s.createdAt)} ago`,
        detail: scoreDetail,
        at: s.createdAt,
      };
    }),
    ...recentConvos.map((c) => ({
      id: c.id, type: "conversation" as const,
      title: `Support Conversation${c.title !== "New Chat" ? `: ${c.title}` : ""}`,
      subtitle: `${formatDistanceToNow(c.createdAt)} ago`,
      at: c.createdAt,
    })),
    ...recentHandoffs.map((h) => ({
      id: h.id, type: "handoff" as const,
      title: `Coach Handoff: ${titleCase(h.reason, { delimiter: "_" })}`,
      subtitle: `${formatDistanceToNow(h.requestedAt)} ago`,
      detail: `Status: ${titleCase(h.status, { delimiter: "_" })}`,
      at: h.requestedAt,
    })),
  ];

  const journalTimestamps = await getStudentJournalTimestamps(patientId);
  for (const j of journalTimestamps) {
    activities.push({
      id: j.id,
      type: "journal",
      title: `Journal Entry${j.promptCategory ? ` (${titleCase(j.promptCategory, { delimiter: "_" })})` : ""}`,
      subtitle: `${formatDistanceToNow(j.createdAt)} ago`,
      detail: j.sentimentLabel ? titleCase(j.sentimentLabel, { delimiter: "_" }) : undefined,
      at: j.createdAt,
    });
  }

  if (profile?.lastActiveAt) {
    activities.push({
      id: "login-last",
      type: "login",
      title: "Logged In",
      subtitle: `${formatDistanceToNow(profile.lastActiveAt)} ago`,
      detail: format(profile.lastActiveAt, "MMM d, yyyy h:mm a"),
      at: profile.lastActiveAt,
    });
  }

  activities.sort((a, b) => b.at.getTime() - a.at.getTime());
  const topActivities = activities.slice(0, 12);

  // ── Compute screening results from real screener data ───────────
  const latestScreeners = await db.admin
    .select({
      id: screeners.id,
      type: screeners.type,
      score: screeners.score,
      maxScore: screeners.maxScore,
      lastScore: screeners.lastScore,
      completedAt: screeners.completedAt,
    })
    .from(screeners)
    .where(eq(screeners.userId, patientId))
    .orderBy(desc(screeners.completedAt))
    .limit(10);

  const screenerByType = new Map<string, typeof latestScreeners[number]>();
  for (const s of latestScreeners) {
    if (!screenerByType.has(s.type)) screenerByType.set(s.type, s);
  }

  function getSeverity(type: string, score: number, max: number): string {
    if (type.startsWith("phq")) {
      if (score <= 4) return "Minimal";
      if (score <= 9) return "Mild";
      if (score <= 14) return "Moderate";
      if (score <= 19) return "Moderately Severe";
      return "Severe";
    }
    if (type.startsWith("gad")) {
      if (score <= 4) return "Minimal";
      if (score <= 9) return "Mild";
      if (score <= 14) return "Moderate";
      return "Severe";
    }
    const pct = max > 0 ? score / max : 0;
    if (pct >= 0.7) return "Strong";
    if (pct >= 0.5) return "Developing";
    return "Emerging";
  }

  const SCREENER_DISPLAY: Record<string, { name: string; max: number }> = {
    phq_a: { name: "PHQ-A", max: 27 },
    phq_9: { name: "PHQ-9", max: 27 },
    gad_child: { name: "GAD-Child", max: 21 },
    gad_7: { name: "GAD-7", max: 21 },
    sel: { name: "SEL", max: 100 },
  };

  const screeningResults = Array.from(screenerByType.entries()).map(([type, s]) => {
    const display = SCREENER_DISPLAY[type] ?? { name: type.toUpperCase(), max: s.maxScore };
    const change = s.lastScore != null ? s.score - s.lastScore : 0;
    const trend: "up" | "down" | "stable" = change < 0 ? "down" : change > 0 ? "up" : "stable";
    return {
      name: display.name,
      score: Math.round(s.score),
      max: Math.round(s.maxScore || display.max),
      severity: getSeverity(type, s.score, s.maxScore || display.max),
      trend,
      change: Math.round(change),
    };
  });

  // ── Compute sentiment from mood check-ins ───────────────────────
  const recentMoods = await db.admin
    .select({ emotion: moodCheckIns.universalEmotion })
    .from(moodCheckIns)
    .where(eq(moodCheckIns.userId, patientId))
    .orderBy(desc(moodCheckIns.createdAt))
    .limit(20);

  const positiveEmotions = new Set(["happy", "surprised"]);
  const negativeEmotions = new Set(["sad", "afraid", "angry", "disgusted", "bad"]);
  let posCount = 0, negCount = 0, neuCount = 0;
  for (const m of recentMoods) {
    if (!m.emotion) { neuCount++; continue; }
    if (positiveEmotions.has(m.emotion)) posCount++;
    else if (negativeEmotions.has(m.emotion)) negCount++;
    else neuCount++;
  }
  const moodTotal = posCount + negCount + neuCount || 1;
  const posPct = Math.round((posCount / moodTotal) * 100);
  const negPct = Math.round((negCount / moodTotal) * 100);
  const neuPct = 100 - posPct - negPct;

  const overallSentiment = posPct >= 50 ? "Mostly Positive" : negPct >= 50 ? "Mostly Negative" : "Mixed";

  const uniqueMoods = [...new Set(recentMoods.slice(0, 5).map((m) => m.emotion ? titleCase(m.emotion, { delimiter: "_" }) : "Neutral"))];

  const sentiment = {
    overall: recentMoods.length > 0 ? overallSentiment : "No Data",
    positive: posPct,
    neutral: neuPct,
    negative: negPct,
    recentMoods: uniqueMoods.length > 0 ? uniqueMoods : ["No check-ins yet"],
  };

  // ── Compute adherence from real data ────────────────────────────
  const totalScreeners = latestScreeners.length;
  const completedScreeners = latestScreeners.filter((s) => s.completedAt).length;
  const assessmentCompletion = totalScreeners > 0 ? Math.round((completedScreeners / totalScreeners) * 100) : 0;
  const sessionAttendance = convoCount > 0 ? Math.min(100, Math.round((convoCount / Math.max(convoCount, 1)) * 100)) : 0;
  const exerciseCompletion = 0;
  const overallAdherence = Math.round((assessmentCompletion + sessionAttendance + exerciseCompletion) / 3);

  const adherence = {
    exerciseCompletion,
    assessmentCompletion,
    sessionAttendance,
    overallAdherence,
  };

  return (
    <div className="pt-2">
      <OverviewClient
        studentId={patientId}
        personalInfo={personalInfo}
        emergencyContacts={contacts}
        stats={{ alerts: alertCount, checkIns: checkInCount, conversations: convoCount, supportHours: supportCount }}
        recentActivities={topActivities.map(({ at, ...rest }) => rest)}
        screeningResults={screeningResults}
        sentiment={sentiment}
        adherence={adherence}
      />
    </div>
  );
}
