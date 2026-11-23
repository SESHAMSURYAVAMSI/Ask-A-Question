import { notFound } from "next/navigation";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Session from "@/models/Session";
import PublicQaPortal, {
  PublicSessionInfo,
} from "@/components/public/public-qa-portal";

export const instant = false;

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function DirectSessionAskPage({ params }: PageProps) {
  const { sessionId } = await params;

  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    notFound();
  }

  await connectDB();

  const sessionDoc = await Session.findById(sessionId).lean<{
    _id: unknown;
    eventId: unknown;
    title: string;
    hall: string;
    speaker?: string;
    startTime: string;
    endTime: string;
    description?: string;
    isActive: boolean;
  } | null>();

  if (!sessionDoc) {
    notFound();
  }

  const eventDoc = await Event.findById(sessionDoc.eventId)
    .select("_id title venue status")
    .lean<{
      _id: unknown;
      title: string;
      venue?: string;
      status: "draft" | "live";
    } | null>();

  if (!eventDoc || eventDoc.status !== "live") {
    return <PublicQaPortal session={null} />;
  }

  const sessionInfo: PublicSessionInfo = {
    id: String(sessionDoc._id),
    eventId: String(eventDoc._id),
    eventTitle: eventDoc.title,
    venue: eventDoc.venue || "",
    title: sessionDoc.title,
    hall: sessionDoc.hall,
    speaker: sessionDoc.speaker || "",
    startTime: sessionDoc.startTime,
    endTime: sessionDoc.endTime,
    description: sessionDoc.description || "",
    isActive: sessionDoc.isActive,
  };

  return <PublicQaPortal session={sessionInfo} />;
}
