
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";



export default function AdminSetupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          setupSecret,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create admin account.");
      }

      setSuccess("Admin account created successfully!");

      setTimeout(() => {
        router.push("/admin/login");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-orange-100 bg-white px-4 py-3.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fffaf5] px-4 py-12">
      <div className="pointer-events-none absolute inset-0 soft-grid opacity-40" />

      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="orange-gradient mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl shadow-xl shadow-orange-200">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-orange-600">
            Ask a Question
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            Create Admin Account
          </h1>

          <p className="mt-3 text-sm leading-6 text-stone-500">
            Set up your first administrator account to manage events,
            sessions and audience questions.
          </p>
        </div>

        <div className="rounded-3xl border border-orange-100/80 bg-white p-6 shadow-2xl shadow-orange-900/5 sm:p-8">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {success} Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-700">
                Administrator Name
              </label>
              <div className="relative">
                <UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  className={`${inputClass} pl-11`}
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  className={`${inputClass} pl-11`}
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-700">
                Create Password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  className={`${inputClass} pl-11 pr-12`}
                  placeholder="Minimum 10 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={10}
                  maxLength={72}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-orange-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-700">
                Admin Setup Secret
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type={showSecret ? "text" : "password"}
                  className={`${inputClass} pl-11 pr-12`}
                  placeholder="Enter setup secret from .env.local"
                  value={setupSecret}
                  onChange={(e) => setSetupSecret(e.target.value)}
                  required
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-orange-600"
                  aria-label="Toggle setup secret visibility"
                >
                  {showSecret ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-stone-400">
                This is your environment setup secret, not your login password.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !!success}
              className="orange-gradient flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Administrator Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-stone-100 pt-5 text-center">
            <p className="text-sm text-stone-500">
              Already have an account?{" "}
              <Link
                href="/admin/login"
                className="font-bold text-orange-600 hover:text-orange-700"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          Protected administrator account initialization
        </p>
      </div>
    </main>
  );
}
