import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest, hasPermission } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthFromRequest(req);
  if (!user || !hasPermission(user.role, ["OWNER", "ADMIN", "STAFF_INPUT"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { status } = await req.json();
    const validStatuses = ["PENDING", "DIJADWALKAN", "DALAM_PENGERJAAN", "SELESAI", "DIBATALKAN"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: { id: params.id },
    });

    if (!job || job.isDeleted) {
      return NextResponse.json({ error: "Pekerjaan tidak ditemukan" }, { status: 404 });
    }

    // Staff input can only update their own job's status
    if (user.role === "STAFF_INPUT" && job.createdById !== user.id) {
      return NextResponse.json(
        { error: "Anda hanya dapat memperbarui status pekerjaan milik sendiri." },
        { status: 403 }
      );
    }

    const oldStatus = job.status;
    const completedAt =
      status === "SELESAI" && oldStatus !== "SELESAI"
        ? new Date()
        : status !== "SELESAI"
        ? null
        : job.completedAt;

    const updatedJob = await prisma.job.update({
      where: { id: params.id },
      data: {
        status,
        updatedById: user.id,
        completedAt,
      },
    });

    // If job marked as SELESAI, increment customer total spent
    if (status === "SELESAI" && oldStatus !== "SELESAI") {
      await prisma.customer.update({
        where: { id: job.customerId },
        data: { totalSpent: { increment: job.totalPrice } },
      });
    }

    // Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "STATUS_CHANGE",
          entity: "JOB",
          entityId: job.id,
          jobId: job.id,
          details: `Status ${job.jobNumber} diubah dari [${oldStatus}] menjadi [${status}] oleh ${user.name}`,
          ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        },
      });
    } catch {}

    return NextResponse.json({ success: true, job: updatedJob });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

