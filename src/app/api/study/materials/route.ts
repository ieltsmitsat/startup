import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { MaterialType } from "@prisma/client";
import { isDbAvailable, markDbOffline } from "@/lib/dbCheck";

export const dynamic = "force-dynamic";

const createMaterialSchema = z.object({
  title: z.string().min(3, "Material sarlavhasi kamida 3 ta belgidan iborat bo'lishi kerak"),
  description: z.string().optional(),
  materialType: z.nativeEnum(MaterialType),
  fileUrl: z.string().min(1, "Fayl manzili ko'rsatilishi shart"),
  fileName: z.string().min(1, "Fayl nomi ko'rsatilishi shart"),
  fileSize: z.number().max(52428800, "Fayl hajmi 50 MB dan oshmasligi kerak"),
  fileType: z.string().regex(/^(pdf|docx|pptx|zip)$/i, "Faqat PDF, DOCX, PPTX yoki ZIP fayllar ruxsat etiladi"),
  teacherName: z.string().optional(),
  academicYear: z.number().int().min(1).max(6).optional(),
  subjectId: z.string().min(1, "Fan tanlanishi shart"),
});

export const MOCK_STUDY_MATERIALS = [
  {
    id: "mat-1",
    title: "Algoritmlar va ma'lumotlar tuzilmasi - Ma'ruzalar matni",
    description: "TATU Dasturiy injiniring fakulteti 2-kurs talabalari uchun saralash, qidiruv va daraxtlar bo'yicha to'liq ma'ruza.",
    materialType: "LECTURE",
    fileUrl: "/uploads/mock-algo.pdf",
    fileName: "Algorithms_Lectures_TATU.pdf",
    fileSize: 4200000,
    fileType: "pdf",
    teacherName: "Prof. S. Rahmatov",
    academicYear: 2,
    downloadsCount: 148,
    viewsCount: 620,
    status: "APPROVED",
    avgRating: 4.9,
    reviewsCount: 18,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    subject: {
      id: "sub-1",
      name: "Algoritmlar va ma'lumotlar tuzilmasi",
      faculty: {
        id: "fac-1",
        name: "Dasturiy injiniring",
        university: { id: "uni-tatu", name: "TATU" },
      },
    },
    author: {
      id: "usr-1",
      name: "Jamshid Qodirov",
      isVerified: true,
      avatarUrl: null,
    },
  },
  {
    id: "mat-2",
    title: "Sun'iy intellekt va neyron tarmoqlar - Oraliq nazorat savollari",
    description: "O'zMU Amaliy matematika fakulteti uchun 40 ta nazorat savollari va qisqacha javoblar konspekti.",
    materialType: "EXAM_QUESTIONS",
    fileUrl: "/uploads/mock-ai-exam.pdf",
    fileName: "AI_Exam_Questions_OzMU.pdf",
    fileSize: 2100000,
    fileType: "pdf",
    teacherName: "Akademik X. Nurmatov",
    academicYear: 4,
    downloadsCount: 95,
    viewsCount: 380,
    status: "APPROVED",
    avgRating: 4.8,
    reviewsCount: 12,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    subject: {
      id: "sub-2",
      name: "Mashinali o'rganish (Machine Learning)",
      faculty: {
        id: "fac-2",
        name: "Amaliy matematika",
        university: { id: "uni-ozmu", name: "O'zMU" },
      },
    },
    author: {
      id: "usr-2",
      name: "Zuhra Yusupova",
      isVerified: true,
      avatarUrl: null,
    },
  },
  {
    id: "mat-3",
    title: "Web dasturlash (React & Next.js) - Taqdimot slaydlari",
    description: "Zamonaviy veb-ishlab chiqish, komponentlar arxitekturasi, server components va SSR bo'yicha slaydlar to'plami.",
    materialType: "SLIDES",
    fileUrl: "/uploads/mock-web.pptx",
    fileName: "Nextjs_Architecture_Slides.pptx",
    fileSize: 8400000,
    fileType: "pptx",
    teacherName: "Katta o'qituvchi B. Saidov",
    academicYear: 3,
    downloadsCount: 215,
    viewsCount: 890,
    status: "APPROVED",
    avgRating: 5.0,
    reviewsCount: 26,
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    subject: {
      id: "sub-3",
      name: "Web dasturlash (React & Next.js)",
      faculty: {
        id: "fac-1",
        name: "Dasturiy injiniring",
        university: { id: "uni-tatu", name: "TATU" },
      },
    },
    author: {
      id: "usr-3",
      name: "Farrux Muxtorov",
      isVerified: true,
      avatarUrl: null,
    },
  },
  {
    id: "mat-4",
    title: "Kriptografiya asoslari - 1-5 laboratoriya ishlari bo'yicha ko'rsatma",
    description: "Simmetrik va asimmetrik shifrlash (RSA, AES) algoritmlarini amalda qo'llash bo'yicha laboratoriya metodik qo'llanmasi.",
    materialType: "LAB_WORK",
    fileUrl: "/uploads/mock-crypto-lab.pdf",
    fileName: "Crypto_Lab_Guide.pdf",
    fileSize: 3600000,
    fileType: "pdf",
    teacherName: "Dots. A. Karimov",
    academicYear: 3,
    downloadsCount: 160,
    viewsCount: 510,
    status: "APPROVED",
    avgRating: 4.7,
    reviewsCount: 15,
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    subject: {
      id: "sub-4",
      name: "Kriptografiya asoslari",
      faculty: {
        id: "fac-3",
        name: "Kiberxavfsizlik",
        university: { id: "uni-tatu", name: "TATU" },
      },
    },
    author: {
      id: "usr-4",
      name: "Rustam Aliyev",
      isVerified: true,
      avatarUrl: null,
    },
  },
  {
    id: "mat-5",
    title: "Oliy matematika 1-semestr testlar va yechimlar bazasi",
    description: "ToshDTU muhandislik yo'nalishlari uchun differensial va integral hisob bo'yicha 200 ta test savollari va javoblar kaliti.",
    materialType: "TESTS",
    fileUrl: "/uploads/mock-math-tests.pdf",
    fileName: "Math_Tests_Solutions.pdf",
    fileSize: 5100000,
    fileType: "pdf",
    teacherName: "Dots. M. Saidov",
    academicYear: 1,
    downloadsCount: 310,
    viewsCount: 1240,
    status: "APPROVED",
    avgRating: 4.9,
    reviewsCount: 34,
    createdAt: new Date(Date.now() - 86400000 * 16).toISOString(),
    subject: {
      id: "sub-5",
      name: "Oliy matematika",
      faculty: {
        id: "fac-4",
        name: "Mashinasozlik",
        university: { id: "uni-toshdtu", name: "ToshDTU" },
      },
    },
    author: {
      id: "usr-5",
      name: "Doniyor Yoqubov",
      isVerified: true,
      avatarUrl: null,
    },
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const subjectId = searchParams.get("subjectId");
    const facultyId = searchParams.get("facultyId");
    const universityId = searchParams.get("universityId");
    const materialType = searchParams.get("materialType") as MaterialType | null;
    const sortBy = searchParams.get("sortBy") || "newest";

    const dbOk = await isDbAvailable();

    if (dbOk) {
      try {
        const where: any = { status: "APPROVED" };

        if (search) {
          where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { teacherName: { contains: search, mode: "insensitive" } },
          ];
        }

        if (materialType && Object.values(MaterialType).includes(materialType)) {
          where.materialType = materialType;
        }

        if (subjectId) {
          where.subjectId = subjectId;
        } else if (facultyId) {
          where.subject = { facultyId: facultyId };
        } else if (universityId) {
          where.subject = { faculty: { universityId: universityId } };
        }

        let orderBy: any = { createdAt: "desc" };
        if (sortBy === "popular") {
          orderBy = { viewsCount: "desc" };
        } else if (sortBy === "downloads") {
          orderBy = { downloadsCount: "desc" };
        }

        const materials = await prisma.studyMaterial.findMany({
          where,
          orderBy,
          include: {
            subject: {
              include: {
                faculty: {
                  include: {
                    university: { select: { id: true, name: true } },
                  },
                },
              },
            },
            author: {
              select: { id: true, name: true, isVerified: true, avatarUrl: true },
            },
            reviews: { select: { rating: true } },
          },
        });

        if (materials && materials.length > 0) {
          const materialsWithRating = materials.map((m) => {
            const avgRating =
              m.reviews.length > 0
                ? m.reviews.reduce((acc, r) => acc + r.rating, 0) / m.reviews.length
                : 0;
            return {
              ...m,
              avgRating: Number(avgRating.toFixed(1)),
              reviewsCount: m.reviews.length,
            };
          });

          return NextResponse.json({ materials: materialsWithRating });
        }
      } catch (err) {
        markDbOffline();
      }
    }

    // Fast In-Memory Fallback
    let filtered = [...MOCK_STUDY_MATERIALS];

    if (search) {
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(search) ||
          m.description.toLowerCase().includes(search) ||
          m.teacherName?.toLowerCase().includes(search) ||
          m.subject.name.toLowerCase().includes(search)
      );
    }

    if (materialType) {
      filtered = filtered.filter((m) => m.materialType === materialType);
    }

    if (universityId) {
      filtered = filtered.filter(
        (m) => m.subject.faculty.university.id === universityId || m.subject.faculty.university.name.toLowerCase().includes(universityId.toLowerCase())
      );
    }

    if (sortBy === "popular") {
      filtered.sort((a, b) => b.viewsCount - a.viewsCount);
    } else if (sortBy === "downloads") {
      filtered.sort((a, b) => b.downloadsCount - a.downloadsCount);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json({ materials: filtered });
  } catch (error) {
    console.error("Study materials fetch error:", error);
    return NextResponse.json({ materials: MOCK_STUDY_MATERIALS });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
      return NextResponse.json(
        { error: "Material yuklash faqat Administratorlar uchun ruxsat etilgan. Admin panel orqali yuklang." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = createMaterialSchema.parse(body);

    const dbOk = await isDbAvailable();
    if (dbOk) {
      try {
        const material = await prisma.studyMaterial.create({
          data: {
            title: validatedData.title,
            description: validatedData.description || null,
            materialType: validatedData.materialType,
            fileUrl: validatedData.fileUrl,
            fileName: validatedData.fileName,
            fileSize: validatedData.fileSize,
            fileType: validatedData.fileType.toLowerCase(),
            teacherName: validatedData.teacherName || null,
            academicYear: validatedData.academicYear || null,
            subjectId: validatedData.subjectId,
            authorId: user.id,
            status: "APPROVED",
          },
          include: {
            subject: true,
            author: {
              select: { id: true, name: true, isVerified: true },
            },
          },
        });

        return NextResponse.json({
          success: true,
          message: "Material muvaffaqiyatli yuklandi",
          material,
        });
      } catch (err) {
        markDbOffline();
      }
    }

    // In-Memory fallback creation
    const newMock = {
      id: `mat-${Date.now()}`,
      title: validatedData.title,
      description: validatedData.description || "",
      materialType: validatedData.materialType,
      fileUrl: validatedData.fileUrl,
      fileName: validatedData.fileName,
      fileSize: validatedData.fileSize,
      fileType: validatedData.fileType.toLowerCase(),
      teacherName: validatedData.teacherName || "O'qituvchi",
      academicYear: validatedData.academicYear || 1,
      downloadsCount: 0,
      viewsCount: 1,
      status: "APPROVED",
      avgRating: 5.0,
      reviewsCount: 1,
      createdAt: new Date().toISOString(),
      subject: {
        id: validatedData.subjectId,
        name: "Tanlangan Fan",
        faculty: {
          id: "fac-general",
          name: "Fakultet",
          university: { id: "uni-general", name: "OTM" },
        },
      },
      author: {
        id: user.id,
        name: user.name || "Administrator",
        isVerified: true,
        avatarUrl: null,
      },
    };

    MOCK_STUDY_MATERIALS.unshift(newMock);

    return NextResponse.json({
      success: true,
      message: "Material muvaffaqiyatli yuklandi",
      material: newMock,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validatsiya xatosi" },
        { status: 400 }
      );
    }
    console.error("Create material error:", error);
    return NextResponse.json(
      { error: "Materialni saqlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
