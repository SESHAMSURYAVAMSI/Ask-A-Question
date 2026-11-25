"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  ChevronRight,
  Clock,
  Layers,
  MapPin,
  Mic2,
  MonitorPlay,
  Radio,
} from "lucide-react";

export interface PublicDisplayEvent {
  id: string;
  title: string;
  venue: string;
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null;   // YYYY-MM-DD
}

export interface PublicDisplaySession {
  id: string;
  eventId: string;
  title: string;
  hall: string;
  speaker: string;
  sessionDate: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface DisplaySelectorPortalProps {
  events: PublicDisplayEvent[];
  sessions: PublicDisplaySession[];
  initialEventId: string;
}

interface DayOption {
  dateStr: string;
  dayLabel: string;
  formattedDate: string;
}

function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return Number.MAX_SAFE_INTEGER;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
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

function buildDaysForEvent(
  event: PublicDisplayEvent | undefined,
  eventSessions: PublicDisplaySession[]
): DayOption[] {
  const dateSet = new Set<string>();

  if (event?.startDate) {
    const startYMD = event.startDate;
    const endYMD = event.endDate || startYMD;

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

  for (const s of eventSessions) {
    if (s.sessionDate) {
      dateSet.add(s.sessionDate);
    }
  }

  const sorted = Array.from(dateSet).sort((a, b) => a.localeCompare(b));
  return sorted.map((dateStr, idx) => ({
    dateStr,
    dayLabel: `Day ${idx + 1}`,
    formattedDate: formatReadableDate(dateStr),
  }));
}

export default function DisplaySelectorPortal({
  events,
  sessions,
  initialEventId,
}: DisplaySelectorPortalProps) {
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedHall, setSelectedHall] = useState<string>("");

  const activeEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || events[0],
    [events, selectedEventId]
  );

  const sessionsForEvent = useMemo(() => {
    if (!activeEvent) return [];
    return sessions.filter((s) => s.eventId === activeEvent.id);
  }, [sessions, activeEvent]);

  const eventDays = useMemo(
    () => buildDaysForEvent(activeEvent, sessionsForEvent),
    [activeEvent, sessionsForEvent]
  );

  useEffect(() => {
    if (eventDays.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedDate("");
      return;
    }
    const stillValid = eventDays.some((d) => d.dateStr === selectedDate);
    if (!stillValid) {
      const todayYMD = new Date().toISOString().slice(0, 10);
      const todayMatch = eventDays.find((d) => d.dateStr === todayYMD);
      setSelectedDate(todayMatch ? todayMatch.dateStr : eventDays[0].dateStr);
    }
  }, [eventDays, selectedDate]);

  const sessionsForDate = useMemo(() => {
    if (!selectedDate) return [];
    return sessionsForEvent.filter((s) => s.sessionDate === selectedDate);
  }, [sessionsForEvent, selectedDate]);

  const hallsForDate = useMemo(() => {
    const unique = Array.from(new Set(sessionsForDate.map((s) => s.hall)));
    return unique.sort((a, b) => a.localeCompare(b));
  }, [sessionsForDate]);

  useEffect(() => {
    if (hallsForDate.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedHall("");
      return;
    }
    if (!selectedHall || !hallsForDate.includes(selectedHall)) {
      setSelectedHall(hallsForDate[0]);
    }
  }, [hallsForDate, selectedHall]);

