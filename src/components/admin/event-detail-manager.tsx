"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileEdit,
  Layers,
  Link2,
  MapPin,
  Mic2,
  Pencil,
  Plus,
  Radio,
  Sparkles,
  Star,
  Trash2,
  User,
  X,
} from "lucide-react";

export interface EventDetailData {
  id: string;
  title: string;
  description: string;
  venue: string;
  status: "draft" | "live";
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface SessionItemData {
  id: string;
  eventId: string;
  title: string;
  hall: string;
  speaker: string;
  sessionDate: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface QuestionItemData {
  id: string;
  eventId: string;
  sessionId: string;
  hall: string;
  participantName: string;
  questionText: string;
  isAnswered: boolean;
  isFeatured: boolean;
  createdAt: string;
}

interface EventDetailManagerProps {
  event: EventDetailData;
  initialSessions: SessionItemData[];
  initialQuestions: QuestionItemData[];
}

interface DayOption {
  dateStr: string; // YYYY-MM-DD
  dayLabel: string; // Day 1, Day 2...
  formattedDate: string; // 23 Nov 2026
}

function toYMD(isoOrDate: string): string {
  const match = isoOrDate.trim().match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  return new Date(isoOrDate).toISOString().slice(0, 10);
}

function formatReadableDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return ymd;
  const date = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatShortDate(dateString: string | null) {
  if (!dateString) return null;
  return formatReadableDate(toYMD(dateString));
}

function formatTime(isoString: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

function buildEventDays(
  startDate: string | null,
  endDate: string | null,
  sessions: SessionItemData[]
): DayOption[] {
  const dateSet = new Set<string>();

  if (startDate) {
    const startYMD = toYMD(startDate);
    const endYMD = endDate ? toYMD(endDate) : startYMD;

    const [sy, sm, sd] = startYMD.split("-").map(Number);
    const [ey, em, ed] = endYMD.split("-").map(Number);

    let cursor = Date.UTC(sy, sm - 1, sd);
    const endMs = Date.UTC(ey, em - 1, ed);
    let safety = 0;

    while (cursor <= endMs && safety < 60) {
      dateSet.add(new Date(cursor).toISOString().slice(0, 10));
      cursor += 24 * 60 * 60 * 1000;
      safety += 1;
    }
  }

  for (const s of sessions) {
    if (s.sessionDate) {
      dateSet.add(toYMD(s.sessionDate));
    }
  }

  const sortedDates = Array.from(dateSet).sort((a, b) => a.localeCompare(b));

  return sortedDates.map((dateStr, index) => ({
    dateStr,
    dayLabel: `Day ${index + 1}`,
    formattedDate: formatReadableDate(dateStr),
  }));
}

export default function EventDetailManager({
  event,
  initialSessions,
  initialQuestions,
}: EventDetailManagerProps) {
  const router = useRouter();

  const [eventStatus, setEventStatus] = useState<"draft" | "live">(event.status);
  const [statusLoading, setStatusLoading] = useState(false);

  const [sessions, setSessions] = useState<SessionItemData[]>(() =>
    initialSessions.map((s) => ({
      ...s,
      sessionDate: toYMD(s.sessionDate),
    }))
  );
  const [questions, setQuestions] =
    useState<QuestionItemData[]>(initialQuestions);

  useEffect(() => {
    setSessions(
      initialSessions.map((s) => ({
        ...s,
        sessionDate: toYMD(s.sessionDate),
      }))
    );
  }, [initialSessions]);

  const eventDays = useMemo(
    () => buildEventDays(event.startDate, event.endDate, sessions),
    [event.startDate, event.endDate, sessions]
  );

  const defaultFormDate =
    eventDays[0]?.dateStr || new Date().toISOString().slice(0, 10);

  // Add session form state
  const [title, setTitle] = useState("");
  const [sessionDate, setSessionDate] = useState(defaultFormDate);
  const [hall, setHall] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("10:00 AM");
  const [description, setDescription] = useState("");
  const [creatingSession, setCreatingSession] = useState(false);

  // Edit session inline state
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSessionDate, setEditSessionDate] = useState("");
  const [editHall, setEditHall] = useState("");
  const [editSpeaker, setEditSpeaker] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Right-side Day -> Hall -> Session drill-down state
  const [activeDayDate, setActiveDayDate] = useState<string>(defaultFormDate);
  const [activeHallName, setActiveHallName] = useState<string>("");

  // Question list filters
  const [questionDayFilter, setQuestionDayFilter] = useState<string>("all");
  const [selectedHall, setSelectedHall] = useState<string>("all");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Sessions belonging to the currently selected Day tab
  const sessionsForActiveDay = useMemo(() => {
    return sessions.filter((s) => toYMD(s.sessionDate) === activeDayDate);
  }, [sessions, activeDayDate]);

  // Unique halls available on the currently selected Day
  const hallsForActiveDay = useMemo(() => {
    const unique = Array.from(
      new Set(sessionsForActiveDay.map((s) => s.hall))
    );
    return unique.sort((a, b) => a.localeCompare(b));
  }, [sessionsForActiveDay]);

  const effectiveActiveHall = useMemo(() => {
    if (hallsForActiveDay.length === 0) return "";
    if (activeHallName && hallsForActiveDay.includes(activeHallName)) {
      return activeHallName;
    }
    return hallsForActiveDay[0];
  }, [hallsForActiveDay, activeHallName]);

  // Sessions inside the selected Day AND selected Hall
  const sessionsForActiveDayAndHall = useMemo(() => {
    if (!effectiveActiveHall) return [];
    return sessionsForActiveDay.filter((s) => s.hall === effectiveActiveHall);
  }, [sessionsForActiveDay, effectiveActiveHall]);

  const allHalls = useMemo(() => {
    const unique = Array.from(new Set(sessions.map((s) => s.hall)));
    return unique.sort((a, b) => a.localeCompare(b));
  }, [sessions]);

  const sessionMap = useMemo(() => {
    return new Map(sessions.map((s) => [s.id, s]));
  }, [sessions]);

  const dayLabelMap = useMemo(() => {
    return new Map(eventDays.map((d) => [d.dateStr, d]));
  }, [eventDays]);

  const questionCountBySession = useMemo(() => {
    const counts = new Map<string, number>();
    for (const q of questions) {
      counts.set(q.sessionId, (counts.get(q.sessionId) ?? 0) + 1);
    }
    return counts;
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const parentSession = sessionMap.get(q.sessionId);
      const dayMatch =
        questionDayFilter === "all" ||
        (parentSession
          ? toYMD(parentSession.sessionDate) === questionDayFilter
          : false);
      const hallMatch = selectedHall === "all" || q.hall === selectedHall;
      const sessionMatch =
        selectedSessionId === "all" || q.sessionId === selectedSessionId;
      return dayMatch && hallMatch && sessionMatch;
    });
  }, [questions, sessionMap, questionDayFilter, selectedHall, selectedSessionId]);

