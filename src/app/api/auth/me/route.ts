import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authUser = getAuthFromRequest(req);
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      phone: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: "User tidak aktif atau tidak ditemukan" }, { status: 401 });
  }

  return NextResponse.json({ user });
}