  // Chronologically ordered sessions for the selected Date & Hall
  const sessionsForDateAndHall = useMemo(() => {
    if (!selectedHall) return [];
    return sessionsForDate
      .filter((s) => s.hall === selectedHall)
      .slice()
      .sort((a, b) => {
        const diff =
          parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime);
        if (diff !== 0) return diff;
        return parseTimeToMinutes(a.endTime) - parseTimeToMinutes(b.endTime);
      });
  }, [sessionsForDate, selectedHall]);

  const activeDayObj = eventDays.find((d) => d.dateStr === selectedDate);

  return (
    <main className="min-h-screen bg-[#fffaf5] text-[#241000]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-orange-100 bg-white/95 shadow-sm shadow-orange-950/[0.03] backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="orange-gradient flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-md shadow-orange-600/20">
              <MonitorPlay size={20} strokeWidth={2.3} />
            </div>
            <div>
              <p className="text-base font-extrabold tracking-tight">
                Stage Display<span className="text-orange-600">.</span>
              </p>
              <p className="text-[11px] text-stone-500">
                Select Date · Hall · Session
              </p>
            </div>
          </Link>

          {/* <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
          >
            <ArrowLeft size={14} />
            Home
          </Link> */}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        {events.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <Radio size={26} />
            </div>
            <h1 className="mt-5 text-2xl font-extrabold text-[#241000]">
              No Live Events Right Now
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              There are currently no live events published for stage display.
              Please check back once an event goes live.
            </p>
          </div>
        ) : (
          <div className="space-y-7">
            {/* Event Header Card */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Live Stage Launcher
                  </span>

                  <h1 className="mt-3 text-2xl font-black tracking-tight text-[#241000] sm:text-3xl">
                    {activeEvent?.title}
                  </h1>

                  {activeEvent?.venue && (
                    <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-stone-500">
                      <MapPin size={14} className="text-orange-500" />
                      {activeEvent.venue}
                    </p>
                  )}
                </div>

                {events.length > 1 && (
                  <div className="w-full md:w-72">
                    <label
                      htmlFor="selectLiveEvent"
                      className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-400"
                    >
                      Switch Live Event
                    </label>
                    <select
                      id="selectLiveEvent"
                      value={activeEvent?.id || ""}
                      onChange={(e) => {
                        setSelectedEventId(e.target.value);
                        setSelectedDate("");
                        setSelectedHall("");
                      }}
                      className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-xs font-bold text-[#241000] outline-none focus:border-orange-500 focus:bg-white"
                    >
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Step 1: Select Date */}
            <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-orange-600">
                Step 1 · Select Date
              </p>

              {eventDays.length === 0 ? (
                <p className="text-sm text-stone-500">
                  No dates configured for this event yet.
                </p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {eventDays.map((day) => {
                    const countOnDay = sessionsForEvent.filter(
                      (s) => s.sessionDate === day.dateStr
                    ).length;
                    const isSelected = selectedDate === day.dateStr;

                    return (
                      <button
                        key={day.dateStr}
                        type="button"
                        onClick={() => setSelectedDate(day.dateStr)}
                        className={`flex items-center gap-3 rounded-2xl border px-5 py-3.5 text-left transition ${
                          isSelected
                            ? "border-orange-600 bg-orange-600 text-white shadow-md shadow-orange-600/20"
                            : "border-orange-100 bg-[#fffaf5] text-[#241000] hover:border-orange-300 hover:bg-orange-50/60"
                        }`}
                      >
                        <CalendarDays
                          size={18}
                          className={
                            isSelected ? "text-orange-100" : "text-orange-600"
                          }
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold">
                              {day.dayLabel}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {countOnDay}{" "}
                              {countOnDay === 1 ? "session" : "sessions"}
                            </span>
                          </div>
                          <p
                            className={`mt-0.5 text-xs ${
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
              )}
            </section>

            {/* Step 2: Select Hall on Selected Date */}
            <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-orange-600">
                Step 2 · Select Hall{" "}
                {activeDayObj
                  ? `(${activeDayObj.dayLabel} — ${activeDayObj.formattedDate})`
                  : ""}
              </p>

              {hallsForDate.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-[#fffaf5] px-6 py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                    <Layers size={22} />
                  </div>
                  <h2 className="mt-3 text-base font-extrabold text-[#241000]">
                    No halls scheduled on this date
                  </h2>
                  <p className="mt-1 text-xs text-stone-500">
                    Try choosing another day above to view active halls and
                    sessions.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {hallsForDate.map((hallName) => {
                    const countInHall = sessionsForDate.filter(
                      (s) => s.hall === hallName
                    ).length;
                    const isHallSelected = selectedHall === hallName;

                    return (
                      <button
                        key={hallName}
                        type="button"
                        onClick={() => setSelectedHall(hallName)}
                        className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                          isHallSelected
                            ? "border-[#241000] bg-[#241000] text-white shadow-md"
                            : "border-stone-200 bg-[#fffaf5]/70 text-[#241000] hover:border-orange-300 hover:bg-orange-50/70"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                              isHallSelected
                                ? "bg-white/10 text-orange-300"
                                : "bg-orange-100 text-orange-600"
                            }`}
                          >
                            <Building2 size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-extrabold">{hallName}</p>
                            <p
                              className={`text-xs ${
                                isHallSelected
                                  ? "text-orange-200/80"
                                  : "text-stone-500"
                              }`}
                            >
                              {countInHall}{" "}
                              {countInHall === 1 ? "Session" : "Sessions"}
                            </p>
                          </div>
                        </div>

                        <ChevronRight
                          size={16}
                          className={
                            isHallSelected ? "text-orange-300" : "text-stone-400"
                          }
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Step 3: Single-Column Chronological Sessions List -> Redirects to /display/[sessionId] */}
            {selectedHall && sessionsForDateAndHall.length > 0 && (
              <motion.section
                key={`${selectedDate}-${selectedHall}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
                      Step 3 · Choose Session to Launch Live Screen
                    </p>
                    <h2 className="mt-1 text-lg font-extrabold text-[#241000]">
                      {selectedHall} · {activeDayObj?.dayLabel} (
                      {sessionsForDateAndHall.length}{" "}
                      {sessionsForDateAndHall.length === 1
                        ? "Session"
                        : "Sessions"}
                      )
                    </h2>
                  </div>
                </div>

                {/* Single Session Per Row */}
                <div className="space-y-3.5">
                  {sessionsForDateAndHall.map((sessionItem) => (
                    <Link
                      key={sessionItem.id}
                      href={`/display/${sessionItem.id}`}
                      className="group flex flex-col justify-between gap-4 rounded-2xl border border-orange-100 bg-[#fffaf5]/70 p-5 transition hover:border-orange-400 hover:bg-white hover:shadow-md hover:shadow-orange-950/[0.04] sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-100/90 px-3 py-1 text-xs font-bold text-orange-900">
                            <Clock size={12} className="text-orange-600" />
                            {sessionItem.startTime} – {sessionItem.endTime}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              sessionItem.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-stone-200/70 text-stone-600"
                            }`}
                          >
                            {sessionItem.isActive ? "Active" : "Completed"}
                          </span>
                        </div>

                        <h3 className="mt-2.5 text-base font-extrabold text-[#241000] transition group-hover:text-orange-600 sm:text-lg">
                          {sessionItem.title}
                        </h3>

                        {sessionItem.speaker && (
                          <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-stone-500">
                            <Mic2 size={13} className="text-orange-500" />
                            {sessionItem.speaker}
                          </p>
                        )}
                      </div>

                      <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-[#241000] px-4 py-2.5 text-xs font-bold text-white transition group-hover:bg-orange-600 sm:self-center">
                        <span>Open Question Screen</span>
                        <ArrowRight
                          size={15}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}