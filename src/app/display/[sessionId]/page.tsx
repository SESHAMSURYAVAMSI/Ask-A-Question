import { notFound } from "next/navigation";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Session from "@/models/Session";
import Question from "@/models/Question";
import LiveScreenDisplay, {
  DisplayQuestionItem,
  DisplaySessionInfo,
} from "@/components/public/live-screen-display";

export const instant = false;

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionDisplayPage({ params }: PageProps) {
  const { sessionId } = await params;

  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    notFound();
  }

  await connectDB();

  const sessionDoc = await Session.findById(sessionId).lean<{
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
    notFound();
  }

  const [eventDoc, questionDocs] = await Promise.all([
    Event.findById(sessionDoc.eventId)
      .select("title")
      .lean<{ title: string } | null>(),
    Question.find({ sessionId })
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean<
        Array<{
          _id: unknown;
          participantName: string;
          questionText: string;
          isAnswered: boolean;
          isFeatured: boolean;
          createdAt: Date;
        }>
      >(),
  ]);

  const sessionInfo: DisplaySessionInfo = {
    id: String(sessionDoc._id),
    eventTitle: eventDoc?.title || "Live Event",
    title: sessionDoc.title,
    hall: sessionDoc.hall,
    speaker: sessionDoc.speaker || "",
    startTime: sessionDoc.startTime,
    endTime: sessionDoc.endTime,
    isActive: sessionDoc.isActive,
  };

  const initialQuestions: DisplayQuestionItem[] = questionDocs.map((q) => ({
    id: String(q._id),
    participantName: q.participantName || "Anonymous",
    questionText: q.questionText,
    isAnswered: Boolean(q.isAnswered),
    isFeatured: Boolean(q.isFeatured),
    createdAt: new Date(q.createdAt).toISOString(),
  }));

  return (
    <LiveScreenDisplay
      session={sessionInfo}
      initialQuestions={initialQuestions}
    />
  );
}