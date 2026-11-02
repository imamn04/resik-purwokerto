import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = getAuthFromRequest(req);
  if (!user || user.role !== "OWNER") {
    return NextResponse.json({ error: "Hanya Owner yang dapat mengakses audit log" }, { status: 403 });
  }

  try {
    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, username: true, role: true },
        },
      },
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

