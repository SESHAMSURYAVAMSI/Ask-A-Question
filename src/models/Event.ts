import mongoose, { Schema, models, model, Types } from "mongoose";

export type EventStatus = "draft" | "live";

export interface IEvent {
  title: string;
  description?: string;
  venue?: string;
  startDate?: Date;
  endDate?: Date;
  status: EventStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    venue: {
      type: String,
      trim: true,
      default: "",
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["draft", "live"],
      default: "draft",
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Event = models.Event || model<IEvent>("Event", EventSchema);

export default Event;