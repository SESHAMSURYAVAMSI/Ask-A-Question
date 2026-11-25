import { connection } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Session from "@/models/Session";
import DisplaySelectorPortal, {
  PublicDisplayEvent,
  PublicDisplaySession,
} from "@/components/public/display-selector-portal";

interface DisplayDirectoryPageProps {
  searchParams: Promise<{ eventId?: string }>;
}

function toYMD(dateInput?: Date | string | null): string {
  if (!dateInput) return "";
  if (typeof dateInput === "string") {
    const match = dateInput.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  return new Date(dateInput).toISOString().slice(0, 10);
}

export default async function DisplayDirectoryPage({
  searchParams,
}: DisplayDirectoryPageProps) {
  await connection();

  const { eventId } = await searchParams;

  await connectDB();

  const liveEvents = await Event.find({ status: "live" })
    .sort({ startDate: 1, createdAt: -1 })
    .select("_id title venue startDate endDate createdAt")
    .lean<
      Array<{
        _id: unknown;
        title: string;
        venue?: string;
        startDate?: Date;
        endDate?: Date;
        createdAt: Date;
      }>
    >();

  if (liveEvents.length === 0) {
    return (
      <DisplaySelectorPortal
        events={[]}
        sessions={[]}
        initialEventId=""
      />
    );
  }

  const eventFallbackDateMap = new Map(
    liveEvents.map((ev) => [
      String(ev._id),
      toYMD(ev.startDate || ev.createdAt),
    ])
  );

  const liveEventIds = liveEvents.map((ev) => ev._id);

  const sessionDocs = await Session.find({
    eventId: { $in: liveEventIds },
  })
    .sort({ sessionDate: 1, startTime: 1, hall: 1, createdAt: 1 })
    .lean<
      Array<{
        _id: unknown;
        eventId: unknown;
        title: string;
        hall: string;
        speaker?: string;
        sessionDate?: string;
        startTime: string;
        endTime: string;
        isActive: boolean;
      }>
    >();

  const eventsData: PublicDisplayEvent[] = liveEvents.map((ev) => ({
    id: String(ev._id),
    title: ev.title,
    venue: ev.venue || "",
    startDate: ev.startDate ? toYMD(ev.startDate) : null,
    endDate: ev.endDate ? toYMD(ev.endDate) : null,
  }));

  const sessionsData: PublicDisplaySession[] = sessionDocs.map((s) => {
    const evId = String(s.eventId);
    const fallbackDate = eventFallbackDateMap.get(evId) || "";

    return {
      id: String(s._id),
      eventId: evId,
      title: s.title,
      hall: s.hall,
      speaker: s.speaker || "",
      sessionDate: s.sessionDate ? toYMD(s.sessionDate) : fallbackDate,
      startTime: s.startTime,
      endTime: s.endTime,
      isActive: Boolean(s.isActive),
    };
  });

  const validInitialEventId =
    eventId && eventsData.some((e) => e.id === eventId)
      ? eventId
      : eventsData[0].id;

  return (
    <DisplaySelectorPortal
      events={eventsData}
      sessions={sessionsData}
      initialEventId={validInitialEventId}
    />
  );
}