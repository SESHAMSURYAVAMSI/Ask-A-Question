"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  CircleHelp,
  Clock,
  MapPin,
  Mic2,
  Radio,
  RefreshCw,
  Send,
  Sparkles,
  Star,
  User,
  X,
} from "lucide-react";

export interface PublicSessionInfo {
  id: string;
  eventId: string;
  eventTitle: string;
  venue: string;
  title: string;
  hall: string;
  speaker: string;
  startTime: string;
  endTime: string;
  description: string;
  isActive: boolean;
}

interface PublicQuestionItem {
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

interface PublicQaPortalProps {
  session: PublicSessionInfo | null;
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function PublicQaPortal({ session }: PublicQaPortalProps) {
  const [activeTab, setActiveTab] = useState<"ask" | "asked">("ask");
  const [questions, setQuestions] = useState<PublicQuestionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [participantName, setParticipantName] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fetchSessionQuestions = useCallback(async () => {
    if (!session?.id) return;

    setLoadingQuestions(true);
    try {
      const res = await fetch(`/api/public/questions?sessionId=${session.id}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } finally {
      setLoadingQuestions(false);
    }
  }, [session?.id]);

  useEffect(() => {
    if (!session?.id) return;

    fetchSessionQuestions();
    const interval = setInterval(fetchSessionQuestions, 5000);
    return () => clearInterval(interval);
  }, [session?.id, fetchSessionQuestions]);

  // Auto-close success popup after 4 seconds
  useEffect(() => {
    if (!showSuccessModal) return;
    const timer = setTimeout(() => {
      setShowSuccessModal(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [showSuccessModal]);

  async function handleSubmitQuestion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session?.id) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/public/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          participantName,
          questionText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Unable to submit your question.");
        return;
      }

      setQuestionText("");
      setQuestions((prev) => [data.question, ...prev]);
      setShowSuccessModal(true);
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fffaf5] text-[#241000]">
      {/* Professional Centered Success Popup Modal */}
      <AnimatePresence>
        {showSuccessModal && session && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSuccessModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 14 }}
              transition={{ type: "spring", stiffness: 360, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-3xl border border-emerald-100 bg-white p-7 text-center shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                aria-label="Close popup"
                className="absolute right-4 top-4 rounded-xl p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
              >
                <X size={18} />
              </button>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
                <CheckCircle2 size={34} strokeWidth={2.3} />
              </div>

              <h3 className="mt-5 text-xl font-extrabold tracking-tight text-[#241000]">
                Submitted Successfully!
              </h3>

              <p className="mt-2 text-sm leading-6 text-stone-500">
                Your question has been sent directly to{" "}
                <strong className="text-[#241000]">{session.hall}</strong> for{" "}
                <span className="font-semibold text-orange-700">
                  {session.title}
                </span>
                .
              </p>

              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="h-11 w-full rounded-xl bg-orange-600 px-5 text-sm font-bold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-700"
                >
                  Ask Another Question
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
        {!session ? (
          <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <Radio size={26} />
            </div>
            <h1 className="mt-5 text-2xl font-extrabold text-[#241000]">
              Session Not Found
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              This session may no longer be active. Choose another active
              session from the directory below.
            </p>
            <Link
              href="/ask"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white"
            >
              Select Date, Hall &amp; Session
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Auto-Detected Hall & Session Banner */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-gradient-to-br from-[#241000] via-[#351804] to-[#4a2208] p-6 text-white shadow-xl shadow-orange-950/10 sm:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wide text-white">
                    <Building2 size={13} />
                    {session.hall}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-orange-200">
                    <Clock size={13} />
                    {session.startTime} – {session.endTime}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    Live
                  </span>
                </div>

                {/* <Link
                  href={`/ask?eventId=${session.eventId}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-bold text-orange-100 transition hover:bg-white/20"
                >
                  <ArrowLeft size={13} />
                  Change Session
                </Link> */}
              </div>

              <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-orange-300/80">
                {session.eventTitle}
              </p>

              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {session.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-orange-100/75">
                {session.speaker && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mic2 size={14} className="text-orange-400" />
                    {session.speaker}
                  </span>
                )}
                {session.venue && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} className="text-orange-400" />
                    {session.venue}
                  </span>
                )}
              </div>
            </motion.section>

            {/* Tab Header */}
            <div className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-white p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab("ask")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition ${
                  activeTab === "ask"
                    ? "bg-orange-600 text-white shadow-sm shadow-orange-600/20"
                    : "text-stone-600 hover:bg-orange-50 hover:text-orange-700"
                }`}
              >
                <Sparkles size={16} />
                Ask a Question
              </button>
            </div>

            {/* Tab 1: Clean Question Submission Form */}
            {activeTab === "ask" ? (
              <motion.section
                key="ask-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-9"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-extrabold text-[#241000]">
                    Submit Your Question
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Your question goes directly to{" "}
                    <strong className="text-[#241000]">{session.hall}</strong>{" "}
                    for this session.
                  </p>
                </div>

                {!session.isActive ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                    This session has ended and is no longer accepting new
                    questions.
                  </div>
                ) : (
                  <form onSubmit={handleSubmitQuestion} className="space-y-5">
                    <div>
                      <label
                        htmlFor="participantName"
                        className="mb-2 block text-xs font-bold uppercase tracking-wide text-stone-600"
                      >
                        Your Name
                      </label>
                      <div className="relative">
                        <User
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                        />
                        <input
                          id="participantName"
                          type="text"
                          placeholder="e.g. Surya (leave blank to post anonymously)"
                          value={participantName}
                          onChange={(e) => setParticipantName(e.target.value)}
                          className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-4 text-sm text-[#241000] outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="questionText"
                        className="mb-2 block text-xs font-bold uppercase tracking-wide text-stone-600"
                      >
                        Your Question <span className="text-orange-600">*</span>
                      </label>
                      <textarea
                        id="questionText"
                        rows={5}
                        required
                        maxLength={600}
                        placeholder="Type your question here..."
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-[#241000] outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                      />
                      <div className="mt-1.5 text-right text-xs text-stone-400">
                        {questionText.length}/600
                      </div>
                    </div>

                    {errorMessage && (
                      <div
                        role="alert"
                        className="rounded-xl border border-red-100 bg-red-50 px-4 py-3.5 text-xs font-semibold text-red-600"
                      >
                        {errorMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 disabled:opacity-60"
                    >
                      <Send size={17} />
                      {submitting ? "Submitting..." : "Submit Question"}
                    </button>
                  </form>
                )}
              </motion.section>
            ) : (
              /* Tab 2: Separate View Showing Only Asked Questions for This Hall & Session */
              <motion.section
                key="asked-list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="mb-5 flex items-center justify-between gap-3 border-b border-orange-100 pb-4">
                  <div>
                    <h2 className="text-lg font-extrabold">
                      Asked Questions · {session.hall}
                    </h2>
                    <p className="text-xs text-stone-500">
                      Showing only questions submitted in this session
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={fetchSessionQuestions}
                    disabled={loadingQuestions}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3.5 py-2 text-xs font-bold text-stone-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                  >
                    <RefreshCw
                      size={13}
                      className={loadingQuestions ? "animate-spin" : ""}
                    />
                    Refresh
                  </button>
                </div>

                {questions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-[#fffaf5] px-6 py-14 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                      <CircleHelp size={22} />
                    </div>
                    <h3 className="mt-4 text-base font-extrabold">
                      No questions asked yet
                    </h3>
                    <p className="mt-1 max-w-sm text-xs leading-5 text-stone-500">
                      No questions have been submitted in {session.hall} for
                      this session yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("ask")}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white"
                    >
                      Ask the First Question
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {questions.map((q) => (
                      <div
                        key={q.id}
                        className={`rounded-2xl border p-4 transition ${
                          q.isFeatured
                            ? "border-orange-400 bg-orange-50/60"
                            : "border-orange-100 bg-[#fffaf5]/60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold leading-6 text-[#241000]">
                            {q.questionText}
                          </p>
                          {q.isFeatured && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-orange-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                              <Star size={10} />
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-stone-700">
                            <User size={12} className="text-orange-600" />
                            {q.participantName}
                          </span>

                          <div className="flex items-center gap-3">
                            {q.isAnswered && (
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                                <CheckCircle2 size={12} />
                                Answered
                              </span>
                            )}
                            <span>{formatTime(q.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}