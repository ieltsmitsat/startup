import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const material = await prisma.studyMaterial.findUnique({
      where: { id },
      include: {
        subject: {
          include: {
            faculty: {
              include: {
                university: true,
              },
            },
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            isVerified: true,
            university: { select: { name: true } },
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                isVerified: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Material topilmadi" },
        { status: 404 }
      );
    }

    // Ko'rishlar sonini oshiramiz
    await prisma.studyMaterial.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    const avgRating =
      material.reviews.length > 0
        ? material.reviews.reduce((acc, r) => acc + r.rating, 0) /
          material.reviews.length
        : 0;

    return NextResponse.json({
      material: {
        ...material,
        avgRating: Number(avgRating.toFixed(1)),
        reviewsCount: material.reviews.length,
      },
    });
  } catch (error) {
    console.error("Material detail fetch error:", error);
    return NextResponse.json(
      { error: "Materialni yuklashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Ruxsat berilmagan" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const material = await prisma.studyMaterial.findUnique({
      where: { id },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Material topilmadi" },
        { status: 404 }
      );
    }

    // Faqat muallif yoki Admin o'chira oladi
    if (material.authorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Sizda ushbu materialni o'chirish huquqi yo'q" },
        { status: 403 }
      );
    }

    await prisma.studyMaterial.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Material muvaffaqiyatli o'chirildi",
    });
  } catch (error) {
    console.error("Material delete error:", error);
    return NextResponse.json(
      { error: "Materialni o'chirishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
