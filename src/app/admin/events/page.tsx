import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/lib/mongodb";
import Event, { EventStatus } from "@/models/Event";
import Session from "@/models/Session";
import Question from "@/models/Question";
import AdminNavbar from "@/components/admin/admin-navbar";
import EventsManager, {
  ManagedEventItem,
} from "@/components/admin/events-manager";

export const instant = false;

interface EventLean {
  _id: unknown;
  title: string;
  description?: string;
  venue?: string;
  status: EventStatus;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
}

export default async function AdminEventsPage() {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  await connectDB();

  const [eventDocs, sessionCounts, questionCounts] = await Promise.all([
    Event.find({}).sort({ createdAt: -1 }).lean<EventLean[]>(),
    Session.aggregate<{ _id: unknown; count: number }>([
      { $group: { _id: "$eventId", count: { $sum: 1 } } },
    ]),
    Question.aggregate<{ _id: unknown; count: number }>([
      { $group: { _id: "$eventId", count: { $sum: 1 } } },
    ]),
  ]);

  const sessionMap = new Map(
    sessionCounts.map((item) => [String(item._id), item.count])
  );
  const questionMap = new Map(
    questionCounts.map((item) => [String(item._id), item.count])
  );

  const events: ManagedEventItem[] = eventDocs.map((event) => {
    const id = String(event._id);
    return {
      id,
      title: event.title,
      description: event.description || "",
      venue: event.venue || "",
      status: event.status,
      startDate: event.startDate ? new Date(event.startDate).toISOString() : null,
      endDate: event.endDate ? new Date(event.endDate).toISOString() : null,
      createdAt: new Date(event.createdAt).toISOString(),
      sessionCount: sessionMap.get(id) ?? 0,
      questionCount: questionMap.get(id) ?? 0,
    };
  });

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
        <EventsManager initialEvents={events} />
      </div>
    </main>
  );
}