import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.trim() },
          { email: username.trim().toLowerCase() },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Akun Anda dinonaktifkan. Hubungi Owner." },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Catat Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "LOGIN",
          entity: "USER",
          entityId: user.id,
          details: `User ${user.username} (${user.role}) berhasil login`,
          ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        },
      });
    } catch {
      // ignore log failure
    }

    const authUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role as any,
      phone: user.phone,
    };

    const token = signToken(authUser);

    const response = NextResponse.json({
      success: true,
      token,
      user: authUser,
      message: `Selamat datang kembali, ${user.name}!`,
    });

    const isHttps =
      req.headers.get("x-forwarded-proto") === "https" ||
      req.url.startsWith("https");

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: false, // Allow client JS to read and verify as fallback
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat login" },
      { status: 500 }
    );
  }
}

