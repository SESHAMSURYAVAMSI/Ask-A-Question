"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CircleHelp,
  Clock,
  FileEdit,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Plus,
  Radio,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

export interface DashboardStats {
  totalEvents: number;
  liveEvents: number;
  draftEvents: number;
  totalQuestions: number;
}

export interface DashboardEventSummary {
  id: string;
  title: string;
  venue: string;
  status: "draft" | "live";
  startDate: string | null;
  createdAt: string;
}

interface AdminDashboardProps {
  admin: {
    name: string;
    email: string;
    role: string;
  };
  stats: DashboardStats;
  recentEvents: DashboardEventSummary[];
}

function formatDate(dateString: string | null) {
  if (!dateString) return "Date not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function AdminDashboard({
  admin,
  stats,
  recentEvents,
}: AdminDashboardProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });

      router.replace("/admin/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  const statCards = [
    {
      label: "Total Events",
      value: stats.totalEvents,
      icon: CalendarDays,
      description: "All created events",
      badgeBg: "bg-orange-50 text-orange-600",
    },
    {
      label: "Live Events",
      value: stats.liveEvents,
      icon: Radio,
      description: "Active for audience Q&A",
      badgeBg: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Draft Events",
      value: stats.draftEvents,
      icon: FileEdit,
      description: "Unpublished preparations",
      badgeBg: "bg-amber-50 text-amber-700",
    },
    {
      label: "Total Questions",
      value: stats.totalQuestions,
      icon: CircleHelp,
      description: "Submitted across all sessions",
      badgeBg: "bg-stone-100 text-[#4a2511]",
    },
  ];

  return (
    <main className="min-h-screen bg-[#fffaf5] text-[#241000]">
      <header className="sticky top-0 z-30 border-b border-orange-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-600 text-lg font-black text-white shadow-lg shadow-orange-600/20">
                Q
              </div>

              <div>
                <h1 className="text-base font-extrabold tracking-tight">
                  Ask a Question
                </h1>
                <p className="text-xs text-stone-500">Admin workspace</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              <Link
                href="/admin"
                className="rounded-xl bg-orange-50 px-3.5 py-2 text-sm font-bold text-orange-700"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/events"
                className="rounded-xl px-3.5 py-2 text-sm font-semibold text-stone-600 transition hover:bg-orange-50/70 hover:text-[#241000]"
              >
                Manage Events
              </Link>
            </nav>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/admin/events/new"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-orange-600/20 transition hover:bg-orange-700"
            >
              <Plus size={16} />
              Create Event
            </Link>

            <div className="h-6 w-px bg-stone-200" />

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700">
                {admin.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="text-sm font-bold">{admin.name}</p>
                <p className="text-xs capitalize text-stone-500">
                  {admin.role.replace("_", " ")}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <LogOut size={16} />
              {loggingOut ? "Signing out..." : "Logout"}
            </button>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="rounded-xl border border-stone-200 p-2 md:hidden"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {menuOpen && (
          <div className="space-y-3 border-t border-stone-100 bg-white p-5 md:hidden">
            <div className="pb-2">
              <p className="font-bold">{admin.name}</p>
              <p className="text-xs text-stone-500">{admin.email}</p>
            </div>

            <div className="grid gap-2">
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-sm font-bold text-orange-700"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <Link
                href="/admin/events"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700"
              >
                <FolderKanban size={16} />
                Manage Events
              </Link>
              <Link
                href="/admin/events/new"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white"
              >
                <Plus size={16} />
                Create Event
              </Link>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
            >
              <LogOut size={16} />
              {loggingOut ? "Signing out..." : "Logout"}
            </button>
          </div>
        )}
      </header>

      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#241000] via-[#351804] to-[#4a2208] p-7 text-white shadow-xl shadow-orange-950/10 sm:p-10"
        >
          <div className="pointer-events-none absolute -right-20 -top-36 h-96 w-96 rounded-full bg-orange-600/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-orange-200">
                <ShieldCheck size={14} />
                Administrator workspace
              </div>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back, {admin.name.split(" ")[0]}!
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-orange-100/75">
                Create events, run parallel sessions across multiple halls, and
                keep every audience question organized in real time.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/admin/events/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500"
                >
                  <Plus size={17} />
                  Create New Event
                </Link>

                <Link
                  href="/admin/events"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-orange-50 backdrop-blur-sm transition hover:bg-white/15"
                >
                  <FolderKanban size={17} />
                  Manage Events
                </Link>
              </div>
            </div>

            <div className="hidden h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-white/10 lg:flex">
              <LayoutDashboard size={42} className="text-orange-300" />
            </div>
          </div>
        </motion.section>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">
                Overview
              </h3>
              <p className="mt-1 text-sm text-stone-500">
                Live metrics across your events and audience sessions.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.07 }}
                  className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-950/5"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.badgeBg}`}
                    >
                      <Icon size={21} />
                    </div>
                    <ArrowUpRight size={18} className="text-stone-300" />
                  </div>

                  <p className="mt-6 text-3xl font-black tracking-tight text-[#241000]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm font-bold">{stat.label}</p>
                  <p className="mt-1 text-xs text-stone-400">
                    {stat.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-7 lg:col-span-2">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold tracking-tight">
                  Recent Events
                </h3>
                <p className="mt-0.5 text-sm text-stone-500">
                  Latest events created in your workspace.
                </p>
              </div>

              <Link
                href="/admin/events"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 transition hover:text-orange-700"
              >
                View all events
                <ArrowRight size={16} />
              </Link>
            </div>

            {recentEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-[#fffaf5] px-6 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                  <Sparkles size={22} />
                </div>
                <h4 className="mt-4 text-base font-extrabold text-[#241000]">
                  No events created yet
                </h4>
                <p className="mt-1.5 max-w-sm text-sm text-stone-500">
                  Start by creating your first event, adding halls and
                  time-slotted sessions, and publishing it live.
                </p>
                <Link
                  href="/admin/events/new"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-orange-600/20 transition hover:bg-orange-700"
                >
                  <Plus size={16} />
                  Create First Event
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-orange-100/80">
                {recentEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/admin/events/${event.id}`}
                    className="group flex flex-col justify-between gap-3 py-4 transition first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <p className="truncate text-base font-bold text-[#241000] transition group-hover:text-orange-600">
                          {event.title}
                        </p>
                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            event.status === "live"
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                              : "bg-amber-50 text-amber-800 ring-1 ring-amber-600/20"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              event.status === "live"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {event.status === "live" ? "Live" : "Draft"}
                        </span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={13} className="text-orange-500" />
                          {formatDate(event.startDate || event.createdAt)}
                        </span>
                        {event.venue && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={13} className="text-orange-500" />
                            {event.venue}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-400 transition group-hover:text-orange-600">
                      <span>Open event</span>
                      <ArrowUpRight size={16} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-7">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <FolderKanban size={23} />
              </div>

              <h3 className="mt-5 text-lg font-extrabold">
                Quick Actions
              </h3>

              <p className="mt-2 text-sm leading-6 text-stone-500">
                Jump straight into setting up an event or organizing halls and
                concurrent sessions.
              </p>

              <div className="mt-6 space-y-3">
                <Link
                  href="/admin/events/new"
                  className="flex w-full items-center justify-between rounded-2xl bg-orange-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm shadow-orange-600/20 transition hover:bg-orange-700"
                >
                  <span className="flex items-center gap-2.5">
                    <Plus size={18} />
                    Create an Event
                  </span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/admin/events"
                  className="flex w-full items-center justify-between rounded-2xl border border-orange-200 bg-[#fffaf5] px-4 py-3.5 text-sm font-bold text-[#241000] transition hover:border-orange-300 hover:bg-orange-50"
                >
                  <span className="flex items-center gap-2.5">
                    <CalendarDays size={18} className="text-orange-600" />
                    Manage All Events
                  </span>
                  <ArrowRight size={16} className="text-stone-400" />
                </Link>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-xs leading-5 text-[#4a2511]">
              <strong className="font-bold">Tip:</strong> Keep events in{" "}
              <span className="font-semibold">Draft</span> while adding halls
              and sessions, then switch to{" "}
              <span className="font-semibold text-emerald-700">Live</span> when
              attendees are ready to ask questions.
            </div>
          </div>
        </section>

        <footer className="mt-12 border-t border-orange-100 pt-6 text-center text-xs text-stone-400">
          Signed in as {admin.email}
        </footer>
      </div>
    </main>
  );
}