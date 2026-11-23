import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin-auth";
import AdminNavbar from "@/components/admin/admin-navbar";
import CreateEventForm from "@/components/admin/create-event-form";

export const instant = false;

export default async function NewEventPage() {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-[#fffaf5] text-[#241000]">
      <AdminNavbar
        admin={{
          name: admin.name,
          email: admin.email,
          role: admin.role,
        }}
      />

      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
        <CreateEventForm />
      </div>
    </main>
  );
}