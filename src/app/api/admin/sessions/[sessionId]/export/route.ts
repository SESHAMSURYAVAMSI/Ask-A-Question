import { NextResponse } from "next/server";
import mongoose from "mongoose";
import * as XLSX from "xlsx";

import { getAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Session from "@/models/Session";
import Question from "@/models/Question";


interface RouteContext {
  params: Promise<{ sessionId: string }>;
}

function formatIndianTime(dateValue: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(dateValue));
}

export async function GET(_request: Request, context: RouteContext) {
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

    const sessionDoc = await Session.findById(sessionId).lean<{
      _id: unknown;
      eventId: unknown;
      title: string;
      hall: string;
      startTime: string;
      endTime: string;
    } | null>();

    if (!sessionDoc) {
      return NextResponse.json(
        { message: "Session not found." },
        { status: 404 }
      );
    }

    const [eventDoc, questions] = await Promise.all([
      Event.findById(sessionDoc.eventId).lean<{ title: string } | null>(),
      Question.find({ sessionId })
        .sort({ createdAt: 1 })
        .lean<
          Array<{
            participantName: string;
            questionText: string;
            createdAt: Date;
          }>
        >(),
    ]);

    const eventTitle = eventDoc?.title || "Event";
    const timeSlot = `${sessionDoc.startTime} - ${sessionDoc.endTime}`;

    const sheetData: Array<Array<string | number>> = [
      [
        "S.No",
        "Event",
        "Hall",
        "Session Title",
        "Time Slot",
        "Asked By",
        "Question",
        "Submitted At (IST)",
      ],
      ...questions.map((q, index) => [
        index + 1,
        eventTitle,
        sessionDoc.hall,
        sessionDoc.title,
        timeSlot,
        q.participantName || "Anonymous",
        q.questionText,
        formatIndianTime(q.createdAt),
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    worksheet["!cols"] = [
      { wch: 6 },  // S.No
      { wch: 25 }, // Event
      { wch: 14 }, // Hall
      { wch: 24 }, // Session Title
      { wch: 20 }, // Time Slot
      { wch: 18 }, // Asked By
      { wch: 52 }, // Question
      { wch: 24 }, // Submitted At (IST)
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Session Questions");

    const arrayBuffer = XLSX.write(workbook, {
      type: "array",
      bookType: "xlsx",
    }) as ArrayBuffer;

    const bytes = new Uint8Array(arrayBuffer);

    const baseName = `${sessionDoc.hall}_${sessionDoc.title}_questions`
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");

    const safeFileName = `${baseName || "session_questions"}.xlsx`;

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${safeFileName}"`,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("GET /api/admin/sessions/[sessionId]/export error:", error);
    return NextResponse.json(
      { message: "Failed to export Excel file." },
      { status: 500 }
    );
  }
}