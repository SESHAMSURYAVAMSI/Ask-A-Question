"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  X,
} from "lucide-react";

interface AdminNavbarProps {
  admin: {
    name: string;
    email: string;
    role: string;
  };
}

export default function AdminNavbar({ admin }: AdminNavbarProps) {
  const pathname = usePathname();
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

  const isDashboard = pathname === "/admin";
  const isEvents = pathname.startsWith("/admin/events");

  return (
    <header className="sticky top-0 z-30 border-b border-orange-100 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-600 text-lg font-black text-white shadow-lg shadow-orange-600/20">
              Q
            </div>

            <div>
              <h1 className="text-base font-extrabold tracking-tight text-[#241000]">
                Ask a Question
              </h1>
              <p className="text-xs text-stone-500">Admin workspace</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/admin"
              className={`rounded-xl px-3.5 py-2 text-sm transition ${
                isDashboard
                  ? "bg-orange-50 font-bold text-orange-700"
                  : "font-semibold text-stone-600 hover:bg-orange-50/70 hover:text-[#241000]"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/events"
              className={`rounded-xl px-3.5 py-2 text-sm transition ${
                isEvents
                  ? "bg-orange-50 font-bold text-orange-700"
                  : "font-semibold text-stone-600 hover:bg-orange-50/70 hover:text-[#241000]"
              }`}
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
              <p className="text-sm font-bold text-[#241000]">{admin.name}</p>
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
            <p className="font-bold text-[#241000]">{admin.name}</p>
            <p className="text-xs text-stone-500">{admin.email}</p>
          </div>

          <div className="grid gap-2">
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm ${
                isDashboard
                  ? "bg-orange-50 font-bold text-orange-700"
                  : "border border-stone-200 font-semibold text-stone-700"
              }`}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <Link
              href="/admin/events"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm ${
                isEvents
                  ? "bg-orange-50 font-bold text-orange-700"
                  : "border border-stone-200 font-semibold text-stone-700"
              }`}
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
  );
}