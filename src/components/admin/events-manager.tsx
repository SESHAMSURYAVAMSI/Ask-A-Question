"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  CircleHelp,
  Clock,
  FileEdit,
  Layers,
  MapPin,
  Pencil,
  Plus,
  Radio,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

export interface ManagedEventItem {
  id: string;
  title: string;
  description: string;
  venue: string;
  status: "draft" | "live";
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  sessionCount: number;
  questionCount: number;
}

interface EventsManagerProps {
  initialEvents: ManagedEventItem[];
}

function toYMD(isoString: string | null): string {
  if (!isoString) return "";
  return new Date(isoString).toISOString().slice(0, 10);
}

function formatDateRange(
  startDate: string | null,
  endDate: string | null,
  fallback: string
) {
  const fmt = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (startDate && endDate) {
    const s = fmt.format(new Date(startDate));
    const e = fmt.format(new Date(endDate));
    return s === e ? s : `${s} – ${e}`;
  }

  if (startDate) {
    return fmt.format(new Date(startDate));
  }

  return `Created ${fmt.format(new Date(fallback))}`;
}

export default function EventsManager({ initialEvents }: EventsManagerProps) {
  const router = useRouter();
  const [events, setEvents] = useState<ManagedEventItem[]>(initialEvents);
  const [filter, setFilter] = useState<"all" | "live" | "draft">("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Inline Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editVenue, setEditVenue] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesStatus = filter === "all" || event.status === filter;
      const query = search.trim().toLowerCase();
      const matchesQuery =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.venue.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [events, filter, search]);

  const counts = useMemo(() => {
    return {
      all: events.length,
      live: events.filter((e) => e.status === "live").length,
      draft: events.filter((e) => e.status === "draft").length,
    };
  }, [events]);

  function startEditing(eventItem: ManagedEventItem) {
    setError("");
    setEditingId(eventItem.id);
    setEditTitle(eventItem.title);
    setEditVenue(eventItem.venue);
    setEditStartDate(toYMD(eventItem.startDate));
    setEditEndDate(toYMD(eventItem.endDate));
    setEditDescription(eventItem.description);
  }

  function cancelEditing() {
    setEditingId(null);
  }

  async function handleSaveEdit(eventId: string) {
    setError("");
    const trimmedTitle = editTitle.trim();

    if (!trimmedTitle) {
      setError("Event title is required.");
      return;
    }

    if (editStartDate && editEndDate && editEndDate < editStartDate) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    setSavingEdit(true);

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
          venue: editVenue.trim(),
          startDate: editStartDate || null,
          endDate: editEndDate || null,
          description: editDescription.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to update event details.");
        return;
      }

      setEvents((prev) =>
        prev.map((item) =>
          item.id === eventId
            ? {
                ...item,
                title: data.event.title,
                venue: data.event.venue,
                description: data.event.description,
                startDate: data.event.startDate,
                endDate: data.event.endDate,
              }
            : item
        )
      );
      setEditingId(null);
      router.refresh();
    } catch {
      setError("Network error while updating event.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleToggleStatus(eventItem: ManagedEventItem) {
    const nextStatus = eventItem.status === "live" ? "draft" : "live";
    setBusyId(eventItem.id);
    setError("");

    try {
      const response = await fetch(`/api/admin/events/${eventItem.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to update event status.");
        return;
      }

      setEvents((prev) =>
        prev.map((item) =>
          item.id === eventItem.id ? { ...item, status: nextStatus } : item
        )
      );
      router.refresh();
    } catch {
      setError("Network error while updating event status.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(eventItem: ManagedEventItem) {
    const confirmed = window.confirm(
      `Delete "${eventItem.title}"? This will also remove all sessions and questions inside this event.`
    );

    if (!confirmed) return;

    setBusyId(eventItem.id);
    setError("");

    try {
      const response = await fetch(`/api/admin/events/${eventItem.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to delete event.");
        return;
      }

      setEvents((prev) => prev.filter((item) => item.id !== eventItem.id));
      if (editingId === eventItem.id) {
        setEditingId(null);
      }
      router.refresh();
    } catch {
      setError("Network error while deleting event.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#241000] sm:text-3xl">
            Manage Events
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Control Draft and Live visibility, edit event details, inspect halls
            &amp; sessions, or create a new event.
          </p>
        </div>

        <Link
          href="/admin/events/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
        >
          <Plus size={17} />
          Create Event
        </Link>
      </div>

      <div className="mt-7 flex flex-col justify-between gap-4 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { key: "all", label: `All (${counts.all})` },
              { key: "live", label: `Live (${counts.live})` },
              { key: "draft", label: `Draft (${counts.draft})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                filter === tab.key
                  ? "bg-[#241000] text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-orange-50 hover:text-orange-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            placeholder="Search events or venues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-4 text-sm text-[#241000] outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:bg-white"
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {filteredEvents.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <Sparkles size={24} />
          </div>
          <h3 className="mt-4 text-lg font-extrabold text-[#241000]">
            {events.length === 0 ? "No events yet" : "No matching events"}
          </h3>
          <p className="mt-1.5 max-w-md text-sm text-stone-500">
            {events.length === 0
              ? "Create your first event to start scheduling parallel sessions across multiple halls."
              : "Try clearing your search query or switching the status filter."}
          </p>
          {events.length === 0 && (
            <Link
              href="/admin/events/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-orange-600/20 transition hover:bg-orange-700"
            >
              <Plus size={16} />
              Create First Event
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {filteredEvents.map((eventItem, index) => {
            const isBusy = busyId === eventItem.id;
            const isLive = eventItem.status === "live";
            const isEditing = editingId === eventItem.id;

            if (isEditing) {
              return (
                <div
                  key={eventItem.id}
                  className="rounded-3xl border-2 border-orange-400 bg-white p-6 shadow-md"
                >
                  <div className="mb-4 flex items-center justify-between border-b border-orange-100 pb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-orange-700">
                      <Pencil size={13} />
                      Edit Event
                    </span>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="mb-1 block text-[11px] font-bold uppercase text-stone-600">
                        Event Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm font-semibold text-[#241000] outline-none focus:border-orange-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-bold uppercase text-stone-600">
                        Venue / Location
                      </label>
                      <input
                        type="text"
                        value={editVenue}
                        onChange={(e) => setEditVenue(e.target.value)}
                        placeholder="e.g. HICC Convention Center, Hyderabad"
                        className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs text-[#241000] outline-none focus:border-orange-500 focus:bg-white"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-bold uppercase text-stone-600">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={editStartDate}
                          onChange={(e) => setEditStartDate(e.target.value)}
                          className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs text-[#241000] outline-none focus:border-orange-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-bold uppercase text-stone-600">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={editEndDate}
                          min={editStartDate || undefined}
                          onChange={(e) => setEditEndDate(e.target.value)}
                          className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs text-[#241000] outline-none focus:border-orange-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-bold uppercase text-stone-600">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-[#241000] outline-none focus:border-orange-500 focus:bg-white"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        disabled={savingEdit}
                        onClick={cancelEditing}
                        className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        disabled={savingEdit}
                        onClick={() => handleSaveEdit(eventItem.id)}
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
              <motion.div
                key={eventItem.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col justify-between rounded-3xl border border-orange-100 bg-white p-6 shadow-sm transition hover:shadow-lg hover:shadow-orange-950/5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
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
                      {isLive ? "Live" : "Draft"}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => startEditing(eventItem)}
                        title="Edit Event Details"
                        className="inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-orange-50/70 px-3 py-1.5 text-xs font-bold text-orange-800 transition hover:bg-orange-100 disabled:opacity-50"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleToggleStatus(eventItem)}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                          isLive
                            ? "border-amber-200 bg-amber-50/60 text-amber-800 hover:bg-amber-100"
                            : "border-emerald-200 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {isLive ? (
                          <>
                            <FileEdit size={13} />
                            Move to Draft
                          </>
                        ) : (
                          <>
                            <Radio size={13} />
                            Make Live
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <h3 className="mt-4 text-xl font-extrabold tracking-tight text-[#241000]">
                    {eventItem.title}
                  </h3>

                  {eventItem.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-500">
                      {eventItem.description}
                    </p>
                  )}

                  <div className="mt-4 space-y-1.5 text-xs text-stone-500">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="shrink-0 text-orange-500" />
                      <span>
                        {formatDateRange(
                          eventItem.startDate,
                          eventItem.endDate,
                          eventItem.createdAt
                        )}
                      </span>
                    </div>

                    {eventItem.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="shrink-0 text-orange-500" />
                        <span>{eventItem.venue}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 border-t border-orange-100/80 pt-4">
                  <div className="mb-4 flex items-center gap-5 text-xs font-semibold text-stone-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Layers size={14} className="text-orange-600" />
                      {eventItem.sessionCount}{" "}
                      {eventItem.sessionCount === 1 ? "Session" : "Sessions"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CircleHelp size={14} className="text-orange-600" />
                      {eventItem.questionCount}{" "}
                      {eventItem.questionCount === 1 ? "Question" : "Questions"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href={`/admin/events/${eventItem.id}`}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#241000] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-orange-600"
                    >
                      <span>Manage Sessions &amp; Q&amp;A</span>
                      <ArrowUpRight size={15} />
                    </Link>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDelete(eventItem)}
                      aria-label={`Delete ${eventItem.title}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 text-stone-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}