
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";

export const ADMIN_COOKIE_NAME = "ask_question_admin";

function getJWTSecret() {
  const jwtSecret = process.env.ADMIN_JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("Please define ADMIN_JWT_SECRET in your .env.local file");
  }

  return new TextEncoder().encode(jwtSecret);
}

export async function createAdminSession(adminId: string) {
  return new SignJWT({
    role: "admin",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJWTSecret());
}

export async function verifyAdminSession(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJWTSecret());

    if (!payload.sub) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyAdminSession(token);

  if (!payload?.sub) {
    return null;
  }

  await connectDB();

  const admin = await Admin.findOne({
    _id: payload.sub,
    isActive: true,
  }).select("_id name email role");

  return admin;
}
