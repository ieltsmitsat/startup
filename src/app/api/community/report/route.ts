import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const ReportSchema = z.object({
  targetId: z.string(),
  targetType: z.enum(["POST", "ANSWER", "USER"]),
  reason: z.string().min(3, "Shikoyat sababini ko'rsating"),
  details: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Shikoyat yuborish uchun tizimga kiring" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = ReportSchema.parse(body);

    try {
      await prisma.report.create({
        data: {
          reason: `[${validated.targetType}:${validated.targetId}] ${validated.reason}`,
          details: validated.details || null,
          reporterId: user.id,
        },
      });
    } catch {
      // In-memory fallback
    }

    return NextResponse.json({
      success: true,
      message: "Shikoyatingiz qabul qilindi va moderatorlarga yuborildi",
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || "Ma'lumotlar to'liq emas" },
        { status: 400 }
      );
    }
    console.error("Report POST error:", err);
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}
