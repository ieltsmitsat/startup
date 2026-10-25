import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak"),
  email: z.string().email("Noto'g'ri email formati"),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
  universityId: z.string().optional(),
  facultyId: z.string().optional(),
  major: z.string().optional(),
  academicYear: z.number().int().min(1).max(6).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    // Email mavjudligini tekshirish
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ushbu email bilan allaqachon ro'yxatdan o'tilgan" },
        { status: 400 }
      );
    }

    // Parolni heshlash
    const passwordHash = await hashPassword(validatedData.password);

    // Foydalanuvchini yaratish
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        passwordHash,
        universityId: validatedData.universityId || null,
        facultyId: validatedData.facultyId || null,
        major: validatedData.major || null,
        academicYear: validatedData.academicYear || 1,
        role: "STUDENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
      },
    });

    // JWT token yaratish va cookie o'rnatish
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: "Muvaffaqiyatli ro'yxatdan o'tdingiz",
      user,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validatsiya xatosi" },
        { status: 400 }
      );
    }
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Serverda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