  async function handleToggleEventStatus() {
    const nextStatus = eventStatus === "live" ? "draft" : "live";
    setStatusLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to update status.");
        return;
      }
      setEventStatus(nextStatus);
      router.refresh();
    } catch {
      setError("Network error while updating event status.");
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleCreateSession(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setCreatingSession(true);

    const chosenDate = toYMD(sessionDate);

    try {
      const res = await fetch(`/api/admin/events/${event.id}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          sessionDate: chosenDate,
          hall,
          speaker,
          startTime,
          endTime,
          description,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Unable to create session.");
        return;
      }

      const created: SessionItemData = {
        ...data.session,
        sessionDate: toYMD(data.session.sessionDate || chosenDate),
      };

      setSessions((prev) => [...prev, created]);
      setActiveDayDate(created.sessionDate);
      setActiveHallName(created.hall);

      setTitle("");
      setSpeaker("");
      setDescription("");
    } catch {
      setError("Something went wrong while adding the session.");
    } finally {
      setCreatingSession(false);
    }
  }

  function startEditingSession(sessionItem: SessionItemData) {
    setError("");
    setEditingSessionId(sessionItem.id);
    setEditTitle(sessionItem.title);
    setEditSessionDate(toYMD(sessionItem.sessionDate));
    setEditHall(sessionItem.hall);
    setEditSpeaker(sessionItem.speaker);
    setEditStartTime(sessionItem.startTime);
    setEditEndTime(sessionItem.endTime);
    setEditDescription(sessionItem.description);
  }

  function cancelEditingSession() {
    setEditingSessionId(null);
  }

  async function handleSaveSessionEdit(sessionId: string) {
    setError("");
    setSavingEdit(true);

    const normalizedDate = toYMD(editSessionDate);

    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          sessionDate: normalizedDate,
          hall: editHall,
          speaker: editSpeaker,
          startTime: editStartTime,
          endTime: editEndTime,
          description: editDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to update session details.");
        return;
      }

      const updated: SessionItemData = {
        ...data.session,
        sessionDate: toYMD(data.session.sessionDate || normalizedDate),
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? updated : s))
      );

      // Update hall name on any existing questions for this session in local state
      setQuestions((prev) =>
        prev.map((q) =>
          q.sessionId === sessionId ? { ...q, hall: updated.hall } : q
        )
      );

      setActiveDayDate(updated.sessionDate);
      setActiveHallName(updated.hall);
      setEditingSessionId(null);
    } catch {
      setError("Network error while saving session changes.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleToggleSessionActive(sessionItem: SessionItemData) {
    setError("");
    try {
      const res = await fetch(`/api/admin/sessions/${sessionItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !sessionItem.isActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to update session.");
        return;
      }
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionItem.id ? { ...s, isActive: !s.isActive } : s
        )
      );
    } catch {
      setError("Network error while updating session.");
    }
  }

  async function handleDeleteSession(sessionItem: SessionItemData) {
    const ok = window.confirm(
      `Delete session "${sessionItem.title}" (${sessionItem.hall}) and all its questions?`
    );
    if (!ok) return;

    setError("");
    try {
      const res = await fetch(`/api/admin/sessions/${sessionItem.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to delete session.");
        return;
      }

      setSessions((prev) => prev.filter((s) => s.id !== sessionItem.id));
      setQuestions((prev) =>
        prev.filter((q) => q.sessionId !== sessionItem.id)
      );
      if (selectedSessionId === sessionItem.id) {
        setSelectedSessionId("all");
      }
      if (editingSessionId === sessionItem.id) {
        setEditingSessionId(null);
      }
    } catch {
      setError("Network error while deleting session.");
    }
  }

  async function handleToggleQuestionFlag(
    question: QuestionItemData,
    field: "isAnswered" | "isFeatured"
  ) {
    setError("");
    const nextVal = !question[field];

    try {
      const res = await fetch(`/api/admin/questions/${question.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: nextVal }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to update question.");
        return;
      }

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id ? { ...q, [field]: nextVal } : q
        )
      );
    } catch {
      setError("Network error while updating question.");
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    const ok = window.confirm("Remove this question permanently?");
    if (!ok) return;

    setError("");
    try {
      const res = await fetch(`/api/admin/questions/${questionId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to delete question.");
        return;
      }

      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch {
      setError("Network error while deleting question.");
    }
  }

  function handleCopyUrl(key: string, path: string) {
    const url = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  const isLive = eventStatus === "live";
  const activeDayObj = dayLabelMap.get(activeDayDate);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-orange-600"
        >
          <ArrowLeft size={16} />
          Back to All Events
        </Link>
      </div>

      {/* Event Banner */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm sm:p-9"
      >
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                  isLive
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                    : "bg-amber-50 text-amber-800 ring-1 ring-amber-600/20"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isLive ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                {isLive ? "Live Event" : "Draft Mode"}
              </span>

              {event.venue && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500">
                  <MapPin size={14} className="text-orange-500" />
                  {event.venue}
                </span>
              )}

              {event.startDate && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500">
                  <Clock size={14} className="text-orange-500" />
                  {formatShortDate(event.startDate)}
                  {event.endDate &&
                  toYMD(event.endDate) !== toYMD(event.startDate)
                    ? ` – ${formatShortDate(event.endDate)}`
                    : ""}
                </span>
              )}
            </div>

            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#241000] sm:text-3xl">
              {event.title}
            </h2>

            {event.description && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
                {event.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={statusLoading}
              onClick={handleToggleEventStatus}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-sm transition disabled:opacity-50 ${
                isLive
                  ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                  : "bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700"
              }`}
            >
              {isLive ? (
                <>
                  <FileEdit size={16} />
                  Switch to Draft
                </>
              ) : (
                <>
                  <Radio size={16} />
                  Publish Event Live
                </>
              )}
            </button>
          </div>
        </div>
      </motion.section>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {/* Sessions Section: Add Form (Left) + Day -> Hall -> Session Explorer (Right) */}
      <section className="grid gap-7 lg:grid-cols-12">
        {/* Create Session Card */}
        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-7 lg:col-span-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <Plus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#241000]">
                Add Session &amp; Hall
              </h3>
              <p className="text-xs text-stone-500">
                Auto-linked to your event dates &amp; halls
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateSession} className="space-y-4">
            {/* Session Date — Auto-populated from Event Start & End Dates */}
            <div>
              <label
                htmlFor="sessionDate"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-600"
              >
                Session Day / Date *
              </label>
              {eventDays.length > 0 ? (
                <select
                  id="sessionDate"
                  required
                  value={sessionDate}
                  onChange={(e) => {
                    setSessionDate(e.target.value);
                    setActiveDayDate(e.target.value);
                  }}
                  className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-sm font-bold text-[#241000] outline-none transition focus:border-orange-500 focus:bg-white"
                >
                  {eventDays.map((d) => (
                    <option key={d.dateStr} value={d.dateStr}>
                      {d.dayLabel} — {d.formattedDate}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="sessionDate"
                  type="date"
                  required
                  value={sessionDate}
                  onChange={(e) => {
                    setSessionDate(e.target.value);
                    setActiveDayDate(e.target.value);
                  }}
                  className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-sm text-[#241000] outline-none transition focus:border-orange-500 focus:bg-white"
                />
              )}
            </div>

            <div>
              <label
                htmlFor="sessionTitle"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-600"
              >
                Session Title *
              </label>
              <input
                id="sessionTitle"
                type="text"
                required
                placeholder="e.g. Keynote: Future of AI"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-sm text-[#241000] outline-none transition focus:border-orange-500 focus:bg-white"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="hallName"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-600"
                >
                  Hall / Room *
                </label>
                <input
                  id="hallName"
                  type="text"
                  required
                  list="existing-halls-list"
                  placeholder="e.g. Hall A"
                  value={hall}
                  onChange={(e) => setHall(e.target.value)}
                  className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-sm text-[#241000] outline-none transition focus:border-orange-500 focus:bg-white"
                />
                <datalist id="existing-halls-list">
                  {allHalls.map((h) => (
                    <option key={h} value={h} />
                  ))}
                </datalist>
              </div>

              <div>
                <label
                  htmlFor="speakerName"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-600"
                >
                  Speaker
                </label>
                <input
                  id="speakerName"
                  type="text"
                  placeholder="e.g. Dr. Rao"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-sm text-[#241000] outline-none transition focus:border-orange-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="startTime"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-600"
                >
                  Start Time *
                </label>
                <input
                  id="startTime"
                  type="text"
                  required
                  placeholder="09:00 AM"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-sm text-[#241000] outline-none transition focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="endTime"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-600"
                >
                  End Time *
                </label>
                <input
                  id="endTime"
                  type="text"
                  required
                  placeholder="10:00 AM"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-sm text-[#241000] outline-none transition focus:border-orange-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="sessionDesc"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-600"
              >
                Topic Notes (Optional)
              </label>
              <textarea
                id="sessionDesc"
                rows={2}
                placeholder="Short summary for attendees..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3.5 text-sm text-[#241000] outline-none transition focus:border-orange-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={creatingSession}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 disabled:opacity-60"
            >
              <Plus size={17} />
              {creatingSession ? "Adding session..." : "Add Session"}
            </button>
          </form>
        </div>

        {/* Right Side: Day 1 / Day 2 / Day 3 -> Hall -> Sessions Drill-Down */}
        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-7 lg:col-span-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-extrabold text-[#241000]">
                Schedule by Day &amp; Hall ({sessions.length} Total)
              </h3>
              <p className="text-xs text-stone-500">
                Select a Day, then click a Hall to view, edit, or export its
                sessions.
              </p>
            </div>
          </div>

          {/* Step 1: Day Selector Pills (Day 1, Day 2, Day 3...) */}
          {eventDays.length > 0 && (
            <div className="mb-5">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                1. Choose Day
              </p>
              <div className="flex flex-wrap gap-2">
                {eventDays.map((day) => {
                  const countOnDay = sessions.filter(
                    (s) => toYMD(s.sessionDate) === day.dateStr
                  ).length;
                  const isSelected = activeDayDate === day.dateStr;

                  return (
                    <button
                      key={day.dateStr}
                      type="button"
                      onClick={() => {
                        setActiveDayDate(day.dateStr);
                        setSessionDate(day.dateStr);
                      }}
                      className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-left transition ${
                        isSelected
                          ? "border-orange-600 bg-orange-600 text-white shadow-md shadow-orange-600/20"
                          : "border-orange-100 bg-[#fffaf5] text-[#241000] hover:border-orange-300"
                      }`}
                    >
                      <CalendarDays
                        size={15}
                        className={
                          isSelected ? "text-orange-100" : "text-orange-600"
                        }
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold">
                            {day.dayLabel}
                          </span>
                          <span
                            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {countOnDay}
                          </span>
                        </div>
                        <p
                          className={`text-[10px] ${
                            isSelected ? "text-orange-100" : "text-stone-500"
                          }`}
                        >
                          {day.formattedDate}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Halls inside the selected Day */}
          {sessionsForActiveDay.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-[#fffaf5] px-6 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <Layers size={22} />
              </div>
              <h4 className="mt-4 text-base font-extrabold text-[#241000]">
                No sessions scheduled for{" "}
                {activeDayObj
                  ? `${activeDayObj.dayLabel} (${activeDayObj.formattedDate})`
                  : "this date"}
              </h4>
              <p className="mt-1 max-w-sm text-xs leading-5 text-stone-500">
                Use the form on the left to add sessions for Hall A, Hall B,
                etc. on this day.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  2. Choose Hall on {activeDayObj?.dayLabel || activeDayDate}
                </p>
                <div className="flex flex-wrap gap-2">
                  {hallsForActiveDay.map((hallName) => {
                    const hallSessionCount = sessionsForActiveDay.filter(
                      (s) => s.hall === hallName
                    ).length;
                    const isHallSelected = effectiveActiveHall === hallName;

                    return (
                      <button
                        key={hallName}
                        type="button"
                        onClick={() => setActiveHallName(hallName)}
                        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
                          isHallSelected
                            ? "border-[#241000] bg-[#241000] text-white shadow-sm"
                            : "border-stone-200 bg-stone-50 text-[#241000] hover:border-orange-300 hover:bg-orange-50"
                        }`}
                      >
                        <Building2
                          size={14}
                          className={
                            isHallSelected
                              ? "text-orange-300"
                              : "text-orange-600"
                          }
                        />
                        <span>{hallName}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] ${
                            isHallSelected
                              ? "bg-white/15 text-orange-200"
                              : "bg-white text-stone-600"
                          }`}
                        >
                          {hallSessionCount}{" "}
                          {hallSessionCount === 1 ? "session" : "sessions"}
                        </span>
                        <ChevronRight size={13} className="opacity-60" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Sessions inside the selected Day & Hall */}
              <div>
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  3. Sessions in {effectiveActiveHall} (
                  {sessionsForActiveDayAndHall.length})
                </p>

                <div className="space-y-3.5">
                  {sessionsForActiveDayAndHall.map((sessionItem) => {
                    const qCount =
                      questionCountBySession.get(sessionItem.id) ?? 0;
                    const isEditing = editingSessionId === sessionItem.id;

                    if (isEditing) {
                      return (
                        <div
                          key={sessionItem.id}
                          className="rounded-2xl border-2 border-orange-400 bg-orange-50/40 p-5 shadow-sm"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-orange-700">
                              <Pencil size={13} />
                              Edit Session Details
                            </span>
                            <button
                              type="button"
                              onClick={cancelEditingSession}
                              className="rounded-lg p-1 text-stone-400 hover:bg-white hover:text-stone-700"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="mb-1 block text-[11px] font-bold uppercase text-stone-600">
                                Session Title *
                              </label>
                              <input
                                type="text"
                                required
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm font-semibold text-[#241000] outline-none focus:border-orange-500"
                              />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                              <div>
                                <label className="mb-1 block text-[11px] font-bold uppercase text-stone-600">
                                  Day / Date *
                                </label>
                                {eventDays.length > 0 ? (
                                  <select
                                    value={editSessionDate}
                                    onChange={(e) =>
                                      setEditSessionDate(e.target.value)
                                    }
                                    className="h-10 w-full rounded-xl border border-stone-200 bg-white px-2.5 text-xs font-bold text-[#241000] outline-none focus:border-orange-500"
                                  >
                                    {eventDays.map((d) => (
                                      <option key={d.dateStr} value={d.dateStr}>
                                        {d.dayLabel} — {d.formattedDate}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="date"
                                    value={editSessionDate}
                                    onChange={(e) =>
                                      setEditSessionDate(e.target.value)
                                    }
                                    className="h-10 w-full rounded-xl border border-stone-200 bg-white px-2.5 text-xs text-[#241000] outline-none focus:border-orange-500"
                                  />
                                )}
                              </div>

                              <div>
                                <label className="mb-1 block text-[11px] font-bold uppercase text-stone-600">
                                  Hall / Room *
                                </label>
                                <input
                                  type="text"
                                  required
                                  list="existing-halls-list"
                                  value={editHall}
                                  onChange={(e) => setEditHall(e.target.value)}
                                  className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs font-bold text-[#241000] outline-none focus:border-orange-500"
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-[11px] font-bold uppercase text-stone-600">
                                  Speaker
                                </label>
                                <input
                                  type="text"
                                  value={editSpeaker}
                                  onChange={(e) =>
                                    setEditSpeaker(e.target.value)
                                  }
                                  placeholder="Optional"
                                  className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-[#241000] outline-none focus:border-orange-500"
                                />
                              </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-[11px] font-bold uppercase text-stone-600">
                                  Start Time *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={editStartTime}
                                  onChange={(e) =>
                                    setEditStartTime(e.target.value)
                                  }
                                  className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-[#241000] outline-none focus:border-orange-500"
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-[11px] font-bold uppercase text-stone-600">
                                  End Time *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={editEndTime}
                                  onChange={(e) =>
                                    setEditEndTime(e.target.value)
                                  }
                                  className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-[#241000] outline-none focus:border-orange-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="mb-1 block text-[11px] font-bold uppercase text-stone-600">
                                Topic Notes
                              </label>
                              <textarea
                                rows={2}
                                value={editDescription}
                                onChange={(e) =>
                                  setEditDescription(e.target.value)
                                }
                                className="w-full rounded-xl border border-stone-200 bg-white p-2.5 text-xs text-[#241000] outline-none focus:border-orange-500"
                              />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                              <button
                                type="button"
                                onClick={cancelEditingSession}
                                disabled={savingEdit}
                                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={savingEdit}
                                onClick={() =>
                                  handleSaveSessionEdit(sessionItem.id)
                                }
                                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700 disabled:opacity-60"
                              >
                                <Check size={14} />
                                {savingEdit ? "Saving..." : "Save Changes"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={sessionItem.id}
                        className="rounded-2xl border border-orange-100 bg-[#fffaf5]/60 p-5 transition hover:border-orange-200 hover:bg-white"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-lg bg-[#241000] px-2.5 py-1 text-xs font-bold text-orange-200">
                                <Building2 size={12} />
                                {sessionItem.hall}
                              </span>

                              <span className="inline-flex items-center gap-1 rounded-lg bg-orange-100/80 px-2.5 py-1 text-xs font-bold text-orange-800">
                                <Clock size={12} />
                                {sessionItem.startTime} – {sessionItem.endTime}
                              </span>

                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                  sessionItem.isActive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-stone-200/70 text-stone-600"
                                }`}
                              >
                                {sessionItem.isActive ? "Active" : "Completed"}
                              </span>
                            </div>

                            <h4 className="mt-2.5 text-base font-extrabold text-[#241000]">
                              {sessionItem.title}
                            </h4>

                            {sessionItem.speaker && (
                              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-stone-500">
                                <Mic2 size={13} className="text-orange-500" />
                                {sessionItem.speaker}
                              </p>
                            )}

                            {sessionItem.description && (
                              <p className="mt-1.5 text-xs leading-5 text-stone-500">
                                {sessionItem.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEditingSession(sessionItem)}
                              title="Edit Session Details"
                              className="inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-white px-3 py-1.5 text-xs font-bold text-orange-700 transition hover:bg-orange-50"
                            >
                              <Pencil size={12} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleToggleSessionActive(sessionItem)
                              }
                              className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 transition hover:border-orange-300 hover:text-orange-700"
                            >
                              {sessionItem.isActive
                                ? "Mark Completed"
                                : "Reopen Session"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSession(sessionItem)}
                              aria-label={`Delete ${sessionItem.title}`}
                              className="flex h-8 w-8 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-orange-100/80 pt-3.5">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600">
                            <CircleHelp size={14} className="text-orange-600" />
                            {qCount} {qCount === 1 ? "Question" : "Questions"}
                          </span>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyUrl(
                                  `ask-${sessionItem.id}`,
                                  `/ask/${sessionItem.id}`
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                            >
                              <Link2 size={13} />
                              {copiedKey === `ask-${sessionItem.id}`
                                ? "Ask Link Copied!"
                                : "Copy Ask Link"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleCopyUrl(
                                  `display-${sessionItem.id}`,
                                  `/display/${sessionItem.id}`
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-white px-3 py-1.5 text-xs font-bold text-orange-700 transition hover:bg-orange-50"
                            >
                              <Copy size={13} />
                              {copiedKey === `display-${sessionItem.id}`
                                ? "Screen URL Copied!"
                                : "Copy Screen URL"}
                            </button>

                            <Link
                              href={`/display/${sessionItem.id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1.5 rounded-xl bg-[#241000] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-orange-600"
                            >
                              <ExternalLink size={13} />
                              Public Screen
                            </Link>

                            <a
                              href={`/api/admin/sessions/${sessionItem.id}/export`}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-orange-600/20 transition hover:bg-orange-700"
                            >
                              <Download size={13} />
                              Download Excel
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Audience Questions Section */}
      <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-orange-100 pb-6 md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-extrabold text-[#241000]">
              Submitted Audience Questions ({filteredQuestions.length})
            </h3>
            <p className="mt-1 text-sm text-stone-500">
              Filter by day, hall, or session, highlight key questions for the
              stage screen, or export completed session Q&amp;A.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {eventDays.length > 0 && (
              <select
                aria-label="Filter by Day"
                value={questionDayFilter}
                onChange={(e) => {
                  setQuestionDayFilter(e.target.value);
                  setSelectedSessionId("all");
                }}
                className="h-10 rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-xs font-bold text-[#241000] outline-none focus:border-orange-500"
              >
                <option value="all">All Days</option>
                {eventDays.map((d) => (
                  <option key={d.dateStr} value={d.dateStr}>
                    {d.dayLabel} ({d.formattedDate})
                  </option>
                ))}
              </select>
            )}

            <select
              aria-label="Filter by Hall"
              value={selectedHall}
              onChange={(e) => {
                setSelectedHall(e.target.value);
                setSelectedSessionId("all");
              }}
              className="h-10 rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-xs font-bold text-[#241000] outline-none focus:border-orange-500"
            >
              <option value="all">All Halls</option>
              {allHalls.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by Session"
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="h-10 rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-xs font-bold text-[#241000] outline-none focus:border-orange-500"
            >
              <option value="all">All Sessions</option>
              {sessions
                .filter(
                  (s) =>
                    (questionDayFilter === "all" ||
                      toYMD(s.sessionDate) === questionDayFilter) &&
                    (selectedHall === "all" || s.hall === selectedHall)
                )
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {dayLabelMap.get(toYMD(s.sessionDate))?.dayLabel ||
                      s.sessionDate}{" "}
                    · {s.hall} — {s.title} ({s.startTime})
                  </option>
                ))}
            </select>

            {selectedSessionId !== "all" && (
              <a
                href={`/api/admin/sessions/${selectedSessionId}/export`}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-orange-600 px-4 text-xs font-bold text-white shadow-sm shadow-orange-600/20 transition hover:bg-orange-700"
              >
                <Download size={14} />
                Download Excel
              </a>
            )}
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-[#fffaf5] px-6 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <Sparkles size={22} />
            </div>
            <h4 className="mt-4 text-base font-extrabold text-[#241000]">
              No questions here yet
            </h4>
            <p className="mt-1 max-w-md text-xs leading-5 text-stone-500">
              Once your event is Live and attendees submit questions using the
              session&apos;s Ask Link, they will appear right here.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {filteredQuestions.map((q) => {
              const parentSession = sessionMap.get(q.sessionId);
              const dayInfo = parentSession
                ? dayLabelMap.get(toYMD(parentSession.sessionDate))
                : undefined;

              return (
                <div
                  key={q.id}
                  className={`flex flex-col justify-between rounded-2xl border p-5 transition ${
                    q.isFeatured
                      ? "border-orange-400 bg-orange-50/50 shadow-sm"
                      : "border-orange-100 bg-[#fffaf5]/50"
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {dayInfo && (
                          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                            {dayInfo.dayLabel}
                          </span>
                        )}
                        <span className="rounded-md bg-[#241000] px-2 py-0.5 text-[11px] font-bold text-orange-200">
                          {q.hall}
                        </span>
                        {parentSession && (
                          <span className="rounded-md bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-800">
                            {parentSession.title}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-stone-400">
                        {formatTime(q.createdAt)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-semibold leading-6 text-[#241000]">
                      {q.questionText}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-orange-100 pt-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600">
                      <User size={13} className="text-orange-500" />
                      {q.participantName || "Anonymous"}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleQuestionFlag(q, "isFeatured")}
                        title="Highlight on Public Screen"
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                          q.isFeatured
                            ? "bg-orange-600 text-white"
                            : "border border-stone-200 bg-white text-stone-600 hover:border-orange-300"
                        }`}
                      >
                        <Star size={12} />
                        {q.isFeatured ? "Featured" : "Feature"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleQuestionFlag(q, "isAnswered")}
                        title="Mark as Answered"
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                          q.isAnswered
                            ? "bg-emerald-600 text-white"
                            : "border border-stone-200 bg-white text-stone-600 hover:border-emerald-300"
                        }`}
                      >
                        <CheckCircle2 size={12} />
                        {q.isAnswered ? "Answered" : "Mark Answered"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        aria-label="Delete question"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}