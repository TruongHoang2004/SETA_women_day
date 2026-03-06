import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// Registration deadline: March 6, 2026 at 17:00 ICT (UTC+7)
const REGISTRATION_DEADLINE = new Date("2026-03-06T17:00:00+07:00");

export async function POST(request: Request) {
  try {
    // Check if registration period has ended
    const now = new Date();
    if (now >= REGISTRATION_DEADLINE) {
      return NextResponse.json(
        {
          error:
            "Thời gian bình chọn đã kết thúc. Cảm ơn bạn đã quan tâm đến sự kiện! 🌸",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { employeeId, fullName, email, department, wishes, selectedImages } =
      body;

    // Validate request data
    if (!employeeId || !fullName || !email || !department) {
      return NextResponse.json(
        { error: "Vui lòng điền đủ Mã nhân viên, Họ tên, Email và Phòng ban" },
        { status: 400 },
      );
    }

    if (!Array.isArray(selectedImages) || selectedImages.length !== 3) {
      return NextResponse.json(
        { error: "Vui lòng chọn đúng 3 bức ảnh." },
        { status: 400 },
      );
    }

    // Check employeeId length (must be 4-5 digits)
    if (!/^\d{4,5}$/.test(employeeId)) {
      return NextResponse.json(
        { error: "Mã nhân viên phải là 4-5 chữ số." },
        { status: 400 },
      );
    }

    // Check if employeeId already registered
    const existing = await prisma.identity.findUnique({
      where: { employeeId },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Mã nhân viên ${employeeId} đã được sử dụng để đăng ký.` },
        { status: 400 },
      );
    }

    // Generate unique random lucky number 100-999
    const allExistingNumbers = await prisma.identity.findMany({
      select: { luckyNumber: true },
    });

    const usedSet = new Set(
      allExistingNumbers.map((n: { luckyNumber: string }) => n.luckyNumber),
    );
    if (usedSet.size >= 900) {
      return NextResponse.json(
        { error: "Đã hết số may mắn." },
        { status: 400 },
      );
    }

    let luckyNumber = "";
    while (true) {
      const rand = 100 + Math.floor(Math.random() * 900); // 101-999
      const strVal = rand.toString();
      if (!usedSet.has(strVal)) {
        luckyNumber = strVal;
        break;
      }
    }

    // Create Identity -> Question record linked together
    const identity = await prisma.identity.create({
      data: {
        employeeId,
        fullName,
        email,
        department,
        luckyNumber,
        question: {
          create: {
            wishes,
            selectedImages,
          },
        },
      },
      include: {
        question: true,
      },
    });

    return NextResponse.json({
      success: true,
      luckyNumber,
      registration: identity,
    });
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra, vui lòng thử lại sau" },
      { status: 500 },
    );
  }
}
