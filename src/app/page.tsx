import Link from "next/link";

import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  CircleHelp,
  Download,
  LayoutDashboard,
  MessageCircle,
  MessageSquareText,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Multiple Halls",
    description:
      "Organize conference halls independently and keep every hall's questions separate.",
    number: "01",
  },
  {
    icon: MessageSquareText,
    title: "Session-wise Questions",
    description:
      "Every question belongs to a specific event, hall and session. No confusion.",
    number: "02",
  },
  {
    icon: Radio,
    title: "Live Question Display",
    description:
      "Display audience questions on a dedicated screen with automatic updates.",
    number: "03",
  },
  {
    icon: Download,
    title: "Excel Downloads",
    description:
      "Export session-wise, hall-wise or complete event question reports.",
    number: "04",
  },
];

const workflow = [
  {
    title: "Create an event",
    description: "Set up your conference and publish its public page.",
    icon: LayoutDashboard,
  },
  {
    title: "Add halls & sessions",
    description: "Organize simultaneous sessions across different halls.",
    icon: Building2,
  },
  {
    title: "Collect questions",
    description: "Let attendees submit questions without creating accounts.",
    icon: MessageCircle,
  },
  {
    title: "Display & download",
    description: "Show questions live and export reports whenever needed.",
    icon: Download,
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffaf5] text-[#27170f]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hero-glow absolute inset-0" />
        <div className="soft-grid absolute inset-0 opacity-30" />
        <div className="absolute -right-40 top-20 h-[480px] w-[480px] rounded-full bg-orange-200/20 blur-[110px]" />
        <div className="absolute -left-40 top-[500px] h-[350px] w-[350px] rounded-full bg-amber-200/20 blur-[100px]" />
      </div>

      {/* Navigation */}
      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="orange-gradient flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg shadow-orange-500/20">
            <MessageCircle size={23} strokeWidth={2.4} />
          </div>

          <div>
            <p className="text-[17px] font-extrabold tracking-tight">
              Ask<span className="text-orange-600">.</span>
            </p>
            <p className="-mt-1 text-[10px] font-semibold tracking-[0.18em] text-[#9a8070] uppercase">
              A Question
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-[#78665a] transition-colors hover:text-orange-600"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-[#78665a] transition-colors hover:text-orange-600"
          >
            How it works
          </a>
          <a
            href="#about"
            className="text-sm font-medium text-[#78665a] transition-colors hover:text-orange-600"
          >
            About
          </a>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/ask"
            className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2.5 text-xs font-bold text-orange-700 shadow-sm transition hover:bg-orange-50 sm:px-5 sm:py-3 sm:text-sm"
          >
            <MessageCircle size={15} />
            Ask a Question
          </Link>

          <Link
            href="/admin/login"
            className="group flex items-center gap-2 rounded-full bg-[#29180f] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#29180f]/10 transition-all hover:-translate-y-0.5 hover:bg-orange-700 sm:px-5 sm:py-3 sm:text-sm"
          >
            Admin Login
            <ArrowUpRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-10 lg:pb-28 lg:pt-28">
        <div className="max-w-2xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-white/80 px-4 py-2 shadow-sm shadow-orange-900/[0.03]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-600" />
            </span>
            <span className="text-[11px] font-bold tracking-[0.12em] text-orange-800 uppercase">
              Smarter Audience Engagement
            </span>
            <Sparkles size={14} className="text-orange-500" />
          </div>

          <h1 className="text-balance text-[clamp(3.1rem,6.5vw,5.6rem)] leading-[1.04] font-black tracking-[-0.065em] text-[#28170e]">
            Every voice
            <br />
            deserves to be
            <br />
            <span className="relative inline-block text-orange-600">
              heard.
              <svg
                viewBox="0 0 280 16"
                fill="none"
                className="absolute -bottom-2 left-0 w-full"
                aria-hidden="true"
              >
                <path
                  d="M3 10C66 1 185 1 276 9"
                  stroke="#FDBA74"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-9 max-w-lg text-base leading-8 text-[#806e61] sm:text-lg">
            A smarter way to collect audience questions, manage multiple
            conference halls and bring every session into the conversation.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/ask"
              className="orange-gradient group inline-flex h-14 items-center justify-center gap-3 rounded-2xl px-7 text-sm font-bold text-white shadow-xl shadow-orange-600/20 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-600/25"
            >
              <MessageCircle size={18} />
              Ask a Question Now
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/admin/login"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-[#e9ddd2] bg-white/80 px-7 text-sm font-bold text-[#594538] transition-all hover:border-orange-200 hover:bg-orange-50"
            >
              <LayoutDashboard size={17} />
              Admin Workspace
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-[#eaded3] pt-7">
            <div className="flex items-center gap-2">
              <ShieldCheck size={17} className="text-orange-600" />
              <span className="text-xs font-semibold text-[#806e61]">
                No attendee login
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Zap size={17} className="text-orange-600" />
              <span className="text-xs font-semibold text-[#806e61]">
                Live question updates
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Download size={17} className="text-orange-600" />
              <span className="text-xs font-semibold text-[#806e61]">
                Excel exports
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative mx-auto w-full max-w-[540px] lg:ml-auto">
          <div className="absolute -inset-5 rounded-[40px] bg-gradient-to-br from-orange-200/40 via-transparent to-amber-100/60 blur-2xl" />

          <div className="relative rounded-[28px] border border-white/80 bg-white/90 p-3 shadow-[0_30px_100px_-35px_rgba(120,65,30,0.25)] backdrop-blur-xl sm:p-5">
            {/* Preview Header */}
            <div className="flex items-center justify-between border-b border-[#f0e8e0] px-2 pb-5">
              <div className="flex items-center gap-3">
                <div className="orange-gradient flex h-9 w-9 items-center justify-center rounded-xl text-white">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#321e13]">
                    Event Overview
                  </p>
                  <p className="text-[10px] text-[#a08d7f]">
                    Conference Management
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold text-green-700">
                  LIVE EVENT
                </span>
              </div>
            </div>

            {/* Event Information */}
            <div className="px-2 pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.13em] text-[#a38c7b] uppercase">
                    Current Event
                  </p>
                  <h3 className="mt-2 text-lg font-extrabold tracking-tight text-[#321e13] sm:text-xl">
                    Global Medical Summit
                  </h3>
                  <p className="mt-1 text-[11px] text-[#998779]">
                    November 23 · Conference Center
                  </p>
                </div>

                <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                  <Building2 size={21} />
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-2xl bg-[#fff7f0] p-3 sm:p-4">
                  <Users size={16} className="text-orange-600" />
                  <p className="mt-3 text-xl font-black text-[#321e13]">
                    248
                  </p>
                  <p className="mt-1 text-[9px] font-semibold text-[#a08d7f] sm:text-[10px]">
                    Participants
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fff7f0] p-3 sm:p-4">
                  <Building2 size={16} className="text-orange-600" />
                  <p className="mt-3 text-xl font-black text-[#321e13]">
                    04
                  </p>
                  <p className="mt-1 text-[9px] font-semibold text-[#a08d7f] sm:text-[10px]">
                    Active Halls
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fff7f0] p-3 sm:p-4">
                  <MessageSquareText size={16} className="text-orange-600" />
                  <p className="mt-3 text-xl font-black text-[#321e13]">
                    126
                  </p>
                  <p className="mt-1 text-[9px] font-semibold text-[#a08d7f] sm:text-[10px]">
                    Questions
                  </p>
                </div>
              </div>

              {/* Sessions */}
              <div className="mt-7">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-[#321e13]">
                    Live Sessions
                  </h4>
                  <span className="text-[10px] font-bold text-orange-600">
                    View all
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-orange-50/50 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
                      <Building2 size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-extrabold text-[#382419]">
                        Cardiology Advances
                      </p>
                      <p className="mt-1 text-[10px] text-[#9b8677]">
                        Hall A · 09:00 – 10:00 AM
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-orange-600">
                        42
                      </p>
                      <p className="text-[9px] text-[#a08d7f]">Questions</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-[#eee6df] bg-white p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f8f3ed] text-[#8c6e58]">
                      <Building2 size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-extrabold text-[#382419]">
                        Neurology Updates
                      </p>
                      <p className="mt-1 text-[10px] text-[#9b8677]">
                        Hall B · 09:00 – 10:00 AM
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#8c6e58]">
                        28
                      </p>
                      <p className="text-[9px] text-[#a08d7f]">Questions</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Activity */}
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#2b1a11] px-4 py-3.5 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <Radio size={16} className="text-orange-300" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold">Live question feed</p>
                    <p className="mt-0.5 text-[9px] text-white/50">
                      Session-wise updates
                    </p>
                  </div>
                </div>
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              </div>
            </div>
          </div>

          {/* Floating question card */}
          <div className="absolute -right-3 -bottom-8 hidden w-60 rounded-2xl border border-white bg-white p-4 shadow-[0_15px_45px_-15px_rgba(100,50,20,0.25)] sm:block lg:-right-10">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <CircleHelp size={15} />
              </div>
              <span className="text-[10px] font-bold text-[#8c7667]">
                NEW QUESTION
              </span>
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-green-500" />
            </div>
            <p className="mt-3 text-xs leading-5 font-semibold text-[#39261a]">
              What are the latest advancements in cardiac care?
            </p>
            <div className="mt-3 flex items-center justify-between text-[9px] text-[#a08d7f]">
              <span>Hall A · Cardiology</span>
              <span className="font-bold text-orange-600">Just now</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Strip */}
      <section className="relative z-10 border-y border-[#eddfd2] bg-white/70">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-8 sm:px-8 lg:grid-cols-4 lg:px-10">
          {[
            ["01", "One event", "Multiple halls"],
            ["02", "Many sessions", "Independent tracking"],
            ["03", "Live questions", "Instant visibility"],
            ["04", "Easy exports", "Organized reports"],
          ].map(([number, title, subtitle]) => (
            <div key={number} className="flex items-center gap-3">
              <span className="text-2xl font-black tracking-tight text-orange-200">
                {number}
              </span>
              <div>
                <p className="text-xs font-extrabold text-[#39261a]">
                  {title}
                </p>
                <p className="mt-1 text-[10px] text-[#9b8677]">
                  {subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="relative z-10 mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-extrabold tracking-[0.2em] text-orange-600 uppercase">
            Everything in one place
          </span>
          <h2 className="mt-4 text-3xl leading-tight font-black tracking-[-0.04em] text-[#2c1b11] sm:text-5xl">
            Designed for the way
            <br className="hidden sm:block" /> conferences work.
          </h2>
          <p className="mt-5 text-sm leading-7 text-[#8d796b] sm:text-base">
            From the first audience question to the final downloadable report,
            keep your entire event organized.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.number}
                className="group rounded-[25px] border border-[#eee3d9] bg-white/80 p-6 shadow-[0_8px_35px_-25px_rgba(100,50,20,0.15)] transition-all duration-300 hover:-translate-y-2 hover:border-orange-200 hover:shadow-[0_20px_45px_-25px_rgba(180,80,20,0.2)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-600 group-hover:text-white">
                    <Icon size={22} />
                  </div>
                  <span className="text-xs font-black text-[#e8d9cd]">
                    {feature.number}
                  </span>
                </div>

                <h3 className="mt-7 text-base font-extrabold text-[#39261a]">
                  {feature.title}
                </h3>

                <p className="mt-3 text-xs leading-6 text-[#968275]">
                  {feature.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-orange-600 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                  Built for your events
                  <ArrowUpRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="relative z-10 overflow-hidden bg-[#2b1a11] py-24 text-white lg:py-28"
      >
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-600/20 blur-[100px]" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-orange-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-xl">
            <span className="text-xs font-extrabold tracking-[0.2em] text-orange-400 uppercase">
              Simple workflow
            </span>
            <h2 className="mt-4 text-3xl leading-tight font-black tracking-[-0.04em] sm:text-5xl">
              Four steps.
              <br />
              One connected event.
            </h2>
            <p className="mt-5 text-sm leading-7 text-white/55">
              A straightforward process for administrators and a frictionless
              experience for attendees.
            </p>
          </div>

          <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {workflow.map((item, index) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-orange-400">
                    <Icon size={23} />
                  </div>

                  <p className="mt-7 text-[10px] font-black tracking-[0.15em] text-orange-400 uppercase">
                    Step 0{index + 1}
                  </p>

                  <h3 className="mt-3 text-lg font-extrabold">
                    {item.title}
                  </h3>

                  <p className="mt-3 max-w-[230px] text-xs leading-6 text-white/50">
                    {item.description}
                  </p>

                  {index !== workflow.length - 1 && (
                    <ArrowRight
                      size={18}
                      className="absolute top-5 right-0 hidden text-white/20 lg:block"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-white/[0.05] p-7 sm:flex-row sm:items-center sm:p-9">
            <div>
              <h3 className="text-xl font-extrabold">
                Ready to make every question count?
              </h3>
              <p className="mt-2 text-xs text-white/50">
                Manage your events from one simple dashboard.
              </p>
            </div>

            <Link
              href="/admin/login"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 text-sm font-bold text-white transition-all hover:bg-orange-500"
            >
              Go to Admin
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-5 py-14 sm:px-8 md:flex-row lg:px-10"
      >
        <div className="flex items-center gap-3">
          <div className="orange-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white">
            <MessageCircle size={20} />
          </div>
          <div>
            <p className="text-sm font-black tracking-tight text-[#321e13]">
              Ask a Question
            </p>
            <p className="text-[10px] text-[#a08d7f]">
              Better conversations. Better events.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[#a08d7f] md:text-right">
          © 2026 Ask a Question. All rights reserved.
        </p>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#8b7667]">
          <Check size={15} className="text-orange-600" />
          Built for better audience engagement
        </div>
      </section>
    </main>
  );
}