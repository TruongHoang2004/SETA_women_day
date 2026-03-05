import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

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
            { error: "Lỗi Server" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { questionTitle, images } = body;

        const config = await prisma.appConfig.upsert({
            where: { id: 1 },
            update: {
                questionTitle,
                images,
            },
            create: {
                id: 1,
                questionTitle,
                images,
            }
        });

        return NextResponse.json({ success: true, config });
    } catch (error) {
        return NextResponse.json(
            { error: "Không thể lưu cấu hình" },
            { status: 500 }
        );
    }
}
