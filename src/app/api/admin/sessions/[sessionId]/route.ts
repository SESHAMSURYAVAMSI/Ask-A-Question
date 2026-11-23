import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { getAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/lib/mongodb";
import Session from "@/models/Session";
import Question from "@/models/Question";

interface RouteContext {
  params: Promise<{ sessionId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        { message: "Invalid session ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.isActive === "boolean") {
      updates.isActive = body.isActive;
    }

    if (typeof body.title === "string" && body.title.trim()) {
      updates.title = body.title.trim();
    }

    if (typeof body.hall === "string" && body.hall.trim()) {
      updates.hall = body.hall.trim();
    }

    if (typeof body.speaker === "string") {
      updates.speaker = body.speaker.trim();
    }

    if (typeof body.sessionDate === "string" && body.sessionDate.trim()) {
      updates.sessionDate = body.sessionDate.trim();
    }

    if (typeof body.startTime === "string" && body.startTime.trim()) {
      updates.startTime = body.startTime.trim();
    }

    if (typeof body.endTime === "string" && body.endTime.trim()) {
      updates.endTime = body.endTime.trim();
    }

    await connectDB();

    const updated = await Session.findByIdAndUpdate(
      sessionId,
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Session not found." },
        { status: 404 }
      );
    }

    if (typeof updates.hall === "string") {
      await Question.updateMany(
        { sessionId },
        { $set: { hall: updates.hall } }
      );
    }

    return NextResponse.json({
      message: "Session updated.",
      session: {
        id: String(updated._id),
        eventId: String(updated.eventId),
        title: updated.title,
        hall: updated.hall,
        speaker: updated.speaker || "",
        sessionDate: updated.sessionDate || "",
        startTime: updated.startTime,
        endTime: updated.endTime,
        description: updated.description || "",
        isActive: updated.isActive,
        createdAt: new Date(updated.createdAt).toISOString(),
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/sessions/[sessionId] error:", error);
    return NextResponse.json(
      { message: "Failed to update session." },
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

    const { sessionId } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        { message: "Invalid session ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const deleted = await Session.findByIdAndDelete(sessionId);
    if (!deleted) {
      return NextResponse.json(
        { message: "Session not found." },
        { status: 404 }
      );
    }

    await Question.deleteMany({ sessionId });

    return NextResponse.json({
      message: "Session and its questions deleted.",
    });
  } catch (error) {
    console.error("DELETE /api/admin/sessions/[sessionId] error:", error);
    return NextResponse.json(
      { message: "Failed to delete session." },
      { status: 500 }
    );
  }
}