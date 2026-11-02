import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest, hasPermission } from "@/lib/auth";
import { sanitizePhoneNumber } from "@/lib/utils";

// Generate Unique Job Number: RP-YYYYMMDD-XXXX
async function generateJobNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const datePrefix = `RP-${year}${month}${day}-`;

  const lastJobToday = await prisma.job.findFirst({
    where: {
      jobNumber: {
        startsWith: datePrefix,
      },
    },
    orderBy: {
      jobNumber: "desc",
    },
    select: {
      jobNumber: true,
    },
  });

  let nextSequence = 1;
  if (lastJobToday && lastJobToday.jobNumber) {
    const parts = lastJobToday.jobNumber.split("-");
    const lastSeq = parseInt(parts[2], 10);
    if (!isNaN(lastSeq)) {
      nextSequence = lastSeq + 1;
    }
  }

  return `${datePrefix}${String(nextSequence).padStart(4, "0")}`;
}

export async function GET(req: NextRequest) {
  const user = getAuthFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const serviceId = searchParams.get("serviceId");
  const technician = searchParams.get("technician") || "";
  const createdById = searchParams.get("createdById") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const myOnly = searchParams.get("myOnly") === "true";

  try {
    const whereClause: any = {
      isDeleted: false,
    };

    // Staff input can filter by own or if required
    if (myOnly || (user.role === "STAFF_INPUT" && searchParams.get("scope") === "mine")) {
      whereClause.createdById = user.id;
    } else if (createdById) {
      whereClause.createdById = createdById;
    }

    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    if (serviceId && serviceId !== "ALL") {
      whereClause.serviceId = parseInt(serviceId, 10);
    }

    if (technician) {
      whereClause.technicianName = {
        contains: technician,
      };
    }

    if (startDate && endDate) {
      whereClause.scheduledDate = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      whereClause.scheduledDate = {
        gte: startDate,
      };
    } else if (endDate) {
      whereClause.scheduledDate = {
        lte: endDate,
      };
    }

    if (search) {
      whereClause.OR = [
        { jobNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { phone: { contains: search } } },
        { customer: { address: { contains: search } } },
        { technicianName: { contains: search } },
        { jobDetails: { contains: search } },
      ];
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
      include: {
        customer: true,
        service: true,
        createdBy: {
          select: { id: true, name: true, username: true },
        },
        updatedBy: {
          select: { id: true, name: true },
        },
        photos: {
          select: {
            id: true,
            photoType: true,
            filePath: true,
            fileName: true,
            caption: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ jobs });
  } catch (error: any) {
    console.error("Fetch jobs error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthFromRequest(req);
  if (!user || !hasPermission(user.role, ["OWNER", "ADMIN", "STAFF_INPUT"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerAddress,
      serviceId,
      jobDetails,
      scheduledDate,
      scheduledTime,
      technicianName,
      basePrice,
      extraFee,
      discount,
      status,
      notes,
    } = body;

    if (!customerName || !customerPhone || !serviceId || !scheduledDate) {
      return NextResponse.json(
        { error: "Nama pelanggan, WhatsApp, Layanan, dan Tanggal jadwal wajib diisi!" },
        { status: 400 }
      );
    }

    const sanitizedPhone = sanitizePhoneNumber(customerPhone);

    // 1. Find or create Customer
    let customer = await prisma.customer.findUnique({
      where: { phone: sanitizedPhone },
    });

    if (customer) {
      // Update name or address if provided
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: customerName,
          address: customerAddress || customer.address,
        },
      });
    } else {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          phone: sanitizedPhone,
          address: customerAddress || "",
          notes: "",
        },
      });
    }

    // 2. Generate Job Number
    const jobNumber = await generateJobNumber();

    // 3. Compute Financials
    const numBasePrice = parseFloat(basePrice) || 0;
    const numExtraFee = parseFloat(extraFee) || 0;
    const numDiscount = parseFloat(discount) || 0;
    const totalPrice = Math.max(0, numBasePrice + numExtraFee - numDiscount);

    // 4. Create Job
    const job = await prisma.job.create({
      data: {
        jobNumber,
        customerId: customer.id,
        serviceId: parseInt(serviceId, 10),
        jobDetails: jobDetails || "",
        scheduledDate,
        scheduledTime: scheduledTime || null,
        technicianName: technicianName || "",
        basePrice: numBasePrice,
        extraFee: numExtraFee,
        discount: numDiscount,
        totalPrice,
        status: status || "PENDING",
        notes: notes || "",
        createdById: user.id,
      },
      include: {
        customer: true,
        service: true,
        createdBy: {
          select: { id: true, name: true, username: true },
        },
      },
    });

    // 5. Update Customer Total Orders and Spent if finished
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        totalOrders: { increment: 1 },
        totalSpent: { increment: status === "SELESAI" ? totalPrice : 0 },
      },
    });

    // 6. Record Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "CREATE",
          entity: "JOB",
          entityId: job.id,
          jobId: job.id,
          details: `Job baru diterbitkan: ${jobNumber} (${customer.name}) oleh ${user.name}`,
          ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        },
      });
    } catch {}

    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (error: any) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

