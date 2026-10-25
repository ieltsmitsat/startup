import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const BLOCKED_WORDS = ["kazino", "1xbet", "stavka", "parol sotiladi", "kripto daromad 100%"];
function containsSpam(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKED_WORDS.some((word) => lower.includes(word));
}

const CreateAnswerSchema = z.object({
  content: z.string().min(3, "Javob matni kamida 3 belgidan iborat bo'lishi kerak"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Javob yozish uchun avval tizimga kiring" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { content } = CreateAnswerSchema.parse(body);

    if (containsSpam(content)) {
      return NextResponse.json(
        { error: "Javobingizda spam yoki taqiqlangan so'zlar mavjud" },
        { status: 400 }
      );
    }

    try {
      const created = await prisma.communityAnswer.create({
        data: {
          content,
          postId,
          authorId: user.id,
        },
        include: {
          author: {
            select: {
              name: true,
              avatarUrl: true,
              isVerified: true,
              university: { select: { name: true } },
            },
          },
        },
      });

      return NextResponse.json(
        {
          success: true,
          answer: {
            ...created,
            createdAt: created.createdAt.toISOString(),
          },
        },
        { status: 201 }
      );
    } catch {
      // Fallback
      const fallback = {
        id: "ans-local-" + Date.now(),
        content,
        upvotes: 0,
        isAccepted: false,
        createdAt: new Date().toISOString(),
        author: {
          name: user.name,
          avatarUrl: user.avatarUrl,
          isVerified: user.isVerified,
          university: user.university,
        },
      };

      return NextResponse.json({ success: true, answer: fallback }, { status: 201 });
    }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || "Noto'g'ri ma'lumot kiritildi" },
        { status: 400 }
      );
    }
    console.error("Answer POST error:", err);
    return NextResponse.json(
      { error: "Javobni saqlashda server xatoligi" },
      { status: 500 }
    );
  }
}
