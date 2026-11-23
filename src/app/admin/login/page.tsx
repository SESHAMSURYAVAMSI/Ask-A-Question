
import { redirect } from "next/navigation";

import AdminLoginForm from "@/components/admin/admin-login-form";
import { getAdminSession } from "@/lib/admin-auth";
export const instant = false;

export default async function AdminLoginPage() {
  const admin = await getAdminSession();

  if (admin) {
    redirect("/admin");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fffaf5] px-4 py-12">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />

      <div className="relative z-10 w-full">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#241000] text-lg font-black text-white">
            Q
          </div>

          <p className="text-sm font-bold tracking-[0.25em] text-orange-700">
            ASK A QUESTION
          </p>
        </div>

        <div className="flex justify-center">
          <AdminLoginForm />
        </div>

        <p className="mt-8 text-center text-xs text-stone-400">
          © 2026 Ask a Question. All rights reserved.
        </p>
      </div>
    </main>
  );
}
