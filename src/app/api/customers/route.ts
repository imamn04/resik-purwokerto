import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest, hasPermission } from "@/lib/auth";
import { sanitizePhoneNumber } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const user = getAuthFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  try {
    const customers = await prisma.customer.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q } },
              { phone: { contains: q } },
              { address: { contains: q } },
            ],
          }
        : undefined,
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        _count: {
          select: { jobs: { where: { isDeleted: false } } },
        },
      },
    });

    return NextResponse.json({ customers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthFromRequest(req);
  if (!user || !hasPermission(user.role, ["OWNER", "ADMIN", "STAFF_INPUT"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, phone, address, notes } = await req.json();

    if (!name || !phone) {
      return NextResponse.json({ error: "Nama dan nomor telepon pelanggan wajib diisi" }, { status: 400 });
    }

    const sanitizedPhone = sanitizePhoneNumber(phone);

    const customer = await prisma.customer.upsert({
      where: { phone: sanitizedPhone },
      update: {
        name,
        address: address || "",
        notes: notes || undefined,
      },
      create: {
        name,
        phone: sanitizedPhone,
        address: address || "",
        notes: notes || "",
      },
    });

    return NextResponse.json({ customer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

