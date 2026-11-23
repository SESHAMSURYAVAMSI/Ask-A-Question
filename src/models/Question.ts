import mongoose, { Schema, models, model, Types } from "mongoose";

export interface IQuestion {
  eventId: Types.ObjectId;
  sessionId: Types.ObjectId;
  hall: string;
  participantName: string;
  questionText: string;
  isAnswered: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    hall: {
      type: String,
      required: true,
      trim: true,
    },
    participantName: {
      type: String,
      trim: true,
      default: "Anonymous",
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    isAnswered: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Question =
  models.Question || model<IQuestion>("Question", QuestionSchema);

export default Question;