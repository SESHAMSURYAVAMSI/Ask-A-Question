import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";

import { getAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/lib/mongodb";
import Event, { EventStatus } from "@/models/Event";
import Session from "@/models/Session";
import Question from "@/models/Question";
import AdminNavbar from "@/components/admin/admin-navbar";
import EventDetailManager, {
  EventDetailData,
  QuestionItemData,
  SessionItemData,
} from "@/components/admin/event-detail-manager";

export const instant = false;

interface PageProps {
  params: Promise<{ eventId: string }>;
}

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

interface SessionLean {
  _id: unknown;
  eventId: unknown;
  title: string;
  hall: string;
  speaker?: string;
  sessionDate?: string;
  startTime: string;
  endTime: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

interface QuestionLean {
  _id: unknown;
  eventId: unknown;
  sessionId: unknown;
  hall: string;
  participantName: string;
  questionText: string;
  isAnswered: boolean;
  isFeatured: boolean;
  createdAt: Date;
}

function toIsoDateOnly(d?: Date | null): string {
  if (!d) return new Date().toISOString().slice(0, 10);
  return new Date(d).toISOString().slice(0, 10);
}

export default async function AdminEventDetailPage({ params }: PageProps) {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/admin/login");
  }

  const { eventId } = await params;
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    notFound();
  }

  await connectDB();

  const eventDoc = await Event.findById(eventId).lean<EventLean | null>();
  if (!eventDoc) {
    notFound();
  }

  const [sessionDocs, questionDocs] = await Promise.all([
    Session.find({ eventId })
      .sort({ sessionDate: 1, startTime: 1, hall: 1, createdAt: 1 })
      .lean<SessionLean[]>(),
    Question.find({ eventId })
      .sort({ createdAt: -1 })
      .lean<QuestionLean[]>(),
  ]);

  const defaultDateFallback = toIsoDateOnly(
    eventDoc.startDate || eventDoc.createdAt
  );

  const eventData: EventDetailData = {
    id: String(eventDoc._id),
    title: eventDoc.title,
    description: eventDoc.description || "",
    venue: eventDoc.venue || "",
    status: eventDoc.status,
    startDate: eventDoc.startDate
      ? new Date(eventDoc.startDate).toISOString()
      : null,
    endDate: eventDoc.endDate ? new Date(eventDoc.endDate).toISOString() : null,
    createdAt: new Date(eventDoc.createdAt).toISOString(),
  };

  const sessionsData: SessionItemData[] = sessionDocs.map((s) => ({
    id: String(s._id),
    eventId: String(s.eventId),
    title: s.title,
    hall: s.hall,
    speaker: s.speaker || "",
    sessionDate: s.sessionDate || defaultDateFallback,
    startTime: s.startTime,
    endTime: s.endTime,
    description: s.description || "",
    isActive: s.isActive,
    createdAt: new Date(s.createdAt).toISOString(),
  }));

  const questionsData: QuestionItemData[] = questionDocs.map((q) => ({
    id: String(q._id),
    eventId: String(q.eventId),
    sessionId: String(q.sessionId),
    hall: q.hall,
    participantName: q.participantName || "Anonymous",
    questionText: q.questionText,
    isAnswered: Boolean(q.isAnswered),
    isFeatured: Boolean(q.isFeatured),
    createdAt: new Date(q.createdAt).toISOString(),
  }));

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
        <EventDetailManager
          event={eventData}
          initialSessions={sessionsData}
          initialQuestions={questionsData}
        />
      </div>
    </main>
  );
}