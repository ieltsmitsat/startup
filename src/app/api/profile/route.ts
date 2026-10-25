import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isDbAvailable, markDbOffline } from "@/lib/dbCheck";

export const dynamic = "force-dynamic";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak").optional(),
  bio: z.string().max(500, "Bio 500 belgidan oshmasligi kerak").optional().nullable(),
  universityId: z.string().optional().nullable(),
  facultyId: z.string().optional().nullable(),
  major: z.string().optional().nullable(),
  academicYear: z.number().int().min(1).max(6).optional().nullable(),
  skills: z.array(z.string()).optional(),
  telegramUsername: z.string().optional().nullable(),
  githubUrl: z.string().optional().nullable(),
  linkedinUrl: z.string().optional().nullable(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
  }

  if (await isDbAvailable()) {
    try {
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          university: true,
          faculty: true,
          materials: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });

      if (fullUser) {
        return NextResponse.json({ user: fullUser });
      }
    } catch {
      markDbOffline();
    }
  }

  return NextResponse.json({
    user: {
      ...user,
      materials: [],
    },
  });
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateProfileSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        bio: validatedData.bio,
        universityId: validatedData.universityId,
        facultyId: validatedData.facultyId,
        major: validatedData.major,
        academicYear: validatedData.academicYear,
        skills: validatedData.skills,
        telegramUsername: validatedData.telegramUsername,
        githubUrl: validatedData.githubUrl,
        linkedinUrl: validatedData.linkedinUrl,
      },
      include: {
        university: true,
        faculty: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil ma'lumotlari muvaffaqiyatli saqlandi",
      user: updatedUser,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validatsiya xatosi" },
        { status: 400 }
      );
    }
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Profilni yangilashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
