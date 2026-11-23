import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const events = await Event.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ events });
  } catch (error) {
    console.error("GET /api/admin/events error:", error);
    return NextResponse.json(
      { message: "Failed to fetch events." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const venue = typeof body.venue === "string" ? body.venue.trim() : "";
    const status = body.status === "live" ? "live" : "draft";
    const startDate = body.startDate ? new Date(body.startDate) : undefined;
    const endDate = body.endDate ? new Date(body.endDate) : undefined;

    if (!title) {
      return NextResponse.json(
        { message: "Event title is required." },
        { status: 400 }
      );
    }

    if (startDate && Number.isNaN(startDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid start date." },
        { status: 400 }
      );
    }

    if (endDate && Number.isNaN(endDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid end date." },
        { status: 400 }
      );
    }

    if (startDate && endDate && endDate < startDate) {
      return NextResponse.json(
        { message: "End date cannot be earlier than start date." },
        { status: 400 }
      );
    }

    await connectDB();

    const newEvent = await Event.create({
      title,
      description,
      venue,
      startDate,
      endDate,
      status,
      createdBy: admin._id,
    });

    return NextResponse.json(
      {
        message: "Event created successfully.",
        event: {
          id: String(newEvent._id),
          title: newEvent.title,
          description: newEvent.description,
          venue: newEvent.venue,
          status: newEvent.status,
          startDate: newEvent.startDate
            ? newEvent.startDate.toISOString()
            : null,
          endDate: newEvent.endDate ? newEvent.endDate.toISOString() : null,
          createdAt: newEvent.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/events error:", error);
    return NextResponse.json(
      { message: "Failed to create event." },
      { status: 500 }
    );
  }
}