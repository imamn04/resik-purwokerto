import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest, hasPermission } from "@/lib/auth";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
  const user = getAuthFromRequest(req);
  if (!user || !hasPermission(user.role, ["OWNER", "ADMIN", "VIEWER"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const status = searchParams.get("status");
  const serviceId = searchParams.get("serviceId");

  try {
    const where: any = { isDeleted: false };
    if (startDate && endDate) where.scheduledDate = { gte: startDate, lte: endDate };
    if (status && status !== "ALL") where.status = status;
    if (serviceId && serviceId !== "ALL") where.serviceId = parseInt(serviceId, 10);

    const jobs = await prisma.job.findMany({
      where,
      include: {
        customer: true,
        service: true,
        createdBy: { select: { name: true } },
      },
      orderBy: { scheduledDate: "asc" },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Resik Purwokerto Management System";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Rekap Pekerjaan", {
      views: [{ showGridLines: true }],
    });

    // Title Block
    sheet.mergeCells("A1:K1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "REKAP DATA PEKERJAAN - RESIK PURWOKERTO";
    titleCell.font = { name: "Arial", size: 14, bold: true, color: { argb: "FF1E3A8A" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(1).height = 30;

    sheet.mergeCells("A2:K2");
    const subtitleCell = sheet.getCell("A2");
    subtitleCell.value = `Dicetak pada: ${new Date().toLocaleString("id-ID")} | Pengguna: ${user.name} (${user.role})`;
    subtitleCell.font = { name: "Arial", size: 10, italic: true };
    subtitleCell.alignment = { horizontal: "center" };
    sheet.getRow(2).height = 20;

    // Table Headers
    const headers = [
      "No. Job",
      "Tanggal Jadwal",
      "Jam",
      "Nama Pelanggan",
      "No. WhatsApp",
      "Layanan",
      "Teknisi / Tim",
      "Status",
      "Harga Dasar (Rp)",
      "Tambahan (Rp)",
      "Total Tagihan (Rp)",
      "Penginput",
    ];

    const headerRow = sheet.getRow(4);
    headerRow.values = headers;
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF59E0B" }, // Brand yellow
      };
      cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF000000" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Populate Rows
    let currentRowIndex = 5;
    let totalRevenue = 0;

    jobs.forEach((job) => {
      const row = sheet.getRow(currentRowIndex);
      row.values = [
        job.jobNumber,
        job.scheduledDate,
        job.scheduledTime || "-",
        job.customer.name,
        job.customer.phone,
        job.service.name,
        job.technicianName || "-",
        job.status,
        job.basePrice,
        job.extraFee,
        job.totalPrice,
        job.createdBy.name,
      ];

      totalRevenue += job.totalPrice;

      // Currency formatting for numeric columns
      row.getCell(9).numFmt = '"Rp"#,##0';
      row.getCell(10).numFmt = '"Rp"#,##0';
      row.getCell(11).numFmt = '"Rp"#,##0';

      row.eachCell((cell) => {
        cell.font = { name: "Arial", size: 9 };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      });

      currentRowIndex++;
    });

    // Summary Total Row
    const totalRow = sheet.getRow(currentRowIndex);
    totalRow.getCell(8).value = "TOTAL OMZET:";
    totalRow.getCell(8).font = { bold: true };
    totalRow.getCell(8).alignment = { horizontal: "right" };
    totalRow.getCell(11).value = totalRevenue;
    totalRow.getCell(11).numFmt = '"Rp"#,##0';
    totalRow.getCell(11).font = { bold: true, color: { argb: "FF1E3A8A" } };
    totalRow.height = 22;

    // Set column widths
    sheet.columns = [
      { width: 20 }, // Job No
      { width: 14 }, // Date
      { width: 10 }, // Time
      { width: 22 }, // Customer
      { width: 16 }, // Phone
      { width: 24 }, // Service
      { width: 18 }, // Technician
      { width: 16 }, // Status
      { width: 16 }, // Base Price
      { width: 14 }, // Extra Fee
      { width: 18 }, // Total Price
      { width: 18 }, // Created By
    ];

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="Rekap_Resik_Purwokerto_${Date.now()}.xlsx"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

