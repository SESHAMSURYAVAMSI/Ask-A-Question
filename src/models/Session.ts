import mongoose, { Schema, models, model, Types } from "mongoose";

export interface ISession {
  eventId: Types.ObjectId;
  title: string;
  hall: string;
  speaker?: string;
  sessionDate: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    hall: {
      type: String,
      required: true,
      trim: true,
    },
    speaker: {
      type: String,
      trim: true,
      default: "",
    },
    sessionDate: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure Next.js HMR uses the latest schema with sessionDate
if (models.Session && !models.Session.schema.path("sessionDate")) {
  delete models.Session;
}

const Session = models.Session || model<ISession>("Session", SessionSchema);

export default Session;
