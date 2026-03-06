import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    // Get all config images
    const config = await prisma.appConfig.findFirst();
    const images: { id: string; url: string; title: string }[] =
      config?.images && typeof config.images === "object"
        ? (config.images as { id: string; url: string; title: string }[])
        : [];

    // Get all questions with selected images
    const questions = await prisma.question.findMany({
      select: {
        selectedImages: true,
      },
    });

    // Count votes per image
    const voteCounts: Record<string, number> = {};
    for (const q of questions) {
      for (const imageId of q.selectedImages) {
        voteCounts[imageId] = (voteCounts[imageId] || 0) + 1;
      }
    }

    // Build result with image details + vote count
    const results = images.map((img) => ({
      id: img.id,
      url: img.url,
      title: img.title,
      votes: voteCounts[img.id] || 0,
    }));

    // Sort by votes descending
    results.sort((a, b) => b.votes - a.votes);

    const totalVoters = questions.length;

    return NextResponse.json({ success: true, data: results, totalVoters });
  } catch (error) {
    console.error("Error fetching vote stats:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải thống kê bình chọn" },
      { status: 500 },
    );
  }
}
