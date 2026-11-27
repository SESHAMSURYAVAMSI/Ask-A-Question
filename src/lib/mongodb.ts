import dns from "node:dns";
import mongoose from "mongoose";

// Only override DNS locally (Vercel's cloud DNS resolves Atlas SRV automatically)
if (process.env.NODE_ENV === "development") {
  try {
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
  } catch {
    // Ignore if environment restricts DNS override
  }
}

let cached = (
  global as typeof globalThis & {
    mongoose?: {
      conn: typeof mongoose | null;
      promise: Promise<typeof mongoose> | null;
    };
  }
).mongoose;

if (!cached) {
  cached = (
    global as typeof globalThis & {
      mongoose?: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      };
    }
  ).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not defined. Add it to Vercel Environment Variables."
    );
  }

  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null; // Reset so the next request can retry
    throw e;
  }

  return cached!.conn;
}