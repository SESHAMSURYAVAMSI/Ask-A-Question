import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { getAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Session from "@/models/Session";
import Question from "@/models/Question";

interface RouteContext {
  params: Promise<{ eventId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
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
    const updates: Record<string, unknown> = {};

    if (typeof body.title === "string") {
      const trimmedTitle = body.title.trim();
      if (!trimmedTitle) {
        return NextResponse.json(
          { message: "Event title cannot be empty." },
          { status: 400 }
        );
      }
      updates.title = trimmedTitle;
    }

    if (typeof body.description === "string") {
      updates.description = body.description.trim();
    }

    if (typeof body.venue === "string") {
      updates.venue = body.venue.trim();
    }

    if (body.status === "draft" || body.status === "live") {
      updates.status = body.status;
    }

    if (body.startDate !== undefined) {
      updates.startDate = body.startDate ? new Date(body.startDate) : null;
    }

    if (body.endDate !== undefined) {
      updates.endDate = body.endDate ? new Date(body.endDate) : null;
    }

    await connectDB();

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $set: updates },
      { new: true }
    );

    if (!updatedEvent) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Event updated successfully.",
      event: {
        id: String(updatedEvent._id),
        title: updatedEvent.title,
        description: updatedEvent.description || "",
        venue: updatedEvent.venue || "",
        status: updatedEvent.status,
        startDate: updatedEvent.startDate
          ? new Date(updatedEvent.startDate).toISOString()
          : null,
        endDate: updatedEvent.endDate
          ? new Date(updatedEvent.endDate).toISOString()
          : null,
        createdAt: new Date(updatedEvent.createdAt).toISOString(),
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/events/[eventId] error:", error);
    return NextResponse.json(
      { message: "Failed to update event." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
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

    const deletedEvent = await Event.findByIdAndDelete(eventId);
    if (!deletedEvent) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }

    await Promise.all([
      Session.deleteMany({ eventId }),
      Question.deleteMany({ eventId }),
    ]);

    return NextResponse.json({
      message: "Event and associated sessions deleted.",
    });
  } catch (error) {
    console.error("DELETE /api/admin/events/[eventId] error:", error);
    return NextResponse.json(
      { message: "Failed to delete event." },
      { status: 500 }
    );
  }
}