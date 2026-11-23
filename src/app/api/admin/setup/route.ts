
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";

function isValidSetupSecret(provided: string, expected: string) {
  const encoder = new TextEncoder();
  const a = encoder.encode(provided);
  const b = encoder.encode(expected);

  if (a.length !== b.length) {
    return false;
  }

  let result = 0;

  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }

  return result === 0;
}

export async function POST(request: NextRequest) {
  try {
    const setupSecret = process.env.ADMIN_SETUP_SECRET;

    if (!setupSecret) {
      return NextResponse.json(
        { message: "Admin setup is not configured." },
        { status: 503 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body.password === "string" ? body.password : "";
    const providedSecret =
      typeof body.setupSecret === "string" ? body.setupSecret : "";

    if (!name || !email || !password || !providedSecret) {
      return NextResponse.json(
        { message: "Name, email, password and setup secret are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 10) {
      return NextResponse.json(
        { message: "Password must contain at least 10 characters." },
        { status: 400 }
      );
    }

    if (password.length > 72) {
      return NextResponse.json(
        { message: "Password is too long." },
        { status: 400 }
      );
    }

    if (!isValidSetupSecret(providedSecret, setupSecret)) {
      return NextResponse.json(
        { message: "Invalid setup credentials." },
        { status: 401 }
      );
    }

    await connectDB();

    const existingAdmin = await Admin.exists({});

    if (existingAdmin) {
      return NextResponse.json(
        { message: "Initial admin setup has already been completed." },
        { status: 403 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await Admin.create({
      name,
      email,
      passwordHash,
      role: "super_admin",
      isActive: true,
    });

    return NextResponse.json(
      {
        message: "Super Admin created successfully.",
        admin: {
          id: admin._id.toString(),
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { message: "An admin with this email already exists." },
        { status: 409 }
      );
    }

    console.error("Admin setup error:", error);

    return NextResponse.json(
      { message: "Unable to complete admin setup." },
      { status: 500 }
    );
  }
}
