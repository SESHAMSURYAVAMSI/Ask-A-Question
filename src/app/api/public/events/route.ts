import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Session from "@/models/Session";

export async function GET() {
  try {
    await connectDB();

    const liveEvents = await Event.find({ status: "live" })
      .sort({ startDate: 1, createdAt: -1 })
      .select("_id title description venue startDate endDate")
      .lean<
        Array<{
          _id: unknown;
          title: string;
          description?: string;
          venue?: string;
          startDate?: Date;
          endDate?: Date;
        }>
      >();

    const eventIds = liveEvents.map((e) => e._id);

    const sessions =
      eventIds.length > 0
        ? await Session.find({ eventId: { $in: eventIds } })
            .sort({ startTime: 1, hall: 1, createdAt: 1 })
            .select(
              "_id eventId title hall speaker startTime endTime description isActive"
            )
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
            >()
        : [];

    const sessionsByEvent = new Map<string, typeof sessions>();
    for (const s of sessions) {
      const key = String(s.eventId);
      const list = sessionsByEvent.get(key) ?? [];
      list.push(s);
      sessionsByEvent.set(key, list);
    }

    const payload = liveEvents.map((ev) => {
      const id = String(ev._id);
      const evSessions = sessionsByEvent.get(id) ?? [];

      return {
        id,
        title: ev.title,
        description: ev.description || "",
        venue: ev.venue || "",
        startDate: ev.startDate ? new Date(ev.startDate).toISOString() : null,
        endDate: ev.endDate ? new Date(ev.endDate).toISOString() : null,
        sessions: evSessions.map((s) => ({
          id: String(s._id),
          eventId: id,
          title: s.title,
          hall: s.hall,
          speaker: s.speaker || "",
          startTime: s.startTime,
          endTime: s.endTime,
          description: s.description || "",
          isActive: s.isActive,
        })),
      };
    });

    return NextResponse.json({ events: payload });
  } catch (error) {
    console.error("GET /api/public/events error:", error);
    return NextResponse.json(
      { message: "Failed to load live events." },
      { status: 500 }
    );
  }
}