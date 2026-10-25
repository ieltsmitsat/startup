import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5, "Baho 1 dan 5 gacha bo'lishi kerak"),
  comment: z.string().optional(),
  isHelpful: z.boolean().default(true),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Sharh qoldirish uchun tizimga kiring" },
        { status: 401 }
      );
    }

    const { id: materialId } = await params;
    const body = await req.json();
    const { rating, comment, isHelpful } = reviewSchema.parse(body);

    const review = await prisma.materialReview.upsert({
      where: {
        materialId_userId: {
          materialId,
          userId: user.id,
        },
      },
      update: {
        rating,
        comment,
        isHelpful,
      },
      create: {
        materialId,
        userId: user.id,
        rating,
        comment,
        isHelpful,
      },
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
    });

    return NextResponse.json({
      success: true,
      message: "Bahoyingiz qabul qilindi",
      review,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validatsiya xatosi" },
        { status: 400 }
      );
    }
    console.error("Review submission error:", error);
    return NextResponse.json(
      { error: "Sharhni saqlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
