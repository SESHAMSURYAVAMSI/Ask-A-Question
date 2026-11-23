"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  Clock,
  History,
  Maximize2,
  MessageCircle,
  Mic2,
  Radio,
  RotateCcw,
  Star,
  User,
} from "lucide-react";

export interface DisplaySessionInfo {
  id: string;
  eventTitle: string;
  title: string;
  hall: string;
  speaker: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface DisplayQuestionItem {
  id: string;
  participantName: string;
  questionText: string;
  isAnswered: boolean;
  isFeatured: boolean;
  createdAt: string;
}

interface LiveScreenDisplayProps {
  session: DisplaySessionInfo;
  initialQuestions: DisplayQuestionItem[];
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function LiveScreenDisplay({
  session,
  initialQuestions,
}: LiveScreenDisplayProps) {
  const [questions, setQuestions] =
    useState<DisplayQuestionItem[]>(initialQuestions);
  const [filter, setFilter] = useState<"all" | "featured" | "unanswered">("all");
  const [clearedAfterMs, setClearedAfterMs] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const storageKey = `display_cleared_after_${session.id}`;

  // Restore any active screen-clear cutoff for this session
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = Number(saved);
        if (!Number.isNaN(parsed) && parsed > 0) {
          setClearedAfterMs(parsed);
        }
      }
    } catch {
      // Ignore storage access issues
    }
  }, [storageKey]);

  const pollQuestions = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/public/questions?sessionId=${session.id}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch {
      // Ignore transient network errors during live polling
    } finally {
      setIsRefreshing(false);
    }
  }, [session.id]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(pollQuestions, 10000);
    return () => clearInterval(interval);
  }, [pollQuestions]);

  // Only show questions submitted AFTER the hard refresh cutoff (if set)
  const activeScreenQuestions = useMemo(() => {
    if (!clearedAfterMs) return questions;
    return questions.filter(
      (q) => new Date(q.createdAt).getTime() > clearedAfterMs
    );
  }, [questions, clearedAfterMs]);

  const visibleQuestions = useMemo(() => {
    if (filter === "featured") {
      return activeScreenQuestions.filter((q) => q.isFeatured);
    }
    if (filter === "unanswered") {
      return activeScreenQuestions.filter((q) => !q.isAnswered);
    }
    return activeScreenQuestions;
  }, [activeScreenQuestions, filter]);

  function handleHardRefresh() {
    const now = Date.now();
    setClearedAfterMs(now);
    try {
      window.localStorage.setItem(storageKey, String(now));
    } catch {
      // Ignore storage access issues
    }
    pollQuestions();
  }

  function handleRestoreCleared() {
    setClearedAfterMs(null);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Ignore storage access issues
    }
  }

  function handleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  const hiddenCount = questions.length - activeScreenQuestions.length;

  return (
    <main className="min-h-screen bg-[#fffaf5] text-[#241000]">
      {/* Clean Light Presentation Header */}
      <header className="sticky top-0 z-30 border-b border-orange-100 bg-white/95 shadow-sm shadow-orange-950/[0.03] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-6 py-5 sm:px-10 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#241000] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-orange-200">
                <Building2 size={13} className="text-orange-400" />
                {session.hall}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1 text-xs font-bold text-orange-900">
                <Clock size={13} className="text-orange-600" />
                {session.startTime} – {session.endTime}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <Radio
                  size={13}
                  className={isRefreshing ? "animate-spin" : "animate-pulse"}
                />
                Live · 10s sync
              </span>
            </div>

            <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.15em] text-orange-600">
              {session.eventTitle}
            </p>
            <h1 className="mt-0.5 text-2xl font-black tracking-tight text-[#241000] sm:text-3xl">
              {session.title}
            </h1>
            {session.speaker && (
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-stone-600">
                <Mic2 size={14} className="text-orange-600" />
                {session.speaker}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex rounded-xl border border-stone-200 bg-stone-100/80 p-1">
              {(
                [
                  { key: "all", label: `All (${activeScreenQuestions.length})` },
                  {
                    key: "featured",
                    label: `Featured (${activeScreenQuestions.filter((q) => q.isFeatured).length})`,
                  },
                  {
                    key: "unanswered",
                    label: `Pending (${activeScreenQuestions.filter((q) => !q.isAnswered).length})`,
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilter(tab.key)}
                  className={`rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                    filter === tab.key
                      ? "bg-[#241000] text-white shadow-sm"
                      : "text-stone-600 hover:text-[#241000]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleHardRefresh}
              title="Clear current questions from screen (keeps all data in DB) and show only new submissions"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs font-bold text-amber-900 transition hover:bg-amber-100"
            >
              <RotateCcw size={14} />
              Hard Refresh
            </button>

            <button
              type="button"
              onClick={handleFullscreen}
              title="Toggle Fullscreen"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs font-bold text-stone-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
            >
              <Maximize2 size={14} />
              Fullscreen
            </button>

            <Link
              href={`/ask/${session.id}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-700"
            >
              <MessageCircle size={14} />
              Ask Question
            </Link>
          </div>
        </div>
      </header>

      {/* Presentation Questions Area */}
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10">
        {/* Compact Subtle Restore Bar (only shown after Hard Refresh) */}
        {hiddenCount > 0 && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-orange-200/70 bg-white/80 px-4 py-2.5 text-xs text-stone-500 shadow-xs">
            <span className="inline-flex items-center gap-2">
              <History size={14} className="text-orange-500" />
              <span>
                Showing only new questions ({hiddenCount} earlier{" "}
                {hiddenCount === 1 ? "question" : "questions"} hidden from
                screen)
              </span>
            </span>

            <button
              type="button"
              onClick={handleRestoreCleared}
              className="rounded-lg bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-700 transition hover:bg-orange-100"
            >
              Restore ({hiddenCount})
            </button>
          </div>
        )}

        {visibleQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-24 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <MessageCircle size={32} />
            </div>
            <h2 className="mt-5 text-2xl font-extrabold text-[#241000]">
              {clearedAfterMs
                ? "Screen Cleared — Waiting for New Questions"
                : "Waiting for Audience Questions"}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-stone-500">
              Attendees can open{" "}
              <Link
                href={`/ask/${session.id}`}
                className="font-bold text-orange-600 underline hover:text-orange-700"
              >
                /ask/{session.id}
              </Link>{" "}
              to submit questions directly to{" "}
              <strong className="text-[#241000]">{session.hall}</strong>. New
              submissions appear automatically every 10 seconds.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {visibleQuestions.map((q, idx) => (
              <motion.article
                key={q.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col justify-between rounded-3xl border p-7 transition ${
                  q.isFeatured
                    ? "border-orange-400 bg-gradient-to-br from-orange-50/90 via-white to-amber-50/60 shadow-lg shadow-orange-950/[0.06] ring-2 ring-orange-500/20"
                    : "border-orange-100 bg-white shadow-sm shadow-orange-950/[0.03]"
                }`}
              >
                <div>
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-stone-100 px-2 text-xs font-extrabold text-stone-600">
                        #{idx + 1}
                      </span>

                      {q.isFeatured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-600 px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                          <Star size={12} />
                          Featured
                        </span>
                      )}

                      {q.isAnswered && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                          <CheckCircle2 size={12} />
                          Answered
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-medium text-stone-400">
                      {formatTime(q.createdAt)}
                    </span>
                  </div>

                  <p className="text-xl font-bold leading-relaxed text-[#241000] sm:text-2xl">
                    {q.questionText}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-2 border-t border-orange-100/80 pt-4 text-sm font-semibold text-stone-600">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                    <User size={14} />
                  </div>
                  <span className="text-[#241000]">{q.participantName}</span>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}