import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Session from "@/models/Session";
import PublicQaPortal, {
  PublicSessionInfo,
} from "@/components/public/public-qa-portal";

export const instant = false;

interface AskPageProps {
  searchParams: Promise<{ sessionId?: string }>;
}

function parseTimeToMinutes(timeStr: string): number | null {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function isCurrentTimeInSlot(startTime: string, endTime: string): boolean {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start === null || end === null) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return currentMinutes >= start && currentMinutes <= end;
}

export default async function AskPage({ searchParams }: AskPageProps) {
  const { sessionId } = await searchParams;

  await connectDB();

  const liveEvents = await Event.find({ status: "live" })
    .sort({ startDate: 1, createdAt: -1 })
    .select("_id title venue")
    .lean<
      Array<{
        _id: unknown;
        title: string;
        venue?: string;
      }>
    >();

  if (liveEvents.length === 0) {
    return <PublicQaPortal session={null} />;
  }

  const eventMap = new Map(
    liveEvents.map((ev) => [
      String(ev._id),
      { title: ev.title, venue: ev.venue || "" },
    ])
  );

  const liveEventIds = liveEvents.map((ev) => ev._id);

  // If ?sessionId= is passed in URL, load that exact session
  if (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) {
    const specific = await Session.findOne({
      _id: sessionId,
      eventId: { $in: liveEventIds },
    }).lean<{
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

    if (specific) {
      const parentEvent = eventMap.get(String(specific.eventId));
      return (
        <PublicQaPortal
          session={{
            id: String(specific._id),
            eventId: String(specific.eventId),
            eventTitle: parentEvent?.title || "Live Event",
            venue: parentEvent?.venue || "",
            title: specific.title,
            hall: specific.hall,
            speaker: specific.speaker || "",
            startTime: specific.startTime,
            endTime: specific.endTime,
            description: specific.description || "",
            isActive: specific.isActive,
          }}
        />
      );
    }
  }

  // Otherwise auto-select the active session matching the current time slot
  const activeSessions = await Session.find({
    eventId: { $in: liveEventIds },
    isActive: true,
  })
    .sort({ startTime: 1, createdAt: 1 })
    .lean<
      Array<{
        _id: unknown;
        eventId: unknown;
        title: string;
        hall: string;
        speaker?: string;
        startTime: string;
        endTime: string;
        description?: string;
        isActive: boolean;
      }>
    >();

  if (activeSessions.length === 0) {
    return <PublicQaPortal session={null} />;
  }

  const matchedSession =
    activeSessions.find((s) => isCurrentTimeInSlot(s.startTime, s.endTime)) ||
    activeSessions[0];

  const parentEvent = eventMap.get(String(matchedSession.eventId));

  const autoSession: PublicSessionInfo = {
    id: String(matchedSession._id),
    eventId: String(matchedSession.eventId),
    eventTitle: parentEvent?.title || "Live Event",
    venue: parentEvent?.venue || "",
    title: matchedSession.title,
    hall: matchedSession.hall,
    speaker: matchedSession.speaker || "",
    startTime: matchedSession.startTime,
    endTime: matchedSession.endTime,
    description: matchedSession.description || "",
    isActive: matchedSession.isActive,
  };

  return <PublicQaPortal session={autoSession} />;
}