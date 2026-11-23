import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/lib/mongodb";
import Event, { EventStatus } from "@/models/Event";
import Question from "@/models/Question";
import AdminDashboard, {
  DashboardEventSummary,
  DashboardStats,
} from "@/components/admin/admin-dashboard";

export const instant = false;

interface RecentEventLean {
  _id: unknown;
  title: string;
  venue?: string;
  status: EventStatus;
  startDate?: Date;
  createdAt: Date;
}

export default async function AdminDashboardPage() {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  await connectDB();

  const [
    totalEvents,
    liveEvents,
    draftEvents,
    totalQuestions,
    recentEventDocs,
  ] = await Promise.all([
    Event.countDocuments({}),
    Event.countDocuments({ status: "live" }),
    Event.countDocuments({ status: "draft" }),
    Question.countDocuments({}),
    Event.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id title venue status startDate createdAt")
      .lean<RecentEventLean[]>(),
  ]);

  const stats: DashboardStats = {
    totalEvents,
    liveEvents,
    draftEvents,
    totalQuestions,
  };

  const recentEvents: DashboardEventSummary[] = recentEventDocs.map((event) => ({
    id: String(event._id),
    title: event.title,
    venue: event.venue || "",
    status: event.status,
    startDate: event.startDate ? new Date(event.startDate).toISOString() : null,
    createdAt: new Date(event.createdAt).toISOString(),
  }));

  return (
    <AdminDashboard
      admin={{
        name: admin.name,
        email: admin.email,
        role: admin.role,
      }}
      stats={stats}
      recentEvents={recentEvents}
    />
  );
}