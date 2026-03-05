import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
    try {
        let config = await prisma.appConfig.findUnique({
            where: { id: 1 }
        });

        if (!config) {
            config = await prisma.appConfig.create({
                data: {
                    id: 1,
                    questionTitle: "Chọn 3 bức ảnh bạn thích nhất",
                    images: []
                }
            });
        }

        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json(
            { error: "Lỗi kết nối cơ sở dữ liệu." },
            { status: 500 }
        );
    }
}
