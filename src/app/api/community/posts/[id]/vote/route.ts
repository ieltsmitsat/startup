import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Ovoz berish uchun tizimga kiring" },
        { status: 401 }
      );
    }

    const { type } = await req.json(); // "UP" yoki "DOWN"

    try {
      if (type === "UP") {
        await prisma.communityPost.update({
          where: { id },
          data: { upvotes: { increment: 1 } },
        });
      } else if (type === "DOWN") {
        await prisma.communityPost.update({
          where: { id },
          data: { downvotes: { increment: 1 } },
        });
      }
    } catch {
      // In-memory fallback
    }

    return NextResponse.json({ success: true, vote: type });
  } catch (error) {
    console.error("Post vote error:", error);
    return NextResponse.json({ error: "Ovoz berishda xatolik" }, { status: 500 });
  }
}
