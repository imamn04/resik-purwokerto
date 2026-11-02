import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest, hasPermission } from "@/lib/auth";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
    });
    return NextResponse.json({ services });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthFromRequest(req);
  if (!user || !hasPermission(user.role, ["OWNER", "ADMIN"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, category, defaultPrice } = await req.json();
    if (!name || !category) {
      return NextResponse.json({ error: "Nama dan kategori layanan wajib diisi" }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        name,
        category,
        defaultPrice: Number(defaultPrice) || 0,
        isActive: true,
      },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

