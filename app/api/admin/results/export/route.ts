import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const department = searchParams.get("department")?.trim() || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    // Build where clause (same as main results route)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (search) {
      where.OR = [
        { employeeId: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
        { luckyNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    if (department) {
      where.department = department;
    }

    // Build orderBy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: sortOrder };
    const allowedSortFields = [
      "employeeId",
      "fullName",
      "email",
      "department",
      "luckyNumber",
      "createdAt",
    ];
    if (allowedSortFields.includes(sortBy)) {
      orderBy = { [sortBy]: sortOrder };
    }

    // Get ALL matching records (no pagination for export)
    const registrations = await prisma.identity.findMany({
      where,
      include: { question: true },
      orderBy,
    });

    return NextResponse.json({ success: true, data: registrations });
  } catch (error) {
    console.error("Error exporting results:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi xuất dữ liệu" },
      { status: 500 },
    );
  }
}
