
import mongoose, { Schema, models, model } from "mongoose";

export interface IAdmin {
  name: string;
  email: string;
  passwordHash: string;
  role: "super_admin" | "admin";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["super_admin", "admin"],
      default: "super_admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Admin =
  models.Admin || model<IAdmin>("Admin", AdminSchema);

export default Admin;
