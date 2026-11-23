import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { getAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/lib/mongodb";
import Question from "@/models/Question";

interface RouteContext {
  params: Promise<{ questionId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { questionId } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return NextResponse.json(
        { message: "Invalid question ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates: Record<string, boolean> = {};

    if (typeof body.isAnswered === "boolean") {
      updates.isAnswered = body.isAnswered;
    }

    if (typeof body.isFeatured === "boolean") {
      updates.isFeatured = body.isFeatured;
    }

    await connectDB();

    const updated = await Question.findByIdAndUpdate(
      questionId,
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Question not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Question updated.",
      question: {
        id: String(updated._id),
        isAnswered: updated.isAnswered,
        isFeatured: updated.isFeatured,
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/questions/[questionId] error:", error);
    return NextResponse.json(
      { message: "Failed to update question." },
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

    const { questionId } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return NextResponse.json(
        { message: "Invalid question ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const deleted = await Question.findByIdAndDelete(questionId);
    if (!deleted) {
      return NextResponse.json(
        { message: "Question not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Question deleted." });
  } catch (error) {
    console.error("DELETE /api/admin/questions/[questionId] error:", error);
    return NextResponse.json(
      { message: "Failed to delete question." },
      { status: 500 }
    );
  }
}