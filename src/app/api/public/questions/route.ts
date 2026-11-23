import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Session from "@/models/Session";
import Question from "@/models/Question";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId") || "";

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        { message: "Valid sessionId is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const sessionDoc = await Session.findById(sessionId)
      .select("_id eventId title hall speaker startTime endTime isActive")
      .lean<{
        _id: unknown;
        eventId: unknown;
        title: string;
        hall: string;
        speaker?: string;
        startTime: string;
        endTime: string;
        isActive: boolean;
      } | null>();

    if (!sessionDoc) {
      return NextResponse.json(
        { message: "Session not found." },
        { status: 404 }
      );
    }

    const questions = await Question.find({ sessionId })
      .sort({ isFeatured: -1, createdAt: -1 })
      .select(
        "_id eventId sessionId hall participantName questionText isAnswered isFeatured createdAt"
      )
      .lean<
        Array<{
          _id: unknown;
          eventId: unknown;
          sessionId: unknown;
          hall: string;
          participantName: string;
          questionText: string;
          isAnswered: boolean;
          isFeatured: boolean;
          createdAt: Date;
        }>
      >();

    return NextResponse.json({
      session: {
        id: String(sessionDoc._id),
        eventId: String(sessionDoc.eventId),
        title: sessionDoc.title,
        hall: sessionDoc.hall,
        speaker: sessionDoc.speaker || "",
        startTime: sessionDoc.startTime,
        endTime: sessionDoc.endTime,
        isActive: sessionDoc.isActive,
      },
      questions: questions.map((q) => ({
        id: String(q._id),
        eventId: String(q.eventId),
        sessionId: String(q.sessionId),
        hall: q.hall,
        participantName: q.participantName || "Anonymous",
        questionText: q.questionText,
        isAnswered: Boolean(q.isAnswered),
        isFeatured: Boolean(q.isFeatured),
        createdAt: new Date(q.createdAt).toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/public/questions error:", error);
    return NextResponse.json(
      { message: "Failed to load questions." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sessionId =
      typeof body.sessionId === "string" ? body.sessionId.trim() : "";
    const participantName =
      typeof body.participantName === "string"
        ? body.participantName.trim()
        : "";
    const questionText =
      typeof body.questionText === "string" ? body.questionText.trim() : "";

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        { message: "Please select a valid session." },
        { status: 400 }
      );
    }

    if (!questionText) {
      return NextResponse.json(
        { message: "Please type your question before submitting." },
        { status: 400 }
      );
    }

    if (questionText.length > 600) {
      return NextResponse.json(
        { message: "Question must be 600 characters or fewer." },
        { status: 400 }
      );
    }

    await connectDB();

    const sessionDoc = await Session.findById(sessionId);
    if (!sessionDoc) {
      return NextResponse.json(
        { message: "Selected session was not found." },
        { status: 404 }
      );
    }

    if (!sessionDoc.isActive) {
      return NextResponse.json(
        { message: "This session has ended and is no longer accepting questions." },
        { status: 403 }
      );
    }

    const eventDoc = await Event.findById(sessionDoc.eventId).select("status");
    if (!eventDoc || eventDoc.status !== "live") {
      return NextResponse.json(
        { message: "This event is not currently live." },
        { status: 403 }
      );
    }

    const created = await Question.create({
      eventId: sessionDoc.eventId,
      sessionId: sessionDoc._id,
      hall: sessionDoc.hall,
      participantName: participantName || "Anonymous",
      questionText,
      isAnswered: false,
      isFeatured: false,
    });

    return NextResponse.json(
      {
        message: "Your question has been submitted!",
        question: {
          id: String(created._id),
          eventId: String(created.eventId),
          sessionId: String(created.sessionId),
          hall: created.hall,
          participantName: created.participantName,
          questionText: created.questionText,
          isAnswered: created.isAnswered,
          isFeatured: created.isFeatured,
          createdAt: created.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/public/questions error:", error);
    return NextResponse.json(
      { message: "Unable to submit question. Please try again." },
      { status: 500 }
    );
  }
}