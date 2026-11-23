import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { getAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Session from "@/models/Session";

interface RouteContext {
  params: Promise<{ eventId: string }>;
}

function normalizeYMD(input: unknown): string {
  if (typeof input !== "string") return "";
  const trimmed = input.trim();
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json({ message: "Invalid event ID." }, { status: 400 });
    }

    await connectDB();

    const sessions = await Session.find({ eventId })
      .sort({ sessionDate: 1, startTime: 1, hall: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("GET /api/admin/events/[eventId]/sessions error:", error);
    return NextResponse.json(
      { message: "Failed to fetch sessions." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json({ message: "Invalid event ID." }, { status: 400 });
    }

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const hall = typeof body.hall === "string" ? body.hall.trim() : "";
    const speaker = typeof body.speaker === "string" ? body.speaker.trim() : "";
    const sessionDate = normalizeYMD(body.sessionDate);
    const startTime =
      typeof body.startTime === "string" ? body.startTime.trim() : "";
    const endTime = typeof body.endTime === "string" ? body.endTime.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    if (!title || !hall || !sessionDate || !startTime || !endTime) {
      return NextResponse.json(
        {
          message:
            "Session title, valid date, hall name, start time, and end time are required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const eventExists = await Event.exists({ _id: eventId });
    if (!eventExists) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }

    const createdSession = await Session.create({
      eventId,
      title,
      hall,
      speaker,
      sessionDate,
      startTime,
      endTime,
      description,
      isActive: true,
    });

    // Guarantee sessionDate is persisted even if an older collection index existed
    if (!createdSession.sessionDate) {
      await Session.updateOne(
        { _id: createdSession._id },
        { $set: { sessionDate } }
      );
    }

    return NextResponse.json(
      {
        message: "Session added successfully.",
        session: {
          id: String(createdSession._id),
          eventId: String(createdSession.eventId),
          title: createdSession.title,
          hall: createdSession.hall,
          speaker: createdSession.speaker || "",
          sessionDate,
          startTime: createdSession.startTime,
          endTime: createdSession.endTime,
          description: createdSession.description || "",
          isActive: createdSession.isActive,
          createdAt: createdSession.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/events/[eventId]/sessions error:", error);
    return NextResponse.json(
      { message: "Failed to create session." },
      { status: 500 }
    );
  }
}