"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlignLeft,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  FileEdit,
  MapPin,
  Radio,
  Sparkles,
} from "lucide-react";

export default function CreateEventForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"draft" | "live">("draft");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          venue,
          startDate: startDate || null,
          endDate: endDate || null,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to create event.");
        return;
      }

      router.push("/admin/events");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-3xl"
    >
      <div className="mb-6">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-orange-600"
        >
          <ArrowLeft size={16} />
          Back to Events
        </Link>
      </div>

      <div className="rounded-3xl border border-orange-100 bg-white p-7 shadow-xl shadow-orange-950/5 sm:p-10">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
            <Sparkles size={13} />
            New Conference / Event
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-[#241000] sm:text-3xl">
            Create an Event
          </h2>

          <p className="mt-2 text-sm leading-6 text-stone-500">
            Set up your event details and choose whether to keep it in Draft
            while configuring halls &amp; sessions or publish it Live right away.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-semibold text-stone-700"
            >
              Event Title <span className="text-orange-600">*</span>
            </label>

            <div className="relative">
              <CalendarDays
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                id="title"
                type="text"
                required
                placeholder="e.g. Annual Tech Summit 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-13 w-full rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-4 text-sm text-[#241000] outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="venue"
              className="mb-2 block text-sm font-semibold text-stone-700"
            >
              Venue / Location
            </label>

            <div className="relative">
              <MapPin
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                id="venue"
                type="text"
                placeholder="e.g. HICC Convention Center, Hyderabad"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="h-13 w-full rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-4 text-sm text-[#241000] outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="startDate"
                className="mb-2 block text-sm font-semibold text-stone-700"
              >
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-13 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm text-[#241000] outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="mb-2 block text-sm font-semibold text-stone-700"
              >
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-13 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm text-[#241000] outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold text-stone-700"
            >
              Description
            </label>

            <div className="relative">
              <AlignLeft
                size={18}
                className="absolute left-4 top-4 text-stone-400"
              />
              <textarea
                id="description"
                rows={3}
                placeholder="Brief overview of the event, tracks, or instructions for attendees..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3.5 pl-11 pr-4 text-sm text-[#241000] outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </div>

          <div>
            <span className="mb-2.5 block text-sm font-semibold text-stone-700">
              Visibility Status
            </span>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setStatus("draft")}
                className={`flex items-start gap-3.5 rounded-2xl border p-4 text-left transition ${
                  status === "draft"
                    ? "border-amber-500 bg-amber-50/70 ring-4 ring-amber-500/10"
                    : "border-stone-200 bg-stone-50/60 hover:border-orange-200"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    status === "draft"
                      ? "bg-amber-600 text-white"
                      : "bg-white text-stone-500"
                  }`}
                >
                  <FileEdit size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#241000]">
                    Save as Draft
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-stone-500">
                    Hidden from public attendees while you add sessions and
                    halls.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStatus("live")}
                className={`flex items-start gap-3.5 rounded-2xl border p-4 text-left transition ${
                  status === "live"
                    ? "border-emerald-600 bg-emerald-50/70 ring-4 ring-emerald-600/10"
                    : "border-stone-200 bg-stone-50/60 hover:border-orange-200"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    status === "live"
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-stone-500"
                  }`}
                >
                  <Radio size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#241000]">
                    Publish Live
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-stone-500">
                    Visible immediately on the public Q&amp;A page for active
                    sessions.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/admin/events"
              className="flex h-12 items-center justify-center rounded-xl border border-stone-200 px-6 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-600 px-7 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating event..." : "Create Event"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}