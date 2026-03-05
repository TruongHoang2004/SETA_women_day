import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
    try {
        const registrations = await prisma.identity.findMany({
            include: {
                question: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ success: true, data: registrations });
    } catch (error) {
        return NextResponse.json({ error: "Lỗi hệ thống khi tải thống kê" }, { status: 500 });
    }
}
